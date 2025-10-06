// OffensiveTeam - Especialización de TeamCamp para unidades ofensivas

import { TeamCamp, TeamCampConfig } from './TeamCamp';
import { Player } from '../../core/Player';
import { CoachingStaff } from '../coaches/CoachingStaff';
import { PlayerTeamworkProfile, CompleteTeamworkSystem } from '../TeamworkAttributes';

export interface OffensiveTeamConfig extends TeamCampConfig {
    unitType: 'offensive';
    coachingStaff?: CoachingStaff;
    teamworkProfiles?: PlayerTeamworkProfile[];
    teamworkSystem?: CompleteTeamworkSystem;
}

export class OffensiveTeam extends TeamCamp {
    public readonly coachingStaff?: CoachingStaff;
    public readonly teamworkProfiles?: PlayerTeamworkProfile[];
    public readonly teamworkSystem?: CompleteTeamworkSystem;

    constructor(config: OffensiveTeamConfig) {
        super(config);
        this.coachingStaff = config.coachingStaff;
        this.teamworkProfiles = config.teamworkProfiles;
        this.teamworkSystem = config.teamworkSystem;
    }

    /**
     * Calcula atributos ofensivos agregados basados en los jugadores en campo,
     * incluyendo efectos del coaching staff y trabajo en equipo
     */
    public getOffensiveAttributes() {
        const qb = this.getQuarterback();
        const ol = this.getOffensiveLine();
        const receivers = this.getReceivers();
        const rbs = this.getRunningBacks();

        // Calcular atributos base de los jugadores
        const basePowerRunBlocking = ol.length > 0 ?
            ol.reduce((sum, p) => sum + (p.attributes.strength + p.attributes.blocking) / 2, 0) / ol.length : 70;

        const baseZoneBlockingAgility = ol.length > 0 ?
            ol.reduce((sum, p) => sum + (p.attributes.agility + p.attributes.blocking) / 2, 0) / ol.length : 70;

        const basePassingAccuracy = qb ? (qb.attributes.throwing + qb.attributes.awareness) / 2 : 70;

        const baseReceiverSeparation = receivers.length > 0 ?
            receivers.reduce((sum, p) => sum + (p.attributes.speed + p.attributes.agility) / 2, 0) / receivers.length : 70;

        const skillPlayers = [...rbs, ...receivers];
        const baseBreakawayAbility = skillPlayers.length > 0 ?
            skillPlayers.reduce((sum, p) => sum + (p.attributes.speed + p.attributes.agility) / 2, 0) / skillPlayers.length : 70;

        const basePassProtectionAnchor = ol.length > 0 ?
            ol.reduce((sum, p) => sum + (p.attributes.strength + p.attributes.blocking) / 2, 0) / ol.length : 70;

        const baseThirdDownConversion = qb && receivers.length > 0 ?
            ((qb.attributes.awareness + qb.attributes.throwing) / 2 +
                receivers.reduce((sum, p) => sum + (p.attributes.catching + p.attributes.agility) / 2, 0) / receivers.length) / 2 : 70;

        const allOffensive = [qb, ...ol, ...receivers, ...rbs].filter(p => p !== undefined) as Player[];
        const baseRedZoneEfficiency = allOffensive.length > 0 ?
            allOffensive.reduce((sum, p) => sum + (p.attributes.composure + p.attributes.awareness) / 2, 0) / allOffensive.length : 70;

        // Aplicar efectos del coaching staff
        let coachingBonus = 0;
        if (this.coachingStaff) {
            const offensiveCoordinator = this.coachingStaff.offensiveCoordinator;
            if (offensiveCoordinator) {
                // Bonus basado en la experiencia y habilidades del coordinador ofensivo
                coachingBonus = (offensiveCoordinator.attributes.experience + offensiveCoordinator.attributes.leadership + offensiveCoordinator.attributes.intelligence) / 15; // 0-20 puntos

                // Bonus específicos por especialización
                // Bonus basado en tendencias del coordinador
                if (offensiveCoordinator.attributes.passingTendency > 40 && offensiveCoordinator.attributes.passingTendency < 60) {
                    coachingBonus += 2; // Bonus para coordinadores balanceados
                }
            }

            // Bonus del head coach
            const headCoach = this.coachingStaff.headCoach;
            if (headCoach) {
                coachingBonus += (headCoach.attributes.leadership + headCoach.attributes.intelligence) / 10; // 0-20 puntos adicionales
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
                // Calcular química ofensiva basada en las 5 C's
                const avgChemistry = relevantProfiles.reduce((sum, profile) =>
                    sum + (profile.fiveCs.communication + profile.fiveCs.coordination + profile.fiveCs.cooperation + profile.fiveCs.commitment + profile.fiveCs.confidence) / 5, 0) / relevantProfiles.length;

                // Aplicar efectos del sistema de trabajo en equipo
                const fiveCs = this.teamworkSystem.fiveCs;
                if (fiveCs) {
                    const teamworkScore = (fiveCs.communication + fiveCs.coordination + fiveCs.cooperation + fiveCs.commitment + fiveCs.confidence) / 5;
                    teamworkMultiplier = 1.0 + ((avgChemistry + teamworkScore - 140) / 1000); // -0.14 a +0.16 multiplicador
                }
            }
        }

        // Aplicar todos los modificadores
        const powerRunBlocking = Math.min(100, (basePowerRunBlocking + coachingBonus) * teamworkMultiplier);
        const zoneBlockingAgility = Math.min(100, (baseZoneBlockingAgility + coachingBonus) * teamworkMultiplier);
        const passingAccuracy = Math.min(100, (basePassingAccuracy + coachingBonus) * teamworkMultiplier);
        const receiverSeparation = Math.min(100, (baseReceiverSeparation + coachingBonus) * teamworkMultiplier);
        const breakawayAbility = Math.min(100, (baseBreakawayAbility + coachingBonus) * teamworkMultiplier);
        const passProtectionAnchor = Math.min(100, (basePassProtectionAnchor + coachingBonus) * teamworkMultiplier);
        const thirdDownConversion = Math.min(100, (baseThirdDownConversion + coachingBonus) * teamworkMultiplier);
        const redZoneEfficiency = Math.min(100, (baseRedZoneEfficiency + coachingBonus) * teamworkMultiplier);

        return {
            powerRunBlocking,
            zoneBlockingAgility,
            passingAccuracy,
            receiverSeparation,
            breakawayAbility,
            passProtectionAnchor,
            thirdDownConversion,
            redZoneEfficiency
        };
    }

