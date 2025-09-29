import { SpecialPlayType, IMatchState, DynamicStrategy, StrategicAxes, ExecutionModifiers, IPlayVector } from './Types';
import { TeamMatch } from './Players';

// --- MOTOR DE JUGADAS Y LÓGICA DE ELECCIÓN ---

export class MatchEngine {

  /**
   * Determina si el equipo debe intentar una patada especial.
   */
  public static shouldAttemptSpecialPlay(team: TeamMatch, state: IMatchState): SpecialPlayType | null {
    // En 4to down, considerar punt o field goal
    if (state.down === 4) {
      // Field goal si estamos cerca (dentro de las 35 yardas)
      if (state.offenseYardLine >= 65) {
        return 'FieldGoal';
      }
      // Punt si estamos lejos
      if (state.offenseYardLine < 50) {
        return 'Punt';
      }
      // En zona intermedia, depende de la agresividad del equipo
      const aggression = team.data.currentStrategy.axes.aggression;
      return aggression > 70 ? null : 'Punt'; // Solo equipos muy agresivos van por el primer down
    }
    return null;
  }

  /**
   * Ejecuta una jugada especial (patada).
   */
  public static executeSpecialPlay(playType: SpecialPlayType, team: TeamMatch, state: IMatchState): {
    success: boolean,
    yardsGained: number,
    points: number,
    description: string
  } {
    const kicker = team.data.players.find(p => p.role === 'Kicker') || team.data.players[0];
    const kickerSkill = kicker.getEffectiveAttribute('kickAccuracy');

    switch (playType) {
      case 'FieldGoal':
        const distance = 120 - state.offenseYardLine; // Distancia al goal (incluye 10 yardas de end zone + snap)
        const successChance = Math.max(0.3, Math.min(0.95, (kickerSkill / 100) - (distance - 30) * 0.02));
        const success = Math.random() < successChance;
        return {
          success,
          yardsGained: success ? 0 : 0,
          points: success ? 3 : 0,
          description: success ?
            `¡FIELD GOAL BUENO! ${Math.round(distance)} yardas 🎯` :
            `Field goal fallido desde ${Math.round(distance)} yardas ❌`
        };

      case 'ExtraPoint':
        const extraSuccess = Math.random() < (kickerSkill / 100) * 0.95; // 95% base para extra point
        return {
          success: extraSuccess,
          yardsGained: 0,
          points: extraSuccess ? 1 : 0,
          description: extraSuccess ? '¡Punto extra bueno! ✅' : 'Punto extra fallido ❌'
        };

      case 'Punt':
        const puntDistance = Math.min(60, Math.max(25, kickerSkill * 0.6 + Math.random() * 20));
        return {
          success: true,
          yardsGained: Math.round(puntDistance),
          points: 0,
          description: `Despeje de ${Math.round(puntDistance)} yardas 🦶`
        };

      default:
        return { success: false, yardsGained: 0, points: 0, description: 'Jugada especial no implementada' };
    }
  }

