// SimpleMatch - Sistema simplificado de simulación de partidos
// Integra PlayCalculator con el estado del juego para simular jugadas

import { TeamMatch } from '../teams/TeamMatch';
import { CompleteGameState } from './GameState';
import { PlayResult } from './PlayResults';
import { PlayCalculator, OffensiveActionSet, DefensiveActionSet, PlayCalculationContext } from './PlayCalculator';
import { Drive, DriveConfig } from './Drive';
import { Narrative } from '../narration/Narrative';
import { RunningPlayAction, PassingPlayAction } from './Actions';
import { Play } from './Play';

/**
 * Estado simplificado del partido
 */
export interface SimpleMatchState {
  scoreX: number;
  scoreY: number;
  quarter: number;
  timeRemaining: number;
  down: number;
  yardsToGo: number;
  ballPosition: number;
  possession: 'X' | 'Y';
  gamePhase: 'kickoff' | 'normal' | 'extra_point' | 'two_point_conversion' | 'finished';
}

/**
 * Simulador simplificado de partidos usando PlayCalculator
 */
export class SimpleMatch {
  public teamX: TeamMatch;
  public teamY: TeamMatch;
  public state: SimpleMatchState;
  public narrative: Narrative;

  // Sistema de drives
  public currentDrive?: Drive;
  public driveHistory: Drive[] = [];

  // Estadísticas del partido
  public totalPlays: number = 0;
  public playHistory: PlayResult[] = [];

  constructor(teamX: TeamMatch, teamY: TeamMatch) {
    this.teamX = teamX;
    this.teamY = teamY;
    this.narrative = new Narrative();

    // Estado inicial del partido - ANTES del kickoff inicial
    this.state = {
      scoreX: 0,
      scoreY: 0,
      quarter: 1,
      timeRemaining: 900, // 15 minutos por cuarto
      down: 1,
      yardsToGo: 10,
      ballPosition: 35, // Posición de kickoff (yarda 35 del equipo que patea)
      possession: 'Y', // Y patea el kickoff inicial, X lo recibe
      gamePhase: 'kickoff' // La primera jugada será un kickoff
    };

    console.log(`🏈 PARTIDO INICIADO: ${this.teamY.name} vs ${this.teamX.name}`);
    console.log(`🏈 PRÓXIMA JUGADA: Kickoff inicial - ${this.teamY.name} patea a ${this.teamX.name}`);
  }



  /**
   * Inicia un nuevo drive
   */
  private startNewDrive(): void {
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
  }

  /**
   * Finaliza el drive actual
   */
  private finalizeDrive(result: 'touchdown' | 'turnover' | 'punt' | 'field_goal' | 'end_of_half'): void {
    if (this.currentDrive) {
      this.currentDrive.finalize(result);
      this.driveHistory.push(this.currentDrive);
      console.log(`Drive finalizado: ${this.currentDrive.getSummary()}`);
      this.currentDrive = undefined;
    }
  }

  /**
   * Simula la siguiente jugada del partido - MÉTODO PRINCIPAL
   */
  public nextPlay(): PlayResult {
    // Verificar si el juego ha terminado
    if (this.state.gamePhase === 'finished') {
      throw new Error('El partido ha terminado');
    }

    const result = this.playNextPlay();

    // Registrar en la narrativa
    const calculation = this.getLastCalculation();
    if (calculation) {
      this.narrative.recordPlay(calculation.narrative, result);
    }

    return result;
  }

  private lastCalculation?: any;

  private getLastCalculation() {
    return this.lastCalculation;
  }

