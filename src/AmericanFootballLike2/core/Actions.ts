// Actions - Acciones y estrategias detalladas basadas en la documentación
// Representa todas las acciones ofensivas y defensivas posibles

import { Player } from "./Player";

// ===== ACCIONES OFENSIVAS =====

// 1) Juego Terrestre (Carreras)
export type RunningPlayType =
    // Carrera Interior
    | 'dive'           // Entrega directa por el centro
    | 'trap'           // Bloqueo trampa
    | 'power'          // Carrera de poder con pulling guard
    | 'iso'            // Aislamiento del fullback
    | 'draw'           // Carrera retrasada

    // Carrera Exterior  
    | 'sweep'          // Carrera hacia la banda
    | 'toss'           // Lanzamiento lateral al RB
    | 'end_around'     // WR corre desde el backfield
    | 'pitch'          // Lanzamiento rápido al RB

    // Counter/Misdirection
    | 'counter'        // Contraataque
    | 'counter_trey'   // Counter con pulling guards
    | 'reverse'        // Reversa con WR
    | 'flea_flicker'   // Entrega-lateral-pase

    // Zone Running
    | 'inside_zone'    // Zona interior
    | 'outside_zone'   // Zona exterior
    | 'stretch'        // Estiramiento de la defensa
    | 'zone_read';     // Lectura de zona con opción QB

export interface RunningPlayAction {
    actionType: 'running';         // Identificador del tipo de acción
    playType: RunningPlayType;
    direction: 'left' | 'right' | 'center';
    gap: 'A' | 'B' | 'C' | 'D';   // Hueco de ataque (A=centro, D=exterior)

    // Características cualitativas
    purpose: 'control_clock' | 'wear_down_defense' | 'exploit_speed' | 'short_yardage' | 'goal_line';
    riskLevel: 'low' | 'medium' | 'high';
    expectedYards: number;         // Yardas esperadas

    // Información del equipo (no jugadores específicos)
    teamStrength: number;          // Fuerza ofensiva del equipo para esta jugada
}

// 2) Juego Aéreo (Pases)
export type PassingPlayType =
    // Pase Corto/Rápido
    | 'slant'          // Ruta diagonal corta
    | 'hitch'          // Parada y vuelta
    | 'flat'           // Pase a la banda
    | 'quick_out'      // Salida rápida
    | 'bubble_screen'  // Pantalla burbuja
    | 'tunnel_screen' // Pantalla túnel

    // Pase Intermedio/Profundo
    | 'post'           // Ruta hacia los postes
    | 'corner'         // Ruta hacia la esquina
    | 'go_route'       // Ruta vertical (fly)
    | 'comeback'       // Regreso
    | 'dig'            // Ruta de excavación
    | 'curl'           // Ruta de rizo

    // Play Action
    | 'play_action_deep'    // PA con ruta profunda
    | 'play_action_bootleg' // PA con rollout
    | 'play_action_screen'  // PA con pantalla

    // Screens
    | 'rb_screen'      // Pantalla al RB
    | 'wr_screen'      // Pantalla al WR
    | 'te_screen'      // Pantalla al TE
    | 'middle_screen'; // Pantalla por el centro

export interface PassingPlayAction {
    actionType: 'passing';         // Identificador del tipo de acción
    playType: PassingPlayType;
    protection?: 'max_protect' | 'slide' | 'hot' | 'empty'; // Opcional

    // Información simplificada de rutas
    routeDepth: number;            // Profundidad promedio de las rutas
    routeComplexity: 'simple' | 'intermediate' | 'complex';

    // Características cualitativas
    purpose: 'neutralize_blitz' | 'explosive_gain' | 'move_chains' | 'exploit_coverage' | 'clock_management';
    riskLevel: 'low' | 'medium' | 'high';
    expectedYards: number;
    completionProbability: number; // 0-100%

    // Información del equipo (no jugadores específicos)
    teamPassingStrength: number;   // Fuerza de pase del equipo
}

