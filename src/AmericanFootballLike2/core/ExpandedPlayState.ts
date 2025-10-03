// ExpandedPlayState - Estado simplificado para SimpleMatch
// Maneja acciones ofensivas/defensivas y análisis de jugadas

import { TeamMatch } from "../teams/TeamMatch";
import { TeamCamp } from "../teams/units/TeamCamp";
import { Player } from "./Player";
import { PlayResult, PlayResultAnalyzer } from "./PlayResults";
import { 
    RunningPlayAction, 
    PassingPlayAction
} from "./Actions";

export interface SimpleGameState {
    // Estado básico del juego
    quarter: number;
    timeRemaining: number;
    down: number;
    yardsToGo: number;
    ballPosition: number;
    
    // Equipos
    offensiveTeam: TeamMatch;
    defensiveTeam: TeamMatch;
    
    // Momentum y presión
    momentum: 'offensive' | 'defensive' | 'neutral';
    pressure: 'low' | 'medium' | 'high';
    
    // Historial de jugadas recientes
    recentPlays: PlayResult[];
}

export class ExpandedPlayState {
    private gameState: SimpleGameState;
    private actionHistory: (RunningPlayAction | PassingPlayAction)[] = [];
    
    constructor(initialState: SimpleGameState) {
        this.gameState = initialState;
    }
    
    // ===== GETTERS PARA ACCESO A INFORMACIÓN =====
    
    get currentState(): SimpleGameState {
        return this.gameState;
    }
    
    get momentum(): 'offensive' | 'defensive' | 'neutral' {
        return this.gameState.momentum;
    }
    
    get pressure(): 'low' | 'medium' | 'high' {
        return this.gameState.pressure;
    }
    
    /**
     * Actualiza el estado después de una jugada
     */
    public updateAfterPlay(
        action: RunningPlayAction | PassingPlayAction, 
        result: PlayResult
    ): void {
        // Añadir acción al historial
        this.actionHistory.push(action);
        
        // Añadir resultado al historial reciente
        this.gameState.recentPlays.push(result);
        if (this.gameState.recentPlays.length > 5) {
            this.gameState.recentPlays.shift();
        }
        
        // Actualizar momentum basado en el resultado
        this.updateMomentum(result);
        
        // Actualizar presión basada en la situación
        this.updatePressure();
    }
    
    /**
     * Actualiza el momentum del juego
     */
    private updateMomentum(result: PlayResult): void {
        const momentumImpact = PlayResultAnalyzer.calculateMomentumImpact(result);
        
        if (momentumImpact >= 3) {
            this.gameState.momentum = 'offensive';
        } else if (momentumImpact <= -3) {
            this.gameState.momentum = 'defensive';
        } else if (Math.abs(momentumImpact) <= 1) {
            this.gameState.momentum = 'neutral';
        }
        // Si el impacto es moderado (2 o -2), mantener momentum actual
    }
    
    /**
     * Actualiza la presión del juego
     */
    private updatePressure(): void {
        let pressureLevel = 0;
        
        // Factores que aumentan presión
        if (this.gameState.down >= 3) pressureLevel += 2;
        if (this.gameState.yardsToGo >= 10) pressureLevel += 1;
        if (this.gameState.ballPosition <= 20) pressureLevel += 2; // Zona roja
        if (this.gameState.timeRemaining <= 120) pressureLevel += 2; // Dos minutos
        
        if (pressureLevel >= 5) {
            this.gameState.pressure = 'high';
        } else if (pressureLevel >= 3) {
            this.gameState.pressure = 'medium';
        } else {
            this.gameState.pressure = 'low';
        }
    }
    
    /**
     * Obtiene recomendaciones estratégicas basadas en el estado actual
     */
    public getStrategicRecommendations(): {
        offensive: string[];
        defensive: string[];
        reasoning: string[];
    } {
        const offensive: string[] = [];
        const defensive: string[] = [];
        const reasoning: string[] = [];
        
        // Recomendaciones ofensivas
        if (this.gameState.yardsToGo >= 10) {
            offensive.push('Usar pases intermedios');
            reasoning.push('Necesita primer down');
        } else if (this.gameState.yardsToGo <= 2) {
            offensive.push('Carrera de poder');
            reasoning.push('Yardas cortas, usar fuerza');
        }
        
        if (this.gameState.pressure === 'high') {
            offensive.push('Pases rápidos');
            defensive.push('Presión agresiva');
            reasoning.push('Situación de alta presión');
        }
        
        if (this.gameState.momentum === 'offensive') {
            offensive.push('Mantener agresividad');
            reasoning.push('Momentum favorable');
        } else if (this.gameState.momentum === 'defensive') {
            defensive.push('Mantener presión');
            reasoning.push('Momentum defensivo');
        }
        
        return { offensive, defensive, reasoning };
    }
    
    /**
     * Genera reporte del estado actual
     */
    public generateStateReport(): string {
        let report = `\n📊 ESTADO DEL JUEGO - Q${this.gameState.quarter} ${this.formatTime(this.gameState.timeRemaining)}\n`;
        report += "=".repeat(50) + "\n";
        
        report += `🏈 Situación: ${this.gameState.down}° y ${this.gameState.yardsToGo}, yarda ${this.gameState.ballPosition}\n`;
        report += `⚡ Momentum: ${this.gameState.momentum.toUpperCase()}\n`;
        report += `🔥 Presión: ${this.gameState.pressure.toUpperCase()}\n`;
        
        if (this.gameState.recentPlays.length > 0) {
            report += `\n📈 Jugadas recientes:\n`;
            this.gameState.recentPlays.slice(-3).forEach((play, index) => {
                const narrative = PlayResultAnalyzer.generateNarrative(play);
                report += `   ${index + 1}. ${narrative}\n`;
            });
        }
        
        const recommendations = this.getStrategicRecommendations();
        if (recommendations.offensive.length > 0) {
            report += `\n💡 Recomendaciones Ofensivas: ${recommendations.offensive.join(', ')}\n`;
        }
        if (recommendations.defensive.length > 0) {
            report += `🛡️ Recomendaciones Defensivas: ${recommendations.defensive.join(', ')}\n`;
        }
        
        return report;
    }
    
    /**
     * Formatea tiempo en minutos:segundos
     */
    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Actualiza el estado del juego
     */
    public updateGameState(newState: Partial<SimpleGameState>): void {
        Object.assign(this.gameState, newState);
        this.updatePressure();
    }
}