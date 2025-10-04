// SimpleMatch - Flujo completo de partido integrando con el sistema existente
// Usa ExpandedPlayState, PlayResult, Drive, Play y Actions para simulación completa

import { TeamMatch } from '../teams/TeamMatch';
import { ExpandedPlayState, SimpleGameState } from './ExpandedPlayState';
import { PlayResult, PlayResultAnalyzer, KickoffResult, PuntResult, KickResult, Touchdown } from './PlayResults';
import { RunningPlayAction, PassingPlayAction, ActionAnalyzer, ActionResult } from './Actions';
import { Drive, DriveConfig } from './Drive';
import { Play, PlayConfig } from './Play';
import { ActionCalculator, PlayContext } from './ActionCalculator';
import { OffensiveTeam } from '../teams/units/OffensiveTeam';
import { DefensiveTeam } from '../teams/units/DefensiveTeam';
import { KickerTeam } from '../teams/units/KickerTeam';
import { ReturnerTeam } from '../teams/units/ReturnerTeam';

export interface SimpleMatchState {
  scoreX: number;
  scoreY: number;
  quarter: number;
  timeRemaining: number;
  possession: 'X' | 'Y';
  ballPosition: number;
  down: number;
  yardsToGo: number;
  gamePhase: 'kickoff' | 'normal' | 'extra_point' | 'two_point_conversion' | 'finished';
}

export class SimpleMatch {
  public readonly teamX: TeamMatch;
  public readonly teamY: TeamMatch;
  public state: SimpleMatchState;
  public expandedState: ExpandedPlayState;
  public totalPlays: number = 0;
  public totalDrives: number = 0;

  // Nuevas propiedades para Drive, Play y Actions
  public drives: Drive[] = [];
  public currentDrive: Drive | null = null;
  public plays: Play[] = [];
  public gameActions: (RunningPlayAction | PassingPlayAction)[] = [];

  constructor(teamX: TeamMatch, teamY: TeamMatch) {
    this.teamX = teamX;
    this.teamY = teamY;

    this.state = {
      scoreX: 0,
      scoreY: 0,
      quarter: 1,
      timeRemaining: 15 * 60,
      possession: 'Y', // Y patea primero, X recibe
      ballPosition: 35, // Kickoff desde la 35
      down: 0, // Kickoff no tiene down
      yardsToGo: 0, // Kickoff no tiene yardsToGo
      gamePhase: 'kickoff'
    };

    // Crear estado expandido simplificado
    const initialGameState: SimpleGameState = {
      quarter: 1,
      timeRemaining: 15 * 60,
      down: 1,
      yardsToGo: 10,
      ballPosition: 25,
      offensiveTeam: teamX,
      defensiveTeam: teamY,
      momentum: 'neutral',
      pressure: 'low',
      recentPlays: []
    };

    this.expandedState = new ExpandedPlayState(initialGameState);
  }

  /**
   * Inicializar el partido
   */
  public initializeMatch(): void {
    this.state.gamePhase = 'kickoff';
    this.totalDrives = 1;
  }

  /**
   * Iniciar un nuevo drive
   */
  private startNewDrive(): void {
    // Finalizar drive anterior si existe
    if (this.currentDrive && !this.currentDrive.isFinalized) {
      this.finalizeDrive('turnover');
    }

    const offensiveTeam = this.state.possession === 'X' ? this.teamX : this.teamY;
    const defensiveTeam = this.state.possession === 'X' ? this.teamY : this.teamX;

    const driveConfig: DriveConfig = {
      offensiveTeam,
      defensiveTeam,
      startPosition: this.state.ballPosition,
      startTime: this.state.timeRemaining,
      quarter: this.state.quarter
    };

    this.currentDrive = new Drive(driveConfig);
    this.drives.push(this.currentDrive);
    this.totalDrives++;
  }

  /**
   * Finalizar el drive actual
   */
  private finalizeDrive(result: 'touchdown' | 'turnover' | 'punt' | 'field_goal' | 'end_of_half'): void {
    if (this.currentDrive && !this.currentDrive.isFinalized) {
      this.currentDrive.endTime = this.state.timeRemaining;
      this.currentDrive.finalize(result);
    }
  }

  /**
   * Seleccionar jugada usando las decisiones del staff técnico
   */
  public selectPlay(): { offense: OffensiveTeam; defense: DefensiveTeam; playType: string; offensivePlayStyle?: string } {
    const offensiveTeam = this.state.possession === 'X' ? this.teamX : this.teamY;
    const defensiveTeam = this.state.possession === 'X' ? this.teamY : this.teamX;

    let playType = 'normal';
    let offensivePlayStyle: string | undefined;

    // El staff técnico toma la decisión en 4° down
    if (this.state.down === 4) {
      const decision = offensiveTeam.makeFourthDownDecision(
        this.state.yardsToGo,
        this.state.ballPosition,
        this.state.timeRemaining,
        this.state.scoreX - this.state.scoreY // Diferencia de puntos
      );

      switch (decision.decision) {
        case 'go':
          playType = 'go_for_it';
          break;
        case 'field_goal':
          playType = 'field_goal';
          break;
        case 'punt':
          playType = 'punt';
          break;
      }
    } else {
      // El coordinador ofensivo decide el tipo de jugada normal
      const offensiveDecision = offensiveTeam.selectOffensivePlay(
        this.state.down,
        this.state.yardsToGo,
        this.state.ballPosition,
        this.state.timeRemaining
      );

      offensivePlayStyle = offensiveDecision.playType;
    }

    // Crear unidad ofensiva según la situación
    const offense = offensiveTeam.selectPlayersForField('offensive', {
      down: this.state.down,
      yardsToGo: this.state.yardsToGo,
      fieldPosition: this.state.ballPosition,
      timeRemaining: this.state.timeRemaining
    }) as OffensiveTeam;

    const defense = defensiveTeam.selectPlayersForField('defensive', {
      down: this.state.down,
      yardsToGo: this.state.yardsToGo,
      fieldPosition: this.state.ballPosition
    }) as DefensiveTeam;

    return { offense, defense, playType, offensivePlayStyle };
  }

