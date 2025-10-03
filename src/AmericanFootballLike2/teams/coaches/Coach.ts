// Coach - Sistema de entrenadores y su influencia en el partido
// Basado en la documentación: Coaches y su influencia en el partido

export type CoachType = 'HC' | 'OC' | 'DC' | 'STC';

// Atributos base para todos los coaches
export interface BaseCoachAttributes {
    experience: number;        // Años de experiencia (0-40)
    leadership: number;        // Liderazgo y presencia (0-100)
    adaptability: number;      // Capacidad de ajuste (0-100)
    intelligence: number;      // IQ futbolístico (0-100)
    composure: number;         // Calma bajo presión (0-100)
}

// Atributos específicos del Head Coach (HC)
export interface HeadCoachAttributes extends BaseCoachAttributes {
    // Gestión del partido
    fourthDownAggression: number;    // Agresividad en 4to Down (0-100)
    timeoutManagement: number;       // Gestión de timeouts (0-100)
    challengeSuccess: number;        // Tasa de éxito en desafíos (0-100)
    clutchCalling: number;          // Llamado en situaciones clutch (0-100)

    // Cultura del equipo
    discipline: number;              // Control de penalizaciones (0-100)
    motivation: number;              // Motivación e inspiración (0-100)
}

// Atributos específicos del Coordinador Ofensivo (OC)
export interface OffensiveCoordinatorAttributes extends BaseCoachAttributes {
    // Filosofía y esquema
    passingTendency: number;         // Tendencia al pase vs carrera (0-100, 50=balanceado)
    schemeComplexity: number;        // Complejidad del esquema (0-100)
    playActionEffectiveness: number; // Efectividad de play-action (0-100)

    // Situaciones específicas
    redZoneEfficiency: number;       // Gestión de zona roja (0-100)
    halftimeAdjustments: number;     // Ajustes de medio tiempo (0-100)
    creativityUnderPressure: number; // Creatividad bajo presión (0-100)
}

// Atributos específicos del Coordinador Defensivo (DC)
export interface DefensiveCoordinatorAttributes extends BaseCoachAttributes {
    // Filosofía defensiva
    blitzAggression: number;         // Agresividad de blitz (0-100)
    coveragePreference: number;      // Preferencia cobertura (0=Zona, 100=Hombre)
    turnoverFocus: number;          // Enfoque en turnovers (0-100)

    // Adaptabilidad
    formationFlexibility: number;    // Uso de formaciones Nickel/Dime (0-100)
    halftimeAdjustments: number;     // Ajustes de medio tiempo (0-100)
    pressureCreativity: number;      // Creatividad en presión (0-100)
}

// Atributos específicos del Coordinador de Equipos Especiales (STC)
export interface SpecialTeamsCoordinatorAttributes extends BaseCoachAttributes {
    // Estrategia de riesgo
    fakeStrategy: number;            // Tendencia a fakes (0-100)
    coverageScheme: number;          // Efectividad de cobertura (0-100)

    // Situaciones específicas
    puntStrategy: number;            // Estrategia de despeje (0-100)
    onsideKickSuccess: number;       // Éxito en onside kicks (0-100)
    fieldPositionAwareness: number;  // Conciencia de posición de campo (0-100)
}

// Configuración para crear un coach
export interface CoachConfig {
    id: string;
    name: string;
    type: CoachType;
    age: number;
    attributes: HeadCoachAttributes | OffensiveCoordinatorAttributes | DefensiveCoordinatorAttributes | SpecialTeamsCoordinatorAttributes;
}

// Clase base para todos los coaches
export abstract class Coach {
    public readonly id: string;
    public readonly name: string;
    public readonly type: CoachType;
    public readonly age: number;
    public readonly baseAttributes: BaseCoachAttributes;

    // Estado dinámico
    public confidence: number = 75;      // Confianza actual (0-100)
    public pressure: number = 0;         // Presión del momento (0-100)

    constructor(config: CoachConfig) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.age = config.age;

        // Extraer atributos base
        this.baseAttributes = {
            experience: config.attributes.experience,
            leadership: config.attributes.leadership,
            adaptability: config.attributes.adaptability,
            intelligence: config.attributes.intelligence,
            composure: config.attributes.composure
        };

