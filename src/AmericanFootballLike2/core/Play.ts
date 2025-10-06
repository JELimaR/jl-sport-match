// Play - Representa una jugada individual
// La jugada es la base de la simulación según la documentación

import { TeamCamp } from '../teams/units/TeamCamp';
import { RunningPlayType, PassingPlayType } from './Actions';
import { PlayResult } from './PlayResults';

// Tipos de jugadas completos
export type PlayType =
  // Jugadas ofensivas normales
  | RunningPlayType
  | PassingPlayType

  // Equipos especiales
  | 'kickoff'
  | 'punt'
  | 'field_goal'
  | 'extra_point'
  | 'two_point_conversion'
  | 'fake_punt'
  | 'fake_field_goal'
  | 'onside_kick'
  | 'squib_kick'

  // Jugadas especiales
  | 'kneel'
  | 'spike'
  | 'safety_kick'

  // Situaciones especiales
  | 'go_for_it';

export interface PlayConfig {
  offense: TeamCamp;
  defense: TeamCamp;
  playType: PlayType;
  down: number;
  yardsToGo: number;
  ballPosition: number;
}



export class Play {
  public readonly offense: TeamCamp;
  public readonly defense: TeamCamp;
  public readonly playType: PlayType;
  public readonly down: number;
  public readonly yardsToGo: number;
  public readonly ballPosition: number;
  public result?: PlayResult;

  constructor(config: PlayConfig) {
    this.offense = config.offense;
    this.defense = config.defense;
    this.playType = config.playType;
    this.down = config.down;
    this.yardsToGo = config.yardsToGo;
    this.ballPosition = config.ballPosition;
  }



  /**
   * Obtener análisis de la jugada
   */
  public getAnalysis(): {
    playType: string;
    situation: string;
    outcome: 'success' | 'failure' | 'neutral';
    impact: 'high' | 'medium' | 'low';
  } {
    if (!this.result) {
      return {
        playType: this.playType,
        situation: `${this.down}° y ${this.yardsToGo} desde la yarda ${this.ballPosition}`,
        outcome: 'neutral',
        impact: 'low'
      };
    }

    let outcome: 'success' | 'failure' | 'neutral';
    let impact: 'high' | 'medium' | 'low';

    // Determinar resultado basado en el tipo de PlayResult
    switch (this.result.type) {
      case 'touchdown':
      case 'first_down':
      case 'offensive_gain':
        outcome = 'success';
        break;

      case 'interception':
      case 'fumble':
      case 'sack':
      case 'tackle_for_loss':
      case 'safety':
      case 'turnover_on_downs':
        outcome = 'failure';
        break;

      default:
        outcome = 'neutral';
    }

    // Determinar impacto basado en el tipo y características
    if (this.result.type === 'touchdown' ||
      this.result.type === 'interception' ||
      this.result.type === 'fumble' ||
      this.result.type === 'safety') {
      impact = 'high';
    } else if (this.result.type === 'first_down' ||
      (this.result.type === 'offensive_gain' && this.result.subType === 'explosive_gain') ||
      this.result.type === 'sack') {
      impact = 'medium';
    } else {
      impact = 'low';
    }

    const situation = `${this.down}° y ${this.yardsToGo} desde la yarda ${this.ballPosition}`;

    return {
      playType: this.playType,
      situation,
      outcome,
      impact
    };
  }
}