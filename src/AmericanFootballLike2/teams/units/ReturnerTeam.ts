// ReturnerTeam - Unidad especializada para retornos y defensa de pateos
// Maneja kickoff returns, punt returns, field goal defense, extra point defense

import { TeamCamp, TeamCampConfig } from './TeamCamp';
import { CoachingStaff } from '../coaches/CoachingStaff';
import { PlayerTeamworkProfile, CompleteTeamworkSystem } from '../TeamworkAttributes';

export type ReturnerTeamType = 'kickoff_return' | 'punt_return' | 'field_goal_defense' | 'extra_point_defense';

export interface ReturnerTeamConfig extends TeamCampConfig {
    unitType: 'special_teams';
    returnerTeamType: ReturnerTeamType;
    coachingStaff?: CoachingStaff;
    teamworkProfiles?: PlayerTeamworkProfile[];
    teamworkSystem?: CompleteTeamworkSystem;
}

export class ReturnerTeam extends TeamCamp {
    public readonly coachingStaff?: CoachingStaff;
    public readonly teamworkProfiles?: PlayerTeamworkProfile[];
    public readonly teamworkSystem?: CompleteTeamworkSystem;
    public readonly returnerTeamType: ReturnerTeamType;

    constructor(config: ReturnerTeamConfig) {
        super(config);
        this.coachingStaff = config.coachingStaff;
        this.teamworkProfiles = config.teamworkProfiles;
        this.teamworkSystem = config.teamworkSystem;
        this.returnerTeamType = config.returnerTeamType;
    }