  /**
   * Ejecutar kickoff usando ratings de equipos especiales
   */
  public executeKickoff(): KickoffResult {
    const kickingTeam = this.state.possession === 'X' ? this.teamX : this.teamY; // El que tiene posesión patea
    const receivingTeam = this.state.possession === 'X' ? this.teamY : this.teamX; // El otro recibe

    // Crear unidades especializadas de equipos especiales
    const kickingUnit: KickerTeam = kickingTeam.createKickerTeam('kickoff');
    const receivingUnit: ReturnerTeam = receivingTeam.createReturnerTeam('kickoff_return');

    // Usar atributos de las unidades especializadas
    const kickingUnitAttrs = kickingUnit.getKickingAttributes();
    const receivingUnitAttrs = receivingUnit.getReturnerAttributes();

    const kickerRating = kickingUnitAttrs.kickerRange + kickingUnitAttrs.kickerComposure;
    const returnerRating = receivingUnitAttrs.returnExplosiveness + receivingUnitAttrs.ballSecurity;
    const coverageRating = kickingUnitAttrs.coverageSpeed;

    // Distancia del kickoff (35-75 yardas)
    const baseDistance = 45;
    const kickQualityBonus = (kickerRating - 70) / 5; // -6 a +6 yardas
    const kickDistance = Math.max(25, Math.min(75, baseDistance + kickQualityBonus + (Math.random() * 10 - 5)));

    // Determinar si es touchback
    const isTouchback = kickDistance >= 65 || Math.random() < 0.3;

    let returnYards = 0;
    let finalPosition = 25; // Touchback estándar

    if (!isTouchback) {
      // Calcular return
      const baseReturn = 15;
      const returnerBonus = (returnerRating - 70) / 10; // -3 a +3 yardas
      const coveragePenalty = (coverageRating - 70) / 15; // Mejor cobertura = menos return

      returnYards = Math.max(0, Math.min(35,
        baseReturn + returnerBonus - coveragePenalty + (Math.random() * 10 - 5)
      ));

      finalPosition = Math.min(50, kickDistance + returnYards);
    }

    const result: KickoffResult = {
      type: 'kickoff_result',
      resultType: isTouchback ? 'touchback' : 'return',
      kickDistance,
      returnYards,
      finalPosition,
      kickQuality: kickerRating >= 140 ? 'excellent' : kickerRating >= 120 ? 'good' : kickerRating >= 100 ? 'fair' : 'poor',
      returnQuality: !isTouchback && returnerRating >= 140 ? 'excellent' :
        !isTouchback && returnerRating >= 120 ? 'good' :
          !isTouchback && returnerRating >= 100 ? 'fair' : 'poor'
    };

    // Actualizar posición del balón y cambiar posesión al equipo que recibe
    this.state.ballPosition = finalPosition;
    this.changePossession(); // Cambiar posesión al equipo que recibe el kickoff
    this.state.down = 1;
    this.state.yardsToGo = 10;
    this.state.gamePhase = 'normal';

    return result;
  }