export interface ReceiverRoute {
    routeType: 'slant' | 'post' | 'corner' | 'go' | 'comeback' | 'dig' | 'curl' | 'flat' | 'hitch';
    depth: number;                 // Profundidad de la ruta en yardas
    breakPoint: number;            // Punto de quiebre de la ruta
    isPrimary: boolean;            // ¿Es el receptor principal?
    receiverQuality: number;       // Calidad del receptor (0-100)
}

// 3) Opciones del QB
export type QuarterbackOption =
    | 'rpo_run'        // RPO - opción de carrera
    | 'rpo_pass'       // RPO - opción de pase
    | 'qb_keep'        // QB se queda con el balón
    | 'qb_scramble'    // QB corre improvisado
    | 'bootleg'        // QB sale del pocket
    | 'rollout'        // QB rueda hacia un lado
    | 'designed_run'   // Carrera diseñada del QB
    | 'read_option';   // Opción de lectura

export interface QuarterbackAction {
    optionType: QuarterbackOption;
    quarterback: Player;
    readKey: Player;               // Jugador defensivo que lee

    // Opciones disponibles
    runOption?: RunningPlayAction;
    passOption?: PassingPlayAction;

    // Características
    decisionTime: number;          // Tiempo para decidir (segundos)
    mobilityRequired: number;      // Movilidad requerida (0-100)
}

// 4) Control de Tempo
export type TempoControl =
    | 'huddle'         // Reunión normal
    | 'no_huddle'      // Sin reunión
    | 'hurry_up'       // Ofensiva acelerada
    | 'two_minute_drill' // Simulacro de dos minutos
    | 'spike'          // Clavar el balón
    | 'kneel'          // Arrodillarse
    | 'delay_game';    // Retrasar el juego

export interface TempoAction {
    tempoType: TempoControl;
    purpose: 'confuse_defense' | 'fatigue_defense' | 'clock_management' | 'rest_offense' | 'strategy_adjustment';
    timeImpact: number;            // Impacto en el tiempo de jugada
    fatigueImpact: number;         // Impacto en la fatiga (positivo = más fatiga para defensa)
}

// ===== ACCIONES DEFENSIVAS =====

// 1) Formaciones Defensivas
export interface DefensiveFormationAction {
    formation: '4-3' | '3-4' | 'nickel' | 'dime' | 'quarter' | 'goal_line' | '46' | 'bear';
    personnel: {
        defensiveLinemen: Player[];
        linebackers: Player[];
        cornerbacks: Player[];
        safeties: Player[];
    };

    // Características
    strengths: ('run_defense' | 'pass_coverage' | 'pass_rush' | 'versatility')[];
    weaknesses: ('deep_coverage' | 'run_gaps' | 'short_passes' | 'mobility')[];
}

// 2) Coberturas de Pase
export type PassCoverage =
    | 'cover_0'        // Sin safety profundo
    | 'cover_1'        // Un safety profundo
    | 'cover_2'        // Dos safeties profundos
    | 'cover_3'        // Tres defensores profundos
    | 'cover_4'        // Cuatro defensores profundos (quarters)
    | 'tampa_2'        // Tampa 2 (MLB profundo)
    | 'robber'         // Defensor "ladrón"
    | 'bracket'        // Cobertura de soporte
    | 'banjo';         // Cobertura cruzada

export interface PassCoverageAction {
    coverageType: PassCoverage;
    assignments: CoverageAssignment[];

    // Características
    deepCoverage: number;          // Calidad de cobertura profunda (0-100)
    shortCoverage: number;         // Calidad de cobertura corta (0-100)
    vulnerabilities: string[];     // Puntos débiles de la cobertura
}

export interface CoverageAssignment {
    defender: Player;
    assignment: 'man_coverage' | 'zone_coverage' | 'spy' | 'blitz' | 'contain';
    target?: Player;               // Si es man coverage
    zone?: 'flat' | 'hook' | 'deep_third' | 'deep_half' | 'middle';
}

