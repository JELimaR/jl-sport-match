// CoachingStaff - Gestión del equipo técnico completo
import {
    Coach, HeadCoach, OffensiveCoordinator, DefensiveCoordinator, SpecialTeamsCoordinator,
    CoachFactory, CoachType
} from "./Coach";

export interface CoachingStaffConfig {
    teamId: string;
    headCoach: HeadCoach;
    offensiveCoordinator: OffensiveCoordinator;
    defensiveCoordinator: DefensiveCoordinator;
    specialTeamsCoordinator: SpecialTeamsCoordinator;
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
     * Realiza ajustes de medio tiempo
     */
    public performHalftimeAdjustments(): {
        offensiveBonus: number;
        defensiveBonus: number;
        overallImprovement: number;
    } {
        const offensiveBonus = this.offensiveCoordinator.getHalftimeAdjustmentBonus();
        const defensiveBonus = this.defensiveCoordinator.getHalftimeAdjustmentBonus();

        // El HC puede amplificar los ajustes
        const hcMultiplier = this.headCoach.baseAttributes.adaptability / 100;
        const overallImprovement = (offensiveBonus + defensiveBonus) * hcMultiplier;

        // Mejorar confianza si los ajustes son buenos
        if (overallImprovement > 0) {
            this.adjustTeamConfidence(Math.min(10, overallImprovement));
        }

        return {
            offensiveBonus: offensiveBonus * hcMultiplier,
            defensiveBonus: defensiveBonus * hcMultiplier,
            overallImprovement
        };
    }

    /**
     * Toma una decisión de 4to down
     */
    public makeFourthDownDecision(
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number,
        scoreDifference: number
    ): {
        decision: 'go' | 'punt' | 'field_goal';
        confidence: number;
        reasoning: string;
    } {
        const shouldGo = this.headCoach.shouldGoForFourthDown(yardsToGo, fieldPosition, timeRemaining, scoreDifference);

        let decision: 'go' | 'punt' | 'field_goal';
        let reasoning: string;

        if (shouldGo) {
            decision = 'go';
            reasoning = `HC decidió ir por el 4to down (Agresividad: ${this.headCoach.attributes.fourthDownAggression})`;
        } else if (fieldPosition >= 33 && fieldPosition <= 55) {
            // Considerar fake punt
            const shouldFake = this.specialTeamsCoordinator.shouldFake('punt', fieldPosition, scoreDifference);
            if (shouldFake) {
                decision = 'go';
                reasoning = `STC decidió fake punt (Estrategia: ${this.specialTeamsCoordinator.attributes.fakeStrategy})`;
            } else {
                decision = 'punt';
                reasoning = 'Despeje convencional';
            }
        } else if (fieldPosition >= 65) {
            // Field goal solo desde yarda 65 en adelante (máximo 52 yardas)
            const fieldGoalDistance = 100 - fieldPosition + 17;
            if (fieldGoalDistance <= 55) { // Máximo 55 yardas
                const shouldFake = this.specialTeamsCoordinator.shouldFake('field_goal', fieldPosition, scoreDifference);
                if (shouldFake) {
                    decision = 'go';
                    reasoning = `STC decidió fake field goal (Estrategia: ${this.specialTeamsCoordinator.attributes.fakeStrategy})`;
                } else {
                    decision = 'field_goal';
                    reasoning = `Intento de field goal de ${fieldGoalDistance} yardas`;
                }
            } else {
                decision = 'punt';
                reasoning = `Field goal muy largo (${fieldGoalDistance} yardas) - mejor punt`;
            }
        } else {
            decision = 'punt';
            reasoning = 'Posición muy lejana para field goal';
        }

        const confidence = this.getOverallEffectiveness();

        return { decision, confidence, reasoning };
    }

