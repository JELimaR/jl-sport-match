// Drive - Representa una serie ofensiva completa
// Una serie comienza cuando un equipo recupera la posesión y termina con pérdida de posesión o anotación

import { TeamMatch } from '../teams/TeamMatch';

// Interfaz Play para evitar dependencias circulares
interface Play {
  ballPosition: number;
  result: {
    yardsGained: number;
    timeElapsed: number;
    isFirstDown: boolean;
  };
}

export interface DriveConfig {
  offensiveTeam: TeamMatch;
  defensiveTeam: TeamMatch;
  startPosition: number;
  startTime: number;
  quarter: number;
}

export class Drive {
  public readonly offensiveTeam: TeamMatch;
  public readonly defensiveTeam: TeamMatch;
  public readonly startPosition: number;
  public readonly startTime: number;
  public readonly quarter: number;
  
  public plays: Play[] = [];
  public endPosition?: number;
  public endTime?: number;
  public result?: 'touchdown' | 'turnover' | 'punt' | 'field_goal' | 'end_of_half';
  public isFinalized: boolean = false;
  
  constructor(config: DriveConfig) {
    this.offensiveTeam = config.offensiveTeam;
    this.defensiveTeam = config.defensiveTeam;
    this.startPosition = config.startPosition;
    this.startTime = config.startTime;
    this.quarter = config.quarter;
  }

  /**
   * Añadir una jugada al drive
   */
  public addPlay(play: Play): void {
    if (this.isFinalized) {
      throw new Error('No se pueden añadir jugadas a un drive finalizado');
    }
    this.plays.push(play);
  }

  /**
   * Finalizar el drive
   */
  public finalize(result: 'touchdown' | 'turnover' | 'punt' | 'field_goal' | 'end_of_half'): void {
    this.result = result;
    this.isFinalized = true;
    
    if (this.plays.length > 0) {
      const lastPlay = this.plays[this.plays.length - 1];
      this.endPosition = lastPlay.ballPosition + lastPlay.result.yardsGained;
    }
  }

  /**
   * Obtener estadísticas del drive
   */
  public getStats(): {
    totalPlays: number;
    totalYards: number;
    timeElapsed: number;
    firstDowns: number;
    result: string;
    efficiency: number;
  } {
    const totalPlays = this.plays.length;
    const totalYards = this.plays.reduce((sum, play) => sum + play.result.yardsGained, 0);
    const timeElapsed = this.plays.reduce((sum, play) => sum + play.result.timeElapsed, 0);
    const firstDowns = this.plays.filter(play => play.result.isFirstDown).length;
    
    // Calcular eficiencia (yardas por jugada)
    const efficiency = totalPlays > 0 ? totalYards / totalPlays : 0;
    
    return {
      totalPlays,
      totalYards,
      timeElapsed,
      firstDowns,
      result: this.result || 'ongoing',
      efficiency
    };
  }

  /**
   * Obtener resumen del drive
   */
  public getSummary(): string {
    const stats = this.getStats();
    const direction = this.startPosition < 50 ? 'hacia zona de anotación' : 'desde campo propio';
    
    return `${this.offensiveTeam.name}: ${stats.totalPlays} jugadas, ` +
           `${stats.totalYards} yardas, ${stats.firstDowns} primeros downs ` +
           `(${direction}) - Resultado: ${stats.result}`;
  }

  /**
   * Verificar si el drive fue exitoso
   */
  public isSuccessful(): boolean {
    return this.result === 'touchdown' || this.result === 'field_goal';
  }

  /**
   * Obtener la jugada más larga del drive
   */
  public getLongestPlay(): Play | null {
    if (this.plays.length === 0) return null;
    
    return this.plays.reduce((longest, current) => 
      current.result.yardsGained > longest.result.yardsGained ? current : longest
    );
  }

  /**
   * Obtener análisis del drive
   */
  public getAnalysis(): {
    driveType: 'explosive' | 'methodical' | 'stalled' | 'quick_strike';
    keyPlays: Play[];
    weaknesses: string[];
    strengths: string[];
  } {
    const stats = this.getStats();
    let driveType: 'explosive' | 'methodical' | 'stalled' | 'quick_strike';
    
    // Determinar tipo de drive
    if (stats.efficiency > 8) {
      driveType = 'explosive';
    } else if (stats.totalPlays >= 8 && stats.efficiency > 4) {
      driveType = 'methodical';
    } else if (stats.totalPlays <= 3 && this.isSuccessful()) {
      driveType = 'quick_strike';
    } else {
      driveType = 'stalled';
    }
    
    // Identificar jugadas clave (más de 10 yardas o primeros downs)
    const keyPlays = this.plays.filter(play => 
      play.result.yardsGained >= 10 || play.result.isFirstDown
    );
    
    // Análisis de fortalezas y debilidades
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (stats.efficiency > 6) {
      strengths.push('Alta eficiencia ofensiva');
    } else if (stats.efficiency < 3) {
      weaknesses.push('Baja eficiencia ofensiva');
    }
    
    if (stats.firstDowns / stats.totalPlays > 0.3) {
      strengths.push('Buena conversión de primeros downs');
    } else if (stats.firstDowns / stats.totalPlays < 0.15) {
      weaknesses.push('Dificultad para convertir primeros downs');
    }
    
    const longPlays = this.plays.filter(play => play.result.yardsGained >= 15).length;
    if (longPlays >= 2) {
      strengths.push('Capacidad de jugadas explosivas');
    }
    
    return {
      driveType,
      keyPlays,
      weaknesses,
      strengths
    };
  }
}