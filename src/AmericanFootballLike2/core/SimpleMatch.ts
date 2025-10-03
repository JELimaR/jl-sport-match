// SimpleMatch - Flujo completo de partido integrando con el sistema existente
// Usa ExpandedPlayState, PlayResult y el sistema completo de acciones

import { TeamMatch } from '../teams/TeamMatch';
import { ExpandedPlayState, SimpleGameState } from './ExpandedPlayState';
import { PlayResult, PlayResultAnalyzer, KickoffResult, PuntResult, KickResult, Touchdown } from './PlayResults';
import { RunningPlayAction, PassingPlayAction } from './Actions';
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
   * Ejecutar jugada usando el sistema completo con Actions y staff técnico
   */
  public executePlay(offense: OffensiveTeam, defense: DefensiveTeam, playType: string, offensivePlayStyle?: string): PlayResult {
    this.totalPlays++;

    let result: PlayResult;

    const offensiveTeam = this.state.possession === 'X' ? this.teamX : this.teamY;
    const defensiveTeam = this.state.possession === 'X' ? this.teamY : this.teamX;

    // Manejar jugadas especiales de tempo
    if (playType === 'kneel') {
      return this.executeKneelDown();
    } else if (playType === 'spike') {
      return this.executeSpike();
    } else if (playType === 'extra_point') {
      const kickResult = this.executeExtraPoint();
      return kickResult;
    } else if (playType === 'two_point_conversion') {
      return this.executeTwoPointConversion();
    }

    // Manejar diferentes tipos de jugadas normales
    if (playType === 'punt') {
      result = this.executePunt(offense, defense);
    } else if (playType === 'field_goal') {
      result = this.executeFieldGoal(offense);
    } else {
      // Jugadas normales (go_for_it, normal, etc.)
      const situationDown = playType === 'go_for_it' ? 3 : this.state.down;
      const offensiveDecision = offensiveTeam.createOffensiveAction(offense, defense, {
        down: situationDown,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: this.state.ballPosition,
        timeRemaining: this.state.timeRemaining,
        scoreDifference: this.state.scoreX - this.state.scoreY
      });

      const action = offensiveDecision.action;

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

      // Ejecutar la action con todos los modificadores
      if (action.actionType === 'running') {
        result = this.executeRunningActionWithModifiers(
          action as RunningPlayAction,
          offense,
          defense,
          { ...defensiveResponse.adjustments, ...realismModifiers },
          actionEvaluation.teamAttributeBonus
        );
      } else {
        result = this.executePassingActionWithModifiers(
          action as PassingPlayAction,
          offense,
          defense,
          { ...defensiveResponse.adjustments, ...realismModifiers },
          actionEvaluation.teamAttributeBonus
        );
      }
    }

    return result;
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

      // Preparar para kickoff - el equipo que anotó patea
      this.state.gamePhase = 'kickoff';
      this.state.ballPosition = 35; // Kickoff desde la 35
      this.state.down = 0; // Kickoff no tiene down
      this.state.yardsToGo = 0; // Kickoff no tiene yardsToGo
      // NO cambiar posesión aquí - el equipo que anotó mantiene posesión para patear

    } else if (result.type === 'kick_result' || result.type === 'two_point_conversion') {
      // Después de conversión - preparar para kickoff
      this.state.gamePhase = 'kickoff';
      this.state.ballPosition = 35; // Kickoff desde la 35
      this.state.down = 0; // Kickoff no tiene down
      this.state.yardsToGo = 0; // Kickoff no tiene yardsToGo
      // NO cambiar posesión aquí - el equipo que anotó mantiene posesión para patear

    } else if (stats.turnover) {
      // Turnover - cambio de posesión con inversión de campo
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
    this.totalDrives++;
  }

  /**
   * Cambiar posesión con inversión de campo (para turnovers normales)
   */
  private changePossessionWithFieldFlip(): void {
    this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';
    this.state.down = 1;
    this.state.yardsToGo = 10;
    this.state.ballPosition = 100 - this.state.ballPosition; // Invertir campo
    this.totalDrives++;
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
      totalDrives: this.totalDrives,
      winner
    };
  }
}