// Play - Representa una jugada individual
// La jugada es la base de la simulación según la documentación

import { TeamCamp } from '../teams/units/TeamCamp';

export interface PlayConfig {
  offense: TeamCamp;
  defense: TeamCamp;
  playType: string;
  down: number;
  yardsToGo: number;
  ballPosition: number;
}

export interface PlayResult {
  yardsGained: number;
  timeElapsed: number;
  isFirstDown: boolean;
  isScore: boolean;
  isTurnover: boolean;
  points: number;
  description: string;
}

export class Play {
  public readonly offense: TeamCamp;
  public readonly defense: TeamCamp;
  public readonly playType: string;
  public readonly down: number;
  public readonly yardsToGo: number;
  public readonly ballPosition: number;
  public result: PlayResult;
  
  constructor(config: PlayConfig) {
    this.offense = config.offense;
    this.defense = config.defense;
    this.playType = config.playType;
    this.down = config.down;
    this.yardsToGo = config.yardsToGo;
    this.ballPosition = config.ballPosition;
    
    // Inicializar resultado vacío
    this.result = {
      yardsGained: 0,
      timeElapsed: 0,
      isFirstDown: false,
      isScore: false,
      isTurnover: false,
      points: 0,
      description: ''
    };
  }

  /**
   * Ejecutar la jugada y calcular el resultado
   */
  public execute(): PlayResult {
    switch (this.playType) {
      case 'normal':
        return this.executeNormalPlay();
      case 'punt':
        return this.executePunt();
      case 'field_goal':
        return this.executeFieldGoal();
      case 'go_for_it':
        return this.executeGoForIt();
      default:
        return this.executeNormalPlay();
    }
  }

  /**
   * Ejecutar jugada normal (carrera o pase)
   */
  private executeNormalPlay(): PlayResult {
    const offRating = this.offense.getSpecificRating();
    const defRating = this.defense.getSpecificRating();
    const advantage = offRating - defRating;
    
    // Determinar tipo de jugada basado en situación
    const isPassingSituation = this.yardsToGo >= 7 || this.down >= 3;
    const playStyle = isPassingSituation ? 'pass' : (Math.random() > 0.6 ? 'pass' : 'run');
    
    // Calcular resultado base
    let baseYards = 0;
    let timeElapsed = 35 + Math.floor(Math.random() * 10); // 35-45 segundos típico
    
    if (playStyle === 'run') {
      // Jugada de carrera
      baseYards = 3 + Math.floor(Math.random() * 8); // 3-10 yardas base
      timeElapsed = 25 + Math.floor(Math.random() * 15); // Más tiempo en carrera
      
      // Ajustar por ventaja
      baseYards += Math.floor(advantage / 10);
      
      this.result.description = `Carrera por ${baseYards} yardas`;
      
    } else {
      // Jugada de pase
      const completionChance = 0.6 + (advantage / 100);
      const isComplete = Math.random() < completionChance;
      
      if (isComplete) {
        if (this.yardsToGo >= 10) {
          // Pase largo
          baseYards = 8 + Math.floor(Math.random() * 15); // 8-22 yardas
        } else {
          // Pase corto
          baseYards = 4 + Math.floor(Math.random() * 8); // 4-11 yardas
        }
        
        // Posibilidad de jugada explosiva
        if (Math.random() < 0.1 + (advantage / 200)) {
          baseYards += 15 + Math.floor(Math.random() * 20); // Jugada explosiva
          this.result.description = `¡Pase explosivo por ${baseYards} yardas!`;
        } else {
          this.result.description = `Pase completo por ${baseYards} yardas`;
        }
        
      } else {
        // Pase incompleto
        baseYards = 0;
        timeElapsed = 5; // Reloj se detiene
        this.result.description = 'Pase incompleto';
        
        // Posibilidad de intercepción
        if (Math.random() < 0.05 - (advantage / 500)) {
          this.result.isTurnover = true;
          this.result.description = '¡INTERCEPCIÓN!';
          baseYards = -(10 + Math.floor(Math.random() * 20)); // Return de intercepción
        }
      }
    }
    
    // Posibilidad de fumble en carreras
    if (playStyle === 'run' && Math.random() < 0.02) {
      this.result.isTurnover = true;
      this.result.description = '¡FUMBLE perdido!';
      baseYards = 0;
    }
    
    // Posibilidad de sack en pases
    if (playStyle === 'pass' && Math.random() < 0.08 - (advantage / 200)) {
      baseYards = -(3 + Math.floor(Math.random() * 8)); // Pérdida por sack
      this.result.description = `Sack por ${Math.abs(baseYards)} yardas`;
    }
    
    // Verificar si es primer down
    const finalYards = Math.max(-20, baseYards); // Límite de pérdida
    this.result.yardsGained = finalYards;
    this.result.timeElapsed = timeElapsed;
    this.result.isFirstDown = finalYards >= this.yardsToGo;
    
    // Verificar si es touchdown
    if (this.ballPosition + finalYards >= 100) {
      this.result.isScore = true;
      this.result.points = 6; // Touchdown
      this.result.description += ' - ¡TOUCHDOWN!';
    }
    
    return this.result;
  }