        this.validateAttributes();
    }

    /**
     * Valida que los atributos estén en rangos válidos
     */
    protected validateAttributes(): void {
        const attrs = Object.values(this.baseAttributes);
        if (attrs.some(attr => attr < 0 || attr > 100)) {
            throw new Error(`Atributos de coach fuera de rango válido (0-100): ${this.name}`);
        }
    }

    /**
     * Calcula la efectividad del coach en una situación específica
     */
    public calculateEffectiveness(situationPressure: number = 0): number {
        const basePressure = this.pressure + situationPressure;
        const pressureEffect = Math.max(0, 100 - basePressure) / 100;

        const baseEffectiveness = (
            this.baseAttributes.experience * 0.3 +
            this.baseAttributes.intelligence * 0.25 +
            this.baseAttributes.composure * 0.25 +
            this.baseAttributes.leadership * 0.2
        );

        return Math.min(100, baseEffectiveness * pressureEffect * (this.confidence / 100));
    }

    /**
     * Obtiene información resumida del coach
     */
    public getCoachSummary(): string {
        return `${this.name} (${this.type}) - ` +
            `Edad: ${this.age}, ` +
            `Experiencia: ${this.baseAttributes.experience} años, ` +
            `Efectividad: ${this.calculateEffectiveness().toFixed(1)}`;
    }

    /**
     * Ajusta la presión del coach
     */
    public adjustPressure(amount: number): void {
        this.pressure = Math.max(0, Math.min(100, this.pressure + amount));
    }

    /**
     * Ajusta la confianza del coach
     */
    public adjustConfidence(amount: number): void {
        this.confidence = Math.max(0, Math.min(100, this.confidence + amount));
    }
}

// Head Coach - Gestión general del equipo
export class HeadCoach extends Coach {
    public readonly attributes: HeadCoachAttributes;

    constructor(config: CoachConfig & { attributes: HeadCoachAttributes }) {
        super(config);
        this.attributes = config.attributes;
    }

    /**
     * Decide si ir por el 4to down basado en situación
     */
    public shouldGoForFourthDown(
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number,
        scoreDifference: number
    ): boolean {
        let baseAggression = this.attributes.fourthDownAggression;

        // Ajustes situacionales
        if (yardsToGo <= 2) baseAggression += 20;
        if (fieldPosition >= 35 && fieldPosition <= 45) baseAggression += 15; // Territorio neutral
        if (timeRemaining < 120 && scoreDifference < 0) baseAggression += 25; // Perdiendo al final
        if (scoreDifference > 14) baseAggression -= 20; // Ganando cómodamente

        const effectiveness = this.calculateEffectiveness();
        const finalDecision = (baseAggression * effectiveness / 100) + (Math.random() * 20 - 10);

        return finalDecision > 60;
    }

    /**
     * Gestiona el uso de timeouts
     */
    public shouldUseTimeout(
        timeoutsRemaining: number,
        timeRemaining: number,
        situation: 'clock_management' | 'stop_momentum' | 'confusion'
    ): boolean {
        if (timeoutsRemaining === 0) return false;

        let useTimeout = this.attributes.timeoutManagement;

        switch (situation) {
            case 'clock_management':
                if (timeRemaining < 120) useTimeout += 30;
                break;
            case 'stop_momentum':
                useTimeout += 20;
                break;
            case 'confusion':
                useTimeout += 15;
                break;
        }

        const effectiveness = this.calculateEffectiveness();
        return (useTimeout * effectiveness / 100) > 70;
    }

    /**
     * Decide si hacer un challenge
     */
    public shouldChallenge(confidenceInCall: number): boolean {
        const challengeThreshold = 100 - this.attributes.challengeSuccess;
        return confidenceInCall > challengeThreshold;
    }
}

// Coordinador Ofensivo
export class OffensiveCoordinator extends Coach {
    public readonly attributes: OffensiveCoordinatorAttributes;

    constructor(config: CoachConfig & { attributes: OffensiveCoordinatorAttributes }) {
        super(config);
        this.attributes = config.attributes;
    }

    /**
     * Determina el tipo de jugada basado en situación
     */
    public selectPlayType(
        down: number,
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number
    ): 'run' | 'pass' | 'play_action' {
        let passLikelihood = this.attributes.passingTendency;

        // Ajustes situacionales
        if (down === 3 && yardsToGo > 7) passLikelihood += 30;
        if (down === 1) passLikelihood -= 20;
        if (timeRemaining < 120) passLikelihood += 25;
        if (fieldPosition < 20) passLikelihood -= 15; // Zona roja

        // Considerar play-action
        if (down === 1 && this.attributes.playActionEffectiveness > 75) {
            if (Math.random() * 100 < this.attributes.playActionEffectiveness / 3) {
                return 'play_action';
            }
        }

        const effectiveness = this.calculateEffectiveness();
        const finalPassLikelihood = passLikelihood * effectiveness / 100;

        return Math.random() * 100 < finalPassLikelihood ? 'pass' : 'run';
    }

