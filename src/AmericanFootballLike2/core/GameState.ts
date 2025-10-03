// GameState - Estado completo del partido con tres niveles de detalle
// Basado en la documentación: Contexto Global, Contexto de Serie, Contexto de Jugada

import { Player } from "./Player";

// ===== NIVEL 1: CONTEXTO GLOBAL DEL PARTIDO =====

export interface ExternalConditions {
  weather: 'clear' | 'rain' | 'snow' | 'wind' | 'fog';
  temperature: number; // En Celsius
  windSpeed: number;   // En km/h
  windDirection: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
  stadiumNoise: number; // 0-100 (nivel de ruido)
  fieldCondition: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface GlobalMatchContext {
  // Marcador
  scoreTeamX: number;
  scoreTeamY: number;

  // Tiempo
  currentQuarter: number;        // 1-4 (+ overtime si aplica)
  timeRemainingInQuarter: number; // En segundos
  totalTimeElapsed: number;      // Tiempo total transcurrido

  // Posesión
  possessionTeam: TeamMatch;
  defendingTeam: TeamMatch;

  // Timeouts
  timeoutsRemainingX: number;    // 0-3 por tiempo
  timeoutsRemainingY: number;    // 0-3 por tiempo

  // Condiciones externas
  externalConditions: ExternalConditions;

  // Estado del partido
  gamePhase: 'first_half' | 'halftime' | 'second_half' | 'overtime' | 'finished';
  isTwoMinuteWarning: boolean;
}

// ===== NIVEL 2: CONTEXTO DE SERIE / DRIVE =====

export interface DriveContext {
  driveNumber: number;           // Número de serie del equipo ofensivo
  startingFieldPosition: number; // Yarda donde inició la serie
  startingTime: number;          // Tiempo cuando inició
  startingQuarter: number;       // Cuarto donde inició

  // Objetivo inmediato
  immediateGoal: 'first_down' | 'touchdown' | 'field_goal' | 'run_clock' | 'two_minute_drill';

  // Historial de jugadas del drive
  playsInDrive: PlayHistoryEntry[];

  // Estadísticas de la serie
  totalYardsGained: number;
  totalTimeTaken: number;
  firstDownsEarned: number;
  penaltiesCommitted: number;
}

export interface PlayHistoryEntry {
  playNumber: number;
  playType: string;
  yardsGained: number;
  timeConsumed: number;
  down: number;
  distance: number;
  fieldPosition: number;
  result: string;
}

// ===== NIVEL 3: CONTEXTO DE JUGADA (PLAYSTATE) =====

export type HashMark = 'left' | 'center' | 'right';

export interface FieldPosition {
  yardLine: number;              // 0-100 (desde zona de anotación propia)
  hashMark: HashMark;            // Posición lateral del balón
  redZone: boolean;              // ¿Está en zona roja? (yarda 80+)
  goalLine: boolean;             // ¿Está en línea de gol? (yarda 95+)
}

// Formaciones Ofensivas
export type OffensiveFormation =
  | 'under_center'      // QB bajo el centro
  | 'shotgun'           // QB a 5-7 yardas del centro
  | 'pistol'            // QB a 4 yardas, RB detrás
  | 'wildcat'           // RB recibe el snap directo
  | 'victory_formation' // Formación de victoria
  | 'goal_line'         // Formación de línea de gol
  | 'two_minute_drill'; // Formación de dos minutos

export interface OffensivePersonnel {
  quarterbacks: number;  // Normalmente 1
  runningBacks: number;  // 0-3
  wideReceivers: number; // 0-5
  tightEnds: number;     // 0-3
  offensiveLinemen: number; // Siempre 5 (C, 2 G, 2 T)

  // Paquetes específicos
  personnel: '11' | '12' | '21' | '22' | '10' | '01' | 'goal_line' | 'special';
  // 11 = 1 RB, 1 TE, 3 WR
  // 12 = 1 RB, 2 TE, 2 WR
  // 21 = 2 RB, 1 TE, 2 WR
  // etc.
}

// Formaciones Defensivas
export type DefensiveFormation =
  | '4-3'        // 4 linieros, 3 linebackers
  | '3-4'        // 3 linieros, 4 linebackers
  | 'nickel'     // 5 DBs (contra 3+ receptores)
  | 'dime'       // 6 DBs (contra pases largos)
  | 'quarter'    // 7 DBs (prevent defense)
  | 'goal_line'  // Defensa compacta
  | '46'         // Defensa 46 (histórica)
  | 'bear'       // Frente Bear
  | '5-2'        // 5 linieros, 2 linebackers
  | 'psycho';    // Formación ultra-agresiva

export interface DefensivePersonnel {
  defensiveLinemen: number;    // 2-6
  linebackers: number;         // 1-5
  cornerbacks: number;         // 2-4
  safeties: number;           // 1-3

