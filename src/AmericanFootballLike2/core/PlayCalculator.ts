// PlayCalculator - Calcula el resultado de una jugada basándose en el estado del juego
// y las acciones combinadas de los equipos ofensivos y defensivos

import { CompletePlayState, CompleteGameState } from './GameState';
import { PlayResult } from './PlayResults';
import {
  RunningPlayAction,
  PassingPlayAction,
  QuarterbackAction,
  TempoAction,
  DefensiveFormationAction,
  PassCoverageAction,
  KickoffAction,
  PuntAction,
  FieldGoalAction,
  TrickPlayAction,
  SituationalPlayAction
} from './Actions';
import { OffensiveTeam } from '../teams/units/OffensiveTeam';
import { DefensiveTeam } from '../teams/units/DefensiveTeam';
import { KickerTeam } from '../teams/units/KickerTeam';
import { ReturnerTeam } from '../teams/units/ReturnerTeam';

/**
 * Conjunto de acciones ofensivas que un equipo puede ejecutar en una jugada
 */
export interface OffensiveActionSet {
  primaryAction: RunningPlayAction | PassingPlayAction | KickoffAction | PuntAction | FieldGoalAction | TrickPlayAction | SituationalPlayAction;
  quarterbackAction?: QuarterbackAction;
  tempoAction?: TempoAction;
  formation: string;
  personnel: string;
}

/**
 * Conjunto de acciones defensivas que un equipo puede ejecutar en una jugada
 */
export interface DefensiveActionSet {
  formationAction: DefensiveFormationAction;
  coverageAction?: PassCoverageAction;
  blitzAction?: any; // Por definir si es necesario
  adjustments: string[];
}

/**
 * Contexto completo para el cálculo de la jugada
 */
export interface PlayCalculationContext {
  gameState: CompleteGameState;
  offensiveActions: OffensiveActionSet;
  defensiveActions: DefensiveActionSet;
  offensiveTeam: OffensiveTeam;
  defensiveTeam: DefensiveTeam;
  kickerTeam?: KickerTeam;
  returnerTeam?: ReturnerTeam;
}

/**
 * Resultado detallado del cálculo de la jugada
 */
export interface DetailedPlayCalculation {
  result: PlayResult;

  // Análisis del matchup
  matchupAnalysis: {
    offensiveRating: number;      // Rating ofensivo total (0-100)
    defensiveRating: number;      // Rating defensivo total (0-100)
    matchupAdvantage: number;     // Ventaja del matchup (-50 a +50)
    keyFactors: string[];         // Factores clave que influyeron
  };

  // Factores situacionales
  situationalFactors: {
    downAndDistance: number;      // Modificador por down y distancia
    fieldPosition: number;        // Modificador por posición de campo
    timeAndScore: number;         // Modificador por tiempo y marcador
    weather: number;              // Modificador por clima
    momentum: number;             // Modificador por momentum
  };

  // Ejecución
  execution: {
    offensiveExecution: number;   // Calidad de ejecución ofensiva (0-100)
    defensiveExecution: number;   // Calidad de ejecución defensiva (0-100)
    randomFactor: number;         // Factor aleatorio (-10 a +10)
  };

  // Narrativa
  narrative: string;              // Descripción de lo que pasó
  keyPlayers: string[];          // Jugadores que destacaron
}

/**
 * Calculadora principal de jugadas
 */
export class PlayCalculator {

