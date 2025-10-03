// Player - Representa un jugador de fútbol americano
// Basado en la documentación: jugadores con posiciones específicas y atributos
// ACTUALIZADO: Integra sistema completo de evaluación de posiciones

import { Position, PositionEvaluation, PlayerEvaluation, PositionRatings } from "../Positions/PositionTypes";
import { PositionEvaluator } from "../Positions/PositionEvaluator";

export interface PlayerAttributes {
    // Atributos físicos básicos
    height: number;        // Altura en cm
    weight: number;        // Peso en kg
    strength: number;      // Fuerza física (0-100)
    speed: number;         // Velocidad (0-100)
    agility: number;       // Agilidad (0-100)
    stamina: number;       // Resistencia (0-100)

    // Habilidades técnicas
    catching: number;      // Capacidad de recepción (0-100)
    throwing: number;      // Precisión de pase (0-100)
    blocking: number;      // Habilidad de bloqueo (0-100)
    tackling: number;      // Habilidad de tacleo (0-100)
    coverage: number;      // Cobertura defensiva (0-100)

    // Atributos mentales
    awareness: number;     // Conciencia del juego (0-100)
    intelligence: number;  // Inteligencia táctica (0-100)
    leadership: number;    // Liderazgo (0-100)
    composure: number;     // Compostura bajo presión (0-100)

    // Habilidades especializadas
    kickAccuracy: number;  // Precisión de pateo (0-100)
    kickPower: number;     // Potencia de pateo (0-100)
}

// Experiencia del jugador en diferentes posiciones
export interface PositionExperience {
    position: Position;
    yearsPlayed: number;        // Años jugando en esta posición
    gamesPlayed: number;        // Juegos jugados en esta posición
    snapsPlayed: number;        // Snaps totales en esta posición
    performanceHistory: number; // Rating promedio histórico (0-100)
    development: number;        // Nivel de desarrollo/entrenamiento (0-100)
}

export interface PlayerConfig {
    id: string;
    name: string;
    position: Position;  // Posición principal actual
    attributes: PlayerAttributes;
    jerseyNumber?: number;
    experience?: PositionExperience[]; // Experiencia en diferentes posiciones
    age?: number;                      // Edad del jugador
}

export class Player {
    public readonly id: string;
    public readonly name: string;
    public readonly position: Position;  // Posición principal actual
    public readonly attributes: PlayerAttributes;
    public readonly jerseyNumber: number;
    public readonly age: number;

    // Experiencia por posición
    public positionExperience: Map<Position, PositionExperience>;

    // Estado dinámico del jugador
    public energy: number = 100;        // Energía actual (0-100)
    public confidence: number = 75;     // Confianza (0-100)
    public injuryStatus: 'healthy' | 'minor' | 'major' = 'healthy';

    // Evaluación completa del jugador (calculada automáticamente)
    public playerEvaluation: PlayerEvaluation;

    // Evaluación legacy para compatibilidad
    public positionEvaluation: PositionEvaluation;

    // Estadísticas del partido actual
    public gameStats: {
        playsParticipated: number;
        yardsGained: number;
        touchdowns: number;
        tackles: number;
        interceptions: number;
        fumbles: number;
    };

    constructor(config: PlayerConfig) {
        this.id = config.id;
        this.name = config.name;
        this.position = config.position;
        this.attributes = config.attributes;
        this.jerseyNumber = config.jerseyNumber || Math.floor(Math.random() * 99) + 1;
        this.age = config.age || 22; // Edad por defecto de rookie

        // Inicializar experiencia por posición
        this.positionExperience = new Map();
        if (config.experience) {
            config.experience.forEach(exp => {
                this.positionExperience.set(exp.position, exp);
            });
        }

        // Si no tiene experiencia en su posición principal, crear una básica
        if (!this.positionExperience.has(this.position)) {
            this.positionExperience.set(this.position, {
                position: this.position,
                yearsPlayed: 1,
                gamesPlayed: 16,
                snapsPlayed: 500,
                performanceHistory: 65,
                development: 70
            });
        }

        // Evaluar automáticamente al jugador (potencial basado en atributos)
        this.playerEvaluation = PositionEvaluator.evaluatePlayerComplete(this.attributes, this.positionExperience);

        // Mantener evaluación legacy para compatibilidad
        this.positionEvaluation = PositionEvaluator.evaluatePlayerAtPosition(
            this.attributes,
            this.position
        );

        // Inicializar estadísticas del juego
        this.gameStats = {
            playsParticipated: 0,
            yardsGained: 0,
            touchdowns: 0,
            tackles: 0,
            interceptions: 0,
            fumbles: 0
        };

        this.validateAttributes();
    }

