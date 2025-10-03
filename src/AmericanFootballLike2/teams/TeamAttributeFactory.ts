// TeamAttributeFactory - Factory para crear y gestionar atributos de equipo
import { 
    CompleteTeamAttributes, 
    OffensiveAttributes, 
    DefensiveAttributes, 
    SpecialTeamsAttributes, 
    GeneralTeamAttributes,
    TeamAttributeSystem,
    TeamAttributesConfig
} from "./TeamAttributes";

export type TeamArchetype = 
    | 'offensive_powerhouse'    // Ofensiva élite, defensiva promedio
    | 'defensive_fortress'      // Defensiva élite, ofensiva promedio
    | 'balanced_contender'      // Balanceado en todas las áreas
    | 'special_teams_focused'   // Equipos especiales élite
    | 'young_developing'        // Equipo joven con potencial
    | 'veteran_experienced'     // Equipo veterano con experiencia
    | 'undisciplined_talented'  // Talentoso pero indisciplinado
    | 'overachieving_disciplined'; // Menos talento pero muy disciplinado

export class TeamAttributeFactory {
    
    /**
     * Crea atributos de equipo basados en un arquetipo
     */
    static createByArchetype(
        teamId: string, 
        teamName: string, 
        archetype: TeamArchetype,
        baseLevel: 'poor' | 'below_average' | 'average' | 'good' | 'elite' = 'average'
    ): TeamAttributeSystem {
        
        const baseRating = this.getBaseRating(baseLevel);
        let attributes: CompleteTeamAttributes;
        
        switch (archetype) {
            case 'offensive_powerhouse':
                attributes = this.createOffensivePowerhouse(baseRating);
                break;
            case 'defensive_fortress':
                attributes = this.createDefensiveFortress(baseRating);
                break;
            case 'balanced_contender':
                attributes = this.createBalancedContender(baseRating);
                break;
            case 'special_teams_focused':
                attributes = this.createSpecialTeamsFocused(baseRating);
                break;
            case 'young_developing':
                attributes = this.createYoungDeveloping(baseRating);
                break;
            case 'veteran_experienced':
                attributes = this.createVeteranExperienced(baseRating);
                break;
            case 'undisciplined_talented':
                attributes = this.createUndisciplinedTalented(baseRating);
                break;
            case 'overachieving_disciplined':
                attributes = this.createOverachievingDisciplined(baseRating);
                break;
            default:
                attributes = this.createBalancedContender(baseRating);
        }
        
        return new TeamAttributeSystem({
            teamId,
            teamName,
            attributes
        });
    }
    
    /**
     * Crea atributos completamente aleatorios
     */
    static createRandom(teamId: string, teamName: string): TeamAttributeSystem {
        const attributes: CompleteTeamAttributes = {
            offensive: this.generateRandomOffensive(),
            defensive: this.generateRandomDefensive(),
            specialTeams: this.generateRandomSpecialTeams(),
            general: this.generateRandomGeneral()
        };
        
        return new TeamAttributeSystem({
            teamId,
            teamName,
            attributes
        });
    }
    
    /**
     * Crea atributos basados en jugadores del equipo
     */
    static createFromPlayers(
        teamId: string, 
        teamName: string, 
        players: any[], // Simplificado por ahora
        coachingInfluence: number = 10
    ): TeamAttributeSystem {
        // Por ahora, crear atributos promedio y agregar influencia de coaching
        const baseAttributes = this.createBalancedContender(65);
        
        // Aplicar influencia de coaching
        const coachingBonus = (coachingInfluence - 50) / 5; // -10 a +10
        
        // Ajustar algunos atributos clave basados en coaching
        baseAttributes.offensive.audibleAdjustment += coachingBonus;
        baseAttributes.offensive.offensiveLineChemistry += coachingBonus;
        baseAttributes.defensive.defensiveIQ += coachingBonus;
        baseAttributes.general.teamDiscipline += coachingBonus;
        baseAttributes.general.teamChemistry += coachingBonus;
        
        // Asegurar que estén en rango válido
        this.clampAttributes(baseAttributes);
        
        return new TeamAttributeSystem({
            teamId,
            teamName,
            attributes: baseAttributes
        });
    }
    
