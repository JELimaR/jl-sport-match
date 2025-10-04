// ActionCalculator - Sistema avanzado para calcular resultados de actions basado en atributos de equipos
// Implementa cálculos realistas considerando matchups ofensivos vs defensivos

import { RunningPlayAction, PassingPlayAction, ActionResult } from './Actions';
import { OffensiveTeam } from '../teams/units/OffensiveTeam';
import { DefensiveTeam } from '../teams/units/DefensiveTeam';
import { PlayResult } from './PlayResults';

/**
 * Contexto situacional que afecta el cálculo de la jugada
 */
export interface PlayContext {
  down: number;                    // 1-4
  yardsToGo: number;              // Yardas necesarias para primer down
  fieldPosition: number;          // 0-100 (yarda actual)
  timeRemaining: number;          // Segundos restantes en el cuarto
  quarter: number;                // 1-4
  scoreDifference: number;        // Diferencia de puntos (positivo = ganando)
  weather?: 'clear' | 'rain' | 'snow' | 'wind';
  pressure: 'low' | 'medium' | 'high' | 'extreme';
}

/**
 * Factores que modifican el resultado base de una jugada
 */
export interface PlayModifiers {
  situationalBonus: number;       // Bonus/penalización por situación (-10 a +10)
  weatherPenalty: number;         // Penalización por clima (0 a -15)
  pressureModifier: number;       // Modificador por presión (-5 a +5)
  fatigueModifier: number;        // Modificador por fatiga (-3 a +3)
  momentumBonus: number;          // Bonus por momentum (-5 a +5)
  randomVariance: number;         // Varianza aleatoria (-3 a +3)
}

/**
 * Resultado detallado del cálculo de una jugada
 */
export interface DetailedPlayResult {
  baseResult: number;             // Resultado base sin modificadores
  modifiedResult: number;         // Resultado final con todos los modificadores
  playResult: PlayResult;         // Resultado convertido al formato estándar
  calculation: {
    offensiveRating: number;      // Rating ofensivo calculado
    defensiveRating: number;      // Rating defensivo calculado
    matchupAdvantage: number;     // Ventaja del matchup (-20 a +20)
    modifiers: PlayModifiers;     // Todos los modificadores aplicados
    successProbability: number;   // Probabilidad de éxito (0-100)
  };
  narrative: string;              // Descripción narrativa del resultado
}

/**
 * Calculadora principal para resultados de actions
 */
export class ActionCalculator {