  /**
   * Juega la siguiente jugada usando el coaching staff para tomar decisiones
   */
  private playNextPlay(): PlayResult {
    // Obtener equipos y coaching staff
    const possessionTeam = this.state.possession === 'X' ? this.teamX : this.teamY;
    const NoPossTeam = this.state.possession === 'X' ? this.teamY : this.teamX;

    // Crear situación para el coaching staff
    const situation = {
      down: this.state.down,
      yardsToGo: this.state.yardsToGo,
      fieldPosition: this.state.ballPosition,
      timeRemaining: this.state.timeRemaining,
      scoreDifference: this.state.scoreX - this.state.scoreY
    };

    // 1. Manejar kickoff (primera jugada o después de score)
    if (this.state.gamePhase === 'kickoff') {
      console.log(`🏈 KICKOFF: ${possessionTeam.name} patea a ${NoPossTeam.name}`);
      return this.executeKickoff();
    }

    // 2. Manejar decisiones especiales de 4to down
    if (this.state.down === 4) {
      const fourthDownDecision = possessionTeam.coachingStaff.makeFourthDownDecision(
        this.state.yardsToGo,
        this.state.ballPosition,
        this.state.timeRemaining,
        situation.scoreDifference
      );

      if (fourthDownDecision.decision === 'punt') {
        console.log(`🦶 ${possessionTeam.name} decide hacer punt`);
        return this.executePunt();
      } else if (fourthDownDecision.decision === 'field_goal') {
        console.log(`🥅 ${possessionTeam.name} intenta field goal`);
        return this.executeFieldGoal();
      }
      // Si decide 'go', continúa con jugada normal
    }

    // 3. Jugada normal - crear unidades
    const offensiveUnit = possessionTeam.createOffensiveUnit();
    const defensiveUnit = NoPossTeam.createDefensiveUnit();

    // 4. El coaching staff ofensivo decide la jugada
    const offensiveDecision = possessionTeam.coachingStaff.createOffensiveDecision(
      offensiveUnit,
      defensiveUnit,
      situation
    );

    // 5. El coaching staff defensivo responde
    const defensiveDecision = NoPossTeam.coachingStaff.createDefensiveResponse(
      offensiveUnit,
      defensiveUnit,
      offensiveDecision.staffDecision.playType,
      {
        down: this.state.down,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: this.state.ballPosition
      }
    );

    // 6. Crear OffensiveActionSet y DefensiveActionSet usando las decisiones del staff
    const offensiveActions: OffensiveActionSet = {
      primaryAction: offensiveDecision.action,
      formation: offensiveDecision.formation,
      personnel: offensiveDecision.personnel
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: defensiveDecision.formation as any,
        personnel: {
          defensiveLinemen: [],
          linebackers: [],
          cornerbacks: [],
          safeties: []
        },
        strengths: ['run_defense', 'pass_coverage'],
        weaknesses: ['deep_coverage']
      },
      adjustments: defensiveDecision.adjustments
    };

    // 7. Log de las decisiones del coaching staff
    console.log(`Decisión Ofensiva: ${offensiveDecision.reasoning}`);
    console.log(`Respuesta Defensiva: ${defensiveDecision.reasoning}`);