    /**
     * Calcula bonus de efectividad en zona roja
     */
    public getRedZoneBonus(): number {
        return (this.attributes.redZoneEfficiency - 50) / 5; // -10 a +10 bonus
    }

    /**
     * Calcula ajustes de medio tiempo
     */
    public getHalftimeAdjustmentBonus(): number {
        return (this.attributes.halftimeAdjustments - 50) / 5; // -10 a +10 bonus
    }
}

// Coordinador Defensivo
export class DefensiveCoordinator extends Coach {
    public readonly attributes: DefensiveCoordinatorAttributes;

    constructor(config: CoachConfig & { attributes: DefensiveCoordinatorAttributes }) {
        super(config);
        this.attributes = config.attributes;
    }

    /**
     * Decide si enviar blitz
     */
    public shouldBlitz(
        down: number,
        yardsToGo: number,
        fieldPosition: number
    ): boolean {
        let blitzLikelihood = this.attributes.blitzAggression;

        // Ajustes situacionales
        if (down === 3 && yardsToGo > 7) blitzLikelihood += 25;
        if (fieldPosition < 30) blitzLikelihood += 20; // Cerca de zona roja
        if (down === 1) blitzLikelihood -= 15;

        const effectiveness = this.calculateEffectiveness();
        const finalBlitzLikelihood = blitzLikelihood * effectiveness / 100;

        return Math.random() * 100 < finalBlitzLikelihood;
    }

    /**
     * Selecciona tipo de cobertura
     */
    public selectCoverage(): 'man' | 'zone' {
        const manLikelihood = this.attributes.coveragePreference;
        return Math.random() * 100 < manLikelihood ? 'man' : 'zone';
    }

    /**
     * Calcula bonus de generación de turnovers
     */
    public getTurnoverBonus(): number {
        return (this.attributes.turnoverFocus - 50) / 5; // -10 a +10 bonus
    }

    /**
     * Calcula ajustes de medio tiempo
     */
    public getHalftimeAdjustmentBonus(): number {
        return (this.attributes.halftimeAdjustments - 50) / 5; // -10 a +10 bonus
    }
}

// Coordinador de Equipos Especiales
export class SpecialTeamsCoordinator extends Coach {
    public readonly attributes: SpecialTeamsCoordinatorAttributes;

    constructor(config: CoachConfig & { attributes: SpecialTeamsCoordinatorAttributes }) {
        super(config);
        this.attributes = config.attributes;
    }

    /**
     * Decide si hacer un fake punt/FG
     */
    public shouldFake(
        situation: 'punt' | 'field_goal',
        fieldPosition: number,
        scoreDifference: number
    ): boolean {
        let fakeLikelihood = this.attributes.fakeStrategy;

        // Ajustes situacionales
        if (Math.abs(scoreDifference) > 14) fakeLikelihood += 15; // Situación desesperada
        if (fieldPosition >= 35 && fieldPosition <= 45) fakeLikelihood += 10; // Territorio neutral
        if (situation === 'field_goal' && fieldPosition > 35) fakeLikelihood -= 20; // FG largo

        const effectiveness = this.calculateEffectiveness();
        const finalFakeLikelihood = fakeLikelihood * effectiveness / 100;

        return Math.random() * 100 < finalFakeLikelihood;
    }

    /**
     * Calcula efectividad de cobertura
     */
    public getCoverageBonus(): number {
        return (this.attributes.coverageScheme - 50) / 5; // -10 a +10 bonus
    }
}

// Factory para crear coaches
export class CoachFactory {
    static createHeadCoach(config: Omit<CoachConfig, 'type'> & { attributes: HeadCoachAttributes }): HeadCoach {
        return new HeadCoach({ ...config, type: 'HC' });
    }

    static createOffensiveCoordinator(config: Omit<CoachConfig, 'type'> & { attributes: OffensiveCoordinatorAttributes }): OffensiveCoordinator {
        return new OffensiveCoordinator({ ...config, type: 'OC' });
    }

    static createDefensiveCoordinator(config: Omit<CoachConfig, 'type'> & { attributes: DefensiveCoordinatorAttributes }): DefensiveCoordinator {
        return new DefensiveCoordinator({ ...config, type: 'DC' });
    }

