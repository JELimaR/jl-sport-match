// TeamAttributeCalculator - Calcula atributos de equipo a partir de jugadores individuales y trabajo en equipo
// Implementa el concepto de que "el resultado sea mayor que la suma de las partes"

import { Player } from "../core/Player";
import { CoachingStaff } from "../teams/coaches/CoachingStaff";
import { CompleteTeamAttributes, OffensiveAttributes, DefensiveAttributes, SpecialTeamsAttributes, GeneralTeamAttributes } from "./TeamAttributes";
import { PlayerTeamworkProfile, CompleteTeamworkSystem, TeamSynergyCalculator, TeamworkProfileFactory } from "./TeamworkAttributes";

export class TeamAttributeCalculator {
    
    /**
     * Calcula los atributos completos del equipo basándose en:
     * 1. Atributos individuales de los jugadores
     * 2. Sistema de trabajo en equipo (5 C's)
     * 3. Cohesión y personalidades
     * 4. Influencia de los coaches
     */
    static calculateTeamAttributes(
        players: Player[],
        coachingStaff: CoachingStaff,
        teamworkProfiles?: PlayerTeamworkProfile[],
        teamworkSystem?: CompleteTeamworkSystem
    ): CompleteTeamAttributes {
        
        // 1. Crear perfiles de trabajo en equipo si no se proporcionan
        const profiles = teamworkProfiles || this.createTeamworkProfiles(players);
        const teamwork = teamworkSystem || TeamworkProfileFactory.createTeamworkSystem(profiles);
        
        // 2. Calcular multiplicador de sinergia
        const synergyMultiplier = TeamSynergyCalculator.calculateTeamSynergyMultiplier(
            profiles, 
            coachingStaff.getAllCoaches(), 
            teamwork
        );
        
        // 3. Calcular atributos base de jugadores individuales
        const baseAttributes = this.calculateBaseAttributesFromPlayers(players);
        
        // 4. Aplicar influencia de coaches
        const coachInfluencedAttributes = this.applyCoachingInfluence(baseAttributes, coachingStaff);
        
        // 5. Aplicar sinergia de trabajo en equipo
        const synergyAttributes = this.applySynergyMultiplier(coachInfluencedAttributes, synergyMultiplier, teamwork);
        
        // 6. Calcular atributos generales basados en personalidades
        const generalAttributes = this.calculateGeneralAttributes(profiles, teamwork, coachingStaff);
        
        return {
            offensive: synergyAttributes.offensive,
            defensive: synergyAttributes.defensive,
            specialTeams: synergyAttributes.specialTeams,
            general: generalAttributes
        };
    }
    
    /**
     * Crea perfiles de trabajo en equipo para todos los jugadores
     */
    private static createTeamworkProfiles(players: Player[]): PlayerTeamworkProfile[] {
        return players.map(player => 
            TeamworkProfileFactory.createPlayerProfile(
                player.id,
                player.attributes,
                player.getExperienceInPosition(player.position)?.yearsPlayed || 1
            )
        );
    }
    
    /**
     * Calcula atributos base agregando las habilidades individuales de los jugadores
     */
    private static calculateBaseAttributesFromPlayers(players: Player[]): CompleteTeamAttributes {
        // Separar jugadores por unidad
        const offense = players.filter(p => this.isOffensivePosition(p.position));
        const defense = players.filter(p => this.isDefensivePosition(p.position));
        const specialTeams = players; // Todos pueden jugar equipos especiales
        
        return {
            offensive: this.calculateOffensiveAttributesFromPlayers(offense),
            defensive: this.calculateDefensiveAttributesFromPlayers(defense),
            specialTeams: this.calculateSpecialTeamsAttributesFromPlayers(specialTeams),
            general: {
                resilience: 50, clutchFactor: 50, teamDiscipline: 50, teamChemistry: 50,
                netTurnoverMargin: 0, conditioningLevel: 50, injuryResistance: 50,
                homeFieldAdvantage: 50, weatherAdaptability: 50, bigGameExperience: 50
            } // Se calculará después con personalidades
        };
    }
    
