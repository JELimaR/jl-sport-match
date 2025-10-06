// CoachingStaff - Gestión del equipo técnico completo (Versión Limpia)
import {
    Coach, HeadCoach, OffensiveCoordinator, DefensiveCoordinator, SpecialTeamsCoordinator,
    CoachFactory, CoachType
} from "./Coach";

// Crear CoachingStaffFactory con métodos de compatibilidad
export class CoachingStaffFactory {
    static createRandomStaff(teamId: string, experienceLevel: string): CoachingStaff {
        const experience = experienceLevel === 'elite' ? 20 : experienceLevel === 'veteran' ? 15 : 5;
        
        const headCoach = CoachFactory.createHeadCoach({
            id: `${teamId}_hc`,
            name: 'Head Coach',
            age: 45 + Math.floor(Math.random() * 15),
            attributes: CoachFactory.generateRandomAttributes('HC', experience)
        });
        
        const offensiveCoordinator = CoachFactory.createOffensiveCoordinator({
            id: `${teamId}_oc`,
            name: 'Offensive Coordinator',
            age: 40 + Math.floor(Math.random() * 15),
            attributes: CoachFactory.generateRandomAttributes('OC', experience)
        });
        
        const defensiveCoordinator = CoachFactory.createDefensiveCoordinator({
            id: `${teamId}_dc`,
            name: 'Defensive Coordinator',
            age: 40 + Math.floor(Math.random() * 15),
            attributes: CoachFactory.generateRandomAttributes('DC', experience)
        });
        
        const specialTeamsCoordinator = CoachFactory.createSpecialTeamsCoordinator({
            id: `${teamId}_stc`,
            name: 'Special Teams Coordinator',
            age: 35 + Math.floor(Math.random() * 15),
            attributes: CoachFactory.generateRandomAttributes('STC', experience)
        });

        return new CoachingStaff({
            teamId,
            headCoach,
            offensiveCoordinator,
            defensiveCoordinator,
            specialTeamsCoordinator
        });
    }

    static createStaffWithPhilosophy(teamId: string, philosophy: string): CoachingStaff {
        // Simplificado - usar experiencia 'veteran' por defecto
        return this.createRandomStaff(teamId, 'veteran');
    }
}
import { RunningPlayAction, PassingPlayAction } from '../../core/Actions';
import { TeamCamp } from '../units/TeamCamp';

export interface CoachingStaffConfig {
    teamId: string;
    headCoach: HeadCoach;
    offensiveCoordinator: OffensiveCoordinator;
    defensiveCoordinator: DefensiveCoordinator;
    specialTeamsCoordinator: SpecialTeamsCoordinator;
}

/**
 * Interfaz para decisiones ofensivas completas
 */
export interface OffensiveDecision {
    action: RunningPlayAction | PassingPlayAction;
    formation: string;
    personnel: string;
    confidence: number;
    reasoning: string;
    staffDecision: {
        playType: 'run' | 'pass' | 'play_action';
        coordinator: string;
        headCoachApproval: boolean;
    };
}

/**
 * Interfaz para respuestas defensivas completas
 */
export interface DefensiveResponse {
    formation: string;
    coverage: string;
    adjustments: string[];
    confidence: number;
    reasoning: string;
    coordinatorDecision: string;
}

export class CoachingStaff {
    public readonly teamId: string;
    public readonly headCoach: HeadCoach;
    public readonly offensiveCoordinator: OffensiveCoordinator;
    public readonly defensiveCoordinator: DefensiveCoordinator;
    public readonly specialTeamsCoordinator: SpecialTeamsCoordinator;

    // Estado del equipo técnico
    public teamChemistry: number = 75;        // Química entre coaches (0-100)
    public gameplanConfidence: number = 75;   // Confianza en el plan de juego (0-100)

    constructor(config: CoachingStaffConfig) {
        this.teamId = config.teamId;
        this.headCoach = config.headCoach;
        this.offensiveCoordinator = config.offensiveCoordinator;
        this.defensiveCoordinator = config.defensiveCoordinator;
        this.specialTeamsCoordinator = config.specialTeamsCoordinator;

        this.calculateTeamChemistry();
    }

