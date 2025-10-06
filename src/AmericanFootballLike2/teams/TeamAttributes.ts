// TeamAttributes - Sistema de atributos de equipo basado en documentación LaTeX
// Implementa atributos estratégicos y funcionales para ofensiva, defensiva y equipos especiales

// Atributos de la Ofensiva
export interface OffensiveAttributes {
    // Quarterback y Mando
    passingAccuracy: number;           // Precisión general del pase (0-100)
    armStrength: number;               // Rango y potencia del brazo (0-100)
    qbMobility: number;                // Movilidad y capacidad de evasión (0-100)
    postSnapVision: number;            // Visión y lectura post-snap (0-100)
    pocketDiscipline: number;          // Disciplina en el pocket (0-100)

    // Línea Ofensiva y Cohesión
    powerRunBlocking: number;          // Poder de bloqueo terrestre (0-100)
    zoneBlockingAgility: number;       // Agilidad para bloqueo de zona (0-100)
    passProtectionAnchor: number;      // Anclaje en protección de pase (0-100)
    offensiveLineChemistry: number;    // Coordinación y comunicación OL (0-100)
    audibleAdjustment: number;         // Ajuste en la línea (audibles) (0-100)
    snapConsistency: number;           // Consistencia del snap (0-100)

    // Running Backs y Receptores
    breakawayAbility: number;          // Tasa de ruptura de tacleos (YAC) (0-100)
    rbVersatility: number;             // Habilidad de recepción y bloqueo RB (0-100)
    receiverSeparation: number;        // Velocidad pura y separación WR (0-100)
    contestedCatches: number;          // Habilidad en balones divididos (0-100)
    routeChemistry: number;            // Química y timing de rutas (0-100)
    teVersatility: number;             // Versatilidad del Tight End (0-100)

    // Métricas Generales Ofensivas
    thirdDownConversion: number;       // Tasa de conversión en 3er down (0-100)
    redZoneEfficiency: number;         // Efectividad en zona roja (0-100)
    offensivePenalties: number;        // Frecuencia de faltas ofensivas (0-100, menor es mejor)
}

// Atributos de la Defensa
export interface DefensiveAttributes {
    // Front Seven y Presión
    fourManRushPressure: number;       // Tasa de presión estándar (4-man rush) (0-100)
    interiorLineAbsorption: number;    // Capacidad de absorber bloqueos NT/DT (0-100)
    edgeSetting: number;               // Contención de carrera en el borde (0-100)
    runFitDiscipline: number;          // Disciplina de run fit (0-100)
    playActionReaction: number;        // Velocidad de reacción al play action (0-100)
    tacklesForLoss: number;            // Tasa de tacleos para pérdida (0-100)

    // Linebackers y Secundaria
    pressManCoverage: number;          // Habilidad en press man coverage CB (0-100)
    freeSafetyRange: number;           // Rango del Free Safety (0-100)
    strongSafetySupport: number;       // Fuerza del Strong Safety (run support) (0-100)
    zoneCoverageCoordination: number;  // Coordinación en cobertura de zona (0-100)
    coverageConfidence: number;        // Confianza en cobertura (trust) (0-100)
    defensiveIQ: number;               // IQ defensivo y liderazgo ILB (0-100)

    // Métricas Generales Defensivas
    turnoverGeneration: number;        // Generación de turnovers (0-100)
    redZoneDefense: number;            // Efectividad defensiva en zona roja (0-100)
    defensivePenalties: number;        // Frecuencia de faltas defensivas (0-100, menor es mejor)
}

// Atributos de Equipos Especiales
export interface SpecialTeamsAttributes {
    // Kicker y Punter
    kickerRange: number;               // Rango máximo consistente (0-100)
    kickerComposure: number;           // Compostura del pateador (pressure kicks) (0-100)
    punterPlacement: number;           // Control de colocación (coffin corner) (0-100)
    punterHangTime: number;            // Alto hang time (0-100)

    // Regresadores
    returnExplosiveness: number;       // Potencial de jugada explosiva (0-100)
    ballSecurity: number;              // Seguridad del balón (turnover risk) (0-100)

    // Unidades de Cobertura
    coverageSpeed: number;             // Velocidad y disciplina de cobertura (0-100)
    longSnapperReliability: number;    // Fiabilidad del long snapper (0-100)

    // Métricas Generales de Equipos Especiales
    specialTeamsPenalties: number;     // Frecuencia de faltas en equipos especiales (0-100, menor es mejor)
}

// Atributos Generales del Equipo
export interface GeneralTeamAttributes {
    // Factores Mentales y de Cohesión
    resilience: number;                // Resiliencia y capacidad de recuperación (0-100)
    clutchFactor: number;              // Confianza en momentos críticos (0-100)
    teamDiscipline: number;            // Disciplina general y tasa de faltas (0-100)
    teamChemistry: number;             // Química y cohesión general (0-100)

