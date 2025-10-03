// PositionEvaluator - Evaluador principal que integra todo el sistema de posiciones

import { PlayerAttributes, PositionExperience } from "../core/Player";
import { 
    Position, PositionEvaluation, QualitativeRating, PlayerEvaluation, PositionRatings, TypeRating
} from "./PositionTypes";

// Importar evaluadores específicos
import { 
    QuarterbackEvaluator, RunningBackEvaluator, WideReceiverEvaluator, 
    TightEndEvaluator, OffensiveLineEvaluator 
} from "./OffensivePositions";
import { 
    DefensiveEndEvaluator, DefensiveTackleEvaluator, LinebackerEvaluator,
    CornerbackEvaluator, SafetyEvaluator 
} from "./DefensivePositions";
import { 
    KickerEvaluator, PunterEvaluator, LongSnapperEvaluator,
    HolderEvaluator, ReturnerEvaluator 
} from "./SpecialTeamsPositions";

export class PositionEvaluator {
    
    /**
     * Evalúa un jugador completamente en todas las posiciones y tipos
     */
    static evaluatePlayerComplete(
        attributes: PlayerAttributes, 
        experienceMap?: Map<Position, PositionExperience>
    ): PlayerEvaluation {
        const positionRatings = this.calculateAllPositionRatings(attributes, experienceMap);
        const physicalProfile = this.analyzePhysicalProfile(attributes);
        const versatility = this.analyzeVersatility(positionRatings);
        const viablePositions = this.findViablePositions(positionRatings);
        
        // Encontrar posición y tipo primarios
        const primary = this.findPrimaryPosition(positionRatings);
        
        return {
            positionRatings,
            primaryPosition: primary.position,
            primaryType: primary.type,
            primaryRating: primary.rating,
            viablePositions,
            physicalProfile,
            versatility
        };
    }
    
    /**
     * Evalúa un jugador en una posición específica (legacy)
     */
    static evaluatePlayerAtPosition(
        attributes: PlayerAttributes, 
        position: Position
    ): PositionEvaluation {
        
        const rating = this.calculatePositionRating(attributes, position);
        const qualitativeRating = this.getQualitativeRating(rating);
        const positionFit = this.calculatePositionFit(attributes, position);
        const assessment = this.getPositionAssessment(attributes, position);
        const alternativePositions = this.getAlternativePositions(attributes, position);
        
        return {
            position,
            primaryType: this.getPlayerType(attributes, position),
            overallRating: rating,
            qualitativeRating,
            positionFit,
            physicalRating: this.calculatePhysicalRating(attributes, position),
            technicalRating: this.calculateTechnicalRating(attributes, position),
            mentalRating: this.calculateMentalRating(attributes, position),
            assessment,
            alternativePositions
        };
    }
    
    /**
     * Encuentra la mejor posición para un jugador
     */
    static findBestPosition(attributes: PlayerAttributes): PositionEvaluation {
        const allPositions: Position[] = [
            'QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'T',
            'DE', 'DT', 'NT', 'OLB', 'ILB', 'CB', 'SS', 'FS',
            'K', 'P', 'LS', 'H', 'KR', 'PR'
        ];
        
        let bestEvaluation: PositionEvaluation | null = null;
        let bestRating = 0;
        
        for (const position of allPositions) {
            const evaluation = this.evaluatePlayerAtPosition(attributes, position);
            const combinedRating = evaluation.overallRating * (evaluation.positionFit / 100);
            
            if (combinedRating > bestRating) {
                bestRating = combinedRating;
                bestEvaluation = evaluation;
            }
        }
        
        return bestEvaluation!;
    }
    