    /**
     * Calcula la química entre los coaches
     */
    private calculateTeamChemistry(): void {
        const coaches = [this.headCoach, this.offensiveCoordinator, this.defensiveCoordinator, this.specialTeamsCoordinator];

        // Promedio de liderazgo y adaptabilidad
        const avgLeadership = coaches.reduce((sum, coach) => sum + coach.baseAttributes.leadership, 0) / coaches.length;
        const avgAdaptability = coaches.reduce((sum, coach) => sum + coach.baseAttributes.adaptability, 0) / coaches.length;

        // Diferencia de experiencia (menos diferencia = mejor química)
        const experiences = coaches.map(coach => coach.baseAttributes.experience);
        const maxExp = Math.max(...experiences);
        const minExp = Math.min(...experiences);
        const experienceGap = maxExp - minExp;
        const experienceBonus = Math.max(0, 20 - experienceGap); // Bonus si la diferencia es pequeña

        this.teamChemistry = Math.min(100, (avgLeadership + avgAdaptability) / 2 + experienceBonus);
    }

    /**
     * Toma decisión de 4to down
     */
    public makeFourthDownDecision(
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number,
        scoreDifference: number
    ): {
        decision: 'punt' | 'field_goal' | 'go';
        confidence: number;
        reasoning: string;
    } {
        let decision: 'punt' | 'field_goal' | 'go' = 'punt';
        let reasoning = '';

        // Lógica de decisión basada en posición de campo
        if (fieldPosition >= 65 && fieldPosition <= 95) {
            decision = 'field_goal';
            reasoning = 'Posición favorable para field goal';
        } else if (yardsToGo <= 2 && this.headCoach.attributes.fourthDownAggression > 60) {
            decision = 'go';
            reasoning = 'Yardas cortas y HC agresivo';
        } else if (timeRemaining < 120 && scoreDifference < 0) {
            decision = 'go';
            reasoning = 'Situación desesperada - necesitamos puntos';
        } else {
            decision = 'punt';
            reasoning = 'Posición muy lejana para field goal';
        }

        const confidence = this.getOverallEffectiveness();

        return { decision, confidence, reasoning };
    }

    /**
     * Selecciona jugada ofensiva (método simplificado)
     */
    public selectOffensivePlay(
        down: number,
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number
    ): {
        playType: 'run' | 'pass' | 'play_action';
        confidence: number;
        reasoning: string;
    } {
        const playType = this.offensiveCoordinator.selectPlayType(down, yardsToGo, fieldPosition, timeRemaining);
        const confidence = this.offensiveCoordinator.calculateEffectiveness();

        let reasoning = `OC seleccionó ${playType}`;
        if (fieldPosition < 20) {
            reasoning += ` en zona roja (Eficiencia ZR: ${this.offensiveCoordinator.attributes.redZoneEfficiency})`;
        }

        return { playType, confidence, reasoning };
    }