  /**
   * Calcula el resultado de una acción de carrera
   * 
   * @param action - Acción de carrera a ejecutar
   * @param offense - Unidad ofensiva
   * @param defense - Unidad defensiva  
   * @param context - Contexto situacional
   * @returns Resultado detallado de la jugada
   */
  static calculateRunningAction(
    action: RunningPlayAction,
    offense: OffensiveTeam,
    defense: DefensiveTeam,
    context: PlayContext
  ): DetailedPlayResult {

    // === PASO 1: OBTENER ATRIBUTOS RELEVANTES ===

    const offAttrs = offense.getOffensiveAttributes();
    const defAttrs = defense.getDefensiveAttributes();

    // Seleccionar atributos específicos según el tipo de carrera
    let primaryOffensiveRating: number;
    let primaryDefensiveRating: number;

    switch (action.playType) {
      case 'power':
      case 'iso':
      case 'dive':
        // Carreras de poder - fuerza vs fuerza
        primaryOffensiveRating = offAttrs.powerRunBlocking;
        primaryDefensiveRating = defAttrs.runFitDiscipline;
        break;

      case 'outside_zone':
      case 'stretch':
      case 'sweep':
        // Carreras de zona/velocidad - agilidad vs disciplina
        primaryOffensiveRating = offAttrs.zoneBlockingAgility;
        primaryDefensiveRating = defAttrs.runFitDiscipline; // Usar disciplina como proxy
        break;

      case 'draw':
      case 'counter':
        // Carreras de engaño - timing vs reacción
        primaryOffensiveRating = offAttrs.zoneBlockingAgility; // Usar agilidad como proxy
        primaryDefensiveRating = defAttrs.runFitDiscipline; // Usar disciplina como proxy
        break;

      default:
        // Carrera estándar
        primaryOffensiveRating = (offAttrs.powerRunBlocking + offAttrs.zoneBlockingAgility) / 2;
        primaryDefensiveRating = defAttrs.runFitDiscipline;
    }

    // === PASO 2: CALCULAR RATINGS SECUNDARIOS ===

    // Factores ofensivos adicionales
    const runningBackAbility = offAttrs.breakawayAbility;      // Habilidad del RB
    const lineChemistry = offAttrs.powerRunBlocking;          // Usar bloqueo como proxy para química
    const snapTiming = offAttrs.passProtectionAnchor;         // Usar protección como proxy para timing

    // Factores defensivos adicionales
    const frontSevenStrength = defAttrs.runFitDiscipline;     // Usar disciplina como proxy
    const tacklingAbility = defAttrs.tacklesForLoss;          // Habilidad de tackle
    const defensiveIQ = defAttrs.zoneCoverageCoordination;     // Usar coordinación como proxy para IQ

    // === PASO 3: CALCULAR RATING OFENSIVO COMPUESTO ===

    const offensiveRating = (
      primaryOffensiveRating * 0.4 +        // 40% - Habilidad principal
      runningBackAbility * 0.25 +           // 25% - Habilidad del RB
      lineChemistry * 0.20 +                // 20% - Química de línea
      snapTiming * 0.15                     // 15% - Timing
    );

    // === PASO 4: CALCULAR RATING DEFENSIVO COMPUESTO ===

    const defensiveRating = (
      primaryDefensiveRating * 0.4 +        // 40% - Habilidad principal
      frontSevenStrength * 0.25 +           // 25% - Fuerza del front
      tacklingAbility * 0.20 +              // 20% - Habilidad de tackle
      defensiveIQ * 0.15                    // 15% - IQ defensivo
    );

    // === PASO 5: CALCULAR VENTAJA DEL MATCHUP ===

    const matchupAdvantage = offensiveRating - defensiveRating; // -100 a +100

    // === PASO 6: CALCULAR RESULTADO BASE ===

    // Yardas base según el tipo de jugada y situación
    let baseYards: number;

    if (context.yardsToGo <= 2) {
      // Situación de yardas cortas - más conservador
      baseYards = 2 + (matchupAdvantage / 25); // 0-6 yardas típicamente
    } else if (context.yardsToGo >= 8) {
      // Situación de yardas largas - más agresivo pero arriesgado
      baseYards = 1 + (matchupAdvantage / 20); // -4 a +6 yardas típicamente
    } else {
      // Situación normal
      baseYards = 3 + (matchupAdvantage / 20); // -2 a +8 yardas típicamente
    }

    // Ajuste por tipo específico de jugada
    switch (action.playType) {
      case 'power':
      case 'iso':
        baseYards += 0.5; // Carreras de poder tienden a ganar más yardas consistentes
        break;
      case 'sweep':
      case 'toss':
        baseYards += Math.random() > 0.7 ? 3 : -1; // Más varianza - o muy bueno o malo
        break;
      case 'draw':
        baseYards += context.yardsToGo >= 8 ? 2 : -1; // Mejor en yardas largas
        break;
    }

    // === PASO 7: APLICAR MODIFICADORES SITUACIONALES ===

    const modifiers = this.calculatePlayModifiers(context, action, offense, defense);
    const modifiedResult = baseYards +
      modifiers.situationalBonus +
      modifiers.weatherPenalty +
      modifiers.pressureModifier +
      modifiers.fatigueModifier +
      modifiers.momentumBonus +
      modifiers.randomVariance;

    // === PASO 8: DETERMINAR EVENTOS ESPECIALES ===

    const finalYards = Math.round(Math.max(-5, Math.min(25, modifiedResult))); // Límites realistas

    // Probabilidad de fumble (más alta con presión)
    const fumbleProbability = this.calculateFumbleProbability(offense, defense, context, finalYards);

    // Probabilidad de jugada explosiva (15+ yardas)
    const explosiveProbability = this.calculateExplosiveProbability(offensiveRating, defensiveRating, context);

    // === PASO 9: GENERAR RESULTADO FINAL ===

    let playResult: PlayResult;
    let narrative: string;

    // Verificar fumble
    if (Math.random() < fumbleProbability) {
      playResult = {
        type: 'fumble',
        fumbleType: 'hit_stick',
        returnYards: 0,
        returnTouchdown: false,
        gameImpact: 'routine_turnover',
        recoveringTeam: defense as any // Simplificado
      };
      narrative = `Fumble en carrera ${action.playType} - balón perdido por contacto fuerte`;
    }
    // Verificar touchdown
    else if (context.fieldPosition + finalYards >= 100) {
      playResult = {
        type: 'touchdown',
        yardsGained: finalYards,
        touchdownType: 'rushing_td',
        celebrationLevel: finalYards >= 15 ? 'explosive' : 'moderate',
        difficultyRating: matchupAdvantage > 10 ? 'easy' : matchupAdvantage < -10 ? 'spectacular' : 'moderate',
        gameImpact: 'momentum_shift'
      };
      narrative = `¡TOUCHDOWN! Carrera ${action.playType} de ${finalYards} yardas - ${this.getRunningNarrative(action, finalYards, matchupAdvantage)}`;
    }
    // Jugada explosiva
    else if (finalYards >= 15 && Math.random() < explosiveProbability) {
      playResult = {
        type: 'offensive_gain',
        subType: 'explosive_gain',
        yardsGained: finalYards,
        brokenTackles: Math.floor(finalYards / 8), // Más tackles rotos en jugadas largas
        gainType: 'power_run',
        difficultyLevel: matchupAdvantage > 5 ? 'routine' : 'spectacular'
      };
      narrative = `¡Carrera explosiva! ${action.playType} de ${finalYards} yardas - ${this.getRunningNarrative(action, finalYards, matchupAdvantage)}`;
    }
    // Jugada normal
    else {
      const subType = finalYards >= 8 ? 'big_gain' :
        finalYards >= 4 ? 'medium_gain' :
          finalYards >= 0 ? 'small_gain' : 'loss';

      playResult = {
        type: 'offensive_gain',
        subType: subType as any,
        yardsGained: finalYards,
        brokenTackles: finalYards > 6 ? 1 : 0,
        gainType: 'power_run',
        difficultyLevel: 'routine'
      };
      narrative = `Carrera ${action.playType} de ${finalYards >= 0 ? '+' : ''}${finalYards} yardas - ${this.getRunningNarrative(action, finalYards, matchupAdvantage)}`;
    }

    // === PASO 10: CALCULAR PROBABILIDAD DE ÉXITO ===

    const successProbability = this.calculateSuccessProbability(finalYards, context.yardsToGo, action.riskLevel);

    // === RETORNAR RESULTADO COMPLETO ===

    return {
      baseResult: Math.round(baseYards),
      modifiedResult: finalYards,
      playResult,
      calculation: {
        offensiveRating: Math.round(offensiveRating),
        defensiveRating: Math.round(defensiveRating),
        matchupAdvantage: Math.round(matchupAdvantage),
        modifiers,
        successProbability
      },
      narrative
    };
  }