    // Métricas de Rendimiento
    netTurnoverMargin: number;         // Generación neta de turnovers (-50 a +50)
    conditioningLevel: number;         // Nivel de acondicionamiento físico (0-100)
    injuryResistance: number;          // Resistencia a lesiones (0-100)

    // Factores Situacionales
    homeFieldAdvantage: number;        // Ventaja de campo propio (0-100)
    weatherAdaptability: number;       // Adaptabilidad al clima (0-100)
    bigGameExperience: number;         // Experiencia en juegos importantes (0-100)
}

// Atributos completos del equipo
export interface CompleteTeamAttributes {
    offensive: OffensiveAttributes;
    defensive: DefensiveAttributes;
    specialTeams: SpecialTeamsAttributes;
    general: GeneralTeamAttributes;
}

// Configuración para crear atributos de equipo
export interface TeamAttributesConfig {
    teamId: string;
    teamName: string;
    attributes: CompleteTeamAttributes;
    season?: number;
    lastUpdated?: Date;
}

// Evaluación cualitativa de atributos
export type AttributeRating = 'elite' | 'very_good' | 'good' | 'average' | 'below_average' | 'poor';

export interface AttributeEvaluation {
    rating: number;
    qualitativeRating: AttributeRating;
    description: string;
    impact: string;
}

// Clase principal para manejar atributos de equipo
export class TeamAttributeSystem {
    public readonly teamId: string;
    public readonly teamName: string;
    public readonly attributes: CompleteTeamAttributes;
    public readonly season: number;
    public lastUpdated: Date;

    constructor(config: TeamAttributesConfig) {
        this.teamId = config.teamId;
        this.teamName = config.teamName;
        this.attributes = config.attributes;
        this.season = config.season || new Date().getFullYear();
        this.lastUpdated = config.lastUpdated || new Date();

        this.validateAttributes();
    }

    /**
     * Valida que todos los atributos estén en rangos válidos
     */
    private validateAttributes(): void {
        const allAttributes = [
            ...Object.values(this.attributes.offensive),
            ...Object.values(this.attributes.defensive),
            ...Object.values(this.attributes.specialTeams),
            ...Object.values(this.attributes.general).filter(attr => typeof attr === 'number')
        ];

        const invalidAttrs = allAttributes.filter(attr => attr < 0 || attr > 100);

        if (invalidAttrs.length > 0) {
            console.warn(`⚠️ Atributos fuera de rango para ${this.teamName}:`, invalidAttrs);
            // Corregir atributos fuera de rango en lugar de fallar
            this.clampAttributes();
        }

        // Validar netTurnoverMargin que tiene rango especial
        if (this.attributes.general.netTurnoverMargin < -50 || this.attributes.general.netTurnoverMargin > 50) {
            throw new Error(`Net Turnover Margin inválido para ${this.teamName}. Debe estar entre -50 y +50`);
        }
    }