  /**
   * Ejecutar punt
   */
  private executePunt(): PlayResult {
    const puntDistance = 35 + Math.floor(Math.random() * 20); // 35-54 yardas
    const returnYards = Math.floor(Math.random() * 12); // 0-11 yardas de return
    
    this.result.yardsGained = puntDistance - returnYards;
    this.result.timeElapsed = 15;
    this.result.description = `Punt de ${puntDistance} yardas, return de ${returnYards}`;
    
    // Posibilidad de punt bloqueado
    if (Math.random() < 0.03) {
      this.result.yardsGained = -(5 + Math.floor(Math.random() * 10));
      this.result.isTurnover = true;
      this.result.description = '¡PUNT BLOQUEADO!';
    }
    
    return this.result;
  }

  /**
   * Ejecutar field goal
   */
  private executeFieldGoal(): PlayResult {
    const distance = 100 - this.ballPosition + 17; // Distancia + end zone + holder
    const successChance = Math.max(0.3, 0.95 - (distance - 20) * 0.02); // Más difícil con distancia
    
    this.result.timeElapsed = 5;
    
    if (Math.random() < successChance) {
      this.result.isScore = true;
      this.result.points = 3;
      this.result.yardsGained = 0;
      this.result.description = `¡FIELD GOAL BUENO de ${distance} yardas!`;
    } else {
      this.result.yardsGained = 0;
      this.result.description = `Field goal fallado de ${distance} yardas`;
      
      // Posibilidad de bloqueo
      if (Math.random() < 0.1) {
        this.result.description = '¡FIELD GOAL BLOQUEADO!';
        this.result.isTurnover = true;
      }
    }
    
    return this.result;
  }

  /**
   * Ejecutar go for it (4to down)
   */
  private executeGoForIt(): PlayResult {
    // Similar a jugada normal pero con más presión
    const result = this.executeNormalPlay();
    
    // Añadir presión de situación
    if (result.yardsGained < this.yardsToGo) {
      result.description += ' - ¡NO CONVIERTE!';
    } else {
      result.description += ' - ¡CONVIERTE EL 4TO DOWN!';
    }
    
    return result;
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
    let outcome: 'success' | 'failure' | 'neutral';
    let impact: 'high' | 'medium' | 'low';
    
    // Determinar resultado
    if (this.result.isScore || this.result.isFirstDown) {
      outcome = 'success';
    } else if (this.result.isTurnover || this.result.yardsGained < 0) {
      outcome = 'failure';
    } else {
      outcome = 'neutral';
    }
    
    // Determinar impacto
    if (this.result.isScore || this.result.isTurnover || Math.abs(this.result.yardsGained) >= 15) {
      impact = 'high';
    } else if (this.result.isFirstDown || Math.abs(this.result.yardsGained) >= 8) {
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