  /**
   * Calcula el resultado de una jugada basándose en el estado y las acciones
   */
  static calculatePlay(context: PlayCalculationContext): DetailedPlayCalculation {

    const primaryAction = context.offensiveActions.primaryAction;

    // Dispatcher para diferentes tipos de acciones
    if ('actionType' in primaryAction) {
      switch (primaryAction.actionType) {
        case 'kickoff':
          if (!context.kickerTeam || !context.returnerTeam) {
            throw new Error('KickerTeam and ReturnerTeam are required for kickoff actions');
          }
          return this.calculateKickoffAction(
            primaryAction as KickoffAction,
            context.kickerTeam!,
            context.returnerTeam!,
            context
          );

        case 'punt':
          if (!context.kickerTeam || !context.returnerTeam) {
            throw new Error('KickerTeam and ReturnerTeam are required for punt actions');
          }
          return this.calculatePuntAction(
            primaryAction as PuntAction,
            context.kickerTeam!,
            context.returnerTeam!,
            context
          );

        case 'field_goal':
          if (!context.kickerTeam || !context.returnerTeam) {
            throw new Error('KickerTeam and ReturnerTeam are required for field goal actions');
          }
          return this.calculateFieldGoalAction(
            primaryAction as FieldGoalAction,
            context.kickerTeam!,
            context.returnerTeam!,
            context
          );

        case 'situational':
          return this.calculateSituationalAction(
            primaryAction as SituationalPlayAction,
            context
          );
      }
    }

    // Jugadas normales (running/passing) - usar el sistema existente
    // 1. Analizar el matchup básico
    const matchupAnalysis = this.analyzeMatchup(context);

    // 2. Aplicar factores situacionales
    const situationalFactors = this.calculateSituationalFactors(context);

    // 3. Calcular ejecución
    const execution = this.calculateExecution(context, matchupAnalysis);

    // 4. Determinar resultado final
    const result = this.determinePlayResult(
      context,
      matchupAnalysis,
      situationalFactors,
      execution
    );

    // 5. Generar narrativa
    const narrative = this.generateNarrative(context, result, matchupAnalysis);
    const keyPlayers = this.identifyKeyPlayers(context, result);

    return {
      result,
      matchupAnalysis,
      situationalFactors,
      execution,
      narrative,
      keyPlayers
    };
  }

  /**
   * Analiza el matchup entre acciones ofensivas y defensivas
   */
  private static analyzeMatchup(context: PlayCalculationContext) {
    const { offensiveActions, defensiveActions, offensiveTeam, defensiveTeam } = context;

    const offAttrs = offensiveTeam.getOffensiveAttributes();
    const defAttrs = defensiveTeam.getDefensiveAttributes();

    let offensiveRating = 0;
    let defensiveRating = 0;
    const keyFactors: string[] = [];

    // Analizar acción principal
    if (offensiveActions.primaryAction.actionType === 'running') {
      // Matchup de carrera
      const runAction = offensiveActions.primaryAction as RunningPlayAction;

      // Rating ofensivo para carrera
      switch (runAction.playType) {
        case 'power':
        case 'iso':
          offensiveRating = offAttrs.powerRunBlocking;
          keyFactors.push('Bloqueo de poder');
          break;
        case 'outside_zone':
        case 'stretch':
          offensiveRating = offAttrs.zoneBlockingAgility;
          keyFactors.push('Bloqueo de zona');
          break;
        default:
          offensiveRating = (offAttrs.powerRunBlocking + offAttrs.zoneBlockingAgility) / 2;
      }

      // Rating defensivo contra carrera
      defensiveRating = defAttrs.runFitDiscipline;
      keyFactors.push('Disciplina defensiva contra carrera');

      // Ajustes por formación defensiva
      if (defensiveActions.formationAction.formation === 'goal_line') {
        defensiveRating += 15;
        keyFactors.push('Formación goal line (+15 def)');
      } else if (defensiveActions.formationAction.formation === 'nickel') {
        defensiveRating -= 10;
        keyFactors.push('Formación nickel (-10 def vs carrera)');
      }

    } else {
      // Matchup de pase
      const passAction = offensiveActions.primaryAction as PassingPlayAction;

      // Rating ofensivo para pase
      offensiveRating = (
        offAttrs.passingAccuracy * 0.4 +
        offAttrs.receiverSeparation * 0.3 +
        offAttrs.passProtectionAnchor * 0.3
      );
      keyFactors.push('Precisión de pase', 'Separación de receptores', 'Protección');

      // Rating defensivo contra pase
      if (defensiveActions.coverageAction) {
        switch (defensiveActions.coverageAction.coverageType) {
          case 'cover_0':
          case 'cover_1':
            defensiveRating = defAttrs.pressManCoverage;
            keyFactors.push('Cobertura man-to-man');
            break;
          case 'cover_2':
          case 'cover_3':
            defensiveRating = defAttrs.zoneCoverageCoordination;
            keyFactors.push('Cobertura de zona');
            break;
          default:
            defensiveRating = (defAttrs.pressManCoverage + defAttrs.zoneCoverageCoordination) / 2;
        }
      } else {
        defensiveRating = (defAttrs.pressManCoverage + defAttrs.zoneCoverageCoordination) / 2;
      }

      // Ajustes por formación defensiva
      if (defensiveActions.formationAction.formation === 'dime') {
        defensiveRating += 10;
        keyFactors.push('Formación dime (+10 def vs pase)');
      }
    }

    const matchupAdvantage = Math.max(-50, Math.min(50, offensiveRating - defensiveRating));

    return {
      offensiveRating: Math.round(offensiveRating),
      defensiveRating: Math.round(defensiveRating),
      matchupAdvantage: Math.round(matchupAdvantage),
      keyFactors
    };
  }

