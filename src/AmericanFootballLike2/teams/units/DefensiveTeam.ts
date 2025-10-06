// DefensiveTeam - Especialización de TeamCamp para unidades defensivas

import { TeamCamp, TeamCampConfig } from './TeamCamp';
import { Player } from '../../core/Player';
import { CoachingStaff } from '../coaches/CoachingStaff';
import { PlayerTeamworkProfile, CompleteTeamworkSystem } from '../TeamworkAttributes';

export interface DefensiveTeamConfig extends TeamCampConfig {
    unitType: 'defensive';
    coachingStaff?: CoachingStaff;
    teamworkProfiles?: PlayerTeamworkProfile[];
    teamworkSystem?: CompleteTeamworkSystem;
}

export class DefensiveTeam extends TeamCamp {
    public readonly coachingStaff?: CoachingStaff;
    public readonly teamworkProfiles?: PlayerTeamworkProfile[];
    public readonly teamworkSystem?: CompleteTeamworkSystem;

    constructor(config: DefensiveTeamConfig) {
        super(config);
        this.coachingStaff = config.coachingStaff;
        this.teamworkProfiles = config.teamworkProfiles;
        this.teamworkSystem = config.teamworkSystem;
    }

    /**
     * Calcula atributos defensivos agregados basados en los jugadores en campo,
     * incluyendo efectos del coaching staff y trabajo en equipo
     */
    public getDefensiveAttributes() {
        const dl = this.getDefensiveLine();
        const lbs = this.getLinebackers();
        const dbs = this.getDefensiveBacks();

        // Calcular atributos base de los jugadores
        const frontSeven = [...dl, ...lbs];
        const baseRunFitDiscipline = frontSeven.length > 0 ? 
            frontSeven.reduce((sum, p) => sum + (p.attributes.tackling + p.attributes.awareness) / 2, 0) / frontSeven.length : 70;

        const baseTacklesForLoss = frontSeven.length > 0 ? 
            frontSeven.reduce((sum, p) => sum + (p.attributes.strength + p.attributes.tackling) / 2, 0) / frontSeven.length : 70;

        const coverage = [...lbs, ...dbs];
        const baseZoneCoverageCoordination = coverage.length > 0 ? 
            coverage.reduce((sum, p) => sum + (p.attributes.coverage + p.attributes.awareness) / 2, 0) / coverage.length : 70;

        const allDefensive = [...dl, ...lbs, ...dbs];
        const baseTurnoverGeneration = allDefensive.length > 0 ? 
            allDefensive.reduce((sum, p) => sum + (p.attributes.awareness + p.attributes.agility) / 2, 0) / allDefensive.length : 70;

        const baseFourManRushPressure = dl.length > 0 ? 
            dl.reduce((sum, p) => sum + (p.attributes.strength + p.attributes.speed) / 2, 0) / dl.length : 70;

        const cbs = dbs.filter(p => p.position === 'CB');
        const basePressManCoverage = cbs.length > 0 ? 
            cbs.reduce((sum, p) => sum + (p.attributes.coverage + p.attributes.speed) / 2, 0) / cbs.length : 70;

        const baseRedZoneDefense = allDefensive.length > 0 ? 
            allDefensive.reduce((sum, p) => sum + (p.attributes.tackling + p.attributes.strength) / 2, 0) / allDefensive.length : 70;

        // Aplicar efectos del coaching staff
        let coachingBonus = 0;
        if (this.coachingStaff) {
            const defensiveCoordinator = this.coachingStaff.defensiveCoordinator;
            if (defensiveCoordinator) {
                // Bonus basado en la experiencia y habilidades del coordinador defensivo
                coachingBonus = (defensiveCoordinator.attributes.experience + defensiveCoordinator.attributes.leadership + defensiveCoordinator.attributes.intelligence) / 15; // 0-20 puntos
                
                // Bonus basado en agresividad del coordinador
                if (defensiveCoordinator.attributes.blitzAggression > 70) {
                    // Coordinador agresivo - bonus para presión
                } else if (defensiveCoordinator.attributes.blitzAggression < 30) {
                    // Coordinador conservador - bonus para cobertura
                } else {
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
                // Calcular química defensiva basada en las 5 C's
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
        const runFitDiscipline = Math.min(100, (baseRunFitDiscipline + coachingBonus) * teamworkMultiplier);
        const tacklesForLoss = Math.min(100, (baseTacklesForLoss + coachingBonus) * teamworkMultiplier);
        const zoneCoverageCoordination = Math.min(100, (baseZoneCoverageCoordination + coachingBonus) * teamworkMultiplier);
        const turnoverGeneration = Math.min(100, (baseTurnoverGeneration + coachingBonus) * teamworkMultiplier);
        const fourManRushPressure = Math.min(100, (baseFourManRushPressure + coachingBonus) * teamworkMultiplier);
        const pressManCoverage = Math.min(100, (basePressManCoverage + coachingBonus) * teamworkMultiplier);
        const redZoneDefense = Math.min(100, (baseRedZoneDefense + coachingBonus) * teamworkMultiplier);

        return {
            runFitDiscipline,
            tacklesForLoss,
            zoneCoverageCoordination,
            turnoverGeneration,
            fourManRushPressure,
            pressManCoverage,
            redZoneDefense
        };
    }

    /**
     * Obtiene el rating defensivo específico de esta unidad
     */
    public getDefensiveRating(): number {
        const attrs = this.getDefensiveAttributes();
        const values = Object.values(attrs);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Verifica si puede ejecutar un esquema defensivo específico
     */
    public canExecuteDefensiveScheme(scheme: 'run_stop' | 'pass_coverage' | 'blitz' | 'prevent'): boolean {
        const dl = this.getDefensiveLine();
        const lbs = this.getLinebackers();
        const dbs = this.getDefensiveBacks();

        switch (scheme) {
            case 'run_stop':
                return dl.length >= 3 && lbs.length >= 2;
            case 'pass_coverage':
                return dbs.length >= 3 && lbs.length >= 1;
            case 'blitz':
                return lbs.length >= 2 || dbs.length >= 1;
            case 'prevent':
                return dbs.length >= 4;
            default:
                return false;
        }
    }

    /**
     * Obtiene análisis específico de la unidad defensiva
     */
    public getDefensiveAnalysis(): {
        formation: string;
        defensiveLineCount: number;
        linebackerCount: number;
        defensiveBackCount: number;
        defensiveRating: number;
        strengths: string[];
        weaknesses: string[];
    } {
        const attrs = this.getDefensiveAttributes();
        const strengths: string[] = [];
        const weaknesses: string[] = [];

        // Analizar fortalezas y debilidades
        if (attrs.runFitDiscipline > 80) strengths.push('Excelente disciplina contra carrera');
        if (attrs.tacklesForLoss > 80) strengths.push('Alta presión defensiva');
        if (attrs.zoneCoverageCoordination > 80) strengths.push('Cobertura de zona sólida');
        if (attrs.turnoverGeneration > 80) strengths.push('Generación de turnovers');
        if (attrs.fourManRushPressure > 80) strengths.push('Presión de 4 hombres efectiva');

        if (attrs.runFitDiscipline < 60) weaknesses.push('Débil contra carrera');
        if (attrs.tacklesForLoss < 60) weaknesses.push('Poca presión defensiva');
        if (attrs.zoneCoverageCoordination < 60) weaknesses.push('Cobertura vulnerable');
        if (attrs.turnoverGeneration < 60) weaknesses.push('Pocos turnovers forzados');
        if (attrs.fourManRushPressure < 60) weaknesses.push('Presión de pase insuficiente');

        return {
            formation: this.formation,
            defensiveLineCount: this.getDefensiveLine().length,
            linebackerCount: this.getLinebackers().length,
            defensiveBackCount: this.getDefensiveBacks().length,
            defensiveRating: this.getDefensiveRating(),
            strengths,
            weaknesses
        };
    }
}