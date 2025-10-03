// TeamCamp - Representa los 11 jugadores que están en campo durante una jugada específica
// Esta es la unidad que ejecuta las jugadas (ofensiva, defensiva o equipos especiales)

import { Position } from "../../Positions/PositionTypes";
import { Player } from "../../core/Player";

/**
 * TODO:
 * * extender a clases hijas: OffensiveTeam, DefensiveTeam,
 *     ReceptorTeam, KickerTeam (GaolTeam), PuntTeam.
 *      De esta forma todo equipo ofensivo tiene asignado un QB.
 * * Crear un modulo de OfensiveFormations que permita crear formaciones
 *     ofensivas tipicas, de forma de que esté claro quienes son los receptores
 *     y los runnings
 * */ 

export interface TeamCampConfig {
    teamName: string;
    players: Player[];
    unitType: 'offensive' | 'defensive' | 'special_teams';
    formation: string;
}

export class TeamCamp {
    public readonly teamName: string;
    public readonly players: Player[];
    public readonly unitType: 'offensive' | 'defensive' | 'special_teams';
    public readonly formation: string;

    constructor(config: TeamCampConfig) {
        this.teamName = config.teamName;
        this.players = config.players;
        this.unitType = config.unitType;
        this.formation = config.formation;

        this.validateUnit();
    }

    /**
     * Valida que la unidad tenga exactamente 11 jugadores
     */
    private validateUnit(): void {
        if (this.players.length !== 11) {
            console.warn(`TeamCamp para ${this.teamName} tiene ${this.players.length} jugadores, se esperaban 11`);
        }
    }

    /**
     * Obtiene jugadores por posición en esta unidad
     */
    public getPlayersByPosition(position: Position): Player[] {
        return this.players.filter(player => player.position === position);
    }

    /**
     * Obtiene el quarterback de la unidad (si es ofensiva)
     */
    public getQuarterback(): Player | undefined {
        return this.players.find(player => player.position === 'QB');
    }

    /**
     * Obtiene todos los receivers disponibles (WR, TE, RB que pueden recibir)
     */
    public getReceivers(): Player[] {
        return this.players.filter(player => 
            ['WR', 'TE', 'RB'].includes(player.position)
        );
    }

    /**
     * Obtiene la línea ofensiva
     */
    public getOffensiveLine(): Player[] {
        return this.players.filter(player => 
            ['C', 'G', 'T'].includes(player.position)
        );
    }

    /**
     * Obtiene la línea defensiva
     */
    public getDefensiveLine(): Player[] {
        return this.players.filter(player => 
            ['DE', 'DT', 'NT'].includes(player.position)
        );
    }

    /**
     * Obtiene los linebackers
     */
    public getLinebackers(): Player[] {
        return this.players.filter(player => 
            ['OLB', 'ILB'].includes(player.position)
        );
    }

    /**
     * Obtiene los defensive backs
     */
    public getDefensiveBacks(): Player[] {
        return this.players.filter(player => 
            ['CB', 'SS', 'FS'].includes(player.position)
        );
    }

    /**
     * Obtiene los running backs
     */
    public getRunningBacks(): Player[] {
        return this.players.filter(player => player.position === 'RB');
    }

    /**
     * Calcula el rating promedio de la unidad
     */
    public getUnitRating(): number {
        if (this.players.length === 0) return 0;
        
        const totalRating = this.players.reduce((sum, player) => 
            sum + player.getPositionRating(), 0
        );
        
        return totalRating / this.players.length;
    }

    /**
     * Calcula el rating específico según el tipo de unidad
     */
    public getSpecificRating(): number {
        if (this.unitType === 'offensive') {
            return this.getOffensiveUnitRating();
        } else if (this.unitType === 'defensive') {
            return this.getDefensiveUnitRating();
        } else {
            return this.getSpecialTeamsUnitRating();
        }
    }

    /**
     * Rating específico para unidad ofensiva
     */
    private getOffensiveUnitRating(): number {
        const qb = this.getQuarterback();
        const ol = this.getOffensiveLine();
        const receivers = this.getReceivers();
        const rbs = this.getRunningBacks();

        let rating = 0;
        let components = 0;

        // QB (30% del rating)
        if (qb) {
            rating += qb.getPositionRating() * 0.3;
            components += 0.3;
        }

        // Línea Ofensiva (35% del rating)
        if (ol.length > 0) {
            const olRating = ol.reduce((sum, p) => sum + p.getPositionRating(), 0) / ol.length;
            rating += olRating * 0.35;
            components += 0.35;
        }

        // Receivers (25% del rating)
        if (receivers.length > 0) {
            const receiverRating = receivers.reduce((sum, p) => sum + p.getPositionRating(), 0) / receivers.length;
            rating += receiverRating * 0.25;
            components += 0.25;
        }

        // Running Backs (10% del rating)
        if (rbs.length > 0) {
            const rbRating = rbs.reduce((sum, p) => sum + p.getPositionRating(), 0) / rbs.length;
            rating += rbRating * 0.1;
            components += 0.1;
        }

        return components > 0 ? rating / components : 0;
    }

