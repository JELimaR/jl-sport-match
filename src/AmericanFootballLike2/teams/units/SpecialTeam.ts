// SpecialTeam - Especialización de TeamCamp para equipos especiales
// Maneja tanto unidades que patean (kickoff, punt, field goal) como unidades que retornan

import { TeamCamp, TeamCampConfig } from './TeamCamp';
import { CoachingStaff } from '../coaches/CoachingStaff';
import { PlayerTeamworkProfile, CompleteTeamworkSystem } from '../TeamworkAttributes';

export type SpecialTeamType = 'kicking' | 'punting' | 'field_goal' | 'return_kickoff' | 'return_punt';

export interface SpecialTeamConfig extends TeamCampConfig {
    unitType: 'special_teams';
    specialTeamType: SpecialTeamType; // Tipo específico de unidad de equipos especiales
    coachingStaff?: CoachingStaff;
    teamworkProfiles?: PlayerTeamworkProfile[];
    teamworkSystem?: CompleteTeamworkSystem;
}

export class SpecialTeam extends TeamCamp {
    public readonly coachingStaff?: CoachingStaff;
    public readonly teamworkProfiles?: PlayerTeamworkProfile[];
    public readonly teamworkSystem?: CompleteTeamworkSystem;
    public readonly specialTeamType: SpecialTeamType;

    constructor(config: SpecialTeamConfig) {
        super(config);
        this.coachingStaff = config.coachingStaff;
        this.teamworkProfiles = config.teamworkProfiles;
        this.teamworkSystem = config.teamworkSystem;
        this.specialTeamType = config.specialTeamType;
    }

    /**
     * Calcula atributos de equipos especiales agregados basados en los jugadores en campo,
     * incluyendo efectos del coaching staff y trabajo en equipo
     */
    public getSpecialTeamsAttributes() {
        const kickers = this.getPlayersByPosition('K');
        const punters = this.getPlayersByPosition('P');
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const coverage = this.players.filter(p => !['K', 'P'].includes(p.position));

        // Calcular atributos base de los jugadores
        const baseKickerRange = kickers.length > 0 ? 
            kickers[0].attributes.kickPower + kickers[0].attributes.kickAccuracy : 70;
        const baseKickerComposure = kickers.length > 0 ? 
            kickers[0].attributes.composure + kickers[0].attributes.awareness : 70;

        const basePunterPlacement = punters.length > 0 ? 
            punters[0].attributes.kickAccuracy + punters[0].attributes.awareness : 70;
        const basePunterHangTime = punters.length > 0 ? 
            punters[0].attributes.kickPower + punters[0].attributes.kickAccuracy : 70;

        const baseReturnExplosiveness = returners.length > 0 ? 
            returners.reduce((sum, p) => sum + p.attributes.speed + p.attributes.agility, 0) / returners.length : 70;
        const baseBallSecurity = returners.length > 0 ? 
            returners.reduce((sum, p) => sum + p.attributes.strength + p.attributes.composure, 0) / returners.length : 70;

        const baseCoverageSpeed = coverage.length > 0 ? 
            coverage.reduce((sum, p) => sum + p.attributes.speed + p.attributes.tackling, 0) / coverage.length : 70;

        // Aplicar efectos del coaching staff
        let coachingBonus = 0;
        if (this.coachingStaff) {
            const specialTeamsCoordinator = this.coachingStaff.specialTeamsCoordinator;
            if (specialTeamsCoordinator) {
                // Bonus basado en la experiencia y habilidades del coordinador de equipos especiales
                coachingBonus = (specialTeamsCoordinator.attributes.experience + specialTeamsCoordinator.attributes.leadership) / 10; // 0-20 puntos
            }

            // Bonus del head coach
            const headCoach = this.coachingStaff.headCoach;
            if (headCoach) {
                coachingBonus += (headCoach.attributes.leadership + headCoach.attributes.intelligence) / 15; // 0-13 puntos adicionales
            }
        }

        // Aplicar efectos del trabajo en equipo
        let teamworkMultiplier = 1.0;
        if (this.teamworkProfiles && this.teamworkSystem && this.teamworkProfiles.length > 0) {
            // Calcular sinergia entre jugadores en campo
            const playersInUnit = this.players.map(p => p.id);
            const relevantProfiles = this.teamworkProfiles.filter(profile => 
                playersInUnit.includes(profile.playerId)
            );

            if (relevantProfiles.length > 0) {
                // Calcular química de equipos especiales basada en las 5 C's
                const avgChemistry = relevantProfiles.reduce((sum, profile) => 
                    sum + (profile.fiveCs.communication + profile.fiveCs.coordination + profile.fiveCs.cooperation + profile.fiveCs.commitment + profile.fiveCs.confidence) / 5, 0) / relevantProfiles.length;
                
                // Aplicar efectos del sistema de trabajo en equipo
                const fiveCs = this.teamworkSystem.fiveCs;
                if (fiveCs) {
                    const teamworkScore = (fiveCs.communication + fiveCs.coordination + fiveCs.cooperation + fiveCs.commitment + fiveCs.confidence) / 5;
                    teamworkMultiplier = 1.0 + ((avgChemistry + teamworkScore - 140) / 1200); // Menor impacto para equipos especiales
                }
            }
        }

        // Aplicar todos los modificadores
        const kickerRange = Math.min(100, (baseKickerRange + coachingBonus) * teamworkMultiplier);
        const kickerComposure = Math.min(100, (baseKickerComposure + coachingBonus) * teamworkMultiplier);
        const punterPlacement = Math.min(100, (basePunterPlacement + coachingBonus) * teamworkMultiplier);
        const punterHangTime = Math.min(100, (basePunterHangTime + coachingBonus) * teamworkMultiplier);
        const returnExplosiveness = Math.min(100, (baseReturnExplosiveness + coachingBonus) * teamworkMultiplier);
        const ballSecurity = Math.min(100, (baseBallSecurity + coachingBonus) * teamworkMultiplier);
        const coverageSpeed = Math.min(100, (baseCoverageSpeed + coachingBonus) * teamworkMultiplier);

        return {
            kickerRange,
            kickerComposure,
            punterPlacement,
            punterHangTime,
            returnExplosiveness,
            ballSecurity,
            coverageSpeed
        };
    }