    /**
     * Selecciona jugada ofensiva
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
            reasoning += ` (Zona Roja: ${this.offensiveCoordinator.attributes.redZoneEfficiency})`;
        }

        return { playType, confidence, reasoning };
    }

    /**
     * Selecciona esquema defensivo
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
     * Obtiene resumen del equipo técnico
     */
    public getStaffSummary(): string {
        const effectiveness = this.getOverallEffectiveness();
        return `Equipo Técnico - Efectividad: ${effectiveness.toFixed(1)}, ` +
            `Química: ${this.teamChemistry.toFixed(1)}, ` +
            `Confianza: ${this.gameplanConfidence.toFixed(1)}`;
    }

    /**
     * Obtiene análisis detallado de cada coach
     */
    public getDetailedAnalysis(): {
        coach: string;
        type: CoachType;
        effectiveness: number;
        keyStrengths: string[];
        keyWeaknesses: string[];
    }[] {
        return this.getAllCoaches().map(coach => {
            const effectiveness = coach.calculateEffectiveness();
            let keyStrengths: string[] = [];
            let keyWeaknesses: string[] = [];

            // Análisis específico por tipo
            switch (coach.type) {
                case 'HC':
                    const hc = coach as HeadCoach;
                    if (hc.attributes.fourthDownAggression > 75) keyStrengths.push('Muy agresivo en 4to down');
                    if (hc.attributes.timeoutManagement > 80) keyStrengths.push('Excelente gestión de timeouts');
                    if (hc.attributes.clutchCalling > 80) keyStrengths.push('Brillante en situaciones clutch');
                    if (hc.attributes.fourthDownAggression < 40) keyWeaknesses.push('Conservador en 4to down');
                    if (hc.attributes.challengeSuccess < 50) keyWeaknesses.push('Mal en challenges');
                    break;

                case 'OC':
                    const oc = coach as OffensiveCoordinator;
                    if (oc.attributes.redZoneEfficiency > 80) keyStrengths.push('Excelente en zona roja');
                    if (oc.attributes.schemeComplexity > 80) keyStrengths.push('Esquemas muy complejos');
                    if (oc.attributes.playActionEffectiveness > 80) keyStrengths.push('Maestro del play-action');
                    if (oc.attributes.creativityUnderPressure < 50) keyWeaknesses.push('Predecible bajo presión');
                    break;

                case 'DC':
                    const dc = coach as DefensiveCoordinator;
                    if (dc.attributes.blitzAggression > 80) keyStrengths.push('Muy agresivo con blitzes');
                    if (dc.attributes.turnoverFocus > 80) keyStrengths.push('Genera muchos turnovers');
                    if (dc.attributes.formationFlexibility > 80) keyStrengths.push('Muy flexible en formaciones');
                    if (dc.attributes.pressureCreativity < 50) keyWeaknesses.push('Presión predecible');
                    break;

                case 'STC':
                    const stc = coach as SpecialTeamsCoordinator;
                    if (stc.attributes.coverageScheme > 80) keyStrengths.push('Excelente cobertura');
                    if (stc.attributes.fakeStrategy > 60) keyStrengths.push('Arriesgado con fakes');
                    if (stc.attributes.onsideKickSuccess > 70) keyStrengths.push('Buen en onside kicks');
                    if (stc.attributes.coverageScheme < 50) keyWeaknesses.push('Cobertura débil');
                    break;
            }

            // Análisis de atributos base
            if (coach.baseAttributes.composure > 85) keyStrengths.push('Muy calmado bajo presión');
            if (coach.baseAttributes.adaptability > 85) keyStrengths.push('Se adapta rápidamente');
            if (coach.baseAttributes.composure < 50) keyWeaknesses.push('Se presiona fácilmente');
            if (coach.baseAttributes.experience < 5) keyWeaknesses.push('Falta de experiencia');

            return {
                coach: coach.name,
                type: coach.type,
                effectiveness,
                keyStrengths,
                keyWeaknesses
            };
        });
    }
}

