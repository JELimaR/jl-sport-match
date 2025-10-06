// Narrative - Sistema de narrativa para generar descripciones de jugadas y partidos
// Clase base para el sistema de narración del simulador de fútbol americano

import { PlayResult } from '../core/PlayResults';

/**
 * Clase principal para generar narrativas de jugadas y eventos del partido
 */
export class Narrative {
  private playHistory: { narrative: string; result: PlayResult }[] = [];
  private lastQuarter: number = 0;
  private lastScore: { X: number; Y: number } = { X: 0, Y: 0 };
  private totalPlays: number = 0;
  
  constructor() {
    // Constructor vacío por ahora
  }

  /**
   * Registra una jugada con su narrativa técnica y la convierte a narrativa legible
   */
  public recordPlay(technicalNarrative: string, result: PlayResult): void {
    this.totalPlays++;
    const readableNarrative = this.translateToReadableNarrative(technicalNarrative, result);
    this.playHistory.push({ narrative: readableNarrative, result });
  }

  /**
   * Genera narrativa completa del estado del partido incluyendo información contextual
   */
  public generateGameNarrative(gameState: {
    quarter: number;
    timeRemaining: number;
    scoreX: number;
    scoreY: number;
    possession: 'X' | 'Y';
    down: number;
    yardsToGo: number;
    ballPosition: number;
  }, teamNames: { X: string; Y: string }): string[] {
    const narratives: string[] = [];

    // Mostrar información de cuarto si cambió
    if (gameState.quarter !== this.lastQuarter) {
      narratives.push(`\n🏈 === CUARTO ${gameState.quarter} ===`);
      this.lastQuarter = gameState.quarter;
    }

    // Mostrar score si cambió
    if (gameState.scoreX !== this.lastScore.X || gameState.scoreY !== this.lastScore.Y) {
      narratives.push(`\n📊 SCORE: ${teamNames.X} ${gameState.scoreX} - ${teamNames.Y} ${gameState.scoreY}`);
      this.lastScore = { X: gameState.scoreX, Y: gameState.scoreY };
    }

    // Mostrar situación cada cierto número de jugadas
    if (this.totalPlays % 15 === 1) {
      const minutes = Math.floor(gameState.timeRemaining / 60);
      const seconds = (gameState.timeRemaining % 60).toString().padStart(2, '0');
      const possessionTeam = gameState.possession === 'X' ? teamNames.X : teamNames.Y;
      
      narratives.push(`\n⏰ Q${gameState.quarter} ${minutes}:${seconds} | ${possessionTeam} - ${gameState.down}° y ${gameState.yardsToGo} en la yarda ${Math.round(gameState.ballPosition)}`);
    }

    return narratives;
  }

  /**
   * Genera narrativa especial para eventos importantes del juego
   */
  public generateEventNarrative(result: PlayResult, gameState: {
    possession: 'X' | 'Y';
  }, teamNames: { X: string; Y: string }): string[] {
    const narratives: string[] = [];

    // Mostrar información especial para eventos importantes
    if (result.type === 'touchdown') {
      const scoringTeam = gameState.possession === 'X' ? teamNames.X : teamNames.Y;
      narratives.push(`\n🎉 ¡TOUCHDOWN! ${scoringTeam} anota 6 puntos`);
    } else if (result.type === 'interception') {
      narratives.push(`\n🔥 ¡INTERCEPCIÓN! Cambio de posesión`);
    } else if (result.type === 'punt_result') {
      narratives.push(`\n🦶 Punt - Cambio de posesión`);
    } else if (result.type === 'kick_result' && 'result' in result && result.result === 'made') {
      narratives.push(`\n🥅 ¡Field Goal bueno! 3 puntos`);
    }

    return narratives;
  }

  /**
   * Determina si una jugada es importante y debe mostrarse siempre
   */
  public isImportantPlay(result: PlayResult): boolean {
    return result.type === 'touchdown' || 
           result.type === 'interception' || 
           result.type === 'first_down' ||
           result.type === 'punt_result' || 
           result.type === 'kick_result' ||
           result.type === 'tackle_for_loss' ||
           (result.type === 'offensive_gain' && 'yardsGained' in result && result.yardsGained >= 15);
  }

  /**
   * Determina si debe mostrar la narrativa de la jugada
   */
  public shouldShowPlay(result: PlayResult): boolean {
    return this.isImportantPlay(result) || this.totalPlays % 5 === 0;
  }