    /**
     * Calcula atributos ofensivos basándose en jugadores ofensivos
     */
    private static calculateOffensiveAttributesFromPlayers(offensivePlayers: Player[]): OffensiveAttributes {
        // Encontrar jugadores por posición
        const qbs = offensivePlayers.filter(p => p.position === 'QB');
        const rbs = offensivePlayers.filter(p => p.position === 'RB');
        const wrs = offensivePlayers.filter(p => p.position === 'WR');
        const tes = offensivePlayers.filter(p => p.position === 'TE');
        const oline = offensivePlayers.filter(p => ['C', 'G', 'T'].includes(p.position));
        
        // Calcular atributos basándose en el mejor jugador de cada posición
        const bestQB = this.getBestPlayerByRating(qbs);
        const bestRB = this.getBestPlayerByRating(rbs);
        const bestWR = this.getBestPlayerByRating(wrs);
        const bestTE = this.getBestPlayerByRating(tes);
        
        return {
            // QB y Mando - basado en el QB principal
            passingAccuracy: bestQB?.attributes.throwing || 50,
            armStrength: bestQB?.attributes.throwing || 50,
            qbMobility: bestQB ? (bestQB.attributes.speed + bestQB.attributes.agility) / 2 : 50,
            postSnapVision: bestQB ? (bestQB.attributes.awareness + bestQB.attributes.intelligence) / 2 : 50,
            pocketDiscipline: bestQB?.attributes.composure || 50,
            
            // Línea Ofensiva - promedio de la línea
            powerRunBlocking: this.calculateAverageAttribute(oline, 'strength'),
            zoneBlockingAgility: this.calculateAverageAttribute(oline, 'agility'),
            passProtectionAnchor: this.calculateAverageAttribute(oline, 'blocking'),
            offensiveLineChemistry: this.calculateAverageAttribute(oline, 'awareness'), // Se mejorará con sinergia
            audibleAdjustment: this.calculateAverageAttribute(oline, 'intelligence'),
            snapConsistency: oline.find(p => p.position === 'C')?.attributes.awareness || 70,
            
            // RB y Receptores
            breakawayAbility: bestRB?.attributes.strength || 50,
            rbVersatility: bestRB ? (bestRB.attributes.catching + bestRB.attributes.blocking) / 2 : 50,
            receiverSeparation: bestWR ? (bestWR.attributes.speed + bestWR.attributes.agility) / 2 : 50,
            contestedCatches: bestWR ? (bestWR.attributes.catching + bestWR.attributes.strength) / 2 : 50,
            routeChemistry: bestWR?.attributes.awareness || 50, // Se mejorará con sinergia
            teVersatility: bestTE ? (bestTE.attributes.catching + bestTE.attributes.blocking) / 2 : 50,
            
            // Métricas generales - se calcularán con sinergia
            thirdDownConversion: 50,
            redZoneEfficiency: 50,
            offensivePenalties: 50 // Se mejorará con disciplina
        };
    }
    