    /**
     * Valida que los atributos estén en rangos válidos
     */
    private validateAttributes(): void {
        // Validar atributos físicos especiales (peso y altura)
        if (this.attributes.height <= 0) {
            throw new Error(`Altura inválida para ${this.name}. Debe ser positiva y mayor a 100 cm (actual: ${this.attributes.height})`);
        }

        if (this.attributes.weight <= 0) {
            throw new Error(`Peso inválido para ${this.name}. Debe ser positivo y mayor a 100 (actual: ${this.attributes.weight})`);
        }

        // Validar otros atributos (0-100)
        const standardAttributes = {
            strength: this.attributes.strength,
            speed: this.attributes.speed,
            agility: this.attributes.agility,
            stamina: this.attributes.stamina,
            catching: this.attributes.catching,
            throwing: this.attributes.throwing,
            blocking: this.attributes.blocking,
            tackling: this.attributes.tackling,
            coverage: this.attributes.coverage,
            awareness: this.attributes.awareness,
            intelligence: this.attributes.intelligence,
            leadership: this.attributes.leadership,
            composure: this.attributes.composure,
            kickAccuracy: this.attributes.kickAccuracy,
            kickPower: this.attributes.kickPower
        };

        const invalidAttrs = Object.entries(standardAttributes).filter(([name, value]) => value < 0 || value > 100);

        if (invalidAttrs.length > 0) {
            const invalidList = invalidAttrs.map(([name, value]) => `${name}: ${value}`).join(', ');
            throw new Error(`Atributos inválidos para ${this.name}. Deben estar entre 0-100: ${invalidList}`);
        }
    }

    /**
     * Obtiene un atributo específico ajustado por el estado actual
     */
    public getEffectiveAttribute(attributeName: keyof PlayerAttributes): number {
        const baseValue = this.attributes[attributeName];

        // Factores que afectan el rendimiento
        const energyFactor = this.energy / 100;
        const confidenceFactor = this.confidence / 100;
        const injuryPenalty = this.getInjuryPenalty();

        return baseValue * energyFactor * confidenceFactor * (1 - injuryPenalty);
    }

    /**
     * Obtiene la penalización por lesión
     */
    private getInjuryPenalty(): number {
        switch (this.injuryStatus) {
            case 'healthy': return 0;
            case 'minor': return 0.1;   // 10% de penalización
            case 'major': return 0.3;   // 30% de penalización
            default: return 0;
        }
    }