  /**
   * Calcula factores situacionales que afectan la jugada
   */
  private static calculateSituationalFactors(context: PlayCalculationContext) {
    const { gameState } = context;
    const playState = gameState.playContext;
    const globalState = gameState.globalContext;

    // Down y distancia
    let downAndDistance = 0;
    if (playState.down === 1) {
      downAndDistance = 5; // Primer down es más fácil
    } else if (playState.down === 3 && playState.yardsToGo >= 8) {
      downAndDistance = -10; // Tercero y largo es difícil
    } else if (playState.down === 4) {
      downAndDistance = -15; // Cuarto down es muy difícil
    }

    // Posición de campo
    let fieldPosition = 0;
    if (playState.fieldPosition.yardLine >= 80) {
      fieldPosition = -5; // Zona roja es más difícil
    } else if (playState.fieldPosition.yardLine <= 20) {
      fieldPosition = -3; // Campo propio es más conservador
    }

    // Tiempo y marcador
    let timeAndScore = 0;
    const scoreDiff = globalState.scoreTeamX - globalState.scoreTeamY;
    if (globalState.currentQuarter >= 4) {
      if (Math.abs(scoreDiff) <= 7) {
        timeAndScore = 5; // Juegos cerrados en el 4to cuarto generan más intensidad
      } else if (scoreDiff > 14) {
        timeAndScore = -5; // Ventaja grande puede generar relajación
      }
    }

    // Clima
    let weather = 0;
    switch (globalState.externalConditions.weather) {
      case 'rain':
        weather = context.offensiveActions.primaryAction.actionType === 'passing' ? -5 : -2;
        break;
      case 'snow':
        weather = context.offensiveActions.primaryAction.actionType === 'passing' ? -8 : -3;
        break;
      case 'wind':
        weather = context.offensiveActions.primaryAction.actionType === 'passing' ? -3 : 0;
        break;
    }

    // Momentum
    let momentum = 0;
    switch (gameState.momentum) {
      case 'heavily_favoring_x':
        momentum = globalState.possessionTeam === globalState.possessionTeam ? 8 : -8;
        break;
      case 'favoring_x':
        momentum = globalState.possessionTeam === globalState.possessionTeam ? 4 : -4;
        break;
      case 'favoring_y':
        momentum = globalState.possessionTeam !== globalState.possessionTeam ? 4 : -4;
        break;
      case 'heavily_favoring_y':
        momentum = globalState.possessionTeam !== globalState.possessionTeam ? 8 : -8;
        break;
    }

    return {
      downAndDistance,
      fieldPosition,
      timeAndScore,
      weather,
      momentum
    };
  }