    /**
     * Calcula el rating de un jugador en una posición específica
     */
    private static calculatePositionRating(attributes: PlayerAttributes, position: Position): number {
        switch (position) {
            case 'QB': return QuarterbackEvaluator.calculateRating(attributes);
            case 'RB': return RunningBackEvaluator.calculateRating(attributes);
            case 'WR': return WideReceiverEvaluator.calculateRating(attributes);
            case 'TE': return TightEndEvaluator.calculateRating(attributes);
            case 'C': return OffensiveLineEvaluator.calculateCenterRating(attributes);
            case 'G': return OffensiveLineEvaluator.calculateGuardRating(attributes);
            case 'T': return OffensiveLineEvaluator.calculateTackleRating(attributes);
            case 'FB': return this.calculateFullbackRating(attributes);
            case 'DE': return DefensiveEndEvaluator.calculateRating(attributes);
            case 'DT':
            case 'NT': return DefensiveTackleEvaluator.calculateRating(attributes);
            case 'OLB':
            case 'ILB': return LinebackerEvaluator.calculateRating(attributes);
            case 'CB': return CornerbackEvaluator.calculateRating(attributes);
            case 'SS':
            case 'FS': return SafetyEvaluator.calculateRating(attributes);
            case 'K': return KickerEvaluator.calculateRating(attributes);
            case 'P': return PunterEvaluator.calculateRating(attributes);
            case 'LS': return LongSnapperEvaluator.calculateRating(attributes);
            case 'H': return HolderEvaluator.calculateRating(attributes);
            case 'KR':
            case 'PR': return ReturnerEvaluator.calculateRating(attributes);
            default: return 50;
        }
    }
    
    private static calculatePositionFit(attributes: PlayerAttributes, position: Position): number {
        // Simplificado por ahora
        return 75;
    }
    
    private static getQualitativeRating(rating: number): QualitativeRating {
        if (rating >= 90) return 'elite';
        if (rating >= 80) return 'very_good';
        if (rating >= 70) return 'good';
        if (rating >= 60) return 'average';
        if (rating >= 50) return 'below_average';
        return 'poor';
    }
    
    private static getPlayerType(attributes: PlayerAttributes, position: Position): string {
        switch (position) {
            case 'QB': return QuarterbackEvaluator.evaluateType(attributes);
            case 'RB': return RunningBackEvaluator.evaluateType(attributes);
            case 'WR': return WideReceiverEvaluator.evaluateType(attributes);
            case 'TE': return TightEndEvaluator.evaluateType(attributes);
            case 'C': return OffensiveLineEvaluator.evaluateCenterType(attributes);
            case 'G': return OffensiveLineEvaluator.evaluateGuardType(attributes);
            case 'T': return OffensiveLineEvaluator.evaluateTackleType(attributes);
            case 'DE': return DefensiveEndEvaluator.evaluateType(attributes);
            case 'DT':
            case 'NT': return DefensiveTackleEvaluator.evaluateType(attributes);
            case 'OLB':
            case 'ILB': return LinebackerEvaluator.evaluateType(attributes);
            case 'CB': return CornerbackEvaluator.evaluateType(attributes);
            case 'SS':
            case 'FS': return SafetyEvaluator.evaluateType(attributes);
            case 'K': return KickerEvaluator.evaluateType(attributes);
            case 'P': return PunterEvaluator.evaluateType(attributes);
            default: return 'standard';
        }
    }
    
    private static getPositionAssessment(attributes: PlayerAttributes, position: Position): any {
        // Simplificado - retorna evaluación básica
        return {
            strengths: ["Evaluación en desarrollo"],
            weaknesses: ["Sistema en construcción"],
            strategicImpact: "Impacto por determinar",
            riskFactors: ["Análisis pendiente"],
            adaptations: {
                offensive: ["Estrategias por definir"],
                defensive: ["Tácticas por definir"]
            }
        };
    }
    
    private static calculatePhysicalRating(attributes: PlayerAttributes, position: Position): number {
        return (attributes.strength + attributes.speed + attributes.agility + attributes.stamina) / 4;
    }
    