    static createSpecialTeamsCoordinator(config: Omit<CoachConfig, 'type'> & { attributes: SpecialTeamsCoordinatorAttributes }): SpecialTeamsCoordinator {
        return new SpecialTeamsCoordinator({ ...config, type: 'STC' });
    }

    /**
     * Genera atributos aleatorios para un tipo de coach
     */
    static generateRandomAttributes(type: CoachType, experience: number = 10): any {
        const baseAttributes = {
            experience,
            leadership: 50 + Math.random() * 40,
            adaptability: 50 + Math.random() * 40,
            intelligence: 50 + Math.random() * 40,
            composure: 50 + Math.random() * 40
        };

        switch (type) {
            case 'HC':
                return {
                    ...baseAttributes,
                    fourthDownAggression: 30 + Math.random() * 50,
                    timeoutManagement: 50 + Math.random() * 40,
                    challengeSuccess: 40 + Math.random() * 40,
                    clutchCalling: 50 + Math.random() * 40,
                    discipline: 50 + Math.random() * 40,
                    motivation: 50 + Math.random() * 40
                } as HeadCoachAttributes;

            case 'OC':
                return {
                    ...baseAttributes,
                    passingTendency: 30 + Math.random() * 40,
                    schemeComplexity: 40 + Math.random() * 50,
                    playActionEffectiveness: 40 + Math.random() * 50,
                    redZoneEfficiency: 50 + Math.random() * 40,
                    halftimeAdjustments: 50 + Math.random() * 40,
                    creativityUnderPressure: 50 + Math.random() * 40
                } as OffensiveCoordinatorAttributes;

            case 'DC':
                return {
                    ...baseAttributes,
                    blitzAggression: 30 + Math.random() * 50,
                    coveragePreference: 20 + Math.random() * 60,
                    turnoverFocus: 40 + Math.random() * 50,
                    formationFlexibility: 50 + Math.random() * 40,
                    halftimeAdjustments: 50 + Math.random() * 40,
                    pressureCreativity: 50 + Math.random() * 40
                } as DefensiveCoordinatorAttributes;

            case 'STC':
                return {
                    ...baseAttributes,
                    fakeStrategy: 10 + Math.random() * 30,
                    coverageScheme: 50 + Math.random() * 40,
                    puntStrategy: 50 + Math.random() * 40,
                    onsideKickSuccess: 30 + Math.random() * 40,
                    fieldPositionAwareness: 50 + Math.random() * 40
                } as SpecialTeamsCoordinatorAttributes;

            default:
                throw new Error(`Tipo de coach no válido: ${type}`);
        }
    }
}

// Integración con sistema de Actions
import { RunningPlayAction, PassingPlayAction } from "../../core/Actions";
import { Player } from "../../core/Player";
import { TeamCamp } from "../units/TeamCamp";

// Extensiones para OffensiveCoordinator
export interface OffensiveCoordinatorExtensions {
    /**
     * Crea una acción de carrera basada en la filosofía del coordinador
     */
    createRunningAction(
        offense: TeamCamp, 
        defense: TeamCamp, 
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
            timeRemaining: number;
        }
    ): RunningPlayAction;

    /**
     * Crea una acción de pase basada en la filosofía del coordinador
     */
    createPassingAction(
        offense: TeamCamp, 
        defense: TeamCamp, 
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
            timeRemaining: number;
        }
    ): PassingPlayAction;
}

// Implementación de extensiones para OffensiveCoordinator
declare module "./Coach" {
    interface OffensiveCoordinator extends OffensiveCoordinatorExtensions {}
}