  /**
   * Calcula la calidad de ejecución de ambos equipos
   */
  private static calculateExecution(
    context: PlayCalculationContext,
    matchupAnalysis: any
  ) {
    const { offensiveTeam, defensiveTeam, gameState } = context;

    // Usar los ratings específicos del matchup en lugar de promedios genéricos
    let offensiveExecution = matchupAnalysis.offensiveRating;
    let defensiveExecution = matchupAnalysis.defensiveRating;

    // Ajustes por presión (reducidos para que no dominen)
    switch (gameState.pressure) {
      case 'high':
        offensiveExecution -= 3;
        defensiveExecution += 2;
        break;
      case 'extreme':
        offensiveExecution -= 5;
        defensiveExecution += 3;
        break;
    }

    // Factor aleatorio para simular variabilidad (reducido para que los atributos importen más)
    const randomFactor = (Math.random() - 0.5) * 8; // -4 a +4

    return {
      offensiveExecution: Math.max(0, Math.min(100, Math.round(offensiveExecution))),
      defensiveExecution: Math.max(0, Math.min(100, Math.round(defensiveExecution))),
      randomFactor: Math.round(randomFactor)
    };
  }

  /**
   * Determina el resultado final de la jugada
   */
  private static determinePlayResult(
    context: PlayCalculationContext,
    matchupAnalysis: any,
    situationalFactors: any,
    execution: any
  ): PlayResult {

    // Calcular resultado base
    let baseResult = matchupAnalysis.matchupAdvantage;

    // Aplicar factores situacionales
    baseResult += situationalFactors.downAndDistance;
    baseResult += situationalFactors.fieldPosition;
    baseResult += situationalFactors.timeAndScore;
    baseResult += situationalFactors.weather;
    baseResult += situationalFactors.momentum;

    // Aplicar ejecución (aumentar impacto para que los atributos importen más)
    const executionDiff = execution.offensiveExecution - execution.defensiveExecution;
    baseResult += executionDiff / 3; // Mayor impacto de la diferencia de atributos

    // Aplicar factor aleatorio
    baseResult += execution.randomFactor;

    // Convertir a yardas ganadas
    let yardsGained = 0;

    if (context.offensiveActions.primaryAction.actionType === 'running') {
      // Carrera: resultado más conservador pero con mayor impacto de atributos
      yardsGained = Math.max(-5, Math.min(25, 3 + (baseResult / 6)));
    } else {
      // Pase: más variabilidad pero mejor probabilidad con buenos atributos
      const passAction = context.offensiveActions.primaryAction as PassingPlayAction;
      const completionProbability = Math.max(0.3, Math.min(0.9, 0.6 + (baseResult / 80)));

      if (Math.random() < completionProbability) {
        yardsGained = Math.max(1, Math.min(40, passAction.expectedYards + (baseResult / 5)));
      } else {
        // Pase incompleto o intercepción
        const interceptionProb = Math.max(0.02, 0.05 - (baseResult / 200));
        if (Math.random() < interceptionProb) {
          return {
            type: 'interception',
            returnYards: Math.floor(Math.random() * 15),
            returnTouchdown: false,
            interceptionType: 'poor_throw',
            difficultyLevel: 'easy',
            gameImpact: 'momentum_shift'
          };
        } else {
          return {
            type: 'incomplete_pass',
            reason: 'defended',
            passQuality: baseResult > 0 ? 'good' : 'poor',
            catchDifficulty: 'moderate'
          };
        }
      }
    }

    yardsGained = Math.round(yardsGained);

    // Determinar tipo de resultado
    if (context.gameState.playContext.fieldPosition.yardLine + yardsGained >= 100) {
      return {
        type: 'touchdown',
        yardsGained,
        touchdownType: context.offensiveActions.primaryAction.actionType === 'running' ? 'rushing_td' : 'passing_td',
        celebrationLevel: 'moderate',
        difficultyRating: baseResult > 20 ? 'easy' : 'moderate',
        gameImpact: 'momentum_shift'
      };
    } else if (yardsGained >= context.gameState.playContext.yardsToGo) {
      return {
        type: 'first_down',
        yardsGained,
        yardsNeeded: context.gameState.playContext.yardsToGo,
        conversionType: baseResult > 15 ? 'easy' : baseResult > 0 ? 'hard_fought' : 'clutch',
        downConverted: context.gameState.playContext.down as 1 | 2 | 3 | 4,
        momentumShift: 'slight',
        crowdReaction: 'moderate'
      };
    } else if (yardsGained >= 0) {
      return {
        type: 'offensive_gain',
        subType: yardsGained >= 15 ? 'explosive_gain' :
          yardsGained >= 8 ? 'big_gain' :
            yardsGained >= 4 ? 'medium_gain' : 'small_gain',
        yardsGained,
        brokenTackles: yardsGained > 10 ? Math.floor(yardsGained / 8) : 0,
        gainType: context.offensiveActions.primaryAction.actionType === 'running' ? 'power_run' : 'short_pass',
        difficultyLevel: 'routine'
      };
    } else {
      return {
        type: 'tackle_for_loss',
        yardsLost: Math.abs(yardsGained),
        ballCarrier: {} as any, // Simplificado
        tackler: {} as any,
        assistingTacklers: [],
        lossType: 'run_tfl',
        defensiveExcellence: 'great_read'
      };
    }
  }