    private static calculateTechnicalRating(attributes: PlayerAttributes, position: Position): number {
        return (attributes.catching + attributes.throwing + attributes.blocking + attributes.tackling + attributes.coverage) / 5;
    }
    
    private static calculateMentalRating(attributes: PlayerAttributes, position: Position): number {
        return (attributes.awareness + attributes.intelligence + attributes.leadership + attributes.composure) / 4;
    }
    
    private static getAlternativePositions(attributes: PlayerAttributes, currentPosition: Position): {
        position: Position;
        rating: number;
        fit: number;
    }[] {
        // Simplificado - retorna algunas alternativas básicas
        return [
            { position: 'RB', rating: 70, fit: 75 },
            { position: 'WR', rating: 65, fit: 70 }
        ];
    }
    
    private static calculateFullbackRating(attributes: PlayerAttributes): number {
        const weights = {
            strength: 0.30,
            blocking: 0.25,
            catching: 0.15,
            awareness: 0.15,
            agility: 0.10,
            stamina: 0.05
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    /**
     * Calcula ratings para todas las posiciones y tipos
     */
    private static calculateAllPositionRatings(
        attributes: PlayerAttributes, 
        experienceMap?: Map<Position, PositionExperience>
    ): PositionRatings {
        const ratings: PositionRatings = {};
        
        // Evaluar posiciones ofensivas
        ratings.QB = this.evaluateQBTypes(attributes, experienceMap?.get('QB'));
        ratings.RB = this.evaluateRBTypes(attributes, experienceMap?.get('RB'));
        ratings.WR = this.evaluateWRTypes(attributes, experienceMap?.get('WR'));
        ratings.TE = this.evaluateTETypes(attributes, experienceMap?.get('TE'));
        ratings.C = this.evaluateCenterTypes(attributes, experienceMap?.get('C'));
        ratings.G = this.evaluateGuardTypes(attributes, experienceMap?.get('G'));
        ratings.T = this.evaluateTackleTypes(attributes, experienceMap?.get('T'));
        ratings.FB = this.evaluateFBTypes(attributes, experienceMap?.get('FB'));
        
        // Evaluar posiciones defensivas
        ratings.DE = this.evaluateDETypes(attributes, experienceMap?.get('DE'));
        ratings.DT = this.evaluateDTTypes(attributes, experienceMap?.get('DT'));
        ratings.NT = this.evaluateNTTypes(attributes, experienceMap?.get('NT'));
        ratings.OLB = this.evaluateLBTypes(attributes, experienceMap?.get('OLB'));
        ratings.ILB = this.evaluateLBTypes(attributes, experienceMap?.get('ILB'));
        ratings.CB = this.evaluateCBTypes(attributes, experienceMap?.get('CB'));
        ratings.SS = this.evaluateSafetyTypes(attributes, experienceMap?.get('SS'));
        ratings.FS = this.evaluateSafetyTypes(attributes, experienceMap?.get('FS'));
        
        // Evaluar equipos especiales
        ratings.K = this.evaluateKickerTypes(attributes, experienceMap?.get('K'));
        ratings.P = this.evaluatePunterTypes(attributes, experienceMap?.get('P'));
        ratings.LS = this.evaluateLSTypes(attributes, experienceMap?.get('LS'));
        ratings.H = this.evaluateHolderTypes(attributes, experienceMap?.get('H'));
        ratings.KR = this.evaluateReturnerTypes(attributes, experienceMap?.get('KR'));
        ratings.PR = this.evaluateReturnerTypes(attributes, experienceMap?.get('PR'));
        
        return ratings;
    }
    
    /**
     * Evalúa todos los tipos de QB
     */
    private static evaluateQBTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            the_general: this.evaluateQBType(attributes, 'the_general', experience),
            dual_threat: this.evaluateQBType(attributes, 'dual_threat', experience),
            gunslinger: this.evaluateQBType(attributes, 'gunslinger', experience)
        };
    }
    