    /**
     * Obtiene el rating de equipos especiales específico de esta unidad
     */
    public getSpecialTeamsRating(): number {
        const attrs = this.getSpecialTeamsAttributes();
        const values = Object.values(attrs);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Verifica si puede ejecutar un tipo específico de jugada de equipos especiales
     */
    public canExecuteSpecialPlay(playType: 'kickoff' | 'punt' | 'field_goal' | 'return'): boolean {
        const kickers = this.getPlayersByPosition('K');
        const punters = this.getPlayersByPosition('P');
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));

        switch (playType) {
            case 'kickoff':
            case 'field_goal':
                return kickers.length > 0;
            case 'punt':
                return punters.length > 0;
            case 'return':
                return returners.length > 0;
            default:
                return false;
        }
    }

    /**
     * Obtiene análisis específico de la unidad de equipos especiales
     */
    public getSpecialTeamsAnalysis(): {
        formation: string;
        kickerPresent: boolean;
        punterPresent: boolean;
        returnerCount: number;
        coverageCount: number;
        specialTeamsRating: number;
        strengths: string[];
        weaknesses: string[];
    } {
        const attrs = this.getSpecialTeamsAttributes();
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Analizar fortalezas y debilidades
        if (attrs.kickerRange > 80) strengths.push('Kicker de largo alcance');
        if (attrs.kickerComposure > 80) strengths.push('Kicker clutch');
        if (attrs.punterPlacement > 80) strengths.push('Punter preciso');
        if (attrs.returnExplosiveness > 80) strengths.push('Returners explosivos');
        if (attrs.coverageSpeed > 80) strengths.push('Cobertura rápida');

        if (attrs.kickerRange < 60) weaknesses.push('Kicker de corto alcance');
        if (attrs.kickerComposure < 60) weaknesses.push('Kicker nervioso');
        if (attrs.punterPlacement < 60) weaknesses.push('Punter impreciso');
        if (attrs.returnExplosiveness < 60) weaknesses.push('Returns lentos');
        if (attrs.coverageSpeed < 60) weaknesses.push('Cobertura lenta');

        const kickers = this.getPlayersByPosition('K');
        const punters = this.getPlayersByPosition('P');
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const coverage = this.players.filter(p => !['K', 'P'].includes(p.position));

        return {
            formation: this.formation,
            kickerPresent: kickers.length > 0,
            punterPresent: punters.length > 0,
            returnerCount: returners.length,
            coverageCount: coverage.length,
            specialTeamsRating: this.getSpecialTeamsRating(),
            strengths,
            weaknesses
        };
    }

    /**
     * Obtiene atributos específicos para unidades de retorno
     */
    public getReturnAttributes() {
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const blockers = this.players.filter(p => !['K', 'P'].includes(p.position) && !returners.includes(p));

        // Calcular atributos base para retornos
        const baseReturnExplosiveness = returners.length > 0 ? 
            returners.reduce((sum, p) => sum + p.attributes.speed + p.attributes.agility, 0) / returners.length : 70;
        
        const baseBallSecurity = returners.length > 0 ? 
            returners.reduce((sum, p) => sum + p.attributes.strength + p.attributes.composure, 0) / returners.length : 70;
        
        const baseBlockingAbility = blockers.length > 0 ? 
            blockers.reduce((sum, p) => sum + p.attributes.blocking + p.attributes.speed, 0) / blockers.length : 70;
        
        const baseFieldVision = returners.length > 0 ? 
            returners.reduce((sum, p) => sum + p.attributes.awareness + p.attributes.intelligence, 0) / returners.length : 70;

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
                    // Mayor impacto del teamwork en returns (requiere coordinación entre returner y blockers)
                    teamworkMultiplier = 1.0 + ((avgChemistry + teamworkScore - 140) / 1000);
                }
            }
        }

        // Aplicar todos los modificadores
        const returnExplosiveness = Math.min(100, (baseReturnExplosiveness + coachingBonus) * teamworkMultiplier);
        const ballSecurity = Math.min(100, (baseBallSecurity + coachingBonus) * teamworkMultiplier);
        const blockingAbility = Math.min(100, (baseBlockingAbility + coachingBonus) * teamworkMultiplier);
        const fieldVision = Math.min(100, (baseFieldVision + coachingBonus) * teamworkMultiplier);

        return {
            returnExplosiveness,
            ballSecurity,
            blockingAbility,
            fieldVision
        };
    }

    /**
     * Verifica si es una unidad de retorno
     */
    public isReturnUnit(): boolean {
        return this.specialTeamType === 'return_kickoff' || this.specialTeamType === 'return_punt';
    }

    /**
     * Verifica si es una unidad de pateo
     */
    public isKickingUnit(): boolean {
        return this.specialTeamType === 'kicking' || this.specialTeamType === 'punting' || this.specialTeamType === 'field_goal';
    }

    /**
     * Obtiene el returner principal
     */
    public getPrimaryReturner() {
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        if (returners.length === 0) return undefined;
        
        // Seleccionar el mejor returner basado en speed + agility + catching
        return returners.reduce((best, current) => {
            const bestScore = best.attributes.speed + best.attributes.agility + best.attributes.catching;
            const currentScore = current.attributes.speed + current.attributes.agility + current.attributes.catching;
            return currentScore > bestScore ? current : best;
        });
    }

    /**
     * Obtiene análisis específico para unidades de retorno
     */
    public getReturnAnalysis(): {
        specialTeamType: SpecialTeamType;
        primaryReturner?: string;
        returnerCount: number;
        blockerCount: number;
        returnRating: number;
        strengths: string[];
        weaknesses: string[];
    } {
        const attrs = this.getReturnAttributes();
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const primaryReturner = this.getPrimaryReturner();

        // Analizar fortalezas y debilidades específicas de retorno
        if (attrs.returnExplosiveness > 80) strengths.push('Returner explosivo');
        if (attrs.ballSecurity > 80) strengths.push('Excelente seguridad del balón');
        if (attrs.blockingAbility > 80) strengths.push('Bloqueo sólido en returns');
        if (attrs.fieldVision > 80) strengths.push('Excelente visión de campo');

        if (attrs.returnExplosiveness < 60) weaknesses.push('Returner lento');
        if (attrs.ballSecurity < 60) weaknesses.push('Propenso a fumbles');
        if (attrs.blockingAbility < 60) weaknesses.push('Bloqueo débil en returns');
        if (attrs.fieldVision < 60) weaknesses.push('Pobre visión de campo');

        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const blockers = this.players.filter(p => !['K', 'P'].includes(p.position) && !returners.includes(p));
        const returnRating = (attrs.returnExplosiveness + attrs.ballSecurity + attrs.blockingAbility + attrs.fieldVision) / 4;

        return {
            specialTeamType: this.specialTeamType,
            primaryReturner: primaryReturner?.name,
            returnerCount: returners.length,
            blockerCount: blockers.length,
            returnRating,
            strengths,
            weaknesses
        };
    }
}