  /**
   * Genera narrativa descriptiva de la jugada
   */
  private static generateNarrative(
    context: PlayCalculationContext,
    result: PlayResult,
    matchupAnalysis: any
  ): string {
    const action = context.offensiveActions.primaryAction;
    const formation = context.defensiveActions.formationAction.formation;

    let narrative = '';

    if (action.actionType === 'running') {
      const runAction = action as RunningPlayAction;
      narrative = `Carrera ${runAction.playType} contra formación ${formation}`;
    } else {
      const passAction = action as PassingPlayAction;
      narrative = `Pase ${passAction.playType} contra formación ${formation}`;
      if (context.defensiveActions.coverageAction) {
        narrative += ` con cobertura ${context.defensiveActions.coverageAction.coverageType}`;
      }
    }

    // Agregar resultado
    if (result.type === 'touchdown') {
      narrative += ' - ¡TOUCHDOWN!';
    } else if (result.type === 'first_down') {
      narrative += ' - ¡PRIMER DOWN!';
    } else if (result.type === 'interception') {
      narrative += ' - ¡INTERCEPCIÓN!';
    } else if ('yardsGained' in result) {
      narrative += ` - ${result.yardsGained >= 0 ? '+' : ''}${result.yardsGained} yardas`;
    }

    // Agregar factor clave
    if (matchupAnalysis.keyFactors.length > 0) {
      narrative += ` (${matchupAnalysis.keyFactors[0]})`;
    }

    return narrative;
  }

  /**
   * Identifica jugadores clave en la jugada
   */
  private static identifyKeyPlayers(
    context: PlayCalculationContext,
    result: PlayResult
  ): string[] {
    const keyPlayers: string[] = [];

    // Simplificado - en implementación real se basaría en jugadores específicos
    if (context.offensiveActions.primaryAction.actionType === 'running') {
      keyPlayers.push('Running Back', 'Offensive Line');
    } else {
      keyPlayers.push('Quarterback', 'Wide Receiver');
    }

    if (result.type === 'tackle_for_loss' || result.type === 'interception') {
      keyPlayers.push('Defensive Player');
    }

    return keyPlayers;
  }