// Factory para crear equipos técnicos completos
export class CoachingStaffFactory {
    /**
     * Crea un equipo técnico completo con coaches aleatorios
     */
    static createRandomStaff(teamId: string, experienceLevel: 'rookie' | 'veteran' | 'elite' = 'veteran'): CoachingStaff {
        let baseExperience: number;

        switch (experienceLevel) {
            case 'rookie':
                baseExperience = 2 + Math.random() * 5; // 2-7 años
                break;
            case 'veteran':
                baseExperience = 8 + Math.random() * 10; // 8-18 años
                break;
            case 'elite':
                baseExperience = 15 + Math.random() * 15; // 15-30 años
                break;
        }

        const headCoach = CoachFactory.createHeadCoach({
            id: `${teamId}-hc`,
            name: `HC ${teamId}`,
            age: 35 + Math.random() * 25,
            attributes: CoachFactory.generateRandomAttributes('HC', baseExperience)
        });

        const offensiveCoordinator = CoachFactory.createOffensiveCoordinator({
            id: `${teamId}-oc`,
            name: `OC ${teamId}`,
            age: 30 + Math.random() * 20,
            attributes: CoachFactory.generateRandomAttributes('OC', baseExperience - 2)
        });

        const defensiveCoordinator = CoachFactory.createDefensiveCoordinator({
            id: `${teamId}-dc`,
            name: `DC ${teamId}`,
            age: 30 + Math.random() * 20,
            attributes: CoachFactory.generateRandomAttributes('DC', baseExperience - 2)
        });

        const specialTeamsCoordinator = CoachFactory.createSpecialTeamsCoordinator({
            id: `${teamId}-stc`,
            name: `STC ${teamId}`,
            age: 28 + Math.random() * 15,
            attributes: CoachFactory.generateRandomAttributes('STC', baseExperience - 3)
        });

        return new CoachingStaff({
            teamId,
            headCoach,
            offensiveCoordinator,
            defensiveCoordinator,
            specialTeamsCoordinator
        });
    }

    /**
     * Crea un equipo técnico con filosofías específicas
     */
    static createStaffWithPhilosophy(
        teamId: string,
        philosophy: 'aggressive' | 'conservative' | 'balanced' | 'innovative'
    ): CoachingStaff {
        const baseExp = 10 + Math.random() * 8;

        let hcAttributes = CoachFactory.generateRandomAttributes('HC', baseExp) as any;
        let ocAttributes = CoachFactory.generateRandomAttributes('OC', baseExp - 2) as any;
        let dcAttributes = CoachFactory.generateRandomAttributes('DC', baseExp - 2) as any;
        let stcAttributes = CoachFactory.generateRandomAttributes('STC', baseExp - 3) as any;

        switch (philosophy) {
            case 'aggressive':
                hcAttributes.fourthDownAggression = 70 + Math.random() * 25;
                dcAttributes.blitzAggression = 70 + Math.random() * 25;
                stcAttributes.fakeStrategy = 40 + Math.random() * 30;
                break;

            case 'conservative':
                hcAttributes.fourthDownAggression = 20 + Math.random() * 30;
                hcAttributes.timeoutManagement = 70 + Math.random() * 25;
                dcAttributes.blitzAggression = 20 + Math.random() * 30;
                break;

            case 'innovative':
                ocAttributes.schemeComplexity = 75 + Math.random() * 20;
                ocAttributes.creativityUnderPressure = 70 + Math.random() * 25;
                dcAttributes.formationFlexibility = 75 + Math.random() * 20;
                break;

            case 'balanced':
                // Mantener valores aleatorios pero más centrados
                break;
        }

        const headCoach = CoachFactory.createHeadCoach({
            id: `${teamId}-hc`,
            name: `HC ${teamId}`,
            age: 40 + Math.random() * 20,
            attributes: hcAttributes
        });

        const offensiveCoordinator = CoachFactory.createOffensiveCoordinator({
            id: `${teamId}-oc`,
            name: `OC ${teamId}`,
            age: 35 + Math.random() * 15,
            attributes: ocAttributes
        });

        const defensiveCoordinator = CoachFactory.createDefensiveCoordinator({
            id: `${teamId}-dc`,
            name: `DC ${teamId}`,
            age: 35 + Math.random() * 15,
            attributes: dcAttributes
        });

        const specialTeamsCoordinator = CoachFactory.createSpecialTeamsCoordinator({
            id: `${teamId}-stc`,
            name: `STC ${teamId}`,
            age: 32 + Math.random() * 12,
            attributes: stcAttributes
        });

        return new CoachingStaff({
            teamId,
            headCoach,
            offensiveCoordinator,
            defensiveCoordinator,
            specialTeamsCoordinator
        });
    }
}