    /**
     * Calcula atributos defensivos basándose en jugadores defensivos
     */
    private static calculateDefensiveAttributesFromPlayers(defensivePlayers: Player[]): DefensiveAttributes {
        const dline = defensivePlayers.filter(p => ['DE', 'DT', 'NT'].includes(p.position));
        const lbs = defensivePlayers.filter(p => ['OLB', 'ILB'].includes(p.position));
        const dbs = defensivePlayers.filter(p => ['CB', 'SS', 'FS'].includes(p.position));
        
        return {
            // Front Seven
            fourManRushPressure: this.calculateAverageAttribute(dline, 'strength'),
            interiorLineAbsorption: this.calculateAverageAttribute(dline.filter(p => ['DT', 'NT'].includes(p.position)), 'strength'),
            edgeSetting: this.calculateAverageAttribute(dline.filter(p => p.position === 'DE'), 'strength'),
            runFitDiscipline: this.calculateAverageAttribute([...dline, ...lbs], 'awareness'),
            playActionReaction: this.calculateAverageAttribute(lbs, 'awareness'),
            tacklesForLoss: this.calculateAverageAttribute([...dline, ...lbs], 'tackling'),
            
            // Secundaria
            pressManCoverage: this.calculateAverageAttribute(dbs.filter(p => p.position === 'CB'), 'coverage'),
            freeSafetyRange: this.calculateAverageAttribute(dbs.filter(p => p.position === 'FS'), 'speed'),
            strongSafetySupport: this.calculateAverageAttribute(dbs.filter(p => p.position === 'SS'), 'tackling'),
            zoneCoverageCoordination: this.calculateAverageAttribute(dbs, 'awareness'), // Se mejorará con sinergia
            coverageConfidence: this.calculateAverageAttribute(dbs, 'composure'),
            defensiveIQ: this.calculateAverageAttribute(lbs, 'intelligence'),
            
            // Métricas generales
            turnoverGeneration: this.calculateAverageAttribute(defensivePlayers, 'awareness'),
            redZoneDefense: this.calculateAverageAttribute(defensivePlayers, 'tackling'),
            defensivePenalties: 50 // Se mejorará con disciplina
        };
    }
    
    /**
     * Calcula atributos de equipos especiales
     */
    private static calculateSpecialTeamsAttributesFromPlayers(players: Player[]): SpecialTeamsAttributes {
        const kickers = players.filter(p => p.position === 'K');
        const punters = players.filter(p => p.position === 'P');
        const returners = players.filter(p => ['KR', 'PR'].includes(p.position));
        
        const bestKicker = this.getBestPlayerByRating(kickers);
        const bestPunter = this.getBestPlayerByRating(punters);
        const bestReturner = this.getBestPlayerByRating(returners);
        
        return {
            kickerRange: bestKicker?.attributes.kickPower || 50,
            kickerComposure: bestKicker?.attributes.composure || 50,
            punterPlacement: bestPunter?.attributes.kickAccuracy || 50,
            punterHangTime: bestPunter?.attributes.kickPower || 50,
            returnExplosiveness: bestReturner ? (bestReturner.attributes.speed + bestReturner.attributes.agility) / 2 : 50,
            ballSecurity: bestReturner?.attributes.catching || 50,
            coverageSpeed: this.calculateAverageAttribute(players, 'speed'),
            longSnapperReliability: players.find(p => p.position === 'LS')?.attributes.awareness || 70,
            specialTeamsPenalties: 50 // Se mejorará con disciplina
        };
    }
    
    /**
     * Aplica la influencia de los coaches a los atributos base
     */
    private static applyCoachingInfluence(
        baseAttributes: CompleteTeamAttributes,
        coachingStaff: CoachingStaff
    ): CompleteTeamAttributes {
        const coachingEffectiveness = coachingStaff.getOverallEffectiveness();
        const coachingBonus = (coachingEffectiveness - 50) / 5; // -10 a +10
        
        // Los coaches mejoran especialmente la coordinación y disciplina
        return {
            offensive: {
                ...baseAttributes.offensive,
                offensiveLineChemistry: Math.min(100, baseAttributes.offensive.offensiveLineChemistry + coachingBonus),
                audibleAdjustment: Math.min(100, baseAttributes.offensive.audibleAdjustment + coachingBonus),
                routeChemistry: Math.min(100, baseAttributes.offensive.routeChemistry + coachingBonus),
                thirdDownConversion: Math.min(100, baseAttributes.offensive.thirdDownConversion + coachingBonus),
                redZoneEfficiency: Math.min(100, baseAttributes.offensive.redZoneEfficiency + coachingBonus),
                offensivePenalties: Math.max(0, baseAttributes.offensive.offensivePenalties - coachingBonus) // Menos penalizaciones
            },
            defensive: {
                ...baseAttributes.defensive,
                runFitDiscipline: Math.min(100, baseAttributes.defensive.runFitDiscipline + coachingBonus),
                playActionReaction: Math.min(100, baseAttributes.defensive.playActionReaction + coachingBonus),
                zoneCoverageCoordination: Math.min(100, baseAttributes.defensive.zoneCoverageCoordination + coachingBonus),
                defensiveIQ: Math.min(100, baseAttributes.defensive.defensiveIQ + coachingBonus),
                turnoverGeneration: Math.min(100, baseAttributes.defensive.turnoverGeneration + coachingBonus),
                defensivePenalties: Math.max(0, baseAttributes.defensive.defensivePenalties - coachingBonus)
            },
            specialTeams: {
                ...baseAttributes.specialTeams,
                coverageSpeed: Math.min(100, baseAttributes.specialTeams.coverageSpeed + coachingBonus / 2),
                specialTeamsPenalties: Math.max(0, baseAttributes.specialTeams.specialTeamsPenalties - coachingBonus)
            },
            general: baseAttributes.general
        };
    }
    