  /**
   * Calcula el resultado de una acción de kickoff
   */
  static calculateKickoffAction(
    action: KickoffAction,
    kickerTeam: KickerTeam,
    returnerTeam: ReturnerTeam,
    context: PlayCalculationContext
  ): DetailedPlayCalculation {

    const kickingAttrs = kickerTeam.getKickingAttributes();
    const returnerAttrs = returnerTeam.getReturnerAttributes();

    let kickDistance = 45; // Base
    let returnYards = 0;
    let finalPosition = 25;

    switch (action.kickoffType) {
      case 'normal_kickoff':
        kickDistance = 45 + (action.kickerStrength - 70) / 5;
        returnYards = Math.max(0, 15 + (returnerAttrs.returnExplosiveness - 70) / 10);
        break;

      case 'onside_kick':
        kickDistance = 15;
        const recoveryChance = 0.3 + (action.surpriseFactor / 200);
        if (Math.random() < recoveryChance) {
          finalPosition = context.gameState.playContext.fieldPosition.yardLine + 15;
          returnYards = 0;
        } else {
          finalPosition = context.gameState.playContext.fieldPosition.yardLine + 15;
          returnYards = 0; // Recupera el equipo receptor
        }
        break;

      case 'squib_kick':
        kickDistance = 35;
        returnYards = Math.max(0, 8 + (returnerAttrs.returnExplosiveness - 70) / 15);
        break;

      case 'touchback_kick':
        kickDistance = 65;
        returnYards = 0;
        finalPosition = 25;
        break;
    }

    const result: PlayResult = {
      type: 'kickoff_result',
      resultType: kickDistance >= 65 ? 'touchback' : 'return',
      kickDistance,
      returnYards,
      finalPosition: Math.min(50, kickDistance + returnYards),
      kickQuality: action.kickerStrength >= 80 ? 'excellent' : 'good',
      returnQuality: returnYards >= 20 ? 'excellent' : 'fair'
    };

    return {
      result,
      matchupAnalysis: {
        offensiveRating: kickingAttrs.kickerRange || action.kickerStrength,
        defensiveRating: returnerAttrs.returnExplosiveness || 70,
        matchupAdvantage: (kickingAttrs.kickerRange || action.kickerStrength) - (returnerAttrs.returnExplosiveness || 70),
        keyFactors: [`Kickoff ${action.kickoffType}`]
      },
      situationalFactors: {
        downAndDistance: 0,
        fieldPosition: 0,
        timeAndScore: 0,
        weather: 0,
        momentum: 0
      },
      execution: {
        offensiveExecution: kickingAttrs.kickerRange || action.kickerStrength,
        defensiveExecution: returnerAttrs.returnExplosiveness || 70,
        randomFactor: 0
      },
      narrative: `Kickoff ${action.kickoffType}: ${kickDistance} yardas, retorno de ${returnYards}`,
      keyPlayers: ['Kicker', 'Returner']
    };
  }

