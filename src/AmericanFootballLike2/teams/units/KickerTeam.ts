// KickerTeam - Unidad especializada para pateo (kickoff, punt, field goal, extra point)
// Maneja todas las situaciones donde el equipo está pateando

import { TeamCamp, TeamCampConfig } from './TeamCamp';
import { CoachingStaff } from '../coaches/CoachingStaff';
import { PlayerTeamworkProfile, CompleteTeamworkSystem } from '../TeamworkAttributes';

export type KickerTeamType = 'kickoff' | 'punt' | 'field_goal' | 'extra_point';

export interface KickerTeamConfig extends TeamCampConfig {
    unitType: 'special_teams';
    kickerTeamType: KickerTeamType;
    coachingStaff?: CoachingStaff;
    teamworkProfiles?: PlayerTeamworkProfile[];
    teamworkSystem?: CompleteTeamworkSystem;
}

export class KickerTeam extends TeamCamp {
    public readonly coachingStaff?: CoachingStaff;
    public readonly teamworkProfiles?: PlayerTeamworkProfile[];
    public readonly teamworkSystem?: CompleteTeamworkSystem;
    public readonly kickerTeamType: KickerTeamType;

    constructor(config: KickerTeamConfig) {
        super(config);
        this.coachingStaff = config.coachingStaff;
        this.teamworkProfiles = config.teamworkProfiles;
        this.teamworkSystem = config.teamworkSystem;
        this.kickerTeamType = config.kickerTeamType;
    }

    /**
     * Calcula atributos específicos de pateo basados en los jugadores en campo
     */
    public getKickingAttributes() {
        const kickers = this.getPlayersByPosition('K');
        const punters = this.getPlayersByPosition('P');
        const longSnappers = this.getPlayersByPosition('LS');
        const centers = this.getPlayersByPosition('C');
        const coverage = this.players.filter(p => !['K', 'P', 'LS'].includes(p.position));

        // Calcular atributos base según el tipo de pateo
        let baseAttributes: any = {};

        if (this.kickerTeamType === 'kickoff') {
            baseAttributes = {
                kickerRange: kickers.length > 0 ? 
                    kickers[0].attributes.kickPower + kickers[0].attributes.kickAccuracy : 70,
                kickerComposure: kickers.length > 0 ? 
                    kickers[0].attributes.composure + kickers[0].attributes.awareness : 70,
                coverageSpeed: coverage.length > 0 ? 
                    coverage.reduce((sum, p) => sum + p.attributes.speed + p.attributes.tackling, 0) / coverage.length : 70,
                kickoffHangTime: kickers.length > 0 ? 
                    kickers[0].attributes.kickPower + kickers[0].attributes.kickAccuracy : 70
            };
        } else if (this.kickerTeamType === 'punt') {
            baseAttributes = {
                punterPlacement: punters.length > 0 ? 
                    punters[0].attributes.kickAccuracy + punters[0].attributes.awareness : 70,
                punterHangTime: punters.length > 0 ? 
                    punters[0].attributes.kickPower + punters[0].attributes.kickAccuracy : 70,
                longSnapAccuracy: longSnappers.length > 0 ? 
                    longSnappers[0].attributes.kickAccuracy + longSnappers[0].attributes.awareness : 
                    (centers.length > 0 ? centers[0].attributes.kickAccuracy + centers[0].attributes.awareness : 70),
                coverageSpeed: coverage.length > 0 ? 
                    coverage.reduce((sum, p) => sum + p.attributes.speed + p.attributes.tackling, 0) / coverage.length : 70,
                puntProtection: coverage.length > 0 ? 
                    coverage.reduce((sum, p) => sum + p.attributes.blocking + p.attributes.awareness, 0) / coverage.length : 70
            };
        } else if (this.kickerTeamType === 'field_goal' || this.kickerTeamType === 'extra_point') {
            baseAttributes = {
                kickerRange: kickers.length > 0 ? 
                    kickers[0].attributes.kickPower + kickers[0].attributes.kickAccuracy : 70,
                kickerComposure: kickers.length > 0 ? 
                    kickers[0].attributes.composure + kickers[0].attributes.awareness : 70,
                kickerAccuracy: kickers.length > 0 ? 
                    kickers[0].attributes.kickAccuracy * 2 : 70,
                longSnapAccuracy: longSnappers.length > 0 ? 
                    longSnappers[0].attributes.kickAccuracy + longSnappers[0].attributes.awareness : 
                    (centers.length > 0 ? centers[0].attributes.kickAccuracy + centers[0].attributes.awareness : 70),
                fieldGoalProtection: coverage.length > 0 ? 
                    coverage.reduce((sum, p) => sum + p.attributes.blocking + p.attributes.strength, 0) / coverage.length : 70
            };
        }

        // Aplicar efectos del coaching staff
        let coachingBonus = 0;
        if (this.coachingStaff) {
            const specialTeamsCoordinator = this.coachingStaff.specialTeamsCoordinator;
            if (specialTeamsCoordinator) {
                coachingBonus = (specialTeamsCoordinator.attributes.experience + specialTeamsCoordinator.attributes.leadership) / 10;
            }

            const headCoach = this.coachingStaff.headCoach;
            if (headCoach) {
                coachingBonus += (headCoach.attributes.leadership + headCoach.attributes.intelligence) / 15;
            }
        }

        // Aplicar efectos del trabajo en equipo
        let teamworkMultiplier = 1.0;
        if (this.teamworkProfiles && this.teamworkSystem && this.teamworkProfiles.length > 0) {
            const playersInUnit = this.players.map(p => p.id);
            const relevantProfiles = this.teamworkProfiles.filter(profile => 
                playersInUnit.includes(profile.playerId)
            );

            if (relevantProfiles.length > 0) {
                const avgChemistry = relevantProfiles.reduce((sum, profile) => 
                    sum + (profile.fiveCs.communication + profile.fiveCs.coordination + profile.fiveCs.cooperation + profile.fiveCs.commitment + profile.fiveCs.confidence) / 5, 0) / relevantProfiles.length;
                
                const fiveCs = this.teamworkSystem.fiveCs;
                if (fiveCs) {
                    const teamworkScore = (fiveCs.communication + fiveCs.coordination + fiveCs.cooperation + fiveCs.commitment + fiveCs.confidence) / 5;
                    // Menor impacto del teamwork en pateo (más individual)
                    teamworkMultiplier = 1.0 + ((avgChemistry + teamworkScore - 140) / 1500);
                }
            }
        }

        // Aplicar todos los modificadores
        const finalAttributes: any = {};
        Object.entries(baseAttributes).forEach(([key, value]) => {
            finalAttributes[key] = Math.min(100, (value as number + coachingBonus) * teamworkMultiplier);
        });

        return finalAttributes;
    }