  /**
   * Calcula el resultado de una acción de pase
   * Similar estructura pero con atributos específicos de pase
   */
  static calculatePassingAction(
    action: PassingPlayAction,
    offense: OffensiveTeam,
    defense: DefensiveTeam,
    context: PlayContext
  ): DetailedPlayResult {

    // === IMPLEMENTACIÓN SIMILAR PARA PASES ===
    // (Por brevedad, implementación simplificada)

    const offAttrs = offense.getOffensiveAttributes();
    const defAttrs = defense.getDefensiveAttributes();

    // Atributos principales para pases
    const passingAccuracy = offAttrs.passingAccuracy;
    const armStrength = offAttrs.passingAccuracy; // Usar precisión como proxy para fuerza
    const receiverSeparation = offAttrs.receiverSeparation;
    const routeChemistry = offAttrs.receiverSeparation; // Usar separación como proxy para química

    const pressManCoverage = defAttrs.pressManCoverage;
    const zoneCoverageCoordination = defAttrs.zoneCoverageCoordination;
    const fourManRushPressure = defAttrs.fourManRushPressure;

    // Cálculo simplificado para el ejemplo
    const offensiveRating = (passingAccuracy + armStrength + receiverSeparation + routeChemistry) / 4;
    const defensiveRating = (pressManCoverage + zoneCoverageCoordination + fourManRushPressure) / 3;

    const matchupAdvantage = offensiveRating - defensiveRating;
    const completionProbability = Math.max(0.3, Math.min(0.9, 0.6 + (matchupAdvantage / 200)));

    const modifiers = this.calculatePlayModifiers(context, action, offense, defense);

    let playResult: PlayResult;
    let narrative: string;
    let finalYards = 0;

    if (Math.random() < completionProbability) {
      // Pase completo
      finalYards = Math.round(Math.max(1, action.expectedYards + (matchupAdvantage / 10) + modifiers.situationalBonus));

      if (context.fieldPosition + finalYards >= 100) {
        playResult = {
          type: 'touchdown',
          yardsGained: finalYards,
          touchdownType: 'passing_td',
          celebrationLevel: 'moderate',
          difficultyRating: 'moderate',
          gameImpact: 'momentum_shift'
        };
        narrative = `¡TOUCHDOWN! Pase ${action.playType} de ${finalYards} yardas`;
      } else {
        playResult = {
          type: 'offensive_gain',
          subType: finalYards >= 15 ? 'explosive_gain' : 'medium_gain',
          yardsGained: finalYards,
          brokenTackles: 0,
          gainType: 'short_pass',
          difficultyLevel: 'routine'
        };
        narrative = `Pase completo ${action.playType} de ${finalYards} yardas`;
      }
    } else {
      // Pase incompleto o intercepción
      const interceptionProbability = Math.max(0.02, 0.05 - (matchupAdvantage / 500));

      if (Math.random() < interceptionProbability) {
        playResult = {
          type: 'interception',
          returnYards: Math.floor(Math.random() * 15),
          returnTouchdown: false,
          interceptionType: 'poor_throw',
          difficultyLevel: 'easy',
          gameImpact: 'momentum_shift'
        };
        narrative = `¡INTERCEPCIÓN! Pase ${action.playType} interceptado`;
      } else {
        playResult = {
          type: 'incomplete_pass',
          reason: 'defended',
          passQuality: matchupAdvantage > 0 ? 'good' : 'poor',
          catchDifficulty: 'moderate'
        };
        narrative = `Pase incompleto ${action.playType} - bien defendido`;
      }
    }

    const successProbability = this.calculateSuccessProbability(finalYards, context.yardsToGo, action.riskLevel);

    return {
      baseResult: Math.round(action.expectedYards),
      modifiedResult: finalYards,
      playResult,
      calculation: {
        offensiveRating: Math.round(offensiveRating),
        defensiveRating: Math.round(defensiveRating),
        matchupAdvantage: Math.round(matchupAdvantage),
        modifiers,
        successProbability
      },
      narrative
    };
  }