    // 8. Ejecutar la jugada normal
    return this.executePlay(offensiveActions, defensiveActions);
  }


  /**
   * Ejecuta un kickoff usando PlayCalculator
   */
  private executeKickoff(): PlayResult {
    const kickoffAction = {
      actionType: 'kickoff' as const,
      kickoffType: 'normal_kickoff' as const,
      kickerStrength: 80,
      surpriseFactor: 0,
      targetArea: 'deep' as const,
      hangTime: 4.2
    };

    const offensiveActions: OffensiveActionSet = {
      primaryAction: kickoffAction,
      formation: 'kickoff',
      personnel: 'special_teams'
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: '4-3',
        personnel: {
          defensiveLinemen: [],
          linebackers: [],
          cornerbacks: [],
          safeties: []
        },
        strengths: ['run_defense'],
        weaknesses: []
      },
      adjustments: []
    };

    return this.executePlay(offensiveActions, defensiveActions);
  }

  /**
   * Ejecuta un punt usando PlayCalculator
   */
  private executePunt(): PlayResult {
    const puntAction = {
      actionType: 'punt' as const,
      puntType: 'normal_punt' as const,
      punterStrength: 75,
      hangTime: 4.5,
      surpriseFactor: 0,
      targetArea: 'deep' as const
    };

    const offensiveActions: OffensiveActionSet = {
      primaryAction: puntAction,
      formation: 'punt',
      personnel: 'special_teams'
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: '4-3',
        personnel: {
          defensiveLinemen: [],
          linebackers: [],
          cornerbacks: [],
          safeties: []
        },
        strengths: ['run_defense'],
        weaknesses: []
      },
      adjustments: []
    };

    return this.executePlay(offensiveActions, defensiveActions);
  }

  /**
   * Ejecuta un field goal usando PlayCalculator
   */
  private executeFieldGoal(): PlayResult {
    const distance = 100 - this.state.ballPosition + 17;

    const fieldGoalAction = {
      actionType: 'field_goal' as const,
      fieldGoalType: 'normal_field_goal' as const,
      distance: distance,
      kickerAccuracy: 85,
      surpriseFactor: 0,
      kickerRange: 50
    };

    const offensiveActions: OffensiveActionSet = {
      primaryAction: fieldGoalAction,
      formation: 'field_goal',
      personnel: 'special_teams'
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: '4-3',
        personnel: {
          defensiveLinemen: [],
          linebackers: [],
          cornerbacks: [],
          safeties: []
        },
        strengths: ['run_defense'],
        weaknesses: []
      },
      adjustments: []
    };

    return this.executePlay(offensiveActions, defensiveActions);
  }

  /**
   * Convierte el tipo de acción especial al tipo de returner correspondiente
   */
  private getReturnerTypeFromAction(actionType: string): 'kickoff_return' | 'punt_return' | 'field_goal_defense' | 'extra_point_defense' {
    switch (actionType) {
      case 'kickoff':
        return 'kickoff_return';
      case 'punt':
        return 'punt_return';
      case 'field_goal':
        return 'field_goal_defense';
      default:
        return 'kickoff_return';
    }
  }

  /**
   * Ejecuta una jugada usando PlayCalculator
   */
  public executePlay(
    offensiveActions: OffensiveActionSet,
    defensiveActions: DefensiveActionSet
  ): PlayResult {

    this.totalPlays++;

    // Obtener equipos
    const offensiveTeam = this.state.possession === 'X' ?
      this.teamX.createOffensiveUnit() : this.teamY.createOffensiveUnit();
    const defensiveTeam = this.state.possession === 'X' ?
      this.teamY.createDefensiveUnit() : this.teamX.createDefensiveUnit();

    // Crear equipos especiales si es necesario
    let kickerTeam, returnerTeam;
    const primaryAction = offensiveActions.primaryAction;

    if ('actionType' in primaryAction &&
      ['kickoff', 'punt', 'field_goal'].includes(primaryAction.actionType)) {
      // Para acciones especiales, el equipo con posesión es el kicker
      kickerTeam = this.state.possession === 'X' ?
        this.teamX.createKickerTeam(primaryAction.actionType as any) :
        this.teamY.createKickerTeam(primaryAction.actionType as any);

      returnerTeam = this.state.possession === 'X' ?
        this.teamY.createReturnerTeam(this.getReturnerTypeFromAction(primaryAction.actionType)) :
        this.teamX.createReturnerTeam(this.getReturnerTypeFromAction(primaryAction.actionType));
    }

    // Crear estado completo del juego
    const gameState = this.createCompleteGameState();

    // Crear contexto para PlayCalculator
    const context: PlayCalculationContext = {
      gameState,
      offensiveActions,
      defensiveActions,
      offensiveTeam,
      defensiveTeam,
      kickerTeam,
      returnerTeam
    };

    // Calcular resultado de la jugada
    const calculation = PlayCalculator.calculatePlay(context);
    const result = calculation.result;

    // Guardar cálculo para narrativa
    this.lastCalculation = calculation;

    // Registrar resultado
    this.playHistory.push(result);

    // Agregar jugada al drive actual
    if (this.currentDrive) {
      const yardsGained = this.extractYardsFromResult(result);
      const playForDrive = {
        ballPosition: this.state.ballPosition,
        result: {
          yardsGained,
          timeElapsed: 35, // Tiempo promedio
          isFirstDown: yardsGained >= this.state.yardsToGo || result.type === 'first_down'
        }
      };
      this.currentDrive.addPlay(playForDrive);
    }

    // Actualizar estado del juego
    this.updateGameState(result);

    // Log de la jugada
    console.log(`Q${this.state.quarter} ${Math.floor(this.state.timeRemaining / 60)}:${(this.state.timeRemaining % 60).toString().padStart(2, '0')} - ${this.state.possession} ${this.state.down}/${this.state.yardsToGo} at ${this.state.ballPosition}: ${calculation.narrative}`);

    return result;
  }


  /**
   * Obtiene situaciones especiales actuales
   */
  private getSpecialSituations() {
    const situations = [];

    if (this.state.ballPosition >= 80) situations.push('red_zone');
    if (this.state.ballPosition >= 95) situations.push('goal_line');
    if (this.state.down === 4) situations.push('fourth_down');
    if (this.state.yardsToGo <= 3) situations.push('short_yardage');
    if (this.state.yardsToGo >= 8) situations.push('long_yardage');
    if (this.state.timeRemaining <= 120) situations.push('two_minute_drill');

    return situations as any[];
  }

  /**
   * Calcula el nivel de presión
   */
  private calculatePressureLevel(): 'low' | 'medium' | 'high' | 'extreme' {
    let pressurePoints = 0;

    if (this.state.quarter >= 4) pressurePoints += 2;
    if (this.state.down >= 3) pressurePoints += 1;
    if (this.state.down === 4) pressurePoints += 2;
    if (this.state.ballPosition >= 80) pressurePoints += 1;

    const scoreDiff = Math.abs(this.state.scoreX - this.state.scoreY);
    if (scoreDiff <= 7) pressurePoints += 1;

    if (pressurePoints >= 6) return 'extreme';
    if (pressurePoints >= 4) return 'high';
    if (pressurePoints >= 2) return 'medium';
    return 'low';
  }

  /**
   * Actualiza el estado del juego basándose en el resultado
   */
  private updateGameState(result: PlayResult): void {
    // Manejar jugadas especiales primero
    if (result.type === 'kickoff_result') {
      this.handleKickoffResult(result);
      return;
    }

    if (result.type === 'punt_result') {
      this.handlePuntResult(result);
      return;
    }

    if (result.type === 'kick_result') {
      this.handleFieldGoalResult(result);
      return;
    }

    // Jugadas normales
    const yardsGained = this.extractYardsFromResult(result);

    // Actualizar posición del balón
    const newPosition = this.state.ballPosition + yardsGained;

    // Verificar touchdown
    if (newPosition >= 100) {
      // Touchdown!
      if (this.state.possession === 'X') {
        this.state.scoreX += 6;
      } else {
        this.state.scoreY += 6;
      }

      console.log(`🏈 ¡TOUCHDOWN! ${this.state.possession === 'X' ? this.teamX.name : this.teamY.name} anota 6 puntos`);

      this.finalizeDrive('touchdown');

      // Simular extra point (automático por ahora)
      if (this.state.possession === 'X') {
        this.state.scoreX += 1;
      } else {
        this.state.scoreY += 1;
      }
      console.log(`✅ Extra point bueno - Score: ${this.teamX.name} ${this.state.scoreX} - ${this.teamY.name} ${this.state.scoreY}`);

      // Después del touchdown, el equipo que anotó patea
      this.changePossessionAfterScore();
      return;
    }

    this.state.ballPosition = Math.max(0, Math.min(100, newPosition));

    // Consumir tiempo
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - 35);

    // Verificar primer down
    if (yardsGained >= this.state.yardsToGo || result.type === 'first_down') {
      this.state.down = 1;
      this.state.yardsToGo = 10;
    } else {
      this.state.down++;
      this.state.yardsToGo -= yardsGained;
    }

    // Manejar cambios de posesión
    if (result.type === 'interception' || result.type === 'fumble') {
      this.finalizeDrive('turnover');
      this.changePossession();
    } else if (this.state.down > 4) {
      this.finalizeDrive('turnover');
      this.changePossession();
    }

    // Verificar fin de cuarto
    if (this.state.timeRemaining <= 0) {
      this.advanceQuarter();
    }
  }

  /**
   * Maneja el resultado de un kickoff
   */
  private handleKickoffResult(result: any): void {
    this.state.gamePhase = 'normal';

    // Cambiar posesión al equipo que recibe
    this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';

    // Calcular posición final
    if (result.resultType === 'touchback') {
      this.state.ballPosition = 25;
    } else {
      this.state.ballPosition = Math.min(50, result.finalPosition || 25);
    }

    this.state.down = 1;
    this.state.yardsToGo = 10;

    console.log(`📍 Kickoff: ${this.state.possession === 'X' ? this.teamX.name : this.teamY.name} inicia en la yarda ${this.state.ballPosition}`);

    this.startNewDrive();
  }

  /**
   * Maneja el resultado de un punt
   */
  private handlePuntResult(result: any): void {
    this.finalizeDrive('punt');

    // Cambiar posesión
    this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';

    // Calcular nueva posición (desde la perspectiva del equipo receptor)
    const netYards = result.netYards || 35;
    this.state.ballPosition = Math.max(5, Math.min(95, 100 - (this.state.ballPosition + netYards)));

    this.state.down = 1;
    this.state.yardsToGo = 10;

    console.log(`📍 Punt: ${result.puntDistance} yardas, retorno ${result.returnYards}. ${this.state.possession === 'X' ? this.teamX.name : this.teamY.name} inicia en la yarda ${this.state.ballPosition}`);

    this.startNewDrive();
  }

  /**
   * Maneja el resultado de un field goal
   */
  private handleFieldGoalResult(result: any): void {
    this.finalizeDrive('field_goal');

    if (result.result === 'made') {
      // Field goal exitoso
      if (this.state.possession === 'X') {
        this.state.scoreX += 3;
      } else {
        this.state.scoreY += 3;
      }
      console.log(`✅ ¡Field goal bueno de ${result.distance} yardas! Score: ${this.teamX.name} ${this.state.scoreX} - ${this.teamY.name} ${this.state.scoreY}`);

      // Después del field goal exitoso, kickoff
      this.changePossessionAfterScore();
    } else {
      // Field goal fallado
      console.log(`❌ Field goal fallado de ${result.distance} yardas`);

      // El otro equipo toma posesión donde estaba el balón
      this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';
      this.state.down = 1;
      this.state.yardsToGo = 10;

      console.log(`🔄 ${this.state.possession === 'X' ? this.teamX.name : this.teamY.name} toma posesión en la yarda ${this.state.ballPosition}`);
      this.startNewDrive();
    }
  }

  /**
   * Extrae yardas ganadas del resultado
  */
  private extractYardsFromResult(result: PlayResult): number {
    if ('yardsGained' in result) {
      return result.yardsGained;
    } else if ('yardsLost' in result) {
      return -result.yardsLost;
    }
    return 0;
  }

  /**
   * Cambia la posesión del balón (para punts, turnovers, etc.)
  */
  private changePossession(): void {
    this.state.possession = this.state.possession === 'X' ? 'Y' : 'X';
    this.state.ballPosition = 100 - this.state.ballPosition;
    this.state.down = 1;
    this.state.yardsToGo = 10; // OJO

    console.log(`🔄 Cambio de posesión: ${this.state.possession === 'X' ? this.teamX.name : this.teamY.name} tiene el balón en la yarda ${this.state.ballPosition}`);

    // Iniciar nuevo drive
    this.startNewDrive();
  }

  /**
   * Cambia la posesión después de un score (touchdown/field goal)
  */
  private changePossessionAfterScore(): void {
    // El equipo que anotó patea, el que no anotó recibe
    // Mantener la posesión del equipo que anotó para que patee
    this.state.gamePhase = 'kickoff';
    this.state.ballPosition = 35; // Posición de kickoff
    this.state.down = 1;
    this.state.yardsToGo = 10;

    console.log(`🏈 PRÓXIMO: Kickoff - ${this.state.possession === 'X' ? this.teamX.name : this.teamY.name} patea`);
  }

  /**
   * Avanza al siguiente cuarto
  */
  private advanceQuarter(): void {
    this.state.quarter++;

    if (this.state.quarter <= 4) {
      this.state.timeRemaining = 900;
      if (this.state.quarter === 3) {
        this.changePossession();
      }
    } else {
      this.state.gamePhase = 'finished';
    }
  }

  /**
   * Obtiene el estado actual
   */
  public getCurrentState(): SimpleMatchState {
    return { ...this.state };
  }

  /**
   * Obtiene el drive actual
   */
  public getCurrentDrive(): Drive | null {
    return this.currentDrive ?? null;
  }

  /**
   * Obtiene el historial de drives
  */
  public getDriveHistory(): Drive[] {
    return [...this.driveHistory];
  }

  /***************************************************************************************** */
  /**
   * Crea el estado completo del juego para PlayCalculator
   */
  private createCompleteGameState(): CompleteGameState {
    // Implementación simplificada - en la realidad sería más completa
    return {
      globalContext: {
        scoreTeamX: this.state.scoreX,
        scoreTeamY: this.state.scoreY,
        currentQuarter: this.state.quarter,
        timeRemainingInQuarter: this.state.timeRemaining,
        totalTimeElapsed: (this.state.quarter - 1) * 900 + (900 - this.state.timeRemaining),
        possessionTeam: this.state.possession === 'X' ? this.teamX : this.teamY,
        defendingTeam: this.state.possession === 'X' ? this.teamY : this.teamX,
        timeoutsRemainingX: 3,
        timeoutsRemainingY: 3,
        externalConditions: {
          weather: 'clear',
          temperature: 20,
          windSpeed: 0,
          windDirection: 'north',
          stadiumNoise: 50,
          fieldCondition: 'excellent'
        },
        gamePhase: this.state.quarter <= 2 ? 'first_half' : 'second_half',
        isTwoMinuteWarning: this.state.timeRemaining <= 120
      },
      driveContext: {
        driveNumber: 1, // Simplificado
        startingFieldPosition: this.state.ballPosition,
        startingTime: this.state.timeRemaining,
        startingQuarter: this.state.quarter,
        immediateGoal: this.state.ballPosition >= 80 ? 'touchdown' : 'first_down',
        playsInDrive: [],
        totalYardsGained: 0,
        totalTimeTaken: 0,
        firstDownsEarned: 0,
        penaltiesCommitted: 0
      },
      playContext: {
        down: this.state.down,
        yardsToGo: this.state.yardsToGo,
        fieldPosition: {
          yardLine: this.state.ballPosition,
          hashMark: 'center',
          redZone: this.state.ballPosition >= 80,
          goalLine: this.state.ballPosition >= 95
        },
        offensiveFormation: 'shotgun', // Simplificado
        offensivePersonnel: {
          quarterbacks: 1,
          runningBacks: 1,
          wideReceivers: 3,
          tightEnds: 1,
          offensiveLinemen: 5,
          personnel: '11'
        },
        defensiveFormation: '4-3', // Simplificado
        defensivePersonnel: {
          defensiveLinemen: 4,
          linebackers: 3,
          cornerbacks: 2,
          safeties: 2,
          coverage: 'cover_2'
        },
        offensivePlayersOnField: [], // Simplificado
        defensivePlayersOnField: [], // Simplificado
        preSnapMovements: {
          motions: [],
          audibles: [],
          lineAdjustments: [],
          timeoutCalled: false,
          delayCalled: false
        },
        specialSituations: this.getSpecialSituations(),
        availablePlayTypes: ['normal_play']
      },
      stateId: `play_${this.totalPlays}`,
      timestamp: Date.now(),
      momentum: 'neutral', // Simplificado
      pressure: this.calculatePressureLevel(),
      gameFlow: 'balanced' // Simplificado
    };
  }
}