OffensiveCoordinator.prototype.createRunningAction = function(
    offense: TeamCamp, 
    defense: TeamCamp, 
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
        timeRemaining: number;
    }
): RunningPlayAction {
    // Calcular fuerza del equipo basada en atributos de equipo
    const offensiveTeam = situation.down >= 3 ? offense.getSpecificRating() : offense.getSpecificRating();
    const teamStrength = Math.min(100, offensiveTeam + (this.baseAttributes.intelligence / 2));

    // Determinar tipo de carrera basado en filosofía del coordinador
    let playType: 'power' | 'sweep' | 'inside_zone' | 'outside_zone' | 'draw';
    let direction: 'left' | 'right' | 'center';
    let gap: 'A' | 'B' | 'C' | 'D';

    // Filosofía del coordinador influye en la selección
    const complexity = this.attributes.schemeComplexity;
    const redZoneBonus = situation.fieldPosition <= 20 ? this.attributes.redZoneEfficiency : 50;

    if (situation.yardsToGo <= 2) {
        // Situación de yardas cortas - preferir power
        playType = complexity > 70 ? 'power' : 'inside_zone';
        direction = 'center';
        gap = 'A';
    } else if (situation.yardsToGo >= 8) {
        // Yardas largas - jugadas más creativas
        if (complexity > 75 && this.attributes.creativityUnderPressure > 70) {
            playType = 'sweep';
            direction = Math.random() > 0.5 ? 'left' : 'right';
            gap = 'C';
        } else {
            playType = 'outside_zone';
            direction = Math.random() > 0.5 ? 'left' : 'right';
            gap = 'B';
        }
    } else {
        // Situación estándar
        playType = 'inside_zone';
        direction = 'center';
        gap = 'B';
    }

    // Determinar propósito basado en situación
    let purpose: 'control_clock' | 'wear_down_defense' | 'exploit_speed' | 'short_yardage' | 'goal_line';
    if (situation.down >= 3) {
        purpose = 'short_yardage';
    } else if (situation.timeRemaining < 300 && situation.down === 1) {
        purpose = 'control_clock';
    } else if (situation.yardsToGo <= 2) {
        purpose = 'short_yardage';
    } else if (situation.fieldPosition >= 95) {
        purpose = 'goal_line';
    } else {
        purpose = 'exploit_speed';
    }

    // Calcular yardas esperadas basado en atributos del coordinador
    let expectedYards = 4; // Base
    if (redZoneBonus > 70) expectedYards += 1;
    if (this.attributes.halftimeAdjustments > 75) expectedYards += 0.5;
    if (playType === 'sweep' && complexity > 80) expectedYards += 1;

    return {
        actionType: 'running',
        playType,
        direction,
        gap,
        purpose,
        riskLevel: complexity > 75 ? 'medium' : 'low',
        expectedYards: Math.round(expectedYards),
        teamStrength
    } as RunningPlayAction;
};

OffensiveCoordinator.prototype.createPassingAction = function(
    offense: TeamCamp, 
    defense: TeamCamp, 
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
        timeRemaining: number;
    }
): PassingPlayAction {
    // Calcular fuerza de pase del equipo
    const offensiveTeam = offense.getSpecificRating();
    const teamPassingStrength = Math.min(100, offensiveTeam + (this.baseAttributes.intelligence / 2));

    // Determinar tipo de pase basado en filosofía y situación
    let playType: 'slant' | 'hitch' | 'comeback' | 'post' | 'go' | 'dig' | 'curl' | 'fade';
    let routeDepth: number;
    let routeComplexity: 'simple' | 'intermediate' | 'complex';

    const complexity = this.attributes.schemeComplexity;

    if (situation.yardsToGo <= 3) {
        // Yardas cortas - rutas rápidas
        playType = complexity > 70 ? 'slant' : 'hitch';
        routeDepth = situation.yardsToGo + 2;
        routeComplexity = 'simple';
    } else if (situation.yardsToGo >= 10) {
        // Yardas largas - rutas profundas
        if (this.attributes.creativityUnderPressure > 75) {
            playType = 'post';
            routeDepth = situation.yardsToGo + 3;
            routeComplexity = 'complex';
        } else {
            playType = 'comeback';
            routeDepth = situation.yardsToGo + 1;
            routeComplexity = 'intermediate';
        }
    } else {
        // Situación intermedia
        playType = 'dig';
        routeDepth = situation.yardsToGo + 2;
        routeComplexity = complexity > 75 ? 'complex' : 'intermediate';
    }

    // Determinar propósito
    let purpose: 'neutralize_blitz' | 'explosive_gain' | 'move_chains' | 'exploit_coverage' | 'clock_management';
    if (situation.down >= 3) {
        purpose = 'move_chains';
    } else if (situation.timeRemaining < 300) {
        purpose = 'clock_management';
    } else if (situation.yardsToGo >= 15) {
        purpose = 'explosive_gain';
    } else {
        purpose = 'exploit_coverage';
    }

    // Calcular probabilidad de completar basado en atributos
    let completionProbability = 65; // Base
    
    // Ajustes por atributos del coordinador
    if (this.attributes.redZoneEfficiency > 75 && situation.fieldPosition >= 80) {
        completionProbability += 10;
    }
    if (this.attributes.creativityUnderPressure > 80 && situation.down >= 3) {
        completionProbability += 8;
    }
    if (complexity > 80) {
        completionProbability += 5; // Esquemas complejos son más efectivos
    }

    // Ajustes por situación
    if (situation.yardsToGo <= 3) completionProbability += 15; // Pases cortos más seguros
    if (situation.yardsToGo >= 15) completionProbability -= 10; // Pases largos más difíciles
    if (situation.down >= 3) completionProbability -= 5; // Presión defensiva

    // Determinar nivel de riesgo
    let riskLevel: 'low' | 'medium' | 'high';
    if (situation.yardsToGo <= 3) {
        riskLevel = 'low';
    } else if (situation.yardsToGo >= 12 || situation.down >= 3) {
        riskLevel = 'high';
    } else {
        riskLevel = 'medium';
    }

    return {
        actionType: 'passing',
        playType,
        routeDepth,
        routeComplexity,
        purpose,
        riskLevel,
        expectedYards: Math.max(situation.yardsToGo, routeDepth),
        completionProbability: Math.max(30, Math.min(90, completionProbability)),
        teamPassingStrength
    } as PassingPlayAction;
};