    /**
     * Aplica el multiplicador de sinergia - aquí es donde "el resultado es mayor que la suma de las partes"
     */
    private static applySynergyMultiplier(
        attributes: CompleteTeamAttributes,
        synergyMultiplier: number,
        teamwork: CompleteTeamworkSystem
    ): CompleteTeamAttributes {
        
        // La sinergia afecta especialmente los atributos de coordinación y trabajo en equipo
        const synergyBonus = (synergyMultiplier - 1.0) * 50; // -10 a +15 puntos
        
        return {
            offensive: {
                ...attributes.offensive,
                // Los atributos de coordinación se benefician más de la sinergia
                offensiveLineChemistry: Math.min(100, attributes.offensive.offensiveLineChemistry + synergyBonus),
                routeChemistry: Math.min(100, attributes.offensive.routeChemistry + synergyBonus),
                audibleAdjustment: Math.min(100, attributes.offensive.audibleAdjustment + synergyBonus * 0.8),
                thirdDownConversion: Math.min(100, attributes.offensive.thirdDownConversion + synergyBonus * 0.6),
                redZoneEfficiency: Math.min(100, attributes.offensive.redZoneEfficiency + synergyBonus * 0.6),
                
                // Bonus adicional basado en las 5 C's
                passingAccuracy: Math.min(100, attributes.offensive.passingAccuracy + (teamwork.fiveCs.coordination - 50) / 10),
                snapConsistency: Math.min(100, attributes.offensive.snapConsistency + (teamwork.fiveCs.communication - 50) / 10)
            },
            defensive: {
                ...attributes.defensive,
                // La defensa se beneficia enormemente de la coordinación
                zoneCoverageCoordination: Math.min(100, attributes.defensive.zoneCoverageCoordination + synergyBonus),
                runFitDiscipline: Math.min(100, attributes.defensive.runFitDiscipline + synergyBonus * 0.8),
                playActionReaction: Math.min(100, attributes.defensive.playActionReaction + synergyBonus * 0.7),
                coverageConfidence: Math.min(100, attributes.defensive.coverageConfidence + synergyBonus * 0.6),
                
                // Bonus adicional basado en las 5 C's
                defensiveIQ: Math.min(100, attributes.defensive.defensiveIQ + (teamwork.fiveCs.communication - 50) / 10),
                turnoverGeneration: Math.min(100, attributes.defensive.turnoverGeneration + (teamwork.fiveCs.coordination - 50) / 10)
            },
            specialTeams: {
                ...attributes.specialTeams,
                // Equipos especiales dependen mucho de la coordinación
                coverageSpeed: Math.min(100, attributes.specialTeams.coverageSpeed + synergyBonus * 0.5),
                longSnapperReliability: Math.min(100, attributes.specialTeams.longSnapperReliability + (teamwork.fiveCs.coordination - 50) / 10)
            },
            general: attributes.general
        };
    }
    