  /**
   * Genera una estrategia dinámica basada en el contexto del partido.
   */
  public static generateDynamicStrategy(team: TeamMatch, state: IMatchState, isOffense: boolean, currentScore: number = 0): DynamicStrategy {
    // Factores contextuales que influyen en la estrategia
    const timeUrgency = (3600 - state.timeRemaining) / 3600; // 0-1, más urgente al final (60 min total)
    const fieldPosition = state.offenseYardLine / 100; // 0-1, más cerca de la end zone
    const downPressure = state.down / 4; // 0.25-1.0, más presión en downs altos

    // Personalidad base del equipo (basada en CT y cohesión)
    const teamAggression = (100 - team.data.tacticalComprehension) / 100; // Equipos con baja CT son más agresivos
    const teamCohesion = team.data.baseCohesion / 100;

    // Generar ejes estratégicos base
    const baseAxes: StrategicAxes = {
      // Aggression: Más agresivo si hay presión de tiempo/down o baja CT
      aggression: Math.min(100, (teamAggression * 60) + (timeUrgency * 30) + (downPressure * 40)),

      // VerticalDepth: Más profundo si estamos lejos de la end zone o hay urgencia
      verticalDepth: isOffense ?
        Math.min(100, ((1 - fieldPosition) * 50) + (timeUrgency * 40) + (downPressure * 30)) :
        Math.max(0, 50 - (fieldPosition * 30)), // Defensa más conservadora cerca de su end zone

      // PositionalFocus: Más especializado si el equipo tiene alta cohesión
      positionalFocus: Math.min(100, teamCohesion * 80 + (downPressure * 20))
    };

    // Generar modificadores de ejecución base
    const baseModifiers: ExecutionModifiers = {
      // Tempo: Ritmo más rápido con urgencia de tiempo
      tempo: Math.min(1.0, 0.3 + (timeUrgency * 0.5) + (downPressure * 0.2)),

      // Deception: Más engaño si el equipo es cohesivo y hay presión
      deception: Math.min(1.0, (teamCohesion * 0.4) + (downPressure * 0.3))
    };

    const baseStrategy: DynamicStrategy = {
      axes: baseAxes,
      modifiers: baseModifiers,
      name: `Agr:${Math.round(baseAxes.aggression)} Prof:${Math.round(baseAxes.verticalDepth)} Foco:${Math.round(baseAxes.positionalFocus)}`
    };

    // INFLUENCIA DE LOS ENTRENADORES
    const gameContext = {
      isOffense,
      score: currentScore,
      timeRemaining: state.timeRemaining,
      down: state.down
    };

    const finalStrategy = team.data.coachingStaff.influenceStrategy(baseStrategy, gameContext);

    return finalStrategy;
  }

  /**
   * Genera un vector de jugada basado en la estrategia dinámica.
   */
  public static generatePlayVector(strategy: DynamicStrategy, team: TeamMatch): IPlayVector {
    const { aggression, verticalDepth, positionalFocus } = strategy.axes;
    const { tempo, deception } = strategy.modifiers;

    // Convertir ejes a pesos para el vector de jugada
    const aggressionFactor = aggression / 100;
    const depthFactor = verticalDepth / 100;
    const specializationFactor = positionalFocus / 100;

    // Generar intención de avance con más variabilidad
    const randomFactor = Math.random();

    // Pases profundos más frecuentes cuando hay alta profundidad vertical
    const A_Prof = depthFactor > 0.6 ?
      (depthFactor * 0.8 + (Math.random() * 0.4)) :
      (depthFactor * 0.3 + (Math.random() * 0.2));

    // Pases cortos/medios
    const A_Prec = (1 - depthFactor) * 0.7 + (Math.random() * 0.5);

    // Carreras de poder (más con alta agresividad)
    const T_Con = aggressionFactor > 0.5 ?
      (aggressionFactor * 0.6 + (Math.random() * 0.4)) :
      ((1 - depthFactor) * 0.4 + (Math.random() * 0.3));

    // Carreras de evasión (más con baja agresividad pero alta velocidad)
    const T_Eva = (1 - aggressionFactor) * 0.5 + (depthFactor * 0.3) + (Math.random() * 0.3);

    // Normalizar intención de avance
    const totalIntention = A_Prof + A_Prec + T_Con + T_Eva;

    // Riesgo/Control basado en AD
    const R = aggressionFactor * 0.8 + (tempo * 0.2);
    const C = 1 - R;

    // Reparto de responsabilidad basado en EP
    const Bl_Conc = specializationFactor * 0.7 + ((1 - aggressionFactor) * 0.3);
    const Ej_Espec = specializationFactor * 0.8 + (aggressionFactor * 0.2);

    return {
      T_Con: T_Con / totalIntention,
      A_Prec: A_Prec / totalIntention,
      A_Prof: A_Prof / totalIntention,
      T_Eva: T_Eva / totalIntention,
      R: Math.min(1.0, R),
      C: Math.min(1.0, C),
      Bl_Conc: Math.min(1.0, Bl_Conc),
      Ej_Espec: Math.min(1.0, Ej_Espec)
    };
  }