  /**
   * Ejecutar jugada usando Play, Actions y el sistema completo
   */
  public executePlay(offense: OffensiveTeam, defense: DefensiveTeam, playType: string, offensivePlayStyle?: string): PlayResult {
    this.totalPlays++;

    // Asegurar que hay un drive activo para jugadas normales
    if (!this.currentDrive && playType !== 'kickoff' && this.state.gamePhase === 'normal') {
      this.startNewDrive();
    }

    // Crear objeto Play para esta jugada
    const playConfig: PlayConfig = {
      offense: offense as any, // Conversión temporal
      defense: defense as any, // Conversión temporal
      playType,
      down: this.state.down,
      yardsToGo: this.state.yardsToGo,
      ballPosition: this.state.ballPosition
    };

    const play = new Play(playConfig);
    this.plays.push(play);

    let result: PlayResult;
    let action: RunningPlayAction | PassingPlayAction | undefined;

    const offensiveTeam = this.state.possession === 'X' ? this.teamX : this.teamY;
    const defensiveTeam = this.state.possession === 'X' ? this.teamY : this.teamX;

    // Manejar jugadas especiales de tempo
    if (playType === 'kneel') {
      result = this.executeKneelDown();
    } else if (playType === 'spike') {
      result = this.executeSpike();
    } else if (playType === 'extra_point') {
      result = this.executeExtraPoint();
    } else if (playType === 'two_point_conversion') {
      result = this.executeTwoPointConversion();
    } else if (playType === 'punt') {
      result = this.executePunt(offense, defense);
    } else if (playType === 'field_goal') {
      result = this.executeFieldGoal(offense);
    } else {
      // Jugadas normales usando Actions
      const situationDown = playType === 'go_for_it' ? 3 : this.state.down;
      const offensiveDecision = offensiveTeam.createOffensiveAction(offense, defense, {
        down: situationDown,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: this.state.ballPosition,
        timeRemaining: this.state.timeRemaining,
        scoreDifference: this.state.scoreX - this.state.scoreY
      });

      action = offensiveDecision.action;
      this.gameActions.push(action); // Registrar la acción

      // El equipo defensivo crea su respuesta
      const expectedAction = action.actionType === 'running' ? 'run' : 'pass';
      const defensiveResponse = defensiveTeam.createDefensiveResponse(offense, defense, expectedAction, {
        down: this.state.down,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: this.state.ballPosition
      });

      // Evaluar la action ofensiva con los ajustes defensivos
      const actionEvaluation = offensiveTeam.evaluateOffensiveAction(action, {
        down: this.state.down,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: this.state.ballPosition
      });

      // Aplicar modificadores de realismo basados en el contexto del juego
      const realismModifiers = this.calculateRealismModifiers();

      // Crear contexto de la jugada para el calculador
      const playContext: PlayContext = {
        down: this.state.down,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: this.state.ballPosition,
        timeRemaining: this.state.timeRemaining,
        quarter: this.state.quarter,
        scoreDifference: this.state.scoreX - this.state.scoreY,
        weather: 'clear', // Simplificado por ahora
        pressure: this.calculatePressureLevel()
      };

      // Ejecutar la action usando el nuevo sistema de cálculo
      let detailedResult;
      if (action.actionType === 'running') {
        detailedResult = ActionCalculator.calculateRunningAction(
          action as RunningPlayAction,
          offense,
          defense,
          playContext
        );
      } else {
        detailedResult = ActionCalculator.calculatePassingAction(
          action as PassingPlayAction,
          offense,
          defense,
          playContext
        );
      }

      // Usar el resultado calculado
      result = detailedResult.playResult;

      // Crear ActionResult usando los datos del calculador detallado
      const yardsGained = this.extractYardsFromResult(result);
      const actionResult: ActionResult = {
        yardsGained,
        timeConsumed: 35, // Tiempo promedio
        firstDownAchieved: yardsGained >= this.state.yardsToGo,
        touchdownScored: result.type === 'touchdown',
        turnoverOccurred: result.type === 'fumble' || result.type === 'interception',
        executionQuality: this.determineExecutionQuality(detailedResult.calculation.successProbability),
        impactOnMomentum: this.determineMomentumImpact(yardsGained, result.type),
        keyFactors: this.extractKeyFactors(detailedResult),
        playmakers: [], // Simplificado por ahora
        goats: [] // Simplificado por ahora
      };

      // Actualizar el Play con el resultado usando la narrativa del calculador
      play.result = {
        yardsGained: actionResult.yardsGained,
        timeElapsed: actionResult.timeConsumed,
        isFirstDown: actionResult.firstDownAchieved,
        isScore: actionResult.touchdownScored,
        isTurnover: actionResult.turnoverOccurred,
        points: actionResult.touchdownScored ? 6 : 0,
        description: detailedResult.narrative || ActionAnalyzer.generateActionDescription(action, actionResult)
      };

      // Agregar la jugada al drive actual (solo si no está finalizado)
      if (this.currentDrive && !this.currentDrive.isFinalized) {
        this.currentDrive.addPlay(play);
      }
    }

    return result;
  }

  /**
   * Extraer yardas de un PlayResult
   */
  private extractYardsFromResult(result: PlayResult): number {
    if ('yardsGained' in result) {
      return result.yardsGained;
    }
    const stats = PlayResultAnalyzer.extractStats(result);
    return Math.round(stats.yards);
  }