    /**
     * Calcula atributos generales basándose en personalidades y trabajo en equipo
     */
    private static calculateGeneralAttributes(
        profiles: PlayerTeamworkProfile[],
        teamwork: CompleteTeamworkSystem,
        coachingStaff: CoachingStaff
    ): GeneralTeamAttributes {
        
        // Calcular clutch factor del equipo
        const clutchFactor = TeamSynergyCalculator.calculateTeamClutchFactor(profiles);
        
        // Calcular disciplina basada en personalidades
        const avgAccountability = profiles.reduce((sum, p) => sum + p.personality.accountability, 0) / profiles.length;
        const teamDiscipline = Math.min(100, avgAccountability + (teamwork.cohesionFactors.coaching_trust - 50) / 2);
        
        // Calcular resiliencia
        const avgResilience = profiles.reduce((sum, p) => sum + p.personality.resilience, 0) / profiles.length;
        const resilience = Math.min(100, avgResilience + (teamwork.cohesionFactors.adversityOvercome * 2));
        
        // Calcular química del equipo
        const teamChemistry = (
            teamwork.fiveCs.cooperation * 0.3 +
            teamwork.fiveCs.communication * 0.25 +
            teamwork.cohesionFactors.locker_room_culture * 0.25 +
            teamwork.unitCohesion.crossUnitChemistry * 0.2
        ) / 100 * 100;
        
        // Calcular net turnover margin basado en disciplina y awareness
        const avgAwareness = profiles.reduce((sum, p) => sum + (p.fiveCs.coordination + p.fiveCs.communication) / 2, 0) / profiles.length;
        const netTurnoverMargin = Math.round((avgAwareness - 50) / 5); // -10 a +10
        
        // Otros atributos
        const avgYearsWithTeam = profiles.reduce((sum, p) => sum + p.yearsWithTeam, 0) / profiles.length;
        const bigGameExperience = Math.min(100, 40 + avgYearsWithTeam * 8 + teamwork.cohesionFactors.successesShared * 3);
        
        const avgCompetitiveness = profiles.reduce((sum, p) => sum + p.personality.competitiveness, 0) / profiles.length;
        const conditioningLevel = Math.min(100, avgCompetitiveness + (coachingStaff.getOverallEffectiveness() - 50) / 2);
        
        return {
            resilience: Math.round(resilience),
            clutchFactor: Math.round(clutchFactor),
            teamDiscipline: Math.round(teamDiscipline),
            teamChemistry: Math.round(teamChemistry),
            netTurnoverMargin: Math.max(-50, Math.min(50, netTurnoverMargin)),
            conditioningLevel: Math.round(conditioningLevel),
            injuryResistance: Math.round(60 + Math.random() * 20), // Simplificado por ahora
            homeFieldAdvantage: Math.round(50 + (teamChemistry - 50) / 2),
            weatherAdaptability: Math.round(50 + (avgResilience - 50) / 2),
            bigGameExperience: Math.round(bigGameExperience)
        };
    }
    
    // Métodos auxiliares
    
    private static isOffensivePosition(position: string): boolean {
        return ['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'T'].includes(position);
    }
    
    private static isDefensivePosition(position: string): boolean {
        return ['DE', 'DT', 'NT', 'OLB', 'ILB', 'CB', 'SS', 'FS'].includes(position);
    }
    
    private static getBestPlayerByRating(players: Player[]): Player | undefined {
        if (players.length === 0) return undefined;
        return players.reduce((best, current) => 
            current.playerEvaluation.primaryRating > best.playerEvaluation.primaryRating ? current : best
        );
    }
    
    private static calculateAverageAttribute(players: Player[], attribute: keyof typeof players[0]['attributes']): number {
        if (players.length === 0) return 50;
        
        const sum = players.reduce((total, player) => {
            const value = player.attributes[attribute];
            return total + (typeof value === 'number' ? value : 50);
        }, 0);
        
        return Math.round(sum / players.length);
    }
}