    /**
     * Obtiene el rating de pateo específico de esta unidad
     */
    public getKickingRating(): number {
        const attrs = this.getKickingAttributes();
        const values = Object.values(attrs) as number[];
        return values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    }

    /**
     * Verifica si puede ejecutar un tipo específico de pateo
     */
    public canExecuteKick(kickType: KickerTeamType): boolean {
        const kickers = this.getPlayersByPosition('K');
        const punters = this.getPlayersByPosition('P');

        switch (kickType) {
            case 'kickoff':
            case 'field_goal':
            case 'extra_point':
                return kickers.length > 0;
            case 'punt':
                return punters.length > 0;
            default:
                return false;
        }
    }

    /**
     * Obtiene el kicker principal
     */
    public getPrimaryKicker() {
        const kickers = this.getPlayersByPosition('K');
        return kickers.length > 0 ? kickers[0] : undefined;
    }

    /**
     * Obtiene el punter principal
     */
    public getPrimaryPunter() {
        const punters = this.getPlayersByPosition('P');
        return punters.length > 0 ? punters[0] : undefined;
    }

    /**
     * Obtiene el long snapper principal
     */
    public getPrimaryLongSnapper() {
        const longSnappers = this.getPlayersByPosition('LS');
        if (longSnappers.length > 0) return longSnappers[0];
        
        // Si no hay long snapper, usar el mejor center
        const centers = this.getPlayersByPosition('C');
        return centers.length > 0 ? centers[0] : undefined;
    }