    /**
     * Evalúa un tipo específico de QB
     */
    private static evaluateQBType(attributes: PlayerAttributes, type: string, experience?: PositionExperience): TypeRating {
        // 1. Calcular POTENCIAL basado solo en atributos
        let potentialRating = QuarterbackEvaluator.calculateRating(attributes);
        let confidence = 75;
        
        // Ajustar potencial según el tipo específico
        switch (type) {
            case 'the_general':
                if (attributes.throwing >= 85 && attributes.intelligence >= 80) {
                    potentialRating += 5;
                    confidence += 15;
                }
                if (attributes.speed < 60) {
                    confidence += 10; // Más confianza si es lento (encaja mejor)
                }
                break;
                
            case 'dual_threat':
                const mobility = (attributes.speed + attributes.agility) / 2;
                if (mobility >= 75) {
                    potentialRating += 8;
                    confidence += 20;
                }
                break;
                
            case 'gunslinger':
                if (attributes.throwing >= 90) {
                    potentialRating += 6;
                    confidence += 15;
                }
                if (attributes.composure < 70) {
                    potentialRating -= 3; // Penalizar falta de compostura
                }
                break;
        }
        
        // 2. Calcular BONUS/PENALTY por experiencia
        const experienceBonus = this.calculateExperienceBonus(experience);
        
        // 3. Calcular RATING REAL (potencial + experiencia)
        const actualRating = Math.max(0, Math.min(100, potentialRating + experienceBonus));
        
        const qualitativeRating = this.getQualitativeRating(actualRating);
        const assessment = QuarterbackEvaluator.getQualitativeAssessment(attributes, type as any);
        
        return {
            potentialRating: Math.max(0, Math.min(100, potentialRating)),
            actualRating,
            rating: actualRating, // El rating mostrado es el real
            qualitativeRating,
            confidence: Math.max(0, Math.min(100, confidence)),
            experienceBonus,
            assessment
        };
    }
    
    // Métodos simplificados para otras posiciones
    private static evaluateRBTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        const baseRating = RunningBackEvaluator.calculateRating(attributes);
        const experienceBonus = this.calculateExperienceBonus(experience);
        