    /**
     * Corrige atributos que están fuera del rango válido
     */
    private clampAttributes(): void {
        // Función auxiliar para corregir un objeto de atributos
        const clampObject = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'number' && key !== 'netTurnoverMargin') {
                    obj[key] = Math.max(0, Math.min(100, obj[key]));
                }
            }
        };

        clampObject(this.attributes.offensive);
        clampObject(this.attributes.defensive);
        clampObject(this.attributes.specialTeams);
        clampObject(this.attributes.general);

        // Corregir netTurnoverMargin por separado
        this.attributes.general.netTurnoverMargin = Math.max(-50, Math.min(50, this.attributes.general.netTurnoverMargin));
    }

    /**
     * Obtiene la evaluación cualitativa de un atributo
     */
    public getAttributeEvaluation(value: number): AttributeEvaluation {
        let qualitativeRating: AttributeRating;
        let description: string;
        let impact: string;

        if (value >= 90) {
            qualitativeRating = 'elite';
            description = 'Nivel élite, entre los mejores de la liga';
            impact = 'Ventaja significativa en esta área';
        } else if (value >= 80) {
            qualitativeRating = 'very_good';
            description = 'Muy bueno, por encima del promedio';
            impact = 'Fortaleza notable del equipo';
        } else if (value >= 70) {
            qualitativeRating = 'good';
            description = 'Bueno, competitivo';
            impact = 'Área sólida sin debilidades';
        } else if (value >= 60) {
            qualitativeRating = 'average';
            description = 'Promedio de la liga';
            impact = 'Neutral, no es ventaja ni desventaja';
        } else if (value >= 50) {
            qualitativeRating = 'below_average';
            description = 'Por debajo del promedio';
            impact = 'Área de preocupación menor';
        } else {
            qualitativeRating = 'poor';
            description = 'Deficiente, necesita mejora urgente';
            impact = 'Debilidad significativa que puede ser explotada';
        }

        return {
            rating: value,
            qualitativeRating,
            description,
            impact
        };
    }

    /**
     * Calcula el rating general ofensivo
     */
    public getOffensiveRating(): number {
        const attrs = this.attributes.offensive;
        const weights = {
            // QB y Mando (35%)
            passingAccuracy: 0.08,
            armStrength: 0.06,
            qbMobility: 0.05,
            postSnapVision: 0.08,
            pocketDiscipline: 0.08,

            // Línea Ofensiva (30%)
            powerRunBlocking: 0.06,
            zoneBlockingAgility: 0.05,
            passProtectionAnchor: 0.08,
            offensiveLineChemistry: 0.06,
            audibleAdjustment: 0.03,
            snapConsistency: 0.02,

            // Receptores y RB (25%)
            breakawayAbility: 0.06,
            rbVersatility: 0.04,
            receiverSeparation: 0.06,
            contestedCatches: 0.04,
            routeChemistry: 0.03,
            teVersatility: 0.02,

            // Métricas Generales (10%)
            thirdDownConversion: 0.05,
            redZoneEfficiency: 0.03,
            offensivePenalties: 0.02 // Invertido: menos penalizaciones = mejor
        };

        let totalRating = 0;
        Object.entries(weights).forEach(([attr, weight]) => {
            let value = (attrs as any)[attr];
            // Invertir penalizaciones (menos es mejor)
            if (attr === 'offensivePenalties') {
                value = 100 - value;
            }
            totalRating += value * weight;
        });

        return Math.round(totalRating);
    }

    /**
     * Calcula el rating general defensivo
     */
    public getDefensiveRating(): number {
        const attrs = this.attributes.defensive;
        const weights = {
            // Front Seven (40%)
            fourManRushPressure: 0.08,
            interiorLineAbsorption: 0.06,
            edgeSetting: 0.06,
            runFitDiscipline: 0.06,
            playActionReaction: 0.06,
            tacklesForLoss: 0.08,

            // Secundaria (35%)
            pressManCoverage: 0.08,
            freeSafetyRange: 0.07,
            strongSafetySupport: 0.05,
            zoneCoverageCoordination: 0.07,
            coverageConfidence: 0.04,
            defensiveIQ: 0.04,

            // Métricas Generales (25%)
            turnoverGeneration: 0.10,
            redZoneDefense: 0.08,
            defensivePenalties: 0.07 // Invertido: menos penalizaciones = mejor
        };

        let totalRating = 0;
        Object.entries(weights).forEach(([attr, weight]) => {
            let value = (attrs as any)[attr];
            // Invertir penalizaciones (menos es mejor)
            if (attr === 'defensivePenalties') {
                value = 100 - value;
            }
            totalRating += value * weight;
        });

        return Math.round(totalRating);
    }

    /**
     * Calcula el rating de equipos especiales
     */
    public getSpecialTeamsRating(): number {
        const attrs = this.attributes.specialTeams;
        const weights = {
            kickerRange: 0.15,
            kickerComposure: 0.12,
            punterPlacement: 0.12,
            punterHangTime: 0.08,
            returnExplosiveness: 0.15,
            ballSecurity: 0.15,
            coverageSpeed: 0.12,
            longSnapperReliability: 0.08,
            specialTeamsPenalties: 0.03 // Invertido
        };

        let totalRating = 0;
        Object.entries(weights).forEach(([attr, weight]) => {
            let value = (attrs as any)[attr];
            if (attr === 'specialTeamsPenalties') {
                value = 100 - value;
            }
            totalRating += value * weight;
        });

        return Math.round(totalRating);
    }

    /**
     * Calcula el rating general del equipo
     */
    public getOverallTeamRating(): number {
        const offensiveRating = this.getOffensiveRating();
        const defensiveRating = this.getDefensiveRating();
        const specialTeamsRating = this.getSpecialTeamsRating();
        const generalFactors = this.attributes.general;

        // Factores generales
        const generalRating = (
            generalFactors.resilience * 0.25 +
            generalFactors.clutchFactor * 0.25 +
            generalFactors.teamDiscipline * 0.20 +
            generalFactors.teamChemistry * 0.15 +
            generalFactors.conditioningLevel * 0.10 +
            generalFactors.bigGameExperience * 0.05
        );

        // Pesos para el rating final
        const overallRating = (
            offensiveRating * 0.35 +
            defensiveRating * 0.35 +
            specialTeamsRating * 0.15 +
            generalRating * 0.15
        );

        return Math.round(overallRating);
    }

    /**
     * Obtiene las fortalezas principales del equipo
     */
    public getTeamStrengths(): { category: string; attribute: string; rating: number; evaluation: AttributeEvaluation }[] {
        const strengths: { category: string; attribute: string; rating: number; evaluation: AttributeEvaluation }[] = [];

        // Revisar todos los atributos
        const categories = [
            { name: 'Ofensiva', attrs: this.attributes.offensive },
            { name: 'Defensiva', attrs: this.attributes.defensive },
            { name: 'Equipos Especiales', attrs: this.attributes.specialTeams },
            { name: 'General', attrs: this.attributes.general }
        ];

        categories.forEach(category => {
            Object.entries(category.attrs).forEach(([attr, value]) => {
                if (typeof value === 'number' && value >= 80) {
                    const evaluation = this.getAttributeEvaluation(value);
                    strengths.push({
                        category: category.name,
                        attribute: attr,
                        rating: value,
                        evaluation
                    });
                }
            });
        });

        return strengths.sort((a, b) => b.rating - a.rating);
    }

    /**
     * Obtiene las debilidades principales del equipo
     */
    public getTeamWeaknesses(): { category: string; attribute: string; rating: number; evaluation: AttributeEvaluation }[] {
        const weaknesses: { category: string; attribute: string; rating: number; evaluation: AttributeEvaluation }[] = [];

        const categories = [
            { name: 'Ofensiva', attrs: this.attributes.offensive },
            { name: 'Defensiva', attrs: this.attributes.defensive },
            { name: 'Equipos Especiales', attrs: this.attributes.specialTeams },
            { name: 'General', attrs: this.attributes.general }
        ];

        categories.forEach(category => {
            Object.entries(category.attrs).forEach(([attr, value]) => {
                if (typeof value === 'number' && value <= 60) {
                    const evaluation = this.getAttributeEvaluation(value);
                    weaknesses.push({
                        category: category.name,
                        attribute: attr,
                        rating: value,
                        evaluation
                    });
                }
            });
        });

        return weaknesses.sort((a, b) => a.rating - b.rating);
    }

    /**
     * Obtiene un resumen completo del equipo
     */
    public getTeamSummary(): string {
        const overall = this.getOverallTeamRating();
        const offensive = this.getOffensiveRating();
        const defensive = this.getDefensiveRating();
        const specialTeams = this.getSpecialTeamsRating();

        return `${this.teamName} - Overall: ${overall} | ` +
            `OFF: ${offensive}, DEF: ${defensive}, ST: ${specialTeams} | ` +
            `Química: ${this.attributes.general.teamChemistry}, ` +
            `Disciplina: ${this.attributes.general.teamDiscipline}`;
    }

    /**
     * Actualiza un atributo específico
     */
    public updateAttribute(category: keyof CompleteTeamAttributes, attribute: string, value: number): void {
        if (value < 0 || value > 100) {
            throw new Error(`Valor inválido para ${attribute}: ${value}. Debe estar entre 0-100`);
        }

        (this.attributes[category] as any)[attribute] = value;
        this.lastUpdated = new Date();
    }

    /**
     * Compara este equipo con otro
     */
    public compareWith(otherTeam: TeamAttributeSystem): {
        advantages: string[];
        disadvantages: string[];
        overallDifference: number;
    } {
        const advantages: string[] = [];
        const disadvantages: string[] = [];

        const myOverall = this.getOverallTeamRating();
        const theirOverall = otherTeam.getOverallTeamRating();

        // Comparar ratings principales
        const myOffensive = this.getOffensiveRating();
        const theirOffensive = otherTeam.getOffensiveRating();
        if (myOffensive - theirOffensive >= 5) {
            advantages.push(`Ofensiva superior (+${myOffensive - theirOffensive})`);
        } else if (theirOffensive - myOffensive >= 5) {
            disadvantages.push(`Ofensiva inferior (-${theirOffensive - myOffensive})`);
        }

        const myDefensive = this.getDefensiveRating();
        const theirDefensive = otherTeam.getDefensiveRating();
        if (myDefensive - theirDefensive >= 5) {
            advantages.push(`Defensiva superior (+${myDefensive - theirDefensive})`);
        } else if (theirDefensive - myDefensive >= 5) {
            disadvantages.push(`Defensiva inferior (-${theirDefensive - myDefensive})`);
        }

        const mySpecialTeams = this.getSpecialTeamsRating();
        const theirSpecialTeams = otherTeam.getSpecialTeamsRating();
        if (mySpecialTeams - theirSpecialTeams >= 5) {
            advantages.push(`Equipos Especiales superiores (+${mySpecialTeams - theirSpecialTeams})`);
        } else if (theirSpecialTeams - mySpecialTeams >= 5) {
            disadvantages.push(`Equipos Especiales inferiores (-${theirSpecialTeams - mySpecialTeams})`);
        }

        return {
            advantages,
            disadvantages,
            overallDifference: myOverall - theirOverall
        };
    }
}