    /**
     * Obtiene análisis específico de la unidad de pateo
     */
    public getKickingAnalysis(): {
        kickerTeamType: KickerTeamType;
        primaryKicker?: string;
        primaryPunter?: string;
        primaryLongSnapper?: string;
        kickingRating: number;
        strengths: string[];
        weaknesses: string[];
        specialistPresent: boolean;
    } {
        const attrs = this.getKickingAttributes();
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const primaryKicker = this.getPrimaryKicker();
        const primaryPunter = this.getPrimaryPunter();
        const primaryLongSnapper = this.getPrimaryLongSnapper();

        // Análisis específico por tipo de pateo
        if (this.kickerTeamType === 'kickoff') {
            if (attrs.kickerRange > 80) strengths.push('Kickoffs profundos');
            if (attrs.coverageSpeed > 80) strengths.push('Cobertura rápida en kickoffs');
            if (attrs.kickoffHangTime > 80) strengths.push('Buen hang time en kickoffs');
            
            if (attrs.kickerRange < 60) weaknesses.push('Kickoffs cortos');
            if (attrs.coverageSpeed < 60) weaknesses.push('Cobertura lenta');
        } else if (this.kickerTeamType === 'punt') {
            if (attrs.punterPlacement > 80) strengths.push('Punter muy preciso');
            if (attrs.punterHangTime > 80) strengths.push('Excelente hang time');
            if (attrs.longSnapAccuracy > 80) strengths.push('Long snap confiable');
            if (attrs.puntProtection > 80) strengths.push('Buena protección en punts');
            
            if (attrs.punterPlacement < 60) weaknesses.push('Punter impreciso');
            if (attrs.longSnapAccuracy < 60) weaknesses.push('Long snap inconsistente');
            if (attrs.puntProtection < 60) weaknesses.push('Protección débil en punts');
        } else if (this.kickerTeamType === 'field_goal' || this.kickerTeamType === 'extra_point') {
            if (attrs.kickerRange > 80) strengths.push('Kicker de largo alcance');
            if (attrs.kickerAccuracy > 80) strengths.push('Kicker muy preciso');
            if (attrs.kickerComposure > 80) strengths.push('Kicker clutch');
            if (attrs.fieldGoalProtection > 80) strengths.push('Excelente protección');
            
            if (attrs.kickerRange < 60) weaknesses.push('Kicker de corto alcance');
            if (attrs.kickerAccuracy < 60) weaknesses.push('Kicker impreciso');
            if (attrs.kickerComposure < 60) weaknesses.push('Kicker nervioso');
            if (attrs.fieldGoalProtection < 60) weaknesses.push('Protección débil');
        }

        const specialistPresent = (this.kickerTeamType === 'punt' && primaryPunter !== undefined) || 
                                 (['kickoff', 'field_goal', 'extra_point'].includes(this.kickerTeamType) && primaryKicker !== undefined);

        return {
            kickerTeamType: this.kickerTeamType,
            primaryKicker: primaryKicker?.name,
            primaryPunter: primaryPunter?.name,
            primaryLongSnapper: primaryLongSnapper?.name,
            kickingRating: this.getKickingRating(),
            strengths,
            weaknesses,
            specialistPresent
        };
    }

    /**
     * Calcula la probabilidad de éxito para un pateo específico
     */
    public calculateKickSuccessProbability(distance?: number, pressure?: number): number {
        const attrs = this.getKickingAttributes();
        let baseProbability = 85; // Probabilidad base

        if (this.kickerTeamType === 'field_goal') {
            // Ajustar por distancia
            if (distance) {
                if (distance <= 30) baseProbability = 95;
                else if (distance <= 40) baseProbability = 90;
                else if (distance <= 50) baseProbability = 80;
                else baseProbability = 60;
                
                // Ajustar por habilidad del kicker
                const rangeBonus = (attrs.kickerRange - 70) / 2;
                const accuracyBonus = (attrs.kickerAccuracy - 70) / 2;
                baseProbability += rangeBonus + accuracyBonus;
            }
        } else if (this.kickerTeamType === 'extra_point') {
            baseProbability = 98; // Extra points son más fáciles
            const accuracyBonus = (attrs.kickerAccuracy - 70) / 5;
            baseProbability += accuracyBonus;
        }

        // Ajustar por presión
        if (pressure) {
            const composureBonus = (attrs.kickerComposure - 70) / 3;
            baseProbability -= pressure - composureBonus;
        }

        return Math.max(10, Math.min(99, baseProbability));
    }
}