// Integración con sistema de Actions
import { RunningPlayAction, PassingPlayAction } from "../../core/Actions";
import { Player } from "../../core/Player";
import { TeamCamp } from "../units/TeamCamp";

/**
 * Extensiones del CoachingStaff para trabajar con Actions
 */
export interface CoachingStaffActionsExtensions {
    /**
     * Crea una acción ofensiva completa basada en la decisión del staff
     */
    createOffensiveAction(
        offense: TeamCamp,
        defense: TeamCamp,
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
            timeRemaining: number;
            scoreDifference: number;
        }
    ): {
        action: RunningPlayAction | PassingPlayAction;
        confidence: number;
        reasoning: string;
        staffDecision: {
            playType: 'run' | 'pass' | 'play_action';
            coordinator: string;
            headCoachApproval: boolean;
        };
    };

    /**
     * Crea ajustes defensivos coordinados
     */
    createDefensiveResponse(
        offense: TeamCamp,
        defense: TeamCamp,
        expectedOffensiveAction: 'run' | 'pass' | 'play_action',
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
        }
    ): {
        adjustments: any;
        confidence: number;
        reasoning: string;
        coordinatorDecision: string;
    };
}

declare module "./CoachingStaff" {
    interface CoachingStaff extends CoachingStaffActionsExtensions { }
}