  /**
   * Simula la elección de la jugada usando estrategia dinámica.
   */
  public static selectStrategyAndPlay(team: TeamMatch, state: IMatchState, isOffense: boolean = true, currentScore: number = 0): { playVector: IPlayVector, strategy: DynamicStrategy } {
    // Generar estrategia dinámica basada en contexto (incluyendo entrenadores)
    const strategy = this.generateDynamicStrategy(team, state, isOffense, currentScore);

    // Actualizar estrategia del equipo
    team.data.currentStrategy = strategy;

    // Generar vector de jugada basado en la estrategia
    const playVector = this.generatePlayVector(strategy, team);

    return { playVector, strategy };
  }

  /**
   * Calcula el multiplicador de alineamiento basado en estrategias dinámicas.
   */
  public static calculateAlignmentMultiplier(offStrategy: DynamicStrategy, defStrategy: DynamicStrategy): number {
    // Ajuste por Ritmo
    const rhythmDiff = offStrategy.modifiers.tempo - defStrategy.modifiers.tempo;
    const rhythmAdjustment = 1 + (rhythmDiff * 0.3); // Bono si la ofensiva es más rápida

    // Ajuste por Engaño
    const deceptionBonus = offStrategy.modifiers.deception * 0.4; // Bono base por engaño
    const defenseConcentration = 0.7; // Simplificado: concentración promedio defensiva
    const deceptionAdjustment = 1 + (deceptionBonus * (1 - defenseConcentration));

    return (rhythmAdjustment + deceptionAdjustment) / 2;
  }

  /**
   * Simula la resolución de una jugada usando estrategias dinámicas.
   */
  public static resolvePlay(offense: TeamMatch, defense: TeamMatch, state: IMatchState, offenseScore: number = 0, defenseScore: number = 0): number {

    // 1. Elección de Estrategia/Jugada usando sistema dinámico
    const { playVector: offPlay, strategy: offStrategy } = this.selectStrategyAndPlay(offense, state, true, offenseScore - defenseScore);
    const { playVector: defPlay, strategy: defStrategy } = this.selectStrategyAndPlay(defense, state, false, defenseScore - offenseScore);

    // 2. CÁLCULO DE FUERZAS BRUTAS (Afectada por la fatiga y ejes estratégicos)
    let FTC_Offense_Bruta = offense.calculateFTCBruta(offPlay, true);
    let FTC_Defense_Bruta = defense.calculateFTCBruta(defPlay, false);

    // Ajuste por Agresividad en Duelos (AD)
    const offAggressionBonus = (offStrategy.axes.aggression / 100) * 0.2; // Hasta 20% de bono
    const defAggressionBonus = (defStrategy.axes.aggression / 100) * 0.15; // Hasta 15% de bono

    FTC_Offense_Bruta *= (1 + offAggressionBonus);
    FTC_Defense_Bruta *= (1 + defAggressionBonus);

    // 3. CÁLCULO DE BONO POR ESPECIALIZACIÓN Y PROFUNDIDAD
    // Matchup basado en Profundidad Vertical
    const depthMatchup = this.calculateDepthMatchup(offStrategy, defStrategy, offense, defense);

    // 4. CÁLCULO DE M_Alineamiento usando estrategias dinámicas
    const M_Alineamiento = this.calculateAlignmentMultiplier(offStrategy, defStrategy);

    // 5. CÁLCULO DE LA GANANCIA DE YARDAS (G)

    // Factor base más agresivo para permitir más yardas
    let factorBase = 4.5; // Base de 4.5 yardas promedio

    // Ajustar según el tipo de jugada
    const isPassPlay = (offPlay.A_Prec + offPlay.A_Prof) > (offPlay.T_Con + offPlay.T_Eva);
    const isDeepPass = offPlay.A_Prof > 0.4;
    const isRunPlay = (offPlay.T_Con + offPlay.T_Eva) > (offPlay.A_Prec + offPlay.A_Prof);

    if (isDeepPass) {
      factorBase = 8.0; // Pases profundos pueden ganar más yardas
    } else if (isPassPlay) {
      factorBase = 5.5; // Pases cortos/medios
    } else if (isRunPlay) {
      factorBase = 4.0; // Carreras más conservadoras
    }

    // Multiplicador Estratégico Total
    const M_EstrategiaTotal = depthMatchup * M_Alineamiento;

    // G = Factor Base * (FTC Bruta / FTC Defensiva) * M_Estrategia
    let G = factorBase * (FTC_Offense_Bruta / FTC_Defense_Bruta) * M_EstrategiaTotal;

    // Volatilidad y Riesgo más dramática
    let volatility = 0;
    if (isDeepPass) {
      // Pases profundos: alta variabilidad (-5 a +25 yardas)
      volatility = (Math.random() * 2 - 1) * 15 + (Math.random() * offPlay.R * 15);
    } else if (isPassPlay) {
      // Pases cortos: variabilidad media (-3 a +12 yardas)
      volatility = (Math.random() * 2 - 1) * 8 + (Math.random() * offPlay.R * 7);
    } else {
      // Carreras: variabilidad baja (-2 a +8 yardas)
      volatility = (Math.random() * 2 - 1) * 5 + (Math.random() * offPlay.R * 5);
    }

    G = G + volatility;

    // Rangos más realistas
    if (isDeepPass) {
      return Math.max(-5, Math.min(45, Math.round(G))); // Pases profundos: -5 a 45 yardas
    } else if (isPassPlay) {
      return Math.max(-3, Math.min(25, Math.round(G))); // Pases cortos: -3 a 25 yardas
    } else {
      return Math.max(-2, Math.min(15, Math.round(G))); // Carreras: -2 a 15 yardas
    }
  }

