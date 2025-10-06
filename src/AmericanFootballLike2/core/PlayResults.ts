// PlayResults - Sistema completo de resultados de jugadas
// Basado en la documentación: todos los posibles resultados de jugadas normales y especiales

import { Player } from "./Player";
import { TeamMatch } from "../teams/TeamMatch";

// ===== RESULTADOS DE JUGADAS NORMALES =====

// 1) Avance Ofensivo
export interface OffensiveGain {
  type: 'offensive_gain';
  subType: 'small_gain' | 'medium_gain' | 'big_gain' | 'explosive_gain';
  yardsGained: number;

  // Detalles del avance (opcionales para simulación simplificada)
  ballCarrier?: Player;
  keyBlockers?: Player[];
  brokenTackles: number;
  tacklers?: Player[];

  // Clasificación cualitativa
  gainType: 'power_run' | 'speed_run' | 'elusive_run' | 'short_pass' | 'medium_pass' | 'deep_pass';
  difficultyLevel: 'routine' | 'contested' | 'spectacular';
}

export interface FirstDown {
  type: 'first_down';
  yardsGained: number;
  yardsNeeded: number;

  // Contexto
  conversionType: 'easy' | 'hard_fought' | 'clutch';
  downConverted: 1 | 2 | 3 | 4;  // En qué down se consiguió

  // Impacto
  momentumShift: 'none' | 'slight' | 'significant';
  crowdReaction: 'quiet' | 'moderate' | 'loud' | 'explosive';
}

export interface Touchdown {
  type: 'touchdown';
  yardsGained: number;

  // Detalles del touchdown (opcionales para simulación simplificada)
  scorer?: Player;
  assistingPlayers?: Player[];
  touchdownType: 'rushing_td' | 'passing_td' | 'return_td' | 'defensive_td';

  // Características cualitativas
  celebrationLevel: 'subdued' | 'moderate' | 'explosive' | 'signature';
  difficultyRating: 'easy' | 'moderate' | 'difficult' | 'spectacular';
  gameImpact: 'routine' | 'momentum_shift' | 'game_changing' | 'game_winner';
}

// 2) Jugadas Neutrales
export interface IncompletePass {
  type: 'incomplete_pass';

  // Razón de la incompleción
  reason: 'overthrown' | 'underthrown' | 'dropped' | 'defended' | 'pressure' | 'miscommunication';
  quarterback?: Player;
  intendedReceiver?: Player;
  defender?: Player;  // Si hubo defensa

  // Calidad del intento
  passQuality: 'poor' | 'fair' | 'good' | 'perfect';
  catchDifficulty: 'easy' | 'moderate' | 'difficult' | 'spectacular_attempt';
}

export interface NoGain {
  type: 'no_gain';

  // Detalles
  ballCarrier: Player;
  tackler: Player;
  playType: 'run_stuffed' | 'pass_completed_no_gain';

  // Calidad de la defensa
  defensivePlay: 'routine_stop' | 'good_tackle' | 'gang_tackle' | 'goal_line_stand';
}

export interface Spike {
  type: 'spike';

  // Propósito
  purpose: 'stop_clock' | 'avoid_delay_of_game';
  timeRemaining: number;
  quarterback: Player;

  // Contexto estratégico
  strategicValue: 'necessary' | 'precautionary' | 'wasteful';
}

export interface Kneel {
  type: 'kneel';

  // Contexto
  purpose: 'victory_formation' | 'end_half' | 'avoid_safety';
  quarterback: Player;
  timeConsumed: number;

  // Estado del juego
  gameStatus: 'victory_assured' | 'running_clock' | 'strategic';
}

// 3) Pérdida de Yardas
export interface TackleForLoss {
  type: 'tackle_for_loss';
  yardsLost: number;

  // Participantes
  ballCarrier: Player;
  tackler: Player;
  assistingTacklers: Player[];

  // Tipo de pérdida
  lossType: 'run_tfl' | 'screen_blown_up' | 'rb_loss';

  // Calidad de la jugada defensiva
  defensiveExcellence: 'routine' | 'good_pursuit' | 'great_read' | 'spectacular';
}

export interface Sack {
  type: 'sack';
  yardsLost: number;

  // Participantes
  quarterback: Player;
  sacker: Player;
  assistingSackers: Player[];

  // Tipo de sack
  sackType: 'coverage_sack' | 'pressure_sack' | 'blitz_sack' | 'coverage_breakdown';