  /**
   * Traduce la narrativa técnica a una descripción legible
   */
  private translateToReadableNarrative(technical: string, result: PlayResult): string {
    // Extraer información básica del resultado
    let narrative = "";
    
    // Determinar el tipo de jugada y resultado
    switch (result.type) {
      case 'touchdown':
        if (result.touchdownType === 'rushing_td') {
          narrative = `🏈 ¡TOUCHDOWN! Carrera poderosa que rompe la defensa y llega a la zona de anotación`;
        } else {
          narrative = `🏈 ¡TOUCHDOWN! Pase perfecto conectado en la zona de anotación`;
        }
        if ('yardsGained' in result) {
          narrative += ` (${result.yardsGained} yardas)`;
        }
        break;

      case 'first_down':
        if ('yardsGained' in result) {
          if (result.yardsGained >= 15) {
            narrative = `⚡ ¡PRIMER DOWN! Jugada explosiva de ${result.yardsGained} yardas`;
          } else if (result.yardsGained >= 8) {
            narrative = `💪 ¡PRIMER DOWN! Buena ganancia de ${result.yardsGained} yardas`;
          } else {
            narrative = `✅ ¡PRIMER DOWN! Conversión clutch de ${result.yardsGained} yardas`;
          }
        } else {
          narrative = `✅ ¡PRIMER DOWN! Conversión exitosa`;
        }
        break;

      case 'offensive_gain':
        if ('yardsGained' in result) {
          if (result.yardsGained >= 15) {
            narrative = `🚀 Jugada explosiva de ${result.yardsGained} yardas`;
          } else if (result.yardsGained >= 8) {
            narrative = `📈 Buena ganancia de ${result.yardsGained} yardas`;
          } else if (result.yardsGained >= 4) {
            narrative = `➡️ Ganancia sólida de ${result.yardsGained} yardas`;
          } else {
            narrative = `➡️ Ganancia corta de ${result.yardsGained} yardas`;
          }
        }
        break;

      case 'tackle_for_loss':
        if ('yardsLost' in result) {
          narrative = `🛡️ ¡Tacleo para pérdida! La defensa detiene la jugada ${result.yardsLost} yardas atrás`;
        }
        break;

      case 'incomplete_pass':
        if (result.reason === 'defended') {
          narrative = `🚫 Pase incompleto - Buena defensa en la cobertura`;
        } else {
          narrative = `🚫 Pase incompleto - El pase no encuentra su objetivo`;
        }
        break;

      case 'interception':
        narrative = `🔥 ¡INTERCEPCIÓN! La defensa roba el balón`;
        if ('returnYards' in result && result.returnYards > 0) {
          narrative += ` y lo retorna ${result.returnYards} yardas`;
        }
        break;

      case 'punt_result':
        if ('puntDistance' in result && 'returnYards' in result) {
          narrative = `🦶 Punt de ${Math.round(result.puntDistance)} yardas`;
          if (result.returnYards > 0) {
            narrative += `, retornado ${Math.round(result.returnYards)} yardas`;
          } else {
            narrative += `, sin retorno`;
          }
        }
        break;

      case 'kick_result':
        if (result.kickType === 'field_goal') {
          if (result.result === 'made') {
            narrative = `🥅 ¡FIELD GOAL BUENO! Patada perfecta de ${result.distance} yardas`;
          } else {
            narrative = `❌ Field goal fallado de ${result.distance} yardas`;
          }
        } else if (result.kickType === 'extra_point') {
          if (result.result === 'made') {
            narrative = `✅ Punto extra bueno`;
          } else {
            narrative = `❌ Punto extra fallado`;
          }
        }
        break;

      case 'kickoff_result':
        if ('kickDistance' in result && 'returnYards' in result) {
          narrative = `🏈 Kickoff de ${Math.round(result.kickDistance)} yardas`;
          if (result.returnYards > 0) {
            narrative += `, retornado ${Math.round(result.returnYards)} yardas`;
          }
        }
        break;

      case 'kneel':
        narrative = `⏰ El quarterback se arrodilla para consumir tiempo`;
        break;

      case 'spike':
        narrative = `⏱️ El quarterback clava el balón para detener el reloj`;
        break;

      default:
        // Fallback a la narrativa técnica si no hay traducción específica
        narrative = technical;
        break;
    }

    return narrative;
  }

  /**
   * Obtiene la narrativa de la última jugada
   */
  public lastPlay(): string {
    if (this.playHistory.length === 0) {
      return "No hay jugadas registradas";
    }
    
    const lastEntry = this.playHistory[this.playHistory.length - 1];
    return lastEntry.narrative;
  }

  /**
   * Obtiene el resultado de la última jugada
   */
  public lastResult(): PlayResult | null {
    if (this.playHistory.length === 0) {
      return null;
    }
    
    return this.playHistory[this.playHistory.length - 1].result;
  }

  /**
   * Obtiene todas las jugadas del partido
   */
  public getAllPlays(): { narrative: string; result: PlayResult }[] {
    return [...this.playHistory];
  }

  /**
   * Genera un resumen del drive actual
   */
  public getDriveSummary(plays: number = 5): string {
    if (this.playHistory.length === 0) {
      return "No hay jugadas en este drive";
    }

    const recentPlays = this.playHistory.slice(-plays);
    return recentPlays.map((play, index) => 
      `${index + 1}. ${play.narrative}`
    ).join('\n');
  }

  /**
   * Genera narrativa especial para eventos importantes
   */
  public generateSpecialEventNarrative(eventType: 'drive_start' | 'drive_end' | 'quarter_end' | 'game_end', details?: any): string {
    switch (eventType) {
      case 'drive_start':
        return `🚀 ${details.team} inicia un nuevo drive desde la yarda ${details.position}`;
      
      case 'drive_end':
        if (details.result === 'touchdown') {
          return `🎯 Drive exitoso terminado en TOUCHDOWN después de ${details.plays} jugadas`;
        } else if (details.result === 'punt') {
          return `🦶 Drive terminado con punt después de ${details.plays} jugadas`;
        } else if (details.result === 'field_goal') {
          return `🥅 Drive terminado con field goal después de ${details.plays} jugadas`;
        } else {
          return `🔄 Drive terminado con turnover después de ${details.plays} jugadas`;
        }
      
      case 'quarter_end':
        return `⏰ Fin del ${details.quarter}° cuarto`;
      
      case 'game_end':
        return `🏁 ¡Fin del partido!`;
      
      default:
        return "";
    }
  }

  /**
   * Limpia el historial (para nuevo drive)
   */
  public clearHistory(): void {
    this.playHistory = [];
  }
}