        return {
            workhorse: this.createTypeRatingWithExperience(baseRating, 75, experienceBonus),
            receiving_back: this.createTypeRatingWithExperience(baseRating, 70, experienceBonus),
            three_down_back: this.createTypeRatingWithExperience(baseRating, 80, experienceBonus)
        };
    }
    
    private static evaluateWRTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            alpha_receiver: this.createTypeRating(WideReceiverEvaluator.calculateRating(attributes), 75),
            slot_receiver: this.createTypeRating(WideReceiverEvaluator.calculateRating(attributes), 70),
            blocking_receiver: this.createTypeRating(WideReceiverEvaluator.calculateRating(attributes), 65)
        };
    }
    
    private static evaluateTETypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            blocking_te: this.createTypeRating(TightEndEvaluator.calculateRating(attributes), 75),
            receiving_te: this.createTypeRating(TightEndEvaluator.calculateRating(attributes), 70),
            hybrid_te: this.createTypeRating(TightEndEvaluator.calculateRating(attributes), 80)
        };
    }
    
    private static evaluateCenterTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            the_general: this.createTypeRating(OffensiveLineEvaluator.calculateCenterRating(attributes), 75),
            dominator: this.createTypeRating(OffensiveLineEvaluator.calculateCenterRating(attributes), 70),
            athletic_center: this.createTypeRating(OffensiveLineEvaluator.calculateCenterRating(attributes), 70)
        };
    }
    
    private static evaluateGuardTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            power_guard: this.createTypeRating(OffensiveLineEvaluator.calculateGuardRating(attributes), 75),
            athletic_guard: this.createTypeRating(OffensiveLineEvaluator.calculateGuardRating(attributes), 70),
            holding_prone: this.createTypeRating(OffensiveLineEvaluator.calculateGuardRating(attributes) - 15, 60)
        };
    }
    
    private static evaluateTackleTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            pass_wall: this.createTypeRating(OffensiveLineEvaluator.calculateTackleRating(attributes), 75),
            run_blocker: this.createTypeRating(OffensiveLineEvaluator.calculateTackleRating(attributes), 70),
            weak_tackle: this.createTypeRating(OffensiveLineEvaluator.calculateTackleRating(attributes) - 20, 50)
        };
    }
    
    private static evaluateFBTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            pure_blocker: this.createTypeRating(this.calculateFullbackRating(attributes), 75),
            hybrid_hback: this.createTypeRating(this.calculateFullbackRating(attributes), 70),
            misdirection: this.createTypeRating(this.calculateFullbackRating(attributes), 65)
        };
    }
    
    // Métodos para posiciones defensivas
    private static evaluateDETypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            pass_rush_specialist: this.createTypeRating(DefensiveEndEvaluator.calculateRating(attributes), 75),
            set_the_edge: this.createTypeRating(DefensiveEndEvaluator.calculateRating(attributes), 70),
            hybrid_de: this.createTypeRating(DefensiveEndEvaluator.calculateRating(attributes), 80)
        };
    }
    
    private static evaluateDTTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            nose_tackle: this.createTypeRating(DefensiveTackleEvaluator.calculateRating(attributes), 75),
            penetrator: this.createTypeRating(DefensiveTackleEvaluator.calculateRating(attributes), 70),
            three_down_dt: this.createTypeRating(DefensiveTackleEvaluator.calculateRating(attributes), 80)
        };
    }
    
    private static evaluateNTTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return this.evaluateDTTypes(attributes); // NT usa mismos tipos que DT
    }
    
    private static evaluateLBTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            the_general: this.createTypeRating(LinebackerEvaluator.calculateRating(attributes), 75),
            coverage_backer: this.createTypeRating(LinebackerEvaluator.calculateRating(attributes), 70),
            hybrid_lb: this.createTypeRating(LinebackerEvaluator.calculateRating(attributes), 80)
        };
    }
    
    private static evaluateCBTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            press_man: this.createTypeRating(CornerbackEvaluator.calculateRating(attributes), 75),
            zone_coverage: this.createTypeRating(CornerbackEvaluator.calculateRating(attributes), 70),
            physical_nickel: this.createTypeRating(CornerbackEvaluator.calculateRating(attributes), 70)
        };
    }
    
    private static evaluateSafetyTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            enforcer: this.createTypeRating(SafetyEvaluator.calculateRating(attributes), 75),
            hybrid_safety: this.createTypeRating(SafetyEvaluator.calculateRating(attributes), 80),
            basic_safety: this.createTypeRating(SafetyEvaluator.calculateRating(attributes), 60)
        };
    }
    
    // Métodos para equipos especiales
    private static evaluateKickerTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            elite_range: this.createTypeRating(KickerEvaluator.calculateRating(attributes), 75),
            inconsistent: this.createTypeRating(KickerEvaluator.calculateRating(attributes) - 15, 60),
            kickoff_specialist: this.createTypeRating(KickerEvaluator.calculateRating(attributes), 70)
        };
    }
    
    private static evaluatePunterTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        return {
            control_punter: this.createTypeRating(PunterEvaluator.calculateRating(attributes), 75),
            power_punter: this.createTypeRating(PunterEvaluator.calculateRating(attributes), 70)
        };
    }
    
    private static evaluateLSTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        const baseRating = LongSnapperEvaluator.calculateRating(attributes);
        return {
            elite: this.createTypeRating(baseRating, baseRating >= 80 ? 90 : 60),
            standard: this.createTypeRating(baseRating - 10, baseRating < 80 ? 80 : 50)
        };
    }
    
    private static evaluateHolderTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        const baseRating = HolderEvaluator.calculateRating(attributes);
        return {
            elite: this.createTypeRating(baseRating, baseRating >= 80 ? 90 : 60),
            standard: this.createTypeRating(baseRating - 10, baseRating < 80 ? 80 : 50)
        };
    }
    
    private static evaluateReturnerTypes(attributes: PlayerAttributes, experience?: PositionExperience) {
        const baseRating = ReturnerEvaluator.calculateRating(attributes);
        const isExplosive = attributes.speed >= 85 && attributes.agility >= 80;
        const isSafe = attributes.catching >= 85 && attributes.composure >= 75;
        
        return {
            explosive: this.createTypeRating(
                baseRating + (isExplosive ? 10 : -10), 
                isExplosive ? 85 : 60
            ),
            safe: this.createTypeRating(
                baseRating + (isSafe ? 8 : -8), 
                isSafe ? 80 : 65
            ),
            complete: this.createTypeRating(
                baseRating + (isExplosive && isSafe ? 15 : -5), 
                isExplosive && isSafe ? 95 : 70
            )
        };
    }
    
    /**
     * Calcula el bonus/penalty por experiencia en una posición
     */
    private static calculateExperienceBonus(experience?: PositionExperience): number {
        if (!experience) {
            return -10; // Penalty por no tener experiencia
        }
        
        let bonus = 0;
        
        // Bonus por años de experiencia (máximo +8)
        const yearBonus = Math.min(8, experience.yearsPlayed * 2);
        bonus += yearBonus;
        
        // Bonus por juegos jugados (máximo +5)
        const gameBonus = Math.min(5, Math.floor(experience.gamesPlayed / 16));
        bonus += gameBonus;
        
        // Bonus por rendimiento histórico (máximo +7)
        if (experience.performanceHistory >= 80) {
            bonus += 7;
        } else if (experience.performanceHistory >= 70) {
            bonus += 4;
        } else if (experience.performanceHistory >= 60) {
            bonus += 2;
        } else {
            bonus -= 3; // Penalty por mal rendimiento
        }
        
        // Bonus por desarrollo/entrenamiento (máximo +5)
        if (experience.development >= 90) {
            bonus += 5;
        } else if (experience.development >= 80) {
            bonus += 3;
        } else if (experience.development >= 70) {
            bonus += 1;
        }
        
        // Limitar el bonus total entre -20 y +20
        return Math.max(-20, Math.min(20, bonus));
    }
    
    /**
     * Crea un TypeRating con experiencia
     */
    private static createTypeRatingWithExperience(baseRating: number, confidence: number, experienceBonus: number): TypeRating {
        const potentialRating = Math.max(0, Math.min(100, baseRating));
        const actualRating = Math.max(0, Math.min(100, baseRating + experienceBonus));
        
        return {
            potentialRating,
            actualRating,
            rating: actualRating, // El rating mostrado es el real
            qualitativeRating: this.getQualitativeRating(actualRating),
            confidence: Math.max(0, Math.min(100, confidence)),
            experienceBonus,
            assessment: {
                strengths: ["Evaluación automática"],
                weaknesses: ["Análisis en desarrollo"],
                strategicImpact: "Impacto por determinar",
                riskFactors: ["Factores por analizar"],
                adaptations: {
                    offensive: ["Estrategias por definir"],
                    defensive: ["Tácticas por definir"]
                }
            }
        };
    }
    
    /**
     * Crea un TypeRating básico (legacy - para posiciones sin experiencia específica)
     */
    private static createTypeRating(rating: number, confidence: number): TypeRating {
        const finalRating = Math.max(0, Math.min(100, rating));
        return {
            potentialRating: finalRating, // Sin experiencia, potencial = rating base
            actualRating: finalRating,    // Sin experiencia, actual = potencial
            rating: finalRating,          // Rating mostrado
            qualitativeRating: this.getQualitativeRating(finalRating),
            confidence: Math.max(0, Math.min(100, confidence)),
            experienceBonus: 0,           // Sin experiencia = sin bonus
            assessment: {
                strengths: ["Evaluación automática"],
                weaknesses: ["Análisis en desarrollo"],
                strategicImpact: "Impacto por determinar",
                riskFactors: ["Factores por analizar"],
                adaptations: {
                    offensive: ["Estrategias por definir"],
                    defensive: ["Tácticas por definir"]
                }
            }
        };
    }
    
    /**
     * Analiza el perfil físico del jugador
     */
    private static analyzePhysicalProfile(attributes: PlayerAttributes) {
        const height = attributes.height;
        const weight = attributes.weight;
        const bmi = weight / ((height / 100) ** 2);
        
        return {
            heightCategory: height < 170 ? 'short' as const : 
                           height < 185 ? 'average' as const : 
                           height < 200 ? 'tall' as const : 'very_tall' as const,
            weightCategory: weight < 70 ? 'light' as const : 
                           weight < 90 ? 'average' as const : 
                           weight < 110 ? 'heavy' as const : 'very_heavy' as const,
            bmi,
            athleticism: (attributes.speed + attributes.agility + attributes.strength) / 3
        };
    }
    
    /**
     * Analiza la versatilidad del jugador
     */
    private static analyzeVersatility(positionRatings: PositionRatings) {
        let viablePositions = 0;
        let totalRating = 0;
        let maxRating = 0;
        
        // Contar posiciones viables (rating >= 60)
        Object.values(positionRatings).forEach(position => {
            if (position) {
                Object.values(position).forEach(type => {
                    const typeRating = type as TypeRating;
                    if (typeRating && typeRating.rating >= 60) {
                        viablePositions++;
                        totalRating += typeRating.rating;
                        maxRating = Math.max(maxRating, typeRating.rating);
                    }
                });
            }
        });
        
        const versatilityScore = Math.min(100, viablePositions * 5); // Más posiciones = más versátil
        const specialistLevel = maxRating; // Rating más alto indica especialización
        
        return {
            score: versatilityScore,
            multiPositional: viablePositions >= 3,
            specialistLevel
        };
    }
    
    /**
     * Encuentra posiciones viables para el jugador
     */
    private static findViablePositions(positionRatings: PositionRatings) {
        const viable: { position: Position; bestType: string; rating: number; confidence: number }[] = [];
        
        Object.entries(positionRatings).forEach(([position, types]) => {
            if (types) {
                let bestType = '';
                let bestRating = 0;
                let bestConfidence = 0;
                
                Object.entries(types).forEach(([type, rating]) => {
                    const typeRating = rating as TypeRating;
                    if (typeRating && typeRating.rating > bestRating) {
                        bestType = type;
                        bestRating = typeRating.rating;
                        bestConfidence = typeRating.confidence;
                    }
                });
                
                if (bestRating >= 60) { // Solo incluir si es viable
                    viable.push({
                        position: position as Position,
                        bestType,
                        rating: bestRating,
                        confidence: bestConfidence
                    });
                }
            }
        });
        
        return viable.sort((a, b) => b.rating - a.rating).slice(0, 8); // Top 8
    }
    
    /**
     * Encuentra la posición y tipo primarios
     */
    private static findPrimaryPosition(positionRatings: PositionRatings) {
        let bestPosition: Position = 'RB';
        let bestType = '';
        let bestRating = 0;
        
        Object.entries(positionRatings).forEach(([position, types]) => {
            if (types) {
                Object.entries(types).forEach(([type, rating]) => {
                    const typeRating = rating as TypeRating;
                    if (typeRating && typeRating.rating > bestRating) {
                        bestPosition = position as Position;
                        bestType = type;
                        bestRating = typeRating.rating;
                    }
                });
            }
        });
        
        return {
            position: bestPosition,
            type: bestType,
            rating: bestRating
        };
    }
}