// 3) Estrategias de Presión
export type PassRushStrategy =
    | 'four_man_rush'  // Presión estándar
    | 'lb_blitz'       // Blitz de linebacker
    | 'safety_blitz'   // Blitz de safety
    | 'corner_blitz'   // Blitz de cornerback
    | 'zone_blitz'     // Blitz con cobertura de zona
    | 'stunt'          // Movimiento cruzado
    | 'twist'          // Intercambio de linieros
    | 'overload'       // Sobrecarga de un lado
    | 'a_gap_blitz'    // Blitz por el hueco A
    | 'edge_rush';     // Presión por las bandas

export interface PassRushAction {
    rushType: PassRushStrategy;
    rushers: Player[];             // Jugadores que presionan

    // Características
    pressureLevel: number;         // Nivel de presión (0-100)
    riskLevel: 'low' | 'medium' | 'high';
    timeToQuarterback: number;     // Tiempo estimado para llegar al QB
}

// 4) Defensa contra Carrera
export type RunDefenseStrategy =
    | 'stack_box'      // Reforzar la caja
    | 'gap_control'    // Control de huecos
    | 'run_blitz'      // Blitz contra carrera
    | 'contain'        // Contención
    | 'edge_set'       // Establecer el borde
    | 'spy_rb'         // Espiar al RB
    | 'fill_gaps'      // Llenar huecos
    | 'scrape_exchange'; // Intercambio de responsabilidades

export interface RunDefenseAction {
    defenseType: RunDefenseStrategy;
    assignments: RunDefenseAssignment[];

    // Características
    runStopProbability: number;    // Probabilidad de parar la carrera (0-100)
    gapsCovered: ('A' | 'B' | 'C' | 'D')[];
}

export interface RunDefenseAssignment {
    defender: Player;
    responsibility: 'gap_control' | 'contain' | 'pursue' | 'fill' | 'spy';
    gap?: 'A' | 'B' | 'C' | 'D';
}

// ===== ACCIONES ESPECIALES =====

// Equipos Especiales - Kickoffs
export type KickoffType = 
    | 'normal_kickoff'     // Kickoff normal
    | 'onside_kick'        // Patada corta
    | 'squib_kick'         // Patada baja
    | 'touchback_kick';    // Patada para touchback

export interface KickoffAction {
    actionType: 'kickoff';
    kickoffType: KickoffType;
    targetArea: 'deep' | 'short' | 'sideline' | 'middle';
    
    // Características
    surpriseFactor: number;        // Factor sorpresa para onside (0-100)
    hangTime: number;              // Tiempo en el aire esperado
    kickerStrength: number;        // Fuerza del pateador (0-100)
}

// Equipos Especiales - Punts
export type PuntType =
    | 'normal_punt'        // Punt normal
    | 'fake_punt'          // Engaño de punt
    | 'coffin_corner'      // Punt a la esquina
    | 'rugby_punt'         // Punt estilo rugby
    | 'quick_punt';        // Punt rápido

export interface PuntAction {
    actionType: 'punt';
    puntType: PuntType;
    targetArea: 'deep' | 'corner' | 'sideline' | 'middle';
    
    // Características para fake punt
    fakePlayType?: RunningPlayType | PassingPlayType;
    surpriseFactor: number;        // Factor sorpresa para fake (0-100)
    hangTime: number;              // Tiempo en el aire esperado
    punterStrength: number;        // Fuerza del punter (0-100)
}

// Equipos Especiales - Field Goals
export type FieldGoalType =
    | 'normal_field_goal'  // Field goal normal
    | 'fake_field_goal'    // Engaño de field goal
    | 'extra_point'        // Punto extra
    | 'two_point_attempt'; // Intento de 2 puntos

export interface FieldGoalAction {
    actionType: 'field_goal';
    fieldGoalType: FieldGoalType;
    distance: number;              // Distancia en yardas
    
    // Características para fake
    fakePlayType?: RunningPlayType | PassingPlayType;
    surpriseFactor: number;        // Factor sorpresa para fake (0-100)
    kickerAccuracy: number;        // Precisión del pateador (0-100)
    kickerRange: number;           // Rango del pateador (0-100)
}