  // Cobertura específica
  coverage: 'cover_0' | 'cover_1' | 'cover_2' | 'cover_3' | 'cover_4' | 'tampa_2' | 'robber';
}

// Situaciones Especiales
export type SpecialSituation =
  | 'red_zone'           // Zona roja (yarda 80+)
  | 'goal_line'          // Línea de gol (yarda 95+)
  | 'two_minute_drill'   // Últimos 2 minutos del tiempo
  | 'fourth_down'        // Cuarto down
  | 'short_yardage'      // Yardaje corto (≤3 yardas)
  | 'long_yardage'       // Yardaje largo (≥8 yardas)
  | 'backed_up'          // Cerca de zona propia (≤10 yardas)
  | 'midfield'           // Campo medio (40-60 yardas)
  | 'field_goal_range'   // Rango de gol de campo
  | 'hail_mary'          // Situación desesperada
  | 'kneel_down'         // Situación de victoria
  | 'onside_kick'        // Patada corta necesaria
  | 'free_play';         // Jugada libre por penalización

// Movimientos Pre-Snap
export interface PreSnapMovements {
  motions: MotionPlay[];         // Movimientos de jugadores
  audibles: AudibleCall[];       // Cambios de jugada
  lineAdjustments: LineAdjustment[]; // Ajustes de línea
  timeoutCalled: boolean;        // ¿Se pidió timeout?
  delayCalled: boolean;          // ¿Hubo delay of game?
}

export interface MotionPlay {
  player: Player;
  motionType: 'jet_sweep' | 'orbit' | 'shift' | 'bunch' | 'stack';
  direction: 'left' | 'right' | 'forward' | 'backward';
  purpose: 'reveal_coverage' | 'create_mismatch' | 'confuse_defense' | 'timing';
}

export interface AudibleCall {
  caller: Player; // Normalmente el QB
  originalPlay: string;
  newPlay: string;
  reason: 'blitz_detected' | 'coverage_read' | 'mismatch_found' | 'time_management';
}

export interface LineAdjustment {
  position: 'center' | 'guard' | 'tackle';
  adjustmentType: 'slide_protection' | 'max_protect' | 'hot_route' | 'blitz_pickup';
  target: 'linebacker' | 'safety' | 'corner' | 'edge_rusher';
}

// Estado Completo de la Jugada
export interface CompletePlayState {
  // Información básica
  down: number;                  // 1-4
  yardsToGo: number;            // Yardas para primer down
  fieldPosition: FieldPosition;  // Posición detallada del balón

  // Formaciones y personal
  offensiveFormation: OffensiveFormation;
  offensivePersonnel: OffensivePersonnel;
  defensiveFormation: DefensiveFormation;
  defensivePersonnel: DefensivePersonnel;

  // Jugadores en campo
  offensivePlayersOnField: Player[]; // Exactamente 11
  defensivePlayersOnField: Player[];  // Exactamente 11

  // Movimientos pre-snap
  preSnapMovements: PreSnapMovements;

  // Situaciones especiales
  specialSituations: SpecialSituation[];

  // Tipo de jugada disponible
  availablePlayTypes: ('normal_play' | 'special_teams' | 'two_point_conversion')[];
}

// Estado Completo del Juego (Combinando los 3 niveles)
export interface CompleteGameState {
  globalContext: GlobalMatchContext;
  driveContext: DriveContext;
  playContext: CompletePlayState;

  // Metadatos
  stateId: string;              // ID único del estado
  timestamp: number;            // Momento de creación
  previousState?: string;       // ID del estado anterior

  // Análisis cualitativo
  momentum: 'heavily_favoring_x' | 'favoring_x' | 'neutral' | 'favoring_y' | 'heavily_favoring_y';
  pressure: 'low' | 'medium' | 'high' | 'extreme';
  gameFlow: 'defensive_battle' | 'offensive_shootout' | 'balanced' | 'special_teams_heavy';
}

// Funciones auxiliares para análisis cualitativo
export class GameStateAnalyzer {

  /**
   * Analiza el momentum del juego basándose en eventos recientes
   */
  static analyzeMomentum(state: CompleteGameState): typeof state.momentum {
    // Lógica simplificada - en implementación real sería más compleja
    const scoreDiff = state.globalContext.scoreTeamX - state.globalContext.scoreTeamY;

    if (Math.abs(scoreDiff) >= 21) {
      return scoreDiff > 0 ? 'heavily_favoring_x' : 'heavily_favoring_y';
    } else if (Math.abs(scoreDiff) >= 10) {
      return scoreDiff > 0 ? 'favoring_x' : 'favoring_y';
    }

    return 'neutral';
  }

  /**
   * Evalúa el nivel de presión de la situación
   */
  static analyzePressure(state: CompleteGameState): typeof state.pressure {
    let pressureLevel = 0;

    // Factores que aumentan la presión
    if (state.globalContext.currentQuarter >= 4) pressureLevel += 2;
    if (state.globalContext.isTwoMinuteWarning) pressureLevel += 2;
    if (state.playContext.down >= 3) pressureLevel += 1;
    if (state.playContext.specialSituations.includes('fourth_down')) pressureLevel += 2;
    if (state.playContext.specialSituations.includes('red_zone')) pressureLevel += 1;

    const scoreDiff = Math.abs(state.globalContext.scoreTeamX - state.globalContext.scoreTeamY);
    if (scoreDiff <= 7) pressureLevel += 1;

    if (pressureLevel >= 6) return 'extreme';
    if (pressureLevel >= 4) return 'high';
    if (pressureLevel >= 2) return 'medium';
    return 'low';
  }

  /**
   * Determina el flujo general del juego
   */
  static analyzeGameFlow(state: CompleteGameState): typeof state.gameFlow {
    const totalScore = state.globalContext.scoreTeamX + state.globalContext.scoreTeamY;
    const timeElapsed = state.globalContext.totalTimeElapsed;

    if (timeElapsed > 0) {
      const pointsPerMinute = totalScore / (timeElapsed / 60);

      if (pointsPerMinute >= 1.5) return 'offensive_shootout';
      if (pointsPerMinute <= 0.5) return 'defensive_battle';
    }

    return 'balanced';
  }

  /**
   * Genera un resumen cualitativo del estado
   */
  static generateQualitativeDescription(state: CompleteGameState): string {
    const momentum = state.momentum;
    const pressure = state.pressure;
    const flow = state.gameFlow;

    let description = `Momentum: ${momentum.replace(/_/g, ' ')}, `;
    description += `Presión: ${pressure}, `;
    description += `Flujo: ${flow.replace(/_/g, ' ')}`;

    return description;
  }
}