  // Tiempo hasta el sack
  timeToSack: number;  // En segundos

  // Calidad
  sackQuality: 'routine' | 'good_rush' | 'great_move' | 'spectacular';
}

export interface OffensivePenalty {
  type: 'offensive_penalty';
  penaltyType: 'holding' | 'false_start' | 'illegal_formation' | 'delay_of_game' | 'intentional_grounding';
  yardsLost: number;

  // Detalles
  penalizedPlayer: Player;
  automaticFirstDown: boolean;

  // Impacto
  driveKiller: boolean;  // ¿Mata la serie?
  timingImpact: 'none' | 'clock_stoppage' | 'significant_delay';
}

// 4) Cambios de Posesión
export interface Interception {
  type: 'interception';

  // Participantes (opcionales para simulación simplificada)
  quarterback?: Player;
  intendedReceiver?: Player;
  interceptor?: Player;

  // Detalles del retorno
  returnYards: number;
  returnTouchdown: boolean;

  // Calidad de la jugada
  interceptionType: 'poor_throw' | 'great_defense' | 'tipped_ball' | 'miscommunication';
  difficultyLevel: 'easy' | 'moderate' | 'difficult' | 'spectacular';

  // Impacto en el juego
  gameImpact: 'routine_turnover' | 'momentum_shift' | 'game_changing' | 'season_defining';
}

export interface Fumble {
  type: 'fumble';

  // Participantes (opcionales para simulación simplificada)
  fumbler?: Player;
  forcer?: Player;     // Quien forzó el fumble
  recoverer?: Player;
  recoveringTeam: TeamMatch;

  // Detalles
  fumbleType: 'strip' | 'hit_stick' | 'bad_handoff' | 'snap_fumble' | 'punt_fumble';
  returnYards: number;
  returnTouchdown: boolean;

  // Contexto
  gameImpact: 'routine_turnover' | 'momentum_shift' | 'game_changing' | 'heartbreaking';
}

export interface TurnoverOnDowns {
  type: 'turnover_on_downs';

  // Contexto
  down: 4;
  yardsShort: number;  // Cuántas yardas faltaron

  // Decisión
  decisionQuality: 'good_call' | 'questionable' | 'poor_decision' | 'desperate';

  // Impacto
  fieldPositionImpact: 'minimal' | 'significant' | 'game_changing';
}

// 5) Resultados Defensivos Especiales
export interface Safety {
  type: 'safety';

  // Cómo ocurrió
  safetyType: 'sack_in_endzone' | 'holding_in_endzone' | 'intentional_grounding' | 'fumble_out_of_endzone';

  // Participantes
  offensivePlayer: Player;  // Quien cometió la safety
  defensivePlayer?: Player; // Quien forzó la safety

  // Puntos para la defensa
  points: 2;

  // Rareza e impacto
  rarity: 'common' | 'uncommon' | 'rare' | 'extremely_rare';
  gameImpact: 'minor' | 'significant' | 'game_changing';
}

export interface DefensiveTouchdown {
  type: 'defensive_touchdown';

  // Tipo de TD defensivo
  touchdownType: 'pick_six' | 'fumble_return_td' | 'blocked_punt_td' | 'safety_return_td';

  // Participantes
  scorer: Player;
  assistingPlayers: Player[];

  // Detalles del retorno
  returnYards: number;

  // Impacto
  gameImpact: 'momentum_shift' | 'game_changing' | 'season_defining' | 'legendary';
}

// ===== RESULTADOS DE JUGADAS ESPECIALES =====

// Kickoff
export interface KickoffResult {
  type: 'kickoff_result';

  // Tipo de resultado
  resultType: 'return' | 'touchback' | 'onside_recovery' | 'fumble';

  // Participantes (opcionales para simulación simplificada)
  kicker?: Player;
  returner?: Player;

  // Detalles
  kickDistance: number;
  returnYards: number;
  finalPosition: number;

  // Calidad
  kickQuality: 'poor' | 'fair' | 'good' | 'excellent';
  returnQuality: 'poor' | 'fair' | 'good' | 'excellent' | 'spectacular';
}

// Punt
export interface PuntResult {
  type: 'punt_result';

  // Tipo de resultado
  resultType: 'return' | 'fair_catch' | 'touchback' | 'blocked' | 'fumble' | 'muff';