// Jugadas de Engaño/Trick Plays
export type TrickPlay =
    | 'flea_flicker'       // Entrega-lateral-pase
    | 'double_pass'        // Doble pase
    | 'reverse'            // Reversa
    | 'halfback_pass'      // Pase del halfback
    | 'statue_of_liberty'  // Estatua de la libertad
    | 'hook_and_ladder'    // Hook and ladder
    | 'fumblerooski';      // Fumblerooski

export interface TrickPlayAction {
    actionType: 'trick_play';
    playType: TrickPlay;
    keyPlayers: Player[];

    // Características
    surpriseFactor: number;        // Factor sorpresa (0-100)
    successProbability: number;    // Probabilidad de éxito (0-100)
    riskLevel: 'medium' | 'high' | 'extreme';
    expectedYards: number;         // Yardas esperadas si funciona
}

// Jugadas Especiales de Situación
export type SituationalPlayType =
    | 'kneel'              // Arrodillarse
    | 'spike'              // Clavar el balón
    | 'safety_kick'        // Patada después de safety
    | 'fair_catch_kick';   // Patada después de fair catch

export interface SituationalPlayAction {
    actionType: 'situational';
    playType: SituationalPlayType;
    purpose: 'clock_management' | 'field_position' | 'score_attempt' | 'safety_protocol';
    
    // Características específicas
    timeImpact: number;            // Impacto en el tiempo de juego
    riskLevel: 'low' | 'medium';
}

// ===== RESULTADOS DE ACCIONES =====

export interface ActionResult {
    // Resultado cuantitativo
    yardsGained: number;
    timeConsumed: number;
    firstDownAchieved: boolean;
    touchdownScored: boolean;
    turnoverOccurred: boolean;

    // Resultado cualitativo
    executionQuality: 'poor' | 'fair' | 'good' | 'excellent';
    impactOnMomentum: 'negative' | 'neutral' | 'positive' | 'game_changing';
    keyFactors: string[];          // Factores que influyeron en el resultado

    // Jugadores destacados
    playmakers: Player[];          // Jugadores que hicieron la jugada
    goats: Player[];               // Jugadores que fallaron
}

// ===== ANÁLISIS DE ACCIONES =====

export class ActionAnalyzer {

    /**
     * Evalúa la calidad de ejecución de una acción
     */
    static evaluateExecution(
        action: RunningPlayAction | PassingPlayAction | QuarterbackAction,
        result: ActionResult
    ): typeof result.executionQuality {
        // Lógica simplificada - en implementación real sería más compleja
        const expectedYards = 'expectedYards' in action ? action.expectedYards : 5;
        const actualYards = result.yardsGained;

        const efficiency = actualYards / expectedYards;

        if (efficiency >= 1.5) return 'excellent';
        if (efficiency >= 1.0) return 'good';
        if (efficiency >= 0.5) return 'fair';
        return 'poor';
    }

    /**
     * Calcula el impacto en el momentum
     */
    static calculateMomentumImpact(
        action: any,
        result: ActionResult,
        gameContext: any
    ): typeof result.impactOnMomentum {
        let impact = 0;

        // Factores positivos
        if (result.touchdownScored) impact += 3;
        if (result.firstDownAchieved) impact += 1;
        if (result.yardsGained >= 15) impact += 1;

        // Factores negativos
        if (result.turnoverOccurred) impact -= 3;
        if (result.yardsGained < 0) impact -= 1;

        // Contexto del juego
        if (gameContext?.isHighPressure && impact > 0) impact += 1;

        if (impact >= 3) return 'game_changing';
        if (impact >= 1) return 'positive';
        if (impact <= -2) return 'negative';
        return 'neutral';
    }

    /**
     * Genera descripción cualitativa de la acción
     */
    static generateActionDescription(
        action: any,
        result: ActionResult
    ): string {
        const execution = result.executionQuality;
        const momentum = result.impactOnMomentum;

        let description = `Ejecución ${execution}`;
        if (momentum !== 'neutral') {
            description += `, impacto ${momentum} en el momentum`;
        }

        if (result.keyFactors.length > 0) {
            description += `. Factores clave: ${result.keyFactors.join(', ')}`;
        }

        return description;
    }
}