    /**
     * Crea una decisión ofensiva completa basada en el staff técnico
     */
    public createOffensiveDecision(
        offense: TeamCamp,
        defense: TeamCamp,
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
            timeRemaining: number;
            scoreDifference: number;
        }
    ): OffensiveDecision {
        // 1. Head Coach evalúa si es situación especial (4to down)
        let headCoachOverride = false;
        let playTypeDecision: 'run' | 'pass' | 'play_action';
        let coordinator = 'OC';

        if (situation.down === 4) {
            const fourthDownDecision = this.makeFourthDownDecision(
                situation.yardsToGo,
                situation.fieldPosition,
                situation.timeRemaining,
                situation.scoreDifference
            );

            if (fourthDownDecision.decision === 'go') {
                headCoachOverride = true;
                coordinator = 'HC';
                // HC decide el tipo de jugada en 4to down
                playTypeDecision = situation.yardsToGo <= 2 ? 'run' : 'pass';
            } else {
                // Punt o FG - crear una acción simple para evitar errores
                playTypeDecision = 'run';
            }
        } else {
            // Coordinador Ofensivo toma la decisión normal
            const ocDecision = this.selectOffensivePlay(
                situation.down,
                situation.yardsToGo,
                situation.fieldPosition,
                situation.timeRemaining
            );
            playTypeDecision = ocDecision.playType;
        }

        // 2. Determinar formación y personal basándose en la decisión
        let formation = 'shotgun';
        let personnel = '11';

        if (playTypeDecision === 'run') {
            if (situation.yardsToGo <= 2) {
                formation = 'i_formation';
                personnel = '21'; // 2 RB, 1 TE
            } else if (situation.fieldPosition >= 80) {
                formation = 'goal_line';
                personnel = '22'; // 2 RB, 2 TE
            } else {
                formation = 'singleback';
                personnel = '11';
            }
        } else if (playTypeDecision === 'pass') {
            if (situation.yardsToGo >= 10) {
                formation = 'shotgun';
                personnel = '10'; // 1 RB, 0 TE, 4 WR
            } else if (situation.fieldPosition >= 80) {
                formation = 'red_zone';
                personnel = '12'; // 1 RB, 2 TE
            } else {
                formation = 'shotgun';
                personnel = '11';
            }
        }

        // 3. Crear la acción específica
        const action = this.createSpecificAction(playTypeDecision, situation);

        // 4. Calcular confianza final
        const coordinatorConfidence = headCoachOverride ?
            this.headCoach.calculateEffectiveness() :
            this.offensiveCoordinator.calculateEffectiveness();

        let finalConfidence = coordinatorConfidence;
        let headCoachApproval = true;

        // HC puede reducir confianza si no está de acuerdo
        if (!headCoachOverride) {
            if (situation.down >= 3 && playTypeDecision === 'run' && this.headCoach.attributes.fourthDownAggression > 70) {
                finalConfidence *= 0.9;
                headCoachApproval = false;
            } else if (situation.timeRemaining < 120 && playTypeDecision === 'run' && situation.scoreDifference < 0) {
                finalConfidence *= 0.85;
                headCoachApproval = false;
            }
        }

        // Bonus por química del equipo
        const chemistryBonus = (this.teamChemistry - 50) / 200;
        finalConfidence = Math.min(100, finalConfidence * (1 + chemistryBonus));

        // 5. Generar razonamiento
        let reasoning = '';
        if (headCoachOverride) {
            reasoning = `HC tomó control en 4to down - ${playTypeDecision} (Agresividad: ${this.headCoach.attributes.fourthDownAggression})`;
        } else {
            reasoning = `OC seleccionó ${playTypeDecision}`;
            if (situation.fieldPosition <= 20) {
                reasoning += ` en zona roja (Eficiencia ZR: ${this.offensiveCoordinator.attributes.redZoneEfficiency})`;
            }
            if (!headCoachApproval) {
                reasoning += ` - HC parcialmente en desacuerdo`;
            }
        }

        return {
            action,
            formation,
            personnel,
            confidence: finalConfidence,
            reasoning,
            staffDecision: {
                playType: playTypeDecision,
                coordinator,
                headCoachApproval
            }
        };
    }

    /**
     * Crea una respuesta defensiva completa
     */
    public createDefensiveResponse(
        offense: TeamCamp,
        defense: TeamCamp,
        expectedOffensiveAction: 'run' | 'pass' | 'play_action',
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
        }
    ): DefensiveResponse {
        // 1. Coordinador defensivo decide la formación base
        let formation = '4-3';
        let coverage = 'cover_2';
        let adjustments: string[] = ['standard_alignment'];

        if (expectedOffensiveAction === 'run') {
            if (situation.yardsToGo <= 2) {
                formation = 'goal_line';
                coverage = 'cover_0';
                adjustments = ['run_stuff', 'gap_control'];
            } else {
                formation = '4-3';
                coverage = 'cover_1';
                adjustments = ['run_fit'];
            }
        } else if (expectedOffensiveAction === 'pass') {
            if (situation.yardsToGo >= 10) {
                formation = 'nickel';
                coverage = 'cover_3';
                adjustments = ['pass_rush', 'deep_coverage'];
            } else if (situation.fieldPosition >= 80) {
                formation = 'goal_line';
                coverage = 'cover_0';
                adjustments = ['red_zone_defense'];
            } else {
                formation = 'nickel';
                coverage = 'cover_2';
                adjustments = ['balanced_coverage'];
            }
        }

        // 2. Aplicar personalidad del coordinador defensivo
        if (this.defensiveCoordinator.attributes.blitzAggression > 70) {
            adjustments.push('aggressive_rush');
            if (situation.down >= 3) {
                adjustments.push('blitz_package');
            }
        }

        // 3. Head Coach puede influir
        let coordinatorDecision = `DC: ${formation} + ${coverage}`;
        if (this.headCoach.attributes.discipline > 80 && situation.fieldPosition >= 80) {
            // HC disciplinado es más conservador en zona roja
            if (adjustments.includes('blitz_package')) {
                adjustments = adjustments.filter(adj => adj !== 'blitz_package');
                adjustments.push('disciplined_coverage');
                coordinatorDecision += ' (HC redujo agresividad)';
            }
        }

        const confidence = this.defensiveCoordinator.calculateEffectiveness();
        const reasoning = `Esquema defensivo estándar`;

        return {
            formation,
            coverage,
            adjustments,
            confidence,
            reasoning,
            coordinatorDecision
        };
    }

    /**
     * Crea una acción específica basándose en el tipo de jugada
     */
    private createSpecificAction(playType: 'run' | 'pass' | 'play_action', situation: any): RunningPlayAction | PassingPlayAction {
        if (playType === 'run') {
            return {
                actionType: 'running',
                playType: situation.yardsToGo <= 2 ? 'power' : 'outside_zone',
                direction: 'center',
                gap: 'A',
                purpose: situation.yardsToGo <= 2 ? 'short_yardage' : 'control_clock',
                riskLevel: 'low',
                expectedYards: Math.min(situation.yardsToGo + 2, 8),
                teamStrength: 75
            };
        } else {
            return {
                actionType: 'passing',
                playType: situation.yardsToGo >= 10 ? 'dig' : 'slant',
                routeDepth: situation.yardsToGo >= 10 ? 12 : 6,
                routeComplexity: situation.yardsToGo >= 10 ? 'intermediate' : 'simple',
                expectedYards: Math.min(situation.yardsToGo + 3, 12),
                riskLevel: situation.down >= 3 ? 'medium' : 'low',
                purpose: 'move_chains',
                completionProbability: 75,
                teamPassingStrength: 75
            };
        }
    }

    /**
     * Obtiene todos los coaches
     */
    public getAllCoaches(): Coach[] {
        return [this.headCoach, this.offensiveCoordinator, this.defensiveCoordinator, this.specialTeamsCoordinator];
    }

    /**
     * Obtiene un coach por tipo
     */
    public getCoach(type: CoachType): Coach {
        switch (type) {
            case 'HC': return this.headCoach;
            case 'OC': return this.offensiveCoordinator;
            case 'DC': return this.defensiveCoordinator;
            case 'STC': return this.specialTeamsCoordinator;
            default: throw new Error(`Tipo de coach no válido: ${type}`);
        }
    }

    /**
     * Calcula la efectividad general del equipo técnico
     */
    public getOverallEffectiveness(): number {
        const coaches = this.getAllCoaches();
        const avgEffectiveness = coaches.reduce((sum, coach) => sum + coach.calculateEffectiveness(), 0) / coaches.length;

        // Bonus por química del equipo
        const chemistryBonus = (this.teamChemistry - 50) / 5; // -10 a +10

        return Math.min(100, avgEffectiveness + chemistryBonus);
    }

    /**
     * Ajusta la presión de todo el equipo técnico
     */
    public adjustTeamPressure(amount: number): void {
        this.getAllCoaches().forEach(coach => coach.adjustPressure(amount));
    }

    /**
     * Ajusta la confianza de todo el equipo técnico
     */
    public adjustTeamConfidence(amount: number): void {
        this.getAllCoaches().forEach(coach => coach.adjustConfidence(amount));
        this.gameplanConfidence = Math.max(0, Math.min(100, this.gameplanConfidence + amount));
    }

    /**
     * Selecciona esquema defensivo (método de compatibilidad)
     */
    public selectDefensiveScheme(
        down: number,
        yardsToGo: number,
        fieldPosition: number
    ): {
        blitz: boolean;
        coverage: 'man' | 'zone';
        confidence: number;
        reasoning: string;
    } {
        const blitz = this.defensiveCoordinator.shouldBlitz(down, yardsToGo, fieldPosition);
        const coverage = this.defensiveCoordinator.selectCoverage();
        const confidence = this.defensiveCoordinator.calculateEffectiveness();

        const reasoning = `DC: ${blitz ? 'Blitz' : 'Rush normal'} + Cobertura ${coverage} ` +
            `(Agresividad: ${this.defensiveCoordinator.attributes.blitzAggression})`;

        return { blitz, coverage, confidence, reasoning };
    }

    /**
     * Realiza ajustes de medio tiempo (método de compatibilidad)
     */
    public performHalftimeAdjustments(): {
        offensiveAdjustments: string[];
        defensiveAdjustments: string[];
        confidence: number;
        reasoning: string;
        overallImprovement: number;
    } {
        const offensiveAdjustments = ['tempo_adjustment', 'formation_mix'];
        const defensiveAdjustments = ['coverage_adjustment', 'pressure_mix'];
        const confidence = this.getOverallEffectiveness();
        const reasoning = 'Ajustes estándar de medio tiempo';
        const overallImprovement = (confidence - 50) / 10; // 0-5 basado en efectividad

        return {
            offensiveAdjustments,
            defensiveAdjustments,
            confidence,
            reasoning,
            overallImprovement
        };
    }

    /**
     * Obtiene resumen del equipo técnico
     */
    public getStaffSummary(): string {
        const effectiveness = this.getOverallEffectiveness();
        return `Equipo Técnico - Efectividad: ${effectiveness.toFixed(1)}, ` +
            `Química: ${this.teamChemistry.toFixed(1)}, ` +
            `Confianza: ${this.gameplanConfidence.toFixed(1)}`;
    }
}