    /**
     * Calcula atributos específicos de retorno/defensa basados en los jugadores en campo
     */
    public getReturnerAttributes() {
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const blockers = this.players.filter(p => !['K', 'P'].includes(p.position) && !returners.includes(p));
        const rushers = this.players.filter(p => ['DE', 'DT', 'OLB', 'ILB'].includes(p.position));

        // Calcular atributos base según el tipo de unidad
        let baseAttributes: any = {};

        if (this.returnerTeamType === 'kickoff_return') {
            baseAttributes = {
                returnExplosiveness: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.speed + p.attributes.agility, 0) / returners.length : 70,
                ballSecurity: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.strength + p.attributes.composure, 0) / returners.length : 70,
                blockingAbility: blockers.length > 0 ? 
                    blockers.reduce((sum, p) => sum + p.attributes.blocking + p.attributes.speed, 0) / blockers.length : 70,
                fieldVision: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.awareness + p.attributes.intelligence, 0) / returners.length : 70,
                returnCoordination: this.players.length > 0 ? 
                    this.players.reduce((sum, p) => sum + p.attributes.awareness + p.attributes.intelligence, 0) / this.players.length : 70
            };
        } else if (this.returnerTeamType === 'punt_return') {
            baseAttributes = {
                returnExplosiveness: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.speed + p.attributes.agility, 0) / returners.length : 70,
                ballSecurity: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.strength + p.attributes.composure, 0) / returners.length : 70,
                fieldVision: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.awareness + p.attributes.intelligence, 0) / returners.length : 70,
                puntRushAbility: rushers.length > 0 ? 
                    rushers.reduce((sum, p) => sum + p.attributes.speed + p.attributes.strength, 0) / rushers.length : 70,
                catchingAbility: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.catching + p.attributes.awareness, 0) / returners.length : 70
            };
        } else if (this.returnerTeamType === 'field_goal_defense' || this.returnerTeamType === 'extra_point_defense') {
            baseAttributes = {
                blockingAbility: rushers.length > 0 ? 
                    rushers.reduce((sum, p) => sum + p.attributes.strength + p.attributes.speed, 0) / rushers.length : 70,
                jumpingAbility: this.players.length > 0 ? 
                    this.players.reduce((sum, p) => sum + p.attributes.agility + p.attributes.strength, 0) / this.players.length : 70,
                rushCoordination: rushers.length > 0 ? 
                    rushers.reduce((sum, p) => sum + p.attributes.awareness + p.attributes.intelligence, 0) / rushers.length : 70,
                penetrationSpeed: rushers.length > 0 ? 
                    rushers.reduce((sum, p) => sum + p.attributes.speed + p.attributes.agility, 0) / rushers.length : 70,
                returnThreat: returners.length > 0 ? 
                    returners.reduce((sum, p) => sum + p.attributes.speed + p.attributes.agility, 0) / returners.length : 70
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
                    // Mayor impacto del teamwork en returns (requiere coordinación)
                    teamworkMultiplier = 1.0 + ((avgChemistry + teamworkScore - 140) / 1000);
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
     * Obtiene el rating de retorno/defensa específico de esta unidad
     */
    public getReturnerRating(): number {
        const attrs = this.getReturnerAttributes();
        const values = Object.values(attrs) as number[];
        return values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    }

    /**
     * Verifica si puede ejecutar un tipo específico de retorno/defensa
     */
    public canExecuteReturn(returnType: ReturnerTeamType): boolean {
        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const rushers = this.players.filter(p => ['DE', 'DT', 'OLB', 'ILB'].includes(p.position));

        switch (returnType) {
            case 'kickoff_return':
            case 'punt_return':
                return returners.length > 0;
            case 'field_goal_defense':
            case 'extra_point_defense':
                return rushers.length > 0;
            default:
                return false;
        }
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
     * Obtiene el mejor rusher para bloquear pateos
     */
    public getPrimaryRusher() {
        const rushers = this.players.filter(p => ['DE', 'DT', 'OLB', 'ILB'].includes(p.position));
        if (rushers.length === 0) return undefined;
        
        // Seleccionar el mejor rusher basado en speed + strength + agility
        return rushers.reduce((best, current) => {
            const bestScore = best.attributes.speed + best.attributes.strength + best.attributes.agility;
            const currentScore = current.attributes.speed + current.attributes.strength + current.attributes.agility;
            return currentScore > bestScore ? current : best;
        });
    }

    /**
     * Obtiene análisis específico de la unidad de retorno/defensa
     */
    public getReturnerAnalysis(): {
        returnerTeamType: ReturnerTeamType;
        primaryReturner?: string;
        primaryRusher?: string;
        returnerCount: number;
        blockerCount: number;
        rusherCount: number;
        returnerRating: number;
        strengths: string[];
        weaknesses: string[];
        specialThreat: boolean;
    } {
        const attrs = this.getReturnerAttributes();
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const primaryReturner = this.getPrimaryReturner();
        const primaryRusher = this.getPrimaryRusher();

        // Análisis específico por tipo de unidad
        if (this.returnerTeamType === 'kickoff_return') {
            if (attrs.returnExplosiveness > 80) strengths.push('Returner explosivo en kickoffs');
            if (attrs.ballSecurity > 80) strengths.push('Excelente seguridad del balón');
            if (attrs.blockingAbility > 80) strengths.push('Bloqueo sólido en returns');
            if (attrs.fieldVision > 80) strengths.push('Excelente visión de campo');
            if (attrs.returnCoordination > 80) strengths.push('Gran coordinación en returns');
            
            if (attrs.returnExplosiveness < 60) weaknesses.push('Returner lento');
            if (attrs.ballSecurity < 60) weaknesses.push('Propenso a fumbles');
            if (attrs.blockingAbility < 60) weaknesses.push('Bloqueo débil');
        } else if (this.returnerTeamType === 'punt_return') {
            if (attrs.returnExplosiveness > 80) strengths.push('Returner explosivo en punts');
            if (attrs.catchingAbility > 80) strengths.push('Excelente en catches bajo presión');
            if (attrs.puntRushAbility > 80) strengths.push('Presión efectiva al punter');
            if (attrs.fieldVision > 80) strengths.push('Gran visión para returns');
            
            if (attrs.catchingAbility < 60) weaknesses.push('Problemas atrapando punts');
            if (attrs.puntRushAbility < 60) weaknesses.push('Presión débil al punter');
        } else if (this.returnerTeamType === 'field_goal_defense' || this.returnerTeamType === 'extra_point_defense') {
            if (attrs.blockingAbility > 80) strengths.push('Excelente para bloquear pateos');
            if (attrs.jumpingAbility > 80) strengths.push('Gran capacidad atlética');
            if (attrs.penetrationSpeed > 80) strengths.push('Penetración rápida');
            if (attrs.rushCoordination > 80) strengths.push('Rush coordinado');
            if (attrs.returnThreat > 80) strengths.push('Amenaza de return en bloqueos');
            
            if (attrs.blockingAbility < 60) weaknesses.push('Dificultad para bloquear pateos');
            if (attrs.penetrationSpeed < 60) weaknesses.push('Rush lento');
        }

        const returners = this.players.filter(p => ['WR', 'RB', 'CB'].includes(p.position));
        const blockers = this.players.filter(p => !['K', 'P'].includes(p.position) && !returners.includes(p));
        const rushers = this.players.filter(p => ['DE', 'DT', 'OLB', 'ILB'].includes(p.position));

        // Determinar si hay amenaza especial
        const specialThreat = (primaryReturner && 
            (primaryReturner.attributes.speed + primaryReturner.attributes.agility) > 160) ||
            (primaryRusher && 
            (primaryRusher.attributes.speed + primaryRusher.attributes.strength) > 160);

        return {
            returnerTeamType: this.returnerTeamType,
            primaryReturner: primaryReturner?.name,
            primaryRusher: primaryRusher?.name,
            returnerCount: returners.length,
            blockerCount: blockers.length,
            rusherCount: rushers.length,
            returnerRating: this.getReturnerRating(),
            strengths,
            weaknesses,
            specialThreat: !!specialThreat
        };
    }

    /**
     * Calcula la probabilidad de éxito para un retorno o bloqueo
     */
    public calculateReturnSuccessProbability(opposingCoverage?: number): number {
        const attrs = this.getReturnerAttributes();
        let baseProbability = 15; // Probabilidad base de gran return/bloqueo

        if (this.returnerTeamType === 'kickoff_return' || this.returnerTeamType === 'punt_return') {
            // Probabilidad de return exitoso (20+ yardas)
            baseProbability = 25;
            const explosiveBonus = (attrs.returnExplosiveness - 70) / 3;
            const visionBonus = (attrs.fieldVision - 70) / 4;
            const blockingBonus = (attrs.blockingAbility - 70) / 5;
            
            baseProbability += explosiveBonus + visionBonus + blockingBonus;
            
            // Ajustar por cobertura rival
            if (opposingCoverage) {
                baseProbability -= (opposingCoverage - 70) / 3;
            }
        } else if (this.returnerTeamType === 'field_goal_defense' || this.returnerTeamType === 'extra_point_defense') {
            // Probabilidad de bloquear el pateo
            baseProbability = 8; // Bloqueos son raros
            const rushBonus = (attrs.blockingAbility - 70) / 2;
            const speedBonus = (attrs.penetrationSpeed - 70) / 3;
            const jumpBonus = (attrs.jumpingAbility - 70) / 4;
            
            baseProbability += rushBonus + speedBonus + jumpBonus;
        }

        return Math.max(1, Math.min(50, baseProbability));
    }

    /**
     * Calcula la probabilidad de turnover en returns
     */
    public calculateTurnoverRisk(): number {
        const attrs = this.getReturnerAttributes();
        let baseRisk = 8; // Riesgo base de fumble

        const securityBonus = (attrs.ballSecurity - 70) / 4;
        baseRisk -= securityBonus;

        return Math.max(1, Math.min(25, baseRisk));
    }
}