  // Participantes (opcionales para simulación simplificada)
  punter?: Player;
  returner?: Player;
  blocker?: Player;

  // Detalles
  puntDistance: number;
  hangTime: number;     // Tiempo en el aire
  returnYards: number;
  netYards: number;     // Yardas netas

  // Calidad
  puntQuality: 'poor' | 'fair' | 'good' | 'excellent' | 'coffin_corner';
  fieldPositionImpact: 'poor' | 'fair' | 'good' | 'excellent';
}

// Field Goal / Extra Point
export interface KickResult {
  type: 'kick_result';

  // Tipo de patada
  kickType: 'field_goal' | 'extra_point';

  // Resultado
  result: 'made' | 'missed' | 'blocked' | 'fake_attempt';

  // Participantes (opcionales para simulación simplificada)
  kicker?: Player;
  holder?: Player;
  snapper?: Player;
  blocker?: Player;

  // Detalles
  distance: number;     // Distancia del gol de campo
  direction: 'left' | 'center' | 'right' | 'wide_left' | 'wide_right';

  // Calidad
  kickQuality: 'poor' | 'fair' | 'good' | 'perfect';
  pressure: 'none' | 'light' | 'heavy' | 'extreme';
}

// Conversión de 2 Puntos
export interface TwoPointConversion {
  type: 'two_point_conversion';

  // Resultado
  successful: boolean;

  // Tipo de jugada
  playType: 'run' | 'pass' | 'trick_play';

  // Participantes
  keyPlayers: Player[];

  // Detalles
  yardsNeeded: 2;
  executionQuality: 'poor' | 'fair' | 'good' | 'excellent';

  // Contexto
  gameImpact: 'routine' | 'important' | 'crucial' | 'game_deciding';
}

// ===== NUEVOS RESULTADOS PARA ACCIONES ESPECIALES =====

// Resultado de acción de tempo
export interface TempoChange {
  type: 'tempo_change';
  tempoType: 'huddle' | 'no_huddle' | 'hurry_up' | 'two_minute_drill' | 'delay_game';
  effectiveness: number;        // 0-100
  fatigueImpact: number;       // Impacto en fatiga
  timeImpact: number;          // Impacto en tiempo
}

// Resultado de formación defensiva
export interface DefensiveFormation {
  type: 'defensive_formation';
  formation: '4-3' | '3-4' | 'nickel' | 'dime' | 'quarter' | 'goal_line' | '46' | 'bear';
  effectiveness: number;        // 0-100
  runDefenseRating: number;    // Rating contra carrera
  passDefenseRating: number;   // Rating contra pase
  versatility: number;         // Versatilidad de la formación
  strengths: string[];         // Fortalezas
  weaknesses: string[];        // Debilidades
}

// Resultado de cobertura de pase
export interface PassCoverage {
  type: 'pass_coverage';
  coverageType: 'cover_0' | 'cover_1' | 'cover_2' | 'cover_3' | 'cover_4' | 'tampa_2' | 'robber' | 'bracket' | 'banjo';
  effectiveness: number;        // 0-100
  deepCoverage: number;        // Rating de cobertura profunda
  shortCoverage: number;       // Rating de cobertura corta
  blitzVulnerability: number;  // Vulnerabilidad al blitz
  vulnerabilities: string[];   // Puntos débiles
}

// Resultado de acción del quarterback
export interface QuarterbackPlay {
  type: 'quarterback_play';
  optionType: 'rpo_run' | 'rpo_pass' | 'qb_keep' | 'qb_scramble' | 'bootleg' | 'rollout' | 'designed_run' | 'read_option';
  yardsGained: number;
  successful: boolean;
  decisionQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

// Spike del balón
export interface SpikePlay {
  type: 'spike';
  timeRemaining: number;
  clockStopped: boolean;
  downUsed: boolean;
}

// QB se arrodilla
export interface KneelDown {
  type: 'kneel_down';
  yardsGained: number;
  timeConsumed: number;
  gameEnding: boolean;
}

// ===== RESULTADO UNIFICADO =====

export type PlayResult =
  | OffensiveGain
  | FirstDown
  | Touchdown
  | IncompletePass
  | NoGain
  | Spike
  | Kneel
  | TackleForLoss
  | Sack
  | OffensivePenalty
  | Interception
  | Fumble
  | TurnoverOnDowns
  | Safety
  | DefensiveTouchdown
  | KickoffResult
  | PuntResult
  | KickResult
  | TwoPointConversion
  | TempoChange
  | DefensiveFormation
  | PassCoverage
  | QuarterbackPlay
  | SpikePlay
  | KneelDown;

// ===== ANÁLISIS DE RESULTADOS =====

export class PlayResultAnalyzer {