    // Métodos privados para crear arquetipos específicos
    
    private static createOffensivePowerhouse(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: {
                passingAccuracy: baseRating + 15,
                armStrength: baseRating + 20,
                qbMobility: baseRating + 10,
                postSnapVision: baseRating + 18,
                pocketDiscipline: baseRating + 12,
                powerRunBlocking: baseRating + 15,
                zoneBlockingAgility: baseRating + 12,
                passProtectionAnchor: baseRating + 18,
                offensiveLineChemistry: baseRating + 15,
                audibleAdjustment: baseRating + 10,
                snapConsistency: baseRating + 8,
                breakawayAbility: baseRating + 20,
                rbVersatility: baseRating + 15,
                receiverSeparation: baseRating + 22,
                contestedCatches: baseRating + 18,
                routeChemistry: baseRating + 20,
                teVersatility: baseRating + 12,
                thirdDownConversion: baseRating + 25,
                redZoneEfficiency: baseRating + 20,
                offensivePenalties: baseRating - 5
            },
            defensive: this.generateAverageDefensive(baseRating - 5),
            specialTeams: this.generateAverageSpecialTeams(baseRating),
            general: {
                resilience: baseRating + 5,
                clutchFactor: baseRating + 10,
                teamDiscipline: baseRating,
                teamChemistry: baseRating + 8,
                netTurnoverMargin: 5,
                conditioningLevel: baseRating + 5,
                injuryResistance: baseRating,
                homeFieldAdvantage: baseRating + 5,
                weatherAdaptability: baseRating,
                bigGameExperience: baseRating + 8
            }
        };
    }
    
    private static createDefensiveFortress(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: this.generateAverageOffensive(baseRating - 5),
            defensive: {
                fourManRushPressure: baseRating + 20,
                interiorLineAbsorption: baseRating + 18,
                edgeSetting: baseRating + 15,
                runFitDiscipline: baseRating + 22,
                playActionReaction: baseRating + 18,
                tacklesForLoss: baseRating + 25,
                pressManCoverage: baseRating + 20,
                freeSafetyRange: baseRating + 18,
                strongSafetySupport: baseRating + 15,
                zoneCoverageCoordination: baseRating + 20,
                coverageConfidence: baseRating + 15,
                defensiveIQ: baseRating + 22,
                turnoverGeneration: baseRating + 25,
                redZoneDefense: baseRating + 20,
                defensivePenalties: baseRating - 8
            },
            specialTeams: this.generateAverageSpecialTeams(baseRating),
            general: {
                resilience: baseRating + 15,
                clutchFactor: baseRating + 12,
                teamDiscipline: baseRating + 10,
                teamChemistry: baseRating + 8,
                netTurnoverMargin: 8,
                conditioningLevel: baseRating + 8,
                injuryResistance: baseRating + 5,
                homeFieldAdvantage: baseRating + 10,
                weatherAdaptability: baseRating + 5,
                bigGameExperience: baseRating + 10
            }
        };
    }
    
    private static createBalancedContender(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: this.generateAverageOffensive(baseRating + 5),
            defensive: this.generateAverageDefensive(baseRating + 5),
            specialTeams: this.generateAverageSpecialTeams(baseRating + 5),
            general: {
                resilience: baseRating + 10,
                clutchFactor: baseRating + 8,
                teamDiscipline: baseRating + 8,
                teamChemistry: baseRating + 10,
                netTurnoverMargin: 3,
                conditioningLevel: baseRating + 8,
                injuryResistance: baseRating + 5,
                homeFieldAdvantage: baseRating + 5,
                weatherAdaptability: baseRating + 5,
                bigGameExperience: baseRating + 8
            }
        };
    }
    
    private static createSpecialTeamsFocused(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: this.generateAverageOffensive(baseRating - 3),
            defensive: this.generateAverageDefensive(baseRating - 3),
            specialTeams: {
                kickerRange: baseRating + 25,
                kickerComposure: baseRating + 20,
                punterPlacement: baseRating + 22,
                punterHangTime: baseRating + 18,
                returnExplosiveness: baseRating + 25,
                ballSecurity: baseRating + 20,
                coverageSpeed: baseRating + 22,
                longSnapperReliability: baseRating + 15,
                specialTeamsPenalties: baseRating - 10
            },
            general: {
                resilience: baseRating + 5,
                clutchFactor: baseRating + 12,
                teamDiscipline: baseRating + 8,
                teamChemistry: baseRating + 5,
                netTurnoverMargin: 2,
                conditioningLevel: baseRating + 10,
                injuryResistance: baseRating,
                homeFieldAdvantage: baseRating + 8,
                weatherAdaptability: baseRating + 5,
                bigGameExperience: baseRating + 5
            }
        };
    }
    
    private static createYoungDeveloping(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: {
                ...this.generateAverageOffensive(baseRating - 8),
                qbMobility: baseRating + 10,        // Jóvenes más móviles
                receiverSeparation: baseRating + 8,  // Velocidad joven
                breakawayAbility: baseRating + 12    // Atletismo joven
            },
            defensive: {
                ...this.generateAverageDefensive(baseRating - 8),
                fourManRushPressure: baseRating + 5, // Atletismo joven
                tacklesForLoss: baseRating + 8
            },
            specialTeams: {
                ...this.generateAverageSpecialTeams(baseRating - 5),
                returnExplosiveness: baseRating + 15, // Velocidad joven
                coverageSpeed: baseRating + 10
            },
            general: {
                resilience: baseRating - 10,         // Menos experiencia mental
                clutchFactor: baseRating - 15,       // Menos experiencia en presión
                teamDiscipline: baseRating - 12,     // Más errores
                teamChemistry: baseRating - 8,       // Menos tiempo juntos
                netTurnoverMargin: -3,               // Más errores
                conditioningLevel: baseRating + 15,  // Mejor condición física
                injuryResistance: baseRating + 8,    // Más jóvenes
                homeFieldAdvantage: baseRating - 5,
                weatherAdaptability: baseRating - 8,
                bigGameExperience: baseRating - 20   // Poca experiencia
            }
        };
    }
    
    private static createVeteranExperienced(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: {
                ...this.generateAverageOffensive(baseRating + 3),
                postSnapVision: baseRating + 15,     // Experiencia mental
                audibleAdjustment: baseRating + 18,  // Experiencia
                routeChemistry: baseRating + 20,     // Tiempo juntos
                offensiveLineChemistry: baseRating + 15
            },
            defensive: {
                ...this.generateAverageDefensive(baseRating + 3),
                playActionReaction: baseRating + 18, // Experiencia
                defensiveIQ: baseRating + 20,        // Veteranía
                zoneCoverageCoordination: baseRating + 15
            },
            specialTeams: {
                ...this.generateAverageSpecialTeams(baseRating + 5),
                kickerComposure: baseRating + 20,    // Experiencia bajo presión
                ballSecurity: baseRating + 15        // Menos errores
            },
            general: {
                resilience: baseRating + 20,         // Experiencia mental
                clutchFactor: baseRating + 25,       // Experiencia en presión
                teamDiscipline: baseRating + 15,     // Menos errores
                teamChemistry: baseRating + 18,      // Tiempo juntos
                netTurnoverMargin: 8,                // Menos errores
                conditioningLevel: baseRating - 8,   // Edad
                injuryResistance: baseRating - 12,   // Más viejos
                homeFieldAdvantage: baseRating + 8,
                weatherAdaptability: baseRating + 12,
                bigGameExperience: baseRating + 25   // Mucha experiencia
            }
        };
    }
    
    private static createUndisciplinedTalented(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: {
                ...this.generateAverageOffensive(baseRating + 8),
                offensivePenalties: baseRating + 20  // Muchas penalizaciones
            },
            defensive: {
                ...this.generateAverageDefensive(baseRating + 8),
                defensivePenalties: baseRating + 18  // Muchas penalizaciones
            },
            specialTeams: {
                ...this.generateAverageSpecialTeams(baseRating + 5),
                specialTeamsPenalties: baseRating + 15
            },
            general: {
                resilience: baseRating - 8,          // Inconsistentes
                clutchFactor: baseRating - 12,       // No confiables bajo presión
                teamDiscipline: baseRating - 25,     // Muy indisciplinados
                teamChemistry: baseRating - 10,      // Problemas de vestuario
                netTurnoverMargin: -5,               // Errores por indisciplina
                conditioningLevel: baseRating + 10,  // Talento físico
                injuryResistance: baseRating,
                homeFieldAdvantage: baseRating - 5,  // Problemas con fans
                weatherAdaptability: baseRating - 8,
                bigGameExperience: baseRating - 10   // Se desmoronan bajo presión
            }
        };
    }
    
    private static createOverachievingDisciplined(baseRating: number): CompleteTeamAttributes {
        return {
            offensive: {
                ...this.generateAverageOffensive(baseRating - 5),
                offensivePenalties: baseRating - 15, // Muy disciplinados
                audibleAdjustment: baseRating + 12,  // Bien preparados
                offensiveLineChemistry: baseRating + 10
            },
            defensive: {
                ...this.generateAverageDefensive(baseRating - 5),
                defensivePenalties: baseRating - 18, // Muy disciplinados
                runFitDiscipline: baseRating + 15,   // Muy disciplinados
                defensiveIQ: baseRating + 12
            },
            specialTeams: {
                ...this.generateAverageSpecialTeams(baseRating),
                specialTeamsPenalties: baseRating - 20, // Muy disciplinados
                ballSecurity: baseRating + 12
            },
            general: {
                resilience: baseRating + 15,         // Mentalmente fuertes
                clutchFactor: baseRating + 18,       // Ejecutan bajo presión
                teamDiscipline: baseRating + 25,     // Muy disciplinados
                teamChemistry: baseRating + 20,      // Muy unidos
                netTurnoverMargin: 6,                // Pocos errores
                conditioningLevel: baseRating + 12,  // Bien preparados
                injuryResistance: baseRating + 8,    // Bien cuidados
                homeFieldAdvantage: baseRating + 10, // Fans leales
                weatherAdaptability: baseRating + 10,
                bigGameExperience: baseRating + 8    // Bien preparados
            }
        };
    }
    
    // Métodos auxiliares
    
    private static getBaseRating(level: 'poor' | 'below_average' | 'average' | 'good' | 'elite'): number {
        switch (level) {
            case 'poor': return 45;
            case 'below_average': return 55;
            case 'average': return 65;
            case 'good': return 75;
            case 'elite': return 85;
        }
    }
    
    private static generateAverageOffensive(baseRating: number): OffensiveAttributes {
        return {
            passingAccuracy: baseRating + this.randomVariation(),
            armStrength: baseRating + this.randomVariation(),
            qbMobility: baseRating + this.randomVariation(),
            postSnapVision: baseRating + this.randomVariation(),
            pocketDiscipline: baseRating + this.randomVariation(),
            powerRunBlocking: baseRating + this.randomVariation(),
            zoneBlockingAgility: baseRating + this.randomVariation(),
            passProtectionAnchor: baseRating + this.randomVariation(),
            offensiveLineChemistry: baseRating + this.randomVariation(),
            audibleAdjustment: baseRating + this.randomVariation(),
            snapConsistency: baseRating + this.randomVariation(),
            breakawayAbility: baseRating + this.randomVariation(),
            rbVersatility: baseRating + this.randomVariation(),
            receiverSeparation: baseRating + this.randomVariation(),
            contestedCatches: baseRating + this.randomVariation(),
            routeChemistry: baseRating + this.randomVariation(),
            teVersatility: baseRating + this.randomVariation(),
            thirdDownConversion: baseRating + this.randomVariation(),
            redZoneEfficiency: baseRating + this.randomVariation(),
            offensivePenalties: baseRating + this.randomVariation()
        };
    }
    
    private static generateAverageDefensive(baseRating: number): DefensiveAttributes {
        return {
            fourManRushPressure: baseRating + this.randomVariation(),
            interiorLineAbsorption: baseRating + this.randomVariation(),
            edgeSetting: baseRating + this.randomVariation(),
            runFitDiscipline: baseRating + this.randomVariation(),
            playActionReaction: baseRating + this.randomVariation(),
            tacklesForLoss: baseRating + this.randomVariation(),
            pressManCoverage: baseRating + this.randomVariation(),
            freeSafetyRange: baseRating + this.randomVariation(),
            strongSafetySupport: baseRating + this.randomVariation(),
            zoneCoverageCoordination: baseRating + this.randomVariation(),
            coverageConfidence: baseRating + this.randomVariation(),
            defensiveIQ: baseRating + this.randomVariation(),
            turnoverGeneration: baseRating + this.randomVariation(),
            redZoneDefense: baseRating + this.randomVariation(),
            defensivePenalties: baseRating + this.randomVariation()
        };
    }
    
    private static generateAverageSpecialTeams(baseRating: number): SpecialTeamsAttributes {
        return {
            kickerRange: baseRating + this.randomVariation(),
            kickerComposure: baseRating + this.randomVariation(),
            punterPlacement: baseRating + this.randomVariation(),
            punterHangTime: baseRating + this.randomVariation(),
            returnExplosiveness: baseRating + this.randomVariation(),
            ballSecurity: baseRating + this.randomVariation(),
            coverageSpeed: baseRating + this.randomVariation(),
            longSnapperReliability: baseRating + this.randomVariation(),
            specialTeamsPenalties: baseRating + this.randomVariation()
        };
    }
    
    private static generateRandomOffensive(): OffensiveAttributes {
        return this.generateAverageOffensive(50 + Math.random() * 30);
    }
    
    private static generateRandomDefensive(): DefensiveAttributes {
        return this.generateAverageDefensive(50 + Math.random() * 30);
    }
    
    private static generateRandomSpecialTeams(): SpecialTeamsAttributes {
        return this.generateAverageSpecialTeams(50 + Math.random() * 30);
    }
    
    private static generateRandomGeneral(): GeneralTeamAttributes {
        return {
            resilience: 50 + Math.random() * 40,
            clutchFactor: 50 + Math.random() * 40,
            teamDiscipline: 50 + Math.random() * 40,
            teamChemistry: 50 + Math.random() * 40,
            netTurnoverMargin: Math.round((Math.random() - 0.5) * 20), // -10 a +10
            conditioningLevel: 50 + Math.random() * 40,
            injuryResistance: 50 + Math.random() * 40,
            homeFieldAdvantage: 50 + Math.random() * 40,
            weatherAdaptability: 50 + Math.random() * 40,
            bigGameExperience: 50 + Math.random() * 40
        };
    }
    
    private static randomVariation(): number {
        return Math.round((Math.random() - 0.5) * 20); // -10 a +10
    }
    
    private static clampAttributes(attributes: CompleteTeamAttributes): void {
        // Asegurar que todos los atributos estén entre 0-100
        const clamp = (value: number) => Math.max(0, Math.min(100, value));
        
        Object.keys(attributes.offensive).forEach(key => {
            (attributes.offensive as any)[key] = clamp((attributes.offensive as any)[key]);
        });
        
        Object.keys(attributes.defensive).forEach(key => {
            (attributes.defensive as any)[key] = clamp((attributes.defensive as any)[key]);
        });
        
        Object.keys(attributes.specialTeams).forEach(key => {
            (attributes.specialTeams as any)[key] = clamp((attributes.specialTeams as any)[key]);
        });
        
        Object.keys(attributes.general).forEach(key => {
            if (key === 'netTurnoverMargin') {
                attributes.general.netTurnoverMargin = Math.max(-50, Math.min(50, attributes.general.netTurnoverMargin));
            } else {
                (attributes.general as any)[key] = clamp((attributes.general as any)[key]);
            }
        });
    }
}