// Extensiones para DefensiveCoordinator
export interface DefensiveCoordinatorExtensions {
    /**
     * Crea ajustes defensivos basados en la acción ofensiva esperada
     */
    createDefensiveAdjustments(
        offense: TeamCamp,
        defense: TeamCamp,
        expectedOffensiveAction: 'run' | 'pass' | 'play_action',
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
        }
    ): {
        blitzPackage: boolean;
        coverageType: 'man' | 'zone';
        rushers: number;
        adjustmentBonus: number;
        reasoning: string;
    };
}

declare module "./Coach" {
    interface DefensiveCoordinator extends DefensiveCoordinatorExtensions {}
}

DefensiveCoordinator.prototype.createDefensiveAdjustments = function(
    offense: TeamCamp,
    defense: TeamCamp,
    expectedOffensiveAction: 'run' | 'pass' | 'play_action',
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
    }
): {
    blitzPackage: boolean;
    coverageType: 'man' | 'zone';
    rushers: number;
    adjustmentBonus: number;
    reasoning: string;
} {
    let blitzPackage = false;
    let coverageType: 'man' | 'zone' = 'zone';
    let rushers = 4; // Base rush
    let adjustmentBonus = 0;
    let reasoning = '';

    // Decisión de blitz basada en atributos y situación
    const blitzAggression = this.attributes.blitzAggression;
    const turnoverFocus = this.attributes.turnoverFocus;
    
    if (expectedOffensiveAction === 'pass') {
        // Contra pase - considerar blitz más agresivamente
        if (situation.down >= 3 && situation.yardsToGo >= 7) {
            if (blitzAggression > 70) {
                blitzPackage = true;
                rushers = 5 + (blitzAggression > 85 ? 1 : 0);
                reasoning = 'Blitz agresivo en 3ra y larga';
                adjustmentBonus += 3;
            }
        }
        
        // Cobertura basada en preferencia
        coverageType = this.attributes.coveragePreference > 50 ? 'man' : 'zone';
        
        if (turnoverFocus > 75) {
            adjustmentBonus += 2;
            reasoning += ' + Enfoque en turnovers';
        }
        
    } else if (expectedOffensiveAction === 'run') {
        // Contra carrera - menos blitz, más disciplina
        if (blitzAggression > 80 && situation.yardsToGo <= 2) {
            blitzPackage = true;
            rushers = 5;
            reasoning = 'Blitz de penetración contra carrera corta';
            adjustmentBonus += 2;
        }
        
        coverageType = 'zone'; // Más seguro contra carrera
        
    } else { // play_action
        // Contra play-action - balance
        if (this.attributes.formationFlexibility > 75) {
            // Coordinador flexible puede ajustarse mejor
            adjustmentBonus += 3;
            reasoning = 'Ajuste flexible contra play-action';
        }
        
        coverageType = this.attributes.coveragePreference > 60 ? 'man' : 'zone';
    }

    // Ajustes por posición de campo
    if (situation.fieldPosition >= 80) {
        // Zona roja - más agresivo
        if (blitzAggression > 60) {
            blitzPackage = true;
            rushers = Math.max(rushers, 5);
            adjustmentBonus += 2;
            reasoning += ' + Presión en zona roja';
        }
    }

    // Bonus por creatividad bajo presión
    if (this.attributes.pressureCreativity > 75) {
        adjustmentBonus += 1;
        reasoning += ' + Presión creativa';
    }

    return {
        blitzPackage,
        coverageType,
        rushers,
        adjustmentBonus,
        reasoning: reasoning || 'Esquema defensivo estándar'
    };
};