    /**
     * Obtiene el rating ofensivo específico de esta unidad
     */
    public getOffensiveRating(): number {
        const attrs = this.getOffensiveAttributes();
        const values = Object.values(attrs);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Verifica si puede ejecutar un tipo específico de jugada ofensiva
     */
    public canExecuteOffensivePlay(playType: 'run' | 'pass' | 'play_action'): boolean {
        const qb = this.getQuarterback();
        const receivers = this.getReceivers();
        const rbs = this.getRunningBacks();
        const ol = this.getOffensiveLine();

        switch (playType) {
            case 'run':
                return (rbs.length > 0 || qb !== undefined) && ol.length >= 3;
            case 'pass':
                return qb !== undefined && receivers.length > 0 && ol.length >= 3;
            case 'play_action':
                return qb !== undefined && receivers.length > 0 && rbs.length > 0 && ol.length >= 3;
            default:
                return false;
        }
    }

    /**
     * Obtiene análisis específico de la unidad ofensiva
     */
    public getOffensiveAnalysis(): {
        formation: string;
        qbPresent: boolean;
        receiverCount: number;
        runningBackCount: number;
        offensiveLineCount: number;
        offensiveRating: number;
        strengths: string[];
        weaknesses: string[];
    } {
        const attrs = this.getOffensiveAttributes();
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Analizar fortalezas y debilidades
        if (attrs.powerRunBlocking > 80) strengths.push('Excelente bloqueo de carrera');
        if (attrs.passingAccuracy > 80) strengths.push('Alta precisión de pase');
        if (attrs.receiverSeparation > 80) strengths.push('Receivers explosivos');
        if (attrs.passProtectionAnchor > 80) strengths.push('Sólida protección de pase');

        if (attrs.powerRunBlocking < 60) weaknesses.push('Débil bloqueo de carrera');
        if (attrs.passingAccuracy < 60) weaknesses.push('Baja precisión de pase');
        if (attrs.receiverSeparation < 60) weaknesses.push('Receivers lentos');
        if (attrs.passProtectionAnchor < 60) weaknesses.push('Protección de pase vulnerable');

        return {
            formation: this.formation,
            qbPresent: this.getQuarterback() !== undefined,
            receiverCount: this.getReceivers().length,
            runningBackCount: this.getRunningBacks().length,
            offensiveLineCount: this.getOffensiveLine().length,
            offensiveRating: this.getOffensiveRating(),
            strengths,
            weaknesses
        };
    }
}