  /**
   * Calcula el resultado de una acción de punt
   */
  static calculatePuntAction(
    action: PuntAction,
    kickerTeam: KickerTeam,
    returnerTeam: ReturnerTeam,
    context: PlayCalculationContext
  ): DetailedPlayCalculation {

    const kickingAttrs = kickerTeam.getKickingAttributes();
    const returnerAttrs = returnerTeam.getReturnerAttributes();

    let puntDistance = 40;
    let returnYards = 0;
    let netYards = 0;

    switch (action.puntType) {
      case 'normal_punt':
        puntDistance = 35 + (action.punterStrength - 70) / 4;
        returnYards = Math.max(0, 8 + (returnerAttrs.returnExplosiveness - 70) / 12);
        netYards = puntDistance - returnYards;
        break;

      case 'fake_punt':
        // Tratar como jugada normal
        if (action.fakePlayType) {
          const fakeSuccess = Math.random() < (action.surpriseFactor / 100);
          if (fakeSuccess) {
            netYards = 5 + Math.random() * 10; // 5-15 yardas
          } else {
            netYards = -2; // Falla
          }
        }
        break;

      case 'coffin_corner':
        puntDistance = 30 + (action.punterStrength - 70) / 6;
        returnYards = Math.max(0, 3 + (returnerAttrs.returnExplosiveness - 70) / 20);
        netYards = puntDistance - returnYards;
        break;
    }

    // Determinar el tipo de resultado basado en la acción
    let resultType: 'return' | 'fair_catch' | 'touchback' | 'blocked' | 'fumble' | 'muff';

    if (action.puntType === 'fake_punt') {
      // Para fake punt, crear un resultado de jugada ofensiva en lugar de punt
      const fakeResult: PlayResult = {
        type: 'offensive_gain',
        subType: 'small_gain',
        yardsGained: Math.floor(Math.random() * 8) + 2,
        gainType: 'power_run',
        difficultyLevel: 'contested',
        brokenTackles: 0
      };

      return {
        result: fakeResult,
        matchupAnalysis: {
          offensiveRating: 65,
          defensiveRating: 70,
          matchupAdvantage: -5,
          keyFactors: ['Fake punt surprise factor']
        },
        situationalFactors: {
          downAndDistance: 0,
          fieldPosition: 0,
          timeAndScore: 0,
          weather: 0,
          momentum: 10
        },
        execution: {
          offensiveExecution: 75,
          defensiveExecution: 60,
          randomFactor: 10
        },
        narrative: 'Fake punt ejecutado exitosamente',
        keyPlayers: ['Punter', 'Upback']
      };
    } else if (netYards >= 50) {
      resultType = 'touchback';
    } else if (Math.random() < 0.1) {
      resultType = 'fair_catch';
    } else {
      resultType = 'return';
    }

    const result: PlayResult = {
      type: 'punt_result',
      resultType,
      puntDistance,
      hangTime: action.hangTime,
      returnYards,
      netYards,
      puntQuality: action.punterStrength >= 80 ? 'excellent' : 'good',
      fieldPositionImpact: netYards >= 35 ? 'excellent' : 'good'
    };

    return {
      result,
      matchupAnalysis: {
        offensiveRating: kickingAttrs.punterPlacement || action.punterStrength,
        defensiveRating: returnerAttrs.returnExplosiveness || 70,
        matchupAdvantage: (kickingAttrs.punterPlacement || action.punterStrength) - (returnerAttrs.returnExplosiveness || 70),
        keyFactors: [`Punt ${action.puntType}`]
      },
      situationalFactors: {
        downAndDistance: 0,
        fieldPosition: 0,
        timeAndScore: 0,
        weather: 0,
        momentum: 0
      },
      execution: {
        offensiveExecution: kickingAttrs.punterPlacement || action.punterStrength,
        defensiveExecution: returnerAttrs.returnExplosiveness || 70,
        randomFactor: 0
      },
      narrative: `Punt ${action.puntType}: ${puntDistance} yardas, retorno de ${returnYards}, neto ${netYards}`,
      keyPlayers: ['Punter', 'Returner']
    };
  }

  /**
   * Calcula el resultado de una acción de field goal
   */
  static calculateFieldGoalAction(
    action: FieldGoalAction,
    kickerTeam: KickerTeam,
    returnerTeam: ReturnerTeam,
    context: PlayCalculationContext
  ): DetailedPlayCalculation {

    let success = false;
    let points = 0;

    switch (action.fieldGoalType) {
      case 'normal_field_goal':
        const successChance = Math.max(0.3, 0.95 - (action.distance - 20) * 0.02);
        success = Math.random() < successChance;
        points = success ? 3 : 0;
        break;

      case 'extra_point':
        success = Math.random() < 0.95; // 95% de éxito
        points = success ? 1 : 0;
        break;

      case 'fake_field_goal':
        const fakeSuccess = Math.random() < (action.surpriseFactor / 100);
        success = fakeSuccess;
        points = 0; // No son puntos de field goal
        break;

      case 'two_point_attempt':
        success = Math.random() < 0.5; // 50% de éxito
        points = success ? 2 : 0;
        break;
    }

    const result: PlayResult = {
      type: 'kick_result',
      kickType: action.fieldGoalType === 'extra_point' ? 'extra_point' : 'field_goal',
      result: success ? 'made' : 'missed',
      distance: action.distance,
      direction: success ? 'center' : (Math.random() > 0.5 ? 'wide_left' : 'wide_right'),
      kickQuality: success ? 'good' : 'poor',
      pressure: context.gameState.pressure === 'extreme' ? 'extreme' : 'light'
    };

    return {
      result,
      matchupAnalysis: {
        offensiveRating: kickerTeam.getKickingAttributes().kickerAccuracy || action.kickerAccuracy,
        defensiveRating: returnerTeam.getReturnerAttributes().blockingAbility || 50,
        matchupAdvantage: (kickerTeam.getKickingAttributes().kickerAccuracy || action.kickerAccuracy) - (returnerTeam.getReturnerAttributes().blockingAbility || 50),
        keyFactors: [`${action.fieldGoalType} desde ${action.distance} yardas`]
      },
      situationalFactors: {
        downAndDistance: 0,
        fieldPosition: 0,
        timeAndScore: context.gameState.pressure === 'extreme' ? -5 : 0,
        weather: 0,
        momentum: 0
      },
      execution: {
        offensiveExecution: kickerTeam.getKickingAttributes().kickerAccuracy || action.kickerAccuracy,
        defensiveExecution: returnerTeam.getReturnerAttributes().blockingAbility || 50,
        randomFactor: Math.random() * 10 - 5
      },
      narrative: `${action.fieldGoalType} desde ${action.distance} yardas: ${success ? 'BUENO' : 'FALLA'}`,
      keyPlayers: ['Kicker', 'Holder', 'Long Snapper']
    };
  }