  /**
   * Determinar calidad de ejecución basada en probabilidad de éxito
   */
  private determineExecutionQuality(successProbability: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (successProbability >= 80) return 'excellent';
    if (successProbability >= 60) return 'good';
    if (successProbability >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Determinar impacto en momentum basado en resultado
   */
  private determineMomentumImpact(yardsGained: number, resultType: string): 'negative' | 'neutral' | 'positive' | 'game_changing' {
    if (resultType === 'touchdown') return 'game_changing';
    if (resultType === 'fumble' || resultType === 'interception') return 'negative';
    if (yardsGained >= 15) return 'positive';
    if (yardsGained >= this.state.yardsToGo) return 'positive';
    if (yardsGained < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Extraer factores clave del cálculo detallado
   */
  private extractKeyFactors(detailedResult: any): string[] {
    const factors: string[] = [];
    
    if (detailedResult.calculation.matchupAdvantage > 10) {
      factors.push('Ventaja ofensiva clara');
    } else if (detailedResult.calculation.matchupAdvantage < -10) {
      factors.push('Ventaja defensiva clara');
    }
    
    const modifiers = detailedResult.calculation.modifiers;
    if (modifiers.pressureModifier < -2) {
      factors.push('Alta presión situacional');
    }
    if (modifiers.weatherPenalty < -2) {
      factors.push('Condiciones climáticas adversas');
    }
    if (modifiers.momentumBonus > 2) {
      factors.push('Momentum favorable');
    }
    
    return factors;
  }

  /**
   * Actualizar estado del juego usando PlayResult
   */
  public updateGameState(result: PlayResult): void {
    // Manejo especial para kickoffs - no actualizar estado normal
    if (result.type === 'kickoff_result') {
      // El kickoff ya actualizó el estado en executeKickoff()
      this.state.gamePhase = 'normal';
      return;
    }

    // Extraer estadísticas del resultado usando el analizador
    const stats = PlayResultAnalyzer.extractStats(result);

    // Actualizar posición del balón (siempre entero)
    const yardsGained = Math.round(stats.yards);
    this.state.ballPosition += yardsGained;
    this.state.ballPosition = Math.max(0, Math.min(100, this.state.ballPosition));

    // Actualizar tiempo según el tipo de resultado
    let timeElapsed = 35; // Tiempo promedio por defecto

    switch (result.type) {
      case 'spike':
        timeElapsed = 3;
        break;
      case 'kneel':
        timeElapsed = (result as any).timeConsumed || 40;
        break;
      case 'incomplete_pass':
        timeElapsed = 5;
        break;
      case 'kick_result':
        timeElapsed = 5;
        break;
      case 'two_point_conversion':
        timeElapsed = 8;
        break;
      default:
        timeElapsed = 35;
    }

    this.state.timeRemaining -= timeElapsed;

    // Actualizar marcador según el tipo de resultado
    let pointsScored = 0;

    if (result.type === 'touchdown') {
      pointsScored = 6; // Touchdown vale 6 puntos
    } else if (result.type === 'kick_result') {
      const kickResult = result as any;
      if (kickResult.kickType === 'field_goal' && kickResult.result === 'made') {
        pointsScored = 3; // Field goal vale 3 puntos
      } else if (kickResult.kickType === 'extra_point' && kickResult.result === 'made') {
        pointsScored = 1; // Extra point vale 1 punto
      }
    } else if (result.type === 'two_point_conversion') {
      const conversion = result as any;
      if (conversion.successful) {
        pointsScored = 2; // Conversión de 2 puntos
      }
    } else if (result.type === 'safety') {
      pointsScored = 2; // Safety vale 2 puntos (para la defensa)
    }

    // Aplicar puntos al marcador
    if (pointsScored > 0) {
      if (this.state.possession === 'X') {
        this.state.scoreX += pointsScored;
      } else {
        this.state.scoreY += pointsScored;
      }
    }

    // Manejar situaciones especiales
    if (stats.touchdown || result.type === 'touchdown') {
      // Finalizar drive con touchdown
      this.finalizeDrive('touchdown');

      // Touchdown - ejecutar conversión automáticamente
      const conversionDecision = this.handlePostTouchdown();

      let conversionResult: any;
      if (conversionDecision.decision === 'extra_point') {
        conversionResult = this.executeExtraPoint();
        if (conversionResult.result === 'made') {
          if (this.state.possession === 'X') {
            this.state.scoreX += 1;
          } else {
            this.state.scoreY += 1;
          }
        }
      } else {
        conversionResult = this.executeTwoPointConversion();
        if (conversionResult.successful) {
          if (this.state.possession === 'X') {
            this.state.scoreX += 2;
          } else {
            this.state.scoreY += 2;
          }
        }
      }

      // Preparar para kickoff - el equipo que NO anotó patea
      this.state.gamePhase = 'kickoff';
      this.state.ballPosition = 35; // Kickoff desde la 35
      this.state.down = 0; // Kickoff no tiene down
      this.state.yardsToGo = 0; // Kickoff no tiene yardsToGo
      // Cambiar posesión: el equipo que NO anotó patea
      this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';

    } else if (result.type === 'kick_result') {
      const kickResult = result as any;
      if (kickResult.kickType === 'field_goal' && kickResult.result === 'made') {
        // Finalizar drive con field goal exitoso
        this.finalizeDrive('field_goal');
      } else {
        // Field goal fallado - cambio de posesión
        this.finalizeDrive('turnover');
        this.changePossessionWithFieldFlip();
      }

      // Después de conversión - preparar para kickoff
      this.state.gamePhase = 'kickoff';
      this.state.ballPosition = 35; // Kickoff desde la 35
      this.state.down = 0; // Kickoff no tiene down
      this.state.yardsToGo = 0; // Kickoff no tiene yardsToGo
      // Cambiar posesión: el equipo que NO anotó patea
      this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';

    } else if (result.type === 'two_point_conversion') {
      // Después de conversión - preparar para kickoff
      this.state.gamePhase = 'kickoff';
      this.state.ballPosition = 35; // Kickoff desde la 35
      this.state.down = 0; // Kickoff no tiene down
      this.state.yardsToGo = 0; // Kickoff no tiene yardsToGo
      // Cambiar posesión: el equipo que NO anotó patea
      this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';

    } else if (result.type === 'punt_result') {
      // Finalizar drive con punt
      this.finalizeDrive('punt');
      this.changePossessionWithFieldFlip();

    } else if (stats.turnover) {
      // Finalizar drive con turnover
      this.finalizeDrive('turnover');
      this.changePossessionWithFieldFlip();

    } else {
      // Jugada normal - avanzar down y calcular yardas restantes
      this.state.yardsToGo -= yardsGained;

      // Verificar si consiguió primer down
      if (this.state.yardsToGo <= 0) {
        // ¡PRIMER DOWN!
        this.state.down = 1;
        this.state.yardsToGo = 10;
      } else {
        // No consiguió primer down - avanzar down
        this.state.down++;

        // Si es 4to down y no convirtieron, cambio de posesión con inversión de campo
        if (this.state.down > 4) {
          this.finalizeDrive('turnover');
          this.changePossessionWithFieldFlip();
        }
      }
    }
  }

  /**
   * Cambiar posesión
   */
  private changePossession(): void {
    this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';
    this.state.down = 1;
    this.state.yardsToGo = 10;
    // NO invertir la posición del balón automáticamente - esto se maneja según el contexto

    // Iniciar nuevo drive
    this.startNewDrive();
  }

  /**
   * Cambiar posesión con inversión de campo (para turnovers normales)
   */
  private changePossessionWithFieldFlip(): void {
    this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';
    this.state.down = 1;
    this.state.yardsToGo = 10;
    this.state.ballPosition = 100 - this.state.ballPosition; // Invertir campo

    // Iniciar nuevo drive
    this.startNewDrive();
  }

  /**
   * Obtener información del estado actual del partido
   */
  public getGameStatus(): {
    quarter: number;
    timeRemaining: string;
    possession: string;
    down: number;
    yardsToGo: number;
    ballPosition: number;
    score: { teamX: number; teamY: number };
    gamePhase: string;
  } {
    const possessionTeam = this.state.possession === 'X' ? this.teamX.name : this.teamY.name;

    return {
      quarter: this.state.quarter,
      timeRemaining: this.formatTime(this.state.timeRemaining),
      possession: possessionTeam,
      down: this.state.down,
      yardsToGo: this.state.yardsToGo,
      ballPosition: this.state.ballPosition,
      score: { teamX: this.state.scoreX, teamY: this.state.scoreY },
      gamePhase: this.state.gamePhase
    };
  }

  /**
   * Formatear tiempo
   */
  private formatTime(seconds: number): string {
    // Asegurar que el tiempo no sea negativo
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Obtener estrategia ofensiva basada en la situación
   */
  private getOffensiveStrategy(down: number, yardsToGo: number, ballPosition: number): string {
    if (down === 4) {
      if (ballPosition >= 65) return "Intentar field goal - dentro del rango";
      if (yardsToGo <= 2) return "Ir por el primer down - situación crítica";
      return "Punt - demasiado arriesgado intentar";
    }

    if (yardsToGo >= 10) return "Pase largo - necesitan yardas significativas";
    if (yardsToGo <= 3) return "Carrera de poder - pocas yardas necesarias";
    if (yardsToGo <= 6) return "Jugada balanceada - opciones múltiples";
    return "Pase medio - buscar primer down";
  }

  /**
   * Obtener estrategia defensiva basada en la situación
   */
  private getDefensiveStrategy(down: number, yardsToGo: number, ballPosition: number): string {
    if (down === 4) {
      if (ballPosition >= 65) return "Bloquear field goal - presión total";
      if (yardsToGo <= 2) return "Detener en línea - no permitir primer down";
      return "Cobertura de punt - preparar return";
    }

    if (yardsToGo >= 10) return "Cobertura profunda - evitar pase largo";
    if (yardsToGo <= 3) return "Cerrar huecos - detener carrera";
    if (yardsToGo <= 6) return "Cobertura mixta - preparados para todo";
    return "Presión al QB - forzar decisión rápida";
  }

  /**
   * Calcular el nivel de presión actual del juego
   */
  private calculatePressureLevel(): 'low' | 'medium' | 'high' | 'extreme' {
    let pressurePoints = 0;

    // Factores que aumentan la presión
    if (this.state.quarter >= 4) pressurePoints += 2;
    if (this.state.timeRemaining <= 120) pressurePoints += 2; // Últimos 2 minutos
    if (this.state.down >= 3) pressurePoints += 1;
    if (this.state.down === 4) pressurePoints += 2;
    
    const scoreDiff = Math.abs(this.state.scoreX - this.state.scoreY);
    if (scoreDiff <= 7) pressurePoints += 1; // Juego cerrado
    
    if (this.state.ballPosition >= 80) pressurePoints += 1; // Zona roja
    if (this.state.ballPosition <= 20) pressurePoints += 1; // Campo propio

    // Determinar nivel de presión
    if (pressurePoints >= 6) return 'extreme';
    if (pressurePoints >= 4) return 'high';
    if (pressurePoints >= 2) return 'medium';
    return 'low';
  }

  /**
   * Obtener contexto del juego
   */
  private getGameContext(): string {
    const scoreDiff = this.state.scoreX - this.state.scoreY;
    const timeRemaining = this.state.timeRemaining;
    const quarter = this.state.quarter;

    if (quarter <= 2) return "Primera mitad - establecer ritmo";
    if (quarter === 3) return "Tercer cuarto - ajustar estrategia";

    // Cuarto cuarto
    if (timeRemaining > 600) return "Inicio del cuarto final";
    if (timeRemaining > 300) return "Últimos 5 minutos - situación crítica";
    if (timeRemaining > 120) return "Últimos 2 minutos - cada jugada cuenta";
    return "Minutos finales - presión máxima";
  }

  /**
   * Simular un partido completo
   */
  public playFullGame(): {
    finalScore: { teamX: number; teamY: number };
    winner: string;
    totalPlays: number;
    totalDrives: number;
    gameLog: Array<{
      quarter: number;
      time: string;
      down: number;
      yardsToGo: number;
      ballPosition: number;
      possession: string;
      playType: string;
      result: string;
      narrative: string;
      score: { teamX: number; teamY: number };
    }>;
  } {
    this.initializeMatch();

    const gameLog: Array<any> = [];
    let playCount = 0;
    const maxPlays = 150; // Límite de seguridad

    // Kickoff inicial - capturar estado ANTES del kickoff
    const kickingTeamName = this.state.possession === 'X' ? this.teamX.name : this.teamY.name;
    const kickoffResult = this.executeKickoff();
    const receivingTeamName = this.state.possession === 'X' ? this.teamX.name : this.teamY.name;

    // Iniciar el primer drive después del kickoff
    this.startNewDrive();

    gameLog.push({
      quarter: this.state.quarter,
      time: this.formatTime(this.state.timeRemaining),
      down: 0,
      yardsToGo: 0,
      ballPosition: 35, // Posición inicial del kickoff
      possession: kickingTeamName,
      playType: 'kickoff',
      result: `Kickoff ${kickoffResult.kickDistance} yardas, ${kickoffResult.resultType === 'touchback' ? 'touchback' : `return ${kickoffResult.returnYards} yardas`}`,
      narrative: `${kickingTeamName} patea a ${receivingTeamName} - posición final yarda ${kickoffResult.finalPosition}`,
      score: { teamX: this.state.scoreX, teamY: this.state.scoreY },
      offensiveStrategy: "Kickoff profundo - buscar touchback o cobertura",
      defensiveStrategy: "Return agresivo - buscar mejor posición de campo",
      gameContext: this.getGameContext()
    });

    let quarterPlayCount = 0;
    const maxPlaysPerQuarter = 25;

    while (this.state.gamePhase !== 'finished' && playCount < maxPlays) {
      playCount++;
      quarterPlayCount++;

      // Forzar fin de cuarto si hay demasiadas jugadas
      if (quarterPlayCount >= maxPlaysPerQuarter) {
        this.state.timeRemaining = 0;
        quarterPlayCount = 0;
      }

      // Capturar estado ANTES de la jugada
      const prePlayState = {
        quarter: this.state.quarter,
        time: this.formatTime(this.state.timeRemaining),
        down: this.state.down,
        yardsToGo: this.state.yardsToGo,
        ballPosition: this.state.ballPosition,
        possession: this.state.possession === 'X' ? this.teamX.name : this.teamY.name,
        score: { teamX: this.state.scoreX, teamY: this.state.scoreY },
        offensiveStrategy: this.getOffensiveStrategy(this.state.down, this.state.yardsToGo, this.state.ballPosition),
        defensiveStrategy: this.getDefensiveStrategy(this.state.down, this.state.yardsToGo, this.state.ballPosition),
        gameContext: this.getGameContext()
      };

      // Seleccionar jugada
      const { offense, defense, playType, offensivePlayStyle } = this.selectPlay();

      // Ejecutar jugada
      const result = this.executePlay(offense, defense, playType, offensivePlayStyle);

      // Actualizar estado DESPUÉS de la jugada
      this.updateGameState(result);

      // Registrar en el log con el estado PRE-JUGADA y resultado
      gameLog.push({
        ...prePlayState,
        playType: playType || 'normal',
        result: this.getPlayResultSummary(result),
        narrative: (result as any).narrative || 'Jugada ejecutada',
        postPlayScore: { teamX: this.state.scoreX, teamY: this.state.scoreY } // Marcador después de la jugada
      });

      // Verificar condiciones especiales
      const condition = this.checkSpecialConditions();

      if (condition === 'kickoff') {
        // Capturar equipo que patea ANTES del kickoff
        const kickingTeamName = this.state.possession === 'X' ? this.teamX.name : this.teamY.name;
        const kickoffResult = this.executeKickoff();
        const receivingTeamName = this.state.possession === 'X' ? this.teamX.name : this.teamY.name;

        gameLog.push({
          quarter: this.state.quarter,
          time: this.formatTime(this.state.timeRemaining),
          down: 0,
          yardsToGo: 0,
          ballPosition: 35, // Posición inicial del kickoff
          possession: kickingTeamName,
          playType: 'kickoff',
          result: `Kickoff ${kickoffResult.kickDistance} yardas, ${kickoffResult.resultType === 'touchback' ? 'touchback' : `return ${kickoffResult.returnYards} yardas`}`,
          narrative: `${kickingTeamName} patea a ${receivingTeamName} después de anotación - posición final yarda ${kickoffResult.finalPosition}`,
          score: { teamX: this.state.scoreX, teamY: this.state.scoreY },
          offensiveStrategy: "Kickoff después de anotación",
          defensiveStrategy: "Return para mejor posición",
          gameContext: this.getGameContext(),
          postPlayScore: { teamX: this.state.scoreX, teamY: this.state.scoreY }
        });
      } else if (condition === 'end_game') {
        this.state.gamePhase = 'finished';
        break;
      }

      // Avanzar tiempo (simulación simple)
      this.state.timeRemaining = Math.max(0, this.state.timeRemaining - (25 + Math.floor(Math.random() * 15)));

      // Cambiar cuarto si se acaba el tiempo
      if (this.state.timeRemaining <= 0 && this.state.quarter < 4) {
        this.state.quarter++;
        this.state.timeRemaining = 15 * 60; // 15 minutos
        quarterPlayCount = 0; // Resetear contador de jugadas por cuarto
      } else if (this.state.timeRemaining <= 0 && this.state.quarter >= 4) {
        this.state.gamePhase = 'finished';
        break;
      }
    }

    const stats = this.getMatchStats();
    return {
      finalScore: stats.finalScore,
      winner: stats.winner,
      totalPlays: stats.totalPlays,
      totalDrives: stats.totalDrives,
      gameLog
    };
  }

  /**
   * Obtener resumen del resultado de una jugada
   */
  private getPlayResultSummary(result: any): string {
    switch (result.type) {
      case 'offensive_gain':
        return `${result.yardsGained >= 0 ? '+' : ''}${result.yardsGained} yardas`;
      case 'touchdown':
        return `TOUCHDOWN ${result.yardsGained} yardas`;
      case 'kick_result':
        if (result.kickType === 'field_goal') {
          return result.result === 'made' ? `Field Goal BUENO ${result.distance} yardas` : `Field Goal FALLADO ${result.distance} yardas`;
        } else if (result.kickType === 'extra_point') {
          return result.result === 'made' ? `EXTRA POINT BUENO` : `EXTRA POINT FALLADO`;
        }
        return `Pateo ${result.result}`;
      case 'two_point_conversion':
        return result.successful ? `CONVERSIÓN 2 PUNTOS EXITOSA` : `CONVERSIÓN 2 PUNTOS FALLIDA`;
      case 'punt_result':
        return `Punt ${result.puntDistance} yardas, return ${result.returnYards}`;
      case 'fumble':
        return `FUMBLE - recuperado por ${result.recoveringTeam ? result.recoveringTeam.name : 'la defensa'}`;
      case 'interception':
        return `INTERCEPCIÓN - return ${result.returnYards} yardas`;
      case 'incomplete_pass':
        return `Pase incompleto`;
      case 'kickoff_result':
        return `Kickoff ${result.kickDistance} yardas`;
      case 'kneel':
        return `Kneel down - tiempo consumido`;
      case 'spike':
        return `Spike - reloj parado`;
      case 'safety':
        return `SAFETY - 2 puntos`;
      default:
        return 'Jugada ejecutada';
    }
  }

  // Métodos auxiliares simplificados (implementaciones básicas)
  private executePunt(offense: OffensiveTeam, defense: DefensiveTeam): PuntResult {
    return {
      type: 'punt_result',
      resultType: 'return',
      puntDistance: 40,
      hangTime: 4.0,
      returnYards: 0,
      netYards: 40,
      puntQuality: 'good',
      fieldPositionImpact: 'good'
    };
  }

  private executeFieldGoal(offense: OffensiveTeam): KickResult {
    const distance = 100 - this.state.ballPosition + 17;
    const isGood = Math.random() < 0.7; // 70% de probabilidad

    return {
      type: 'kick_result',
      kickType: 'field_goal',
      result: isGood ? 'made' : 'missed',
      distance,
      direction: 'center',
      kickQuality: 'good',
      pressure: 'light'
    };
  }

  private executeExtraPoint(): KickResult {
    const isGood = Math.random() < 0.95; // 95% de probabilidad

    return {
      type: 'kick_result',
      kickType: 'extra_point',
      result: isGood ? 'made' : 'missed',
      distance: 33,
      direction: 'center',
      kickQuality: 'good',
      pressure: 'light'
    };
  }

  private executeTwoPointConversion(): PlayResult {
    const successful = Math.random() < 0.45; // 45% de probabilidad

    return {
      type: 'two_point_conversion',
      successful,
      playType: 'pass',
      keyPlayers: [],
      yardsNeeded: 2,
      executionQuality: successful ? 'good' : 'fair',
      gameImpact: 'important'
    };
  }

  private executeKneelDown(): PlayResult {
    return {
      type: 'kneel',
      purpose: 'victory_formation',
      quarterback: {} as any,
      timeConsumed: 40,
      gameStatus: 'victory_assured'
    };
  }

  private executeSpike(): PlayResult {
    return {
      type: 'spike',
      purpose: 'stop_clock',
      timeRemaining: this.state.timeRemaining,
      quarterback: {} as any,
      strategicValue: 'necessary'
    };
  }

  private executeRunningActionWithModifiers(
    action: RunningPlayAction,
    offense: OffensiveTeam,
    defense: DefensiveTeam,
    adjustments: any,
    teamBonus: number
  ): PlayResult {
    const yardsGained = Math.max(-3, Math.min(25, Math.floor(Math.random() * 15) - 2));

    if (this.state.ballPosition + yardsGained >= 100) {
      return {
        type: 'touchdown',
        yardsGained,
        touchdownType: 'rushing_td',
        celebrationLevel: 'moderate',
        difficultyRating: 'moderate',
        gameImpact: 'momentum_shift'
      };
    }

    return {
      type: 'offensive_gain',
      subType: yardsGained >= 15 ? 'explosive_gain' : 'medium_gain',
      yardsGained,
      brokenTackles: 0,
      gainType: 'power_run',
      difficultyLevel: 'routine'
    };
  }

  private executePassingActionWithModifiers(
    action: PassingPlayAction,
    offense: OffensiveTeam,
    defense: DefensiveTeam,
    adjustments: any,
    teamBonus: number
  ): PlayResult {
    const completionChance = 0.6;

    if (Math.random() < completionChance) {
      const yardsGained = Math.max(1, Math.floor(Math.random() * 20) + 3);

      if (this.state.ballPosition + yardsGained >= 100) {
        return {
          type: 'touchdown',
          yardsGained,
          touchdownType: 'passing_td',
          celebrationLevel: 'moderate',
          difficultyRating: 'moderate',
          gameImpact: 'momentum_shift'
        };
      }

      return {
        type: 'offensive_gain',
        subType: yardsGained >= 15 ? 'explosive_gain' : 'medium_gain',
        yardsGained,
        brokenTackles: 0,
        gainType: 'short_pass',
        difficultyLevel: 'routine'
      };
    } else {
      if (Math.random() < 0.05) {
        return {
          type: 'interception',
          returnYards: Math.floor(Math.random() * 15),
          returnTouchdown: false,
          interceptionType: 'poor_throw',
          difficultyLevel: 'easy',
          gameImpact: 'momentum_shift'
        };
      }

      return {
        type: 'incomplete_pass',
        reason: 'defended',
        passQuality: 'fair',
        catchDifficulty: 'moderate'
      };
    }
  }

  private calculateRealismModifiers(): any {
    return {
      adjustmentBonus: 0,
      realismApplied: true
    };
  }

  private handlePostTouchdown(): { decision: 'extra_point' | 'two_point_conversion'; reasoning: string } {
    return {
      decision: 'extra_point',
      reasoning: 'Situación estándar - extra point más seguro'
    };
  }

  private checkSpecialConditions(): 'continue' | 'new_drive' | 'kickoff' | 'end_game' {
    if (this.state.ballPosition >= 100) {
      return 'kickoff';
    }

    if (this.state.down > 4) {
      this.changePossessionWithFieldFlip();
      return 'new_drive';
    }

    if (this.state.timeRemaining <= 0 && this.state.quarter >= 4) {
      this.state.gamePhase = 'finished';
      return 'end_game';
    }

    return 'continue';
  }

  private getMatchStats(): {
    finalScore: { teamX: number; teamY: number };
    totalPlays: number;
    totalDrives: number;
    winner: string;
  } {
    const winner = this.state.scoreX > this.state.scoreY ? this.teamX.name :
      this.state.scoreY > this.state.scoreX ? this.teamY.name : 'EMPATE';

    return {
      finalScore: { teamX: this.state.scoreX, teamY: this.state.scoreY },
      totalPlays: this.totalPlays,
      totalDrives: this.drives.length,
      winner
    };
  }

  /**
   * Obtener estadísticas detalladas de drives
   */
  public getDriveStats(): {
    totalDrives: number;
    successfulDrives: number;
    averageYardsPerDrive: number;
    averagePlaysPerDrive: number;
    longestDrive: Drive | null;
    drivesByTeam: { [teamName: string]: Drive[] };
  } {
    const successfulDrives = this.drives.filter(drive => drive.isSuccessful()).length;
    const totalYards = this.drives.reduce((sum, drive) => sum + drive.getStats().totalYards, 0);
    const totalPlays = this.drives.reduce((sum, drive) => sum + drive.getStats().totalPlays, 0);

    const longestDrive = this.drives.reduce((longest, current) => {
      const currentStats = current.getStats();
      const longestStats = longest ? longest.getStats() : { totalPlays: 0 };
      return currentStats.totalPlays > longestStats.totalPlays ? current : longest;
    }, null as Drive | null);

    const drivesByTeam: { [teamName: string]: Drive[] } = {};
    this.drives.forEach(drive => {
      const teamName = drive.offensiveTeam.name;
      if (!drivesByTeam[teamName]) {
        drivesByTeam[teamName] = [];
      }
      drivesByTeam[teamName].push(drive);
    });

    return {
      totalDrives: this.drives.length,
      successfulDrives,
      averageYardsPerDrive: this.drives.length > 0 ? totalYards / this.drives.length : 0,
      averagePlaysPerDrive: this.drives.length > 0 ? totalPlays / this.drives.length : 0,
      longestDrive,
      drivesByTeam
    };
  }

  /**
   * Obtener análisis de acciones del partido
   */
  public getActionAnalysis(): {
    totalActions: number;
    runningActions: number;
    passingActions: number;
    averageExpectedYards: number;
    mostCommonPlayTypes: { [playType: string]: number };
  } {
    const runningActions = this.gameActions.filter(action => action.actionType === 'running').length;
    const passingActions = this.gameActions.filter(action => action.actionType === 'passing').length;

    const totalExpectedYards = this.gameActions.reduce((sum, action) => sum + action.expectedYards, 0);
    const averageExpectedYards = this.gameActions.length > 0 ? totalExpectedYards / this.gameActions.length : 0;

    const playTypeCounts: { [playType: string]: number } = {};
    this.gameActions.forEach(action => {
      const playType = action.playType;
      playTypeCounts[playType] = (playTypeCounts[playType] || 0) + 1;
    });

    return {
      totalActions: this.gameActions.length,
      runningActions,
      passingActions,
      averageExpectedYards,
      mostCommonPlayTypes: playTypeCounts
    };
  }

  /**
   * Obtener resumen de jugadas destacadas
   */
  public getHighlightPlays(): Play[] {
    return this.plays.filter(play => {
      const result = play.result;
      return result.isScore ||
        result.isTurnover ||
        Math.abs(result.yardsGained) >= 15 ||
        (play.down === 4 && result.isFirstDown);
    });
  }
}