  /**
   * Calcula el matchup de profundidad entre estrategias ofensivas y defensivas.
   */
  private static calculateDepthMatchup(offStrategy: DynamicStrategy, defStrategy: DynamicStrategy,
    offense: TeamMatch, defense: TeamMatch): number {
    // Diferencia en enfoque de profundidad
    const depthDifference = offStrategy.axes.verticalDepth - defStrategy.axes.verticalDepth;

    // Si la ofensiva va más profunda que lo que espera la defensa, hay ventaja
    let matchupBonus = 1 + (depthDifference / 100) * 0.3;

    // Ajuste por especialización del equipo
    const offSpecialization = offense.data.offenseSpecialization.PCM / 100;
    const defSpecialization = defense.data.defenseSpecialization.PCM / 100;

    matchupBonus *= (offSpecialization / defSpecialization);

    return Math.max(0.5, Math.min(2.0, matchupBonus));
  }

  /**
   * Realiza una iteración del partido (una jugada), incluyendo la fatiga.
   */
  public static runPlay(offense: TeamMatch, defense: TeamMatch, state: IMatchState, offenseScore: number = 0, defenseScore: number = 0): number {
    const gain = this.resolvePlay(offense, defense, state, offenseScore, defenseScore);

    // Determinar si la jugada fue exitosa
    const playSuccess = gain > 0;

    // Actualizar estado mental de los entrenadores
    const gameContext = { score: offenseScore - defenseScore, timeRemaining: state.timeRemaining };
    offense.data.coachingStaff.updateStaffMentalState(playSuccess, gameContext);
    defense.data.coachingStaff.updateStaffMentalState(!playSuccess, { score: defenseScore - offenseScore, timeRemaining: state.timeRemaining });

    // Actualizar Fatiga (muy simplificado: alta intensidad para todos)
    const intensity = 0.8;
    offense.data.players.forEach(p => p.loseEnergy(intensity));
    defense.data.players.forEach(p => p.loseEnergy(intensity));

    return gain;
  }
}