  /**
   * Determina si el resultado fue exitoso para la ofensiva
   */
  static isOffensiveSuccess(result: PlayResult): boolean {
    switch (result.type) {
      case 'offensive_gain':
      case 'first_down':
      case 'touchdown':
        return true;

      case 'no_gain':
      case 'spike':
      case 'kneel':
        return false; // Neutral

      case 'tackle_for_loss':
      case 'sack':
      case 'offensive_penalty':
      case 'interception':
      case 'fumble':
      case 'turnover_on_downs':
      case 'safety':
        return false;

      default:
        return false;
    }
  }

  /**
   * Calcula el impacto en el momentum del juego
   */
  static calculateMomentumImpact(result: PlayResult): number {
    // Escala: -5 (muy negativo) a +5 (muy positivo)
    switch (result.type) {
      case 'touchdown':
        return result.gameImpact === 'game_changing' ? 5 : 4;

      case 'defensive_touchdown':
        return result.gameImpact === 'game_changing' ? -5 : -4;

      case 'interception':
      case 'fumble':
        return result.gameImpact === 'game_changing' ? -4 : -3;

      case 'safety':
        return -3;

      case 'first_down':
        return result.conversionType === 'clutch' ? 2 : 1;

      case 'sack':
        return result.sackQuality === 'spectacular' ? -2 : -1;

      case 'offensive_gain':
        return result.subType === 'explosive_gain' ? 2 :
          result.subType === 'big_gain' ? 1 : 0;

      default:
        return 0;
    }
  }

  /**
   * Genera descripción narrativa del resultado
   */
  static generateNarrative(result: PlayResult): string {
    switch (result.type) {
      case 'touchdown':
        return `¡TOUCHDOWN${result.scorer ? ` de ${result.scorer.name}` : ''}! ${result.difficultyRating} desde ${result.yardsGained} yardas. ${result.celebrationLevel} celebración.`;

      case 'interception':
        return `¡INTERCEPCIÓN${result.interceptor ? ` de ${result.interceptor.name}` : ''}! ${result.difficultyLevel} intercepción, retorno de ${result.returnYards} yardas.`;

      case 'sack':
        return `¡SACK! ${result.sacker.name} derriba al QB por pérdida de ${result.yardsLost} yardas. ${result.sackQuality} jugada defensiva.`;

      case 'first_down':
        return `¡PRIMER DOWN! Conversión ${result.conversionType} en ${result.downConverted}° down.`;

      case 'fumble':
        return `¡FUMBLE!${result.fumbler ? ` ${result.fumbler.name} pierde el balón,` : ''} recupera${result.recoverer ? ` ${result.recoverer.name}` : ' la defensa'}. ${result.gameImpact} impacto.`;

      default:
        return `Jugada completada: ${result.type}`;
    }
  }

  /**
   * Extrae estadísticas cuantitativas del resultado
   */
  static extractStats(result: PlayResult): {
    yards: number;
    points: number;
    turnover: boolean;
    firstDown: boolean;
    touchdown: boolean;
  } {
    let yards = 0;
    let points = 0;
    let turnover = false;
    let firstDown = false;
    let touchdown = false;

    switch (result.type) {
      case 'offensive_gain':
        yards = result.yardsGained;
        break;

      case 'first_down':
        yards = result.yardsGained;
        firstDown = true;
        break;

      case 'touchdown':
        yards = result.yardsGained;
        points = 6;
        touchdown = true;
        break;

      case 'tackle_for_loss':
      case 'sack':
        yards = -Math.abs('yardsLost' in result ? result.yardsLost : 0);
        break;

      case 'interception':
      case 'fumble':
        turnover = true;
        break;

      case 'safety':
        points = -2; // Puntos para la defensa
        break;

      case 'defensive_touchdown':
        points = -6; // Puntos para la defensa
        turnover = true;
        break;

      case 'kick_result':
        if (result.result === 'made') {
          points = result.kickType === 'field_goal' ? 3 : 1;
        }
        break;

      case 'two_point_conversion':
        points = result.successful ? 2 : 0;
        break;
    }

    return { yards, points, turnover, firstDown, touchdown };
  }
}