    /**
     * Calcula el rating general del jugador
     */
    public getOverallRating(): number {
        const positionWeights = this.getPositionWeights();
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [attr, weight] of Object.entries(positionWeights)) {
            const attrValue = this.getEffectiveAttribute(attr as keyof PlayerAttributes);
            weightedSum += attrValue * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Obtiene los pesos de atributos según la posición del jugador
     */
    private getPositionWeights(): Record<string, number> {
        switch (this.position) {
            case 'QB': // Quarterback
                return {
                    throwing: 3.0,
                    awareness: 2.5,
                    intelligence: 2.0,
                    leadership: 2.0,
                    composure: 2.0,
                    agility: 1.5
                };

            case 'RB': // Running Back
                return {
                    speed: 2.5,
                    agility: 2.5,
                    strength: 2.0,
                    catching: 1.5,
                    awareness: 1.5
                };

            case 'WR': // Wide Receiver
                return {
                    catching: 3.0,
                    speed: 2.5,
                    agility: 2.0,
                    awareness: 1.5
                };

            case 'TE': // Tight End
                return {
                    catching: 2.0,
                    blocking: 2.0,
                    strength: 2.0,
                    awareness: 1.5
                };

            case 'G': // Offensive Line
                return {
                    blocking: 3.0,
                    strength: 2.5,
                    awareness: 2.0,
                    intelligence: 1.5
                };

            case 'DE': // Defensive End
            case 'DT': // Defensive Tackle
            case 'NT': // Nose Tackle
                return {
                    strength: 2.5,
                    tackling: 2.5,
                    awareness: 2.0,
                    agility: 1.5
                };

            case 'OLB': // Outside Linebacker
            case 'ILB': // Inside Linebacker
                return {
                    tackling: 2.5,
                    coverage: 2.0,
                    strength: 2.0,
                    speed: 2.0,
                    awareness: 2.0
                };

            case 'CB': // Cornerback
                return {
                    coverage: 3.0,
                    speed: 2.5,
                    agility: 2.0,
                    awareness: 2.0
                };

            case 'SS': // Strong Safety
            case 'FS': // Free Safety
                return {
                    coverage: 2.5,
                    tackling: 2.0,
                    awareness: 2.5,
                    speed: 2.0
                };

            case 'K': // Kicker
                return {
                    kickAccuracy: 3.0,
                    kickPower: 2.5,
                    composure: 2.0
                };

            default:
                // Peso uniforme para posiciones no definidas
                return {
                    strength: 1, speed: 1, agility: 1, stamina: 1,
                    catching: 1, throwing: 1, blocking: 1, tackling: 1,
                    coverage: 1, awareness: 1, intelligence: 1, leadership: 1,
                    composure: 1, kickAccuracy: 1, kickPower: 1
                };
        }
    }

    /**
     * Aplica fatiga al jugador
     */
    public applyFatigue(amount: number): void {
        this.energy = Math.max(0, this.energy - amount);
    }

    /**
     * Permite al jugador descansar y recuperar energía
     */
    public rest(amount: number): void {
        this.energy = Math.min(100, this.energy + amount);
    }

    /**
     * Actualiza la confianza del jugador
     */
    public updateConfidence(change: number): void {
        this.confidence = Math.max(0, Math.min(100, this.confidence + change));
    }

    /**
     * Registra participación en una jugada
     */
    public recordPlayParticipation(): void {
        this.gameStats.playsParticipated++;
    }

    /**
     * Obtiene información resumida del jugador
     */
    public getPlayerSummary(): string {
        return `#${this.jerseyNumber} ${this.name} (${this.position}) - ` +
            `Rating: ${this.playerEvaluation.primaryRating.toFixed(1)}, ` +
            `Tipo: ${this.playerEvaluation.primaryType}, ` +
            `Versatilidad: ${this.playerEvaluation.versatility.score.toFixed(0)}, ` +
            `Energía: ${this.energy.toFixed(0)}%`;
    }

    /**
     * Obtiene el rating para una posición y tipo específicos
     */
    public getRatingForType(position: Position, type: string): number | null {
        const positionRatings = this.playerEvaluation.positionRatings[position as keyof PositionRatings];
        if (!positionRatings) return null;

        const typeRating = (positionRatings as any)[type];
        return typeRating && 'rating' in typeRating ? typeRating.rating : null;
    }

    /**
     * Obtiene todos los ratings para una posición
     */
    public getAllRatingsForPosition(position: Position): Record<string, number> {
        const positionRatings = this.playerEvaluation.positionRatings[position as keyof PositionRatings];
        if (!positionRatings) return {};

        const ratings: Record<string, number> = {};
        Object.entries(positionRatings).forEach(([type, rating]) => {
            if (rating && 'rating' in rating) {
                ratings[type] = rating.rating;
            }
        });

        return ratings;
    }

    /**
     * Obtiene las mejores posiciones donde puede jugar
     */
    public getViablePositions(): { position: Position; bestType: string; rating: number; confidence: number }[] {
        return this.playerEvaluation.viablePositions;
    }

    /**
     * Verifica si puede jugar una posición con competencia
     */
    public canPlayPosition(position: Position, minRating: number = 60): boolean {
        const ratings = this.getAllRatingsForPosition(position);
        return Object.values(ratings).some(rating => rating >= minRating);
    }

    /**
     * Obtiene el mejor tipo para una posición específica
     */
    public getBestTypeForPosition(position: Position): { type: string; rating: number } | null {
        const ratings = this.getAllRatingsForPosition(position);
        if (Object.keys(ratings).length === 0) return null;

        let bestType = '';
        let bestRating = 0;

        Object.entries(ratings).forEach(([type, rating]) => {
            if (rating > bestRating) {
                bestType = type;
                bestRating = rating;
            }
        });

        return { type: bestType, rating: bestRating };
    }

    /**
     * Obtiene análisis de versatilidad
     */
    public getVersatilityAnalysis(): {
        score: number;
        multiPositional: boolean;
        specialistLevel: number;
        viablePositionsCount: number;
    } {
        return {
            ...this.playerEvaluation.versatility,
            viablePositionsCount: this.playerEvaluation.viablePositions.length
        };
    }

    /**
     * Obtiene perfil físico
     */
    public getPhysicalProfile() {
        return this.playerEvaluation.physicalProfile;
    }

    /**
     * Obtiene el rating POTENCIAL (basado solo en atributos) para una posición y tipo
     */
    public getPotentialRatingForType(position: Position, type: string): number | null {
        const positionRatings = this.playerEvaluation.positionRatings[position as keyof PositionRatings];
        if (!positionRatings) return null;

        const typeRating = (positionRatings as any)[type];
        return typeRating && 'potentialRating' in typeRating ? typeRating.potentialRating : null;
    }

    /**
     * Obtiene el rating REAL (potencial + experiencia) para una posición y tipo
     */
    public getActualRatingForType(position: Position, type: string): number | null {
        const positionRatings = this.playerEvaluation.positionRatings[position as keyof PositionRatings];
        if (!positionRatings) return null;

        const typeRating = (positionRatings as any)[type];
        return typeRating && 'actualRating' in typeRating ? typeRating.actualRating : null;
    }

    /**
     * Obtiene el bonus de experiencia para una posición y tipo
     */
    public getExperienceBonusForType(position: Position, type: string): number | null {
        const positionRatings = this.playerEvaluation.positionRatings[position as keyof PositionRatings];
        if (!positionRatings) return null;

        const typeRating = (positionRatings as any)[type];
        return typeRating && 'experienceBonus' in typeRating ? typeRating.experienceBonus : null;
    }

    /**
     * Obtiene todos los ratings potenciales para una posición
     */
    public getAllPotentialRatingsForPosition(position: Position): Record<string, number> {
        const positionRatings = this.playerEvaluation.positionRatings[position as keyof PositionRatings];
        if (!positionRatings) return {};

        const ratings: Record<string, number> = {};
        Object.entries(positionRatings).forEach(([type, rating]) => {
            if (rating && 'potentialRating' in rating) {
                ratings[type] = rating.potentialRating;
            }
        });

        return ratings;
    }

    /**
     * Obtiene la experiencia en una posición específica
     */
    public getExperienceInPosition(position: Position): PositionExperience | null {
        return this.positionExperience.get(position) || null;
    }

    /**
     * Agrega experiencia en una posición
     */
    public addExperienceInPosition(experience: PositionExperience): void {
        this.positionExperience.set(experience.position, experience);
        // Re-evaluar al jugador con la nueva experiencia
        this.playerEvaluation = PositionEvaluator.evaluatePlayerComplete(this.attributes, this.positionExperience);
    }

    /**
     * Obtiene un resumen de potencial vs experiencia
     */
    public getPotentialVsExperienceAnalysis(): {
        position: Position;
        type: string;
        potential: number;
        actual: number;
        experienceBonus: number;
        hasExperience: boolean;
    }[] {
        const analysis: any[] = [];

        // Analizar las top 5 posiciones viables
        this.getViablePositions().slice(0, 5).forEach(viable => {
            const potential = this.getPotentialRatingForType(viable.position, viable.bestType);
            const actual = this.getActualRatingForType(viable.position, viable.bestType);
            const experienceBonus = this.getExperienceBonusForType(viable.position, viable.bestType);
            const hasExperience = this.positionExperience.has(viable.position);

            if (potential !== null && actual !== null && experienceBonus !== null) {
                analysis.push({
                    position: viable.position,
                    type: viable.bestType,
                    potential,
                    actual,
                    experienceBonus,
                    hasExperience
                });
            }
        });

        return analysis;
    }

    /**
     * Obtiene el rating específico para la posición actual usando el nuevo sistema
     */
    public getPositionRating(): number {
        return this.positionEvaluation.overallRating;
    }

    /**
     * Obtiene el tipo específico del jugador en su posición
     */
    public getPlayerType(): string {
        return this.positionEvaluation.primaryType;
    }

    /**
     * Obtiene las fortalezas del jugador según su evaluación
     */
    public getStrengths(): string[] {
        return this.positionEvaluation.assessment.strengths;
    }

    /**
     * Obtiene las debilidades del jugador según su evaluación
     */
    public getWeaknesses(): string[] {
        return this.positionEvaluation.assessment.weaknesses;
    }

    /**
     * Obtiene el impacto estratégico del jugador
     */
    public getStrategicImpact(): string {
        return this.positionEvaluation.assessment.strategicImpact;
    }

    /**
     * Obtiene los factores de riesgo del jugador
     */
    public getRiskFactors(): string[] {
        return this.positionEvaluation.assessment.riskFactors;
    }

    /**
     * Evalúa al jugador en una posición diferente
     */
    public evaluateAtPosition(position: Position): PositionEvaluation {
        return PositionEvaluator.evaluatePlayerAtPosition(this.attributes, position);
    }

    /**
     * Encuentra la mejor posición alternativa para el jugador
     */
    public findBestPosition(): PositionEvaluation {
        return PositionEvaluator.findBestPosition(this.attributes);
    }

    /**
     * Obtiene posiciones alternativas donde el jugador podría jugar
     */
    public getAlternativePositions(): { position: Position; rating: number; fit: number }[] {
        return this.positionEvaluation.alternativePositions;
    }

    /**
     * Genera un reporte completo de evaluación del jugador
     */
    public generateEvaluationReport(): string {
        const eval_ = this.positionEvaluation;

        let report = `\n📊 EVALUACIÓN COMPLETA: ${this.name}\n`;
        report += "=".repeat(50) + "\n\n";

        // Información básica
        report += `🏈 INFORMACIÓN BÁSICA:\n`;
        report += `   Nombre: ${this.name} (#${this.jerseyNumber})\n`;
        report += `   Posición: ${this.position}\n`;
        report += `   Tipo: ${eval_.primaryType}\n`;
        report += `   Rating General: ${eval_.overallRating.toFixed(1)} (${eval_.qualitativeRating})\n`;
        report += `   Encaje en Posición: ${eval_.positionFit.toFixed(1)}%\n\n`;

        // Ratings por área
        report += `📈 RATINGS POR ÁREA:\n`;
        report += `   Físico: ${eval_.physicalRating.toFixed(1)}\n`;
        report += `   Técnico: ${eval_.technicalRating.toFixed(1)}\n`;
        report += `   Mental: ${eval_.mentalRating.toFixed(1)}\n\n`;

        // Análisis cualitativo
        report += `💪 FORTALEZAS:\n`;
        eval_.assessment.strengths.forEach(strength => {
            report += `   • ${strength}\n`;
        });

        report += `\n⚠️ DEBILIDADES:\n`;
        eval_.assessment.weaknesses.forEach(weakness => {
            report += `   • ${weakness}\n`;
        });

        report += `\n🎯 IMPACTO ESTRATÉGICO:\n`;
        report += `   ${eval_.assessment.strategicImpact}\n`;

        report += `\n🚨 FACTORES DE RIESGO:\n`;
        eval_.assessment.riskFactors.forEach(risk => {
            report += `   • ${risk}\n`;
        });

        // Adaptaciones esperadas
        report += `\n🔄 ADAPTACIONES ESPERADAS:\n`;
        report += `   Ofensivas: ${eval_.assessment.adaptations.offensive.join(', ')}\n`;
        report += `   Defensivas: ${eval_.assessment.adaptations.defensive.join(', ')}\n`;

        // Posiciones alternativas
        if (eval_.alternativePositions.length > 0) {
            report += `\n🔀 POSICIONES ALTERNATIVAS:\n`;
            eval_.alternativePositions.slice(0, 3).forEach((alt, index) => {
                report += `   ${index + 1}. ${alt.position}: Rating ${alt.rating.toFixed(1)}, Encaje ${alt.fit.toFixed(1)}%\n`;
            });
        }

        return report;
    }

    /**
     * Obtiene un resumen cualitativo rápido del jugador
     */
    public getQualitativeSummary(): string {
        const eval_ = this.positionEvaluation;
        const topStrength = eval_.assessment.strengths[0] || "Jugador versátil";
        const mainWeakness = eval_.assessment.weaknesses[0] || "Sin debilidades obvias";

        return `${this.name} es un ${eval_.primaryType} ${eval_.qualitativeRating}. ` +
            `Destaca por: ${topStrength.toLowerCase()}. ` +
            `Área de mejora: ${mainWeakness.toLowerCase()}.`;
    }
}