CoachingStaff.prototype.createOffensiveAction = function (
    offense: TeamCamp,
    defense: TeamCamp,
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
        timeRemaining: number;
        scoreDifference: number;
    }
): {
    action: RunningPlayAction | PassingPlayAction;
    confidence: number;
    reasoning: string;
    staffDecision: {
        playType: 'run' | 'pass' | 'play_action';
        coordinator: string;
        headCoachApproval: boolean;
    };
} {
    // 1. Head Coach evalúa si es situación especial (4to down)
    let headCoachOverride = false;
    let playTypeDecision: 'run' | 'pass' | 'play_action';

    if (situation.down === 4) {
        const fourthDownDecision = this.makeFourthDownDecision(
            situation.yardsToGo,
            situation.fieldPosition,
            situation.timeRemaining,
            situation.scoreDifference
        );

        if (fourthDownDecision.decision === 'go') {
            headCoachOverride = true;
            // HC decide el tipo de jugada en 4to down
            playTypeDecision = situation.yardsToGo <= 2 ? 'run' : 'pass';
        } else {
            // Punt o FG - no crear action ofensiva normal
            throw new Error(`4to down decision: ${fourthDownDecision.decision} - No offensive action needed`);
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

    // 2. Crear la action específica usando el coordinador ofensivo
    let action: RunningPlayAction | PassingPlayAction;
    let coordinatorConfidence: number;

    if (playTypeDecision === 'run') {
        action = this.offensiveCoordinator.createRunningAction(offense, defense, situation);
        coordinatorConfidence = this.offensiveCoordinator.calculateEffectiveness();
    } else {
        // 'pass' o 'play_action' - ambos usan PassingPlayAction
        action = this.offensiveCoordinator.createPassingAction(offense, defense, situation);
        coordinatorConfidence = this.offensiveCoordinator.calculateEffectiveness();

        // Si es play_action, ajustar algunos parámetros
        if (playTypeDecision === 'play_action') {
            // Aumentar probabilidad de completar por el engaño
            if (action.actionType === 'passing') {
                const playActionBonus = this.offensiveCoordinator.attributes.playActionEffectiveness / 10;
                (action as PassingPlayAction).completionProbability = Math.min(95, (action as PassingPlayAction).completionProbability + playActionBonus);
            }
        }
    }

    // 3. Head Coach evalúa y puede ajustar la confianza
    const headCoachEffectiveness = this.headCoach.calculateEffectiveness();
    let headCoachApproval = true;
    let finalConfidence = coordinatorConfidence;

    // HC puede reducir confianza si no está de acuerdo con la decisión
    if (!headCoachOverride) {
        // Evaluar si HC está de acuerdo con la decisión del OC
        if (situation.down >= 3 && playTypeDecision === 'run' && this.headCoach.attributes.fourthDownAggression > 70) {
            // HC agresivo podría preferir pase en 3ra down
            finalConfidence *= 0.9;
            headCoachApproval = false;
        } else if (situation.timeRemaining < 120 && playTypeDecision === 'run' && situation.scoreDifference < 0) {
            // HC podría no estar de acuerdo con carrera cuando van perdiendo al final
            finalConfidence *= 0.85;
            headCoachApproval = false;
        }
    }

    // Bonus por química del equipo
    const chemistryBonus = (this.teamChemistry - 50) / 200; // -0.25 a +0.25
    finalConfidence = Math.min(100, finalConfidence * (1 + chemistryBonus));

    // 4. Generar razonamiento
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
        confidence: finalConfidence,
        reasoning,
        staffDecision: {
            playType: playTypeDecision,
            coordinator: headCoachOverride ? this.headCoach.name : this.offensiveCoordinator.name,
            headCoachApproval
        }
    };
};

CoachingStaff.prototype.createDefensiveResponse = function (
    offense: TeamCamp,
    defense: TeamCamp,
    expectedOffensiveAction: 'run' | 'pass' | 'play_action',
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
    }
): {
    adjustments: any;
    confidence: number;
    reasoning: string;
    coordinatorDecision: string;
} {
    // Coordinador Defensivo crea los ajustes
    const adjustments = this.defensiveCoordinator.createDefensiveAdjustments(
        offense,
        defense,
        expectedOffensiveAction,
        situation
    );

    const dcConfidence = this.defensiveCoordinator.calculateEffectiveness();

    // Head Coach puede influir en decisiones defensivas críticas
    let finalAdjustments = { ...adjustments };
    let headCoachInput = '';

    // HC puede ser más conservador o agresivo según su personalidad
    if (situation.fieldPosition >= 80) { // Zona roja
        if (this.headCoach.attributes.discipline > 80) {
            // HC disciplinado prefiere menos riesgo en zona roja
            if (finalAdjustments.blitzPackage && finalAdjustments.rushers > 5) {
                finalAdjustments.rushers = 5;
                finalAdjustments.adjustmentBonus -= 1;
                headCoachInput = ' - HC redujo agresividad en zona roja';
            }
        } else if (this.headCoach.attributes.clutchCalling > 80) {
            // HC clutch puede ser más agresivo en momentos críticos
            if (!finalAdjustments.blitzPackage && this.defensiveCoordinator.attributes.blitzAggression > 60) {
                finalAdjustments.blitzPackage = true;
                finalAdjustments.rushers = Math.max(5, finalAdjustments.rushers);
                finalAdjustments.adjustmentBonus += 2;
                headCoachInput = ' - HC ordenó presión clutch';
            }
        }
    }

    // Bonus por química del equipo
    const chemistryBonus = (this.teamChemistry - 50) / 100; // -0.5 a +0.5
    finalAdjustments.adjustmentBonus += chemistryBonus;

    const finalConfidence = Math.min(100, dcConfidence * (1 + chemistryBonus / 2));

    return {
        adjustments: finalAdjustments,
        confidence: finalConfidence,
        reasoning: adjustments.reasoning + headCoachInput,
        coordinatorDecision: this.defensiveCoordinator.name
    };
};