  // === MÉTODOS AUXILIARES ===

  /**
   * Calcula modificadores situacionales que afectan la jugada
   */
  private static calculatePlayModifiers(
    context: PlayContext,
    action: RunningPlayAction | PassingPlayAction,
    offense: OffensiveTeam,
    defense: DefensiveTeam
  ): PlayModifiers {

    let situationalBonus = 0;
    let weatherPenalty = 0;
    let pressureModifier = 0;
    let fatigueModifier = 0;
    let momentumBonus = 0;

    // === BONUS SITUACIONAL ===

    // Bonus por situación de down
    if (context.down === 1) {
      situationalBonus += 1; // Primer down es más fácil
    } else if (context.down === 3 && context.yardsToGo >= 8) {
      situationalBonus -= 2; // Tercero y largo es más difícil
    } else if (context.down === 4) {
      situationalBonus -= 3; // Cuarto down tiene máxima presión
    }

    // Bonus por posición de campo
    if (context.fieldPosition >= 80) {
      situationalBonus -= 1; // Zona roja es más difícil (defensa compacta)
    } else if (context.fieldPosition <= 20) {
      situationalBonus -= 1; // Campo propio es más conservador
    }

    // === PENALIZACIÓN POR CLIMA ===

    switch (context.weather) {
      case 'rain':
        weatherPenalty = action.actionType === 'passing' ? -3 : -1;
        break;
      case 'snow':
        weatherPenalty = action.actionType === 'passing' ? -5 : -2;
        break;
      case 'wind':
        weatherPenalty = action.actionType === 'passing' ? -2 : 0;
        break;
      default:
        weatherPenalty = 0;
    }

    // === MODIFICADOR POR PRESIÓN ===

    switch (context.pressure) {
      case 'low':
        pressureModifier = 1;
        break;
      case 'medium':
        pressureModifier = 0;
        break;
      case 'high':
        pressureModifier = -2;
        break;
      case 'extreme':
        pressureModifier = -4;
        break;
    }

    // === MODIFICADOR POR FATIGA ===

    // Simplificado - basado en el cuarto
    if (context.quarter >= 4) {
      fatigueModifier = -1;
    }
    if (context.quarter >= 4 && context.timeRemaining < 300) {
      fatigueModifier = -2; // Últimos 5 minutos
    }

    // === BONUS POR MOMENTUM ===

    // Simplificado - basado en diferencia de puntos
    if (Math.abs(context.scoreDifference) <= 3) {
      momentumBonus = 1; // Juegos cerrados generan más intensidad
    } else if (Math.abs(context.scoreDifference) >= 14) {
      momentumBonus = context.scoreDifference > 0 ? 2 : -2; // Momentum claro
    }

    // === VARIANZA ALEATORIA ===

    const randomVariance = (Math.random() - 0.5) * 6; // -3 a +3

    return {
      situationalBonus,
      weatherPenalty,
      pressureModifier,
      fatigueModifier,
      momentumBonus,
      randomVariance
    };
  }