    /**
     * Rating específico para unidad defensiva
     */
    private getDefensiveUnitRating(): number {
        const dl = this.getDefensiveLine();
        const lbs = this.getLinebackers();
        const dbs = this.getDefensiveBacks();

        let rating = 0;
        let components = 0;

        // Línea Defensiva (40% del rating)
        if (dl.length > 0) {
            const dlRating = dl.reduce((sum, p) => sum + p.getPositionRating(), 0) / dl.length;
            rating += dlRating * 0.4;
            components += 0.4;
        }

        // Linebackers (35% del rating)
        if (lbs.length > 0) {
            const lbRating = lbs.reduce((sum, p) => sum + p.getPositionRating(), 0) / lbs.length;
            rating += lbRating * 0.35;
            components += 0.35;
        }

        // Defensive Backs (25% del rating)
        if (dbs.length > 0) {
            const dbRating = dbs.reduce((sum, p) => sum + p.getPositionRating(), 0) / dbs.length;
            rating += dbRating * 0.25;
            components += 0.25;
        }

        return components > 0 ? rating / components : 0;
    }

    /**
     * Rating específico para equipos especiales
     */
    private getSpecialTeamsUnitRating(): number {
        // Para equipos especiales, usar el rating promedio con énfasis en speed y special teams skills
        const ratings = this.players.map(player => {
            const baseRating = player.getPositionRating();
            const speedBonus = player.attributes.speed * 0.1;
            const specialBonus = (player.attributes.kickAccuracy + player.attributes.kickPower) * 0.05;
            
            return baseRating + speedBonus + specialBonus;
        });

        return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }

    /**
     * Obtiene información de la formación
     */
    public getFormationInfo(): {
        formation: string;
        unitType: string;
        playerCount: number;
        keyPositions: string[];
    } {
        const keyPositions: string[] = [];

        if (this.unitType === 'offensive') {
            keyPositions.push('QB');
            if (this.getRunningBacks().length > 0) keyPositions.push('RB');
            if (this.getReceivers().length > 0) keyPositions.push('WR/TE');
            keyPositions.push('OL');
        } else if (this.unitType === 'defensive') {
            if (this.getDefensiveLine().length > 0) keyPositions.push('DL');
            if (this.getLinebackers().length > 0) keyPositions.push('LB');
            if (this.getDefensiveBacks().length > 0) keyPositions.push('DB');
        } else {
            keyPositions.push('ST');
        }

        return {
            formation: this.formation,
            unitType: this.unitType,
            playerCount: this.players.length,
            keyPositions
        };
    }

    /**
     * Obtiene resumen de la unidad
     */
    public getUnitSummary(): string {
        const info = this.getFormationInfo();
        const rating = this.getSpecificRating();
        
        return `${this.teamName} ${info.unitType.toUpperCase()} - ` +
               `Formación: ${info.formation}, ` +
               `Jugadores: ${info.playerCount}, ` +
               `Rating: ${rating.toFixed(1)}`;
    }

    /**
     * Obtiene análisis detallado de la unidad
     */
    public getDetailedAnalysis(): {
        unitType: string;
        formation: string;
        overallRating: number;
        specificRating: number;
        positionBreakdown: { position: string; count: number; avgRating: number }[];
        strengths: string[];
        weaknesses: string[];
    } {
        const positionGroups = this.players.reduce((groups, player) => {
            if (!groups[player.position]) {
                groups[player.position] = [];
            }
            groups[player.position].push(player);
            return groups;
        }, {} as Record<string, Player[]>);

        const positionBreakdown = Object.entries(positionGroups).map(([position, players]) => ({
            position,
            count: players.length,
            avgRating: players.reduce((sum: number, p: Player) => sum + p.getPositionRating(), 0) / players.length
        }));

        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Analizar fortalezas y debilidades basadas en ratings
        positionBreakdown.forEach(({ position, avgRating }) => {
            if (avgRating >= 80) {
                strengths.push(`Excelente ${position}`);
            } else if (avgRating <= 60) {
                weaknesses.push(`Débil ${position}`);
            }
        });

        return {
            unitType: this.unitType,
            formation: this.formation,
            overallRating: this.getUnitRating(),
            specificRating: this.getSpecificRating(),
            positionBreakdown,
            strengths,
            weaknesses
        };
    }

    /**
     * Aplica fatiga a todos los jugadores de la unidad
     */
    public applyFatigue(amount: number): void {
        this.players.forEach(player => {
            player.energy = Math.max(0, player.energy - amount);
        });
    }

    /**
     * Permite descanso a todos los jugadores de la unidad
     */
    public rest(amount: number): void {
        this.players.forEach(player => {
            player.energy = Math.min(100, player.energy + amount);
        });
    }

    /**
     * Verifica si la unidad puede ejecutar un tipo específico de jugada
     */
    public canExecutePlay(playType: 'run' | 'pass' | 'kick' | 'punt'): boolean { // no debería ser necesaria
        if (this.unitType === 'special_teams') {
            return playType === 'kick' || playType === 'punt';
        }

        if (this.unitType === 'offensive') {
            if (playType === 'pass') {
                return this.getQuarterback() !== undefined && this.getReceivers().length > 0;
            } else if (playType === 'run') {
                return this.getRunningBacks().length > 0 || this.getQuarterback() !== undefined;
            }
        }

        return false;
    }
}