  /**
   * Calcula el resultado de jugadas situacionales
   */
  static calculateSituationalAction(
    action: SituationalPlayAction,
    context: PlayCalculationContext
  ): DetailedPlayCalculation {

    let timeConsumed = 0;
    let yardsGained = 0;

    switch (action.playType) {
      case 'kneel':
        timeConsumed = 40;
        yardsGained = -1;
        break;

      case 'spike':
        timeConsumed = 3;
        yardsGained = 0;
        break;

      case 'safety_kick':
        // Similar a punt pero desde la 20 - tratarlo como punt
        timeConsumed = 5;
        yardsGained = 0;
        const safetyKickResult: PlayResult = {
          type: 'punt_result',
          resultType: 'return',
          puntDistance: 35 + Math.floor(Math.random() * 15),
          hangTime: 4.0,
          returnYards: Math.floor(Math.random() * 10),
          netYards: 35,
          puntQuality: 'fair',
          fieldPositionImpact: 'fair'
        };

        return {
          result: safetyKickResult,
          matchupAnalysis: {
            offensiveRating: 60,
            defensiveRating: 65,
            matchupAdvantage: -5,
            keyFactors: ['Safety kick from 20-yard line']
          },
          situationalFactors: {
            downAndDistance: 0,
            fieldPosition: -10,
            timeAndScore: 0,
            weather: 0,
            momentum: -5
          },
          execution: {
            offensiveExecution: 70,
            defensiveExecution: 70,
            randomFactor: 0
          },
          narrative: 'Safety kick ejecutado',
          keyPlayers: ['Punter']
        };
    }

    const result: PlayResult = action.playType === 'kneel' ? {
      type: 'kneel',
      purpose: 'victory_formation',
      quarterback: {} as any,
      timeConsumed,
      gameStatus: 'victory_assured'
    } : action.playType === 'spike' ? {
      type: 'spike',
      purpose: 'stop_clock',
      timeRemaining: context.gameState.globalContext.timeRemainingInQuarter,
      quarterback: {} as any,
      strategicValue: 'necessary'
    } : {
      type: 'punt_result',
      resultType: 'return',
      puntDistance: 45,
      hangTime: 4.5,
      returnYards: 8,
      netYards: 37,
      puntQuality: 'good',
      fieldPositionImpact: 'good'
    };

    return {
      result,
      matchupAnalysis: {
        offensiveRating: 100,
        defensiveRating: 0,
        matchupAdvantage: 100,
        keyFactors: [`Jugada situacional: ${action.playType}`]
      },
      situationalFactors: {
        downAndDistance: 0,
        fieldPosition: 0,
        timeAndScore: action.timeImpact,
        weather: 0,
        momentum: 0
      },
      execution: {
        offensiveExecution: 100,
        defensiveExecution: 0,
        randomFactor: 0
      },
      narrative: `${action.playType}: ${action.purpose}`,
      keyPlayers: action.playType === 'kneel' ? ['Quarterback'] : ['Quarterback', 'Center']
    };
  }
}