  /**
   * Calcula la probabilidad de fumble basada en la situación
   */
  private static calculateFumbleProbability(
    offense: OffensiveTeam,
    defense: DefensiveTeam,
    context: PlayContext,
    yardsGained: number
  ): number {

    const offAttrs = offense.getOffensiveAttributes();
    const defAttrs = defense.getDefensiveAttributes();

    // Factores que aumentan fumbles
    let fumbleChance = 0.015; // Base 1.5%

    // Más fumbles con más contacto (yardas ganadas)
    if (yardsGained >= 8) fumbleChance += 0.005;

    // Más fumbles bajo presión
    if (context.pressure === 'high') fumbleChance += 0.01;
    if (context.pressure === 'extreme') fumbleChance += 0.02;

    // Habilidad defensiva para forzar fumbles
    const defensiveFumbleForcing = defAttrs.tacklesForLoss / 100;
    fumbleChance += defensiveFumbleForcing * 0.01;

    // Seguridad ofensiva del balón
    const offensiveBallSecurity = offAttrs.breakawayAbility / 100; // Usar habilidad de RB como proxy
    fumbleChance -= offensiveBallSecurity * 0.01;

    return Math.max(0.005, Math.min(0.05, fumbleChance)); // 0.5% - 5%
  }

  /**
   * Calcula la probabilidad de jugada explosiva
   */
  private static calculateExplosiveProbability(
    offensiveRating: number,
    defensiveRating: number,
    context: PlayContext
  ): number {

    const advantage = offensiveRating - defensiveRating;
    let explosiveChance = 0.1; // Base 10%

    // Más probable con ventaja ofensiva
    explosiveChance += Math.max(0, advantage / 500);

    // Menos probable en situaciones de alta presión
    if (context.pressure === 'high') explosiveChance *= 0.7;
    if (context.pressure === 'extreme') explosiveChance *= 0.5;

    return Math.max(0.05, Math.min(0.3, explosiveChance)); // 5% - 30%
  }

  /**
   * Calcula la probabilidad de éxito de la jugada
   */
  private static calculateSuccessProbability(
    yardsGained: number,
    yardsToGo: number,
    riskLevel: 'low' | 'medium' | 'high'
  ): number {

    let successProb = 0;

    // Éxito = conseguir primer down o ganar yardas positivas
    if (yardsGained >= yardsToGo) {
      successProb = 100; // Primer down conseguido
    } else if (yardsGained > 0) {
      successProb = 50 + (yardsGained / yardsToGo) * 30; // Progreso parcial
    } else {
      successProb = 10; // Pérdida de yardas
    }

    // Ajustar por nivel de riesgo
    switch (riskLevel) {
      case 'low':
        successProb = Math.min(90, successProb + 10);
        break;
      case 'high':
        successProb = Math.max(20, successProb - 10);
        break;
    }

    return Math.round(successProb);
  }

  /**
   * Genera narrativa específica para carreras
   */
  private static getRunningNarrative(
    action: RunningPlayAction,
    yards: number,
    advantage: number
  ): string {

    const playTypeDescriptions: { [key: string]: string } = {
      'power': 'carrera de poder por el centro',
      'sweep': 'carrera hacia la banda',
      'draw': 'carrera retrasada sorpresiva',
      'counter': 'contraataque con engaño',
      'outside_zone': 'carrera de zona exterior',
      'inside_zone': 'carrera de zona interior',
      'dive': 'carrera directa por el centro',
      'iso': 'carrera de aislamiento',
      'toss': 'lanzamiento lateral',
      'stretch': 'carrera de estiramiento'
    };

    const description = playTypeDescriptions[action.playType] || 'carrera';

    if (yards >= 10) {
      return advantage > 10 ?
        `${description} con bloqueo dominante` :
        `${description} con gran esfuerzo individual`;
    } else if (yards >= 4) {
      return `${description} con bloqueo sólido`;
    } else if (yards >= 0) {
      return advantage < -5 ?
        `${description} contra defensa bien posicionada` :
        `${description} con poco espacio`;
    } else {
      return `${description} detenida en el backfield`;
    }
  }
}