// TeamworkAttributes - Las 5 C's del trabajo en equipo y cohesión
// Sistema que permite que el resultado del equipo sea mayor que la suma de las partes

// Las 5 C's del trabajo en equipo
export interface TeamworkFiveCs {
    // 1. Communication - Comunicación
    communication: number;           // Capacidad de comunicarse efectivamente (0-100)
    
    // 2. Coordination - Coordinación  
    coordination: number;            // Capacidad de sincronizar acciones (0-100)
    
    // 3. Cooperation - Cooperación
    cooperation: number;             // Disposición a ayudar y colaborar (0-100)
    
    // 4. Commitment - Compromiso
    commitment: number;              // Dedicación al éxito del equipo (0-100)
    
    // 5. Confidence - Confianza
    confidence: number;              // Confianza en compañeros y sistema (0-100)
}

// Atributos de personalidad que afectan el trabajo en equipo
export interface PersonalityTraits {
    // Personalidad individual
    leadership: number;              // Tendencia a liderar (0-100)
    followership: number;            // Capacidad de seguir liderazgo (0-100)
    adaptability: number;            // Flexibilidad ante cambios (0-100)
    competitiveness: number;         // Impulso competitivo (0-100)
    
    // Inteligencia emocional
    emotionalIntelligence: number;   // Manejo de emociones propias y ajenas (0-100)
    conflictResolution: number;      // Capacidad de resolver conflictos (0-100)
    empathy: number;                 // Comprensión de otros (0-100)
    
    // Factores de cohesión
    teamFirst: number;               // Priorizar equipo sobre individual (0-100)
    accountability: number;          // Responsabilidad por errores (0-100)
    resilience: number;              // Recuperación ante adversidad (0-100)
}

// Cohesión específica por unidad
export interface UnitCohesion {
    // Ofensiva
    offensiveLineCohesion: number;   // Química de la línea ofensiva (0-100)
    qbReceiversCohesion: number;     // Química QB-receptores (0-100)
    runGameCohesion: number;         // Coordinación del juego terrestre (0-100)
    
    // Defensiva
    frontSevenCohesion: number;      // Química del front seven (0-100)
    secondaryCohesion: number;       // Química de la secundaria (0-100)
    passRushCoverage: number;        // Coordinación rush-cobertura (0-100)
    
    // Equipos Especiales
    specialTeamsCohesion: number;    // Química en equipos especiales (0-100)
    
    // General
    veteranLeadership: number;       // Liderazgo de veteranos (0-100)
    rookieIntegration: number;       // Integración de rookies (0-100)
    crossUnitChemistry: number;      // Química entre unidades (0-100)
}

// Factores externos que afectan la cohesión
export interface CohesionFactors {
    // Tiempo juntos
    timeTogetherBonus: number;       // Bonus por tiempo jugando juntos (0-20)
    
    // Experiencias compartidas
    adversityOvercome: number;       // Adversidades superadas juntos (0-15)
    successesShared: number;         // Éxitos compartidos (0-15)
    
    // Factores de vestuario
    locker_room_culture: number;     // Cultura del vestuario (0-100)
    leadership_structure: number;    // Estructura de liderazgo (0-100)
    
    // Factores externos
    coaching_trust: number;          // Confianza en los coaches (0-100)
    organizational_stability: number; // Estabilidad organizacional (0-100)
}

// Sistema completo de trabajo en equipo
export interface CompleteTeamworkSystem {
    fiveCs: TeamworkFiveCs;
    personality: PersonalityTraits;
    unitCohesion: UnitCohesion;
    cohesionFactors: CohesionFactors;
}

// Configuración para jugadores individuales
export interface PlayerTeamworkProfile {
    playerId: string;
    fiveCs: TeamworkFiveCs;
    personality: PersonalityTraits;
    
    // Relaciones específicas con otros jugadores
    strongConnections: string[];     // IDs de jugadores con buena química
    conflictsWith: string[];         // IDs de jugadores con conflictos
    
    // Historial
    yearsWithTeam: number;
    previousTeamExperience: number;  // Experiencia previa en otros equipos
}

// Calculadora de sinergia de equipo
export class TeamSynergyCalculator {
    
    /**
     * Calcula el multiplicador de sinergia del equipo
     * Este es el factor que hace que el resultado sea mayor que la suma de las partes
     */
    static calculateTeamSynergyMultiplier(
        players: PlayerTeamworkProfile[],
        coaches: any[], // Simplificado por ahora
        teamworkSystem: CompleteTeamworkSystem
    ): number {
        // Calcular componentes de sinergia
        const communicationSynergy = this.calculateCommunicationSynergy(players, teamworkSystem);
        const leadershipSynergy = this.calculateLeadershipSynergy(players);
        const cohesionSynergy = this.calculateCohesionSynergy(teamworkSystem);
        const experienceSynergy = this.calculateExperienceSynergy(players, teamworkSystem);
        
        // Combinar todos los factores
        const baseSynergy = (
            communicationSynergy * 0.25 +
            leadershipSynergy * 0.25 +
            cohesionSynergy * 0.30 +
            experienceSynergy * 0.20
        );
        
        // Convertir a multiplicador (0.8 a 1.3)
        // 0 = 0.8x (equipo disfuncional)
        // 50 = 1.0x (equipo promedio)  
        // 100 = 1.3x (equipo con sinergia élite)
        const synergyMultiplier = 0.8 + (baseSynergy / 100) * 0.5;
        
        return Math.max(0.8, Math.min(1.3, synergyMultiplier));
    }
    
    /**
     * Calcula la sinergia de comunicación
     */
    private static calculateCommunicationSynergy(
        players: PlayerTeamworkProfile[],
        teamworkSystem: CompleteTeamworkSystem
    ): number {
        // Promedio de comunicación individual
        const avgCommunication = players.reduce((sum, p) => sum + p.fiveCs.communication, 0) / players.length;
        
        // Bonus por líderes comunicativos
        const communicativeLeaders = players.filter(p => 
            p.fiveCs.communication >= 80 && p.personality.leadership >= 75
        ).length;
        const leadershipBonus = Math.min(20, communicativeLeaders * 5);
        
        // Penalty por barreras de comunicación
        const poorCommunicators = players.filter(p => p.fiveCs.communication < 50).length;
        const communicationPenalty = Math.min(15, poorCommunicators * 3);
        
        return Math.max(0, Math.min(100, avgCommunication + leadershipBonus - communicationPenalty));
    }
    
    /**
     * Calcula la sinergia de liderazgo
     */
    private static calculateLeadershipSynergy(players: PlayerTeamworkProfile[]): number {
        // Identificar líderes naturales
        const strongLeaders = players.filter(p => p.personality.leadership >= 80);
        const goodFollowers = players.filter(p => p.personality.followership >= 75);
        
        // Balance ideal: 2-3 líderes fuertes, mayoría buenos seguidores
        let leadershipScore = 50; // Base
        
        if (strongLeaders.length >= 2 && strongLeaders.length <= 4) {
            leadershipScore += 20; // Buen número de líderes
        } else if (strongLeaders.length > 4) {
            leadershipScore -= 10; // Demasiados líderes (conflicto)
        } else if (strongLeaders.length < 2) {
            leadershipScore -= 15; // Falta de liderazgo
        }
        
        // Bonus por buenos seguidores
        const followerRatio = goodFollowers.length / players.length;
        if (followerRatio >= 0.7) {
            leadershipScore += 15;
        }
        
        // Penalty por conflictos de ego
        const highEgoPlayers = players.filter(p => 
            p.personality.leadership >= 85 && p.personality.teamFirst < 60
        ).length;
        leadershipScore -= highEgoPlayers * 8;
        
        return Math.max(0, Math.min(100, leadershipScore));
    }
    
    /**
     * Calcula la sinergia de cohesión
     */
    private static calculateCohesionSynergy(teamworkSystem: CompleteTeamworkSystem): number {
        const cohesion = teamworkSystem.unitCohesion;
        const factors = teamworkSystem.cohesionFactors;
        
        // Promedio de cohesión por unidad
        const unitCohesionAvg = (
            cohesion.offensiveLineCohesion +
            cohesion.qbReceiversCohesion +
            cohesion.frontSevenCohesion +
            cohesion.secondaryCohesion +
            cohesion.specialTeamsCohesion
        ) / 5;
        
        // Bonus por factores externos
        const externalBonus = (
            factors.locker_room_culture * 0.3 +
            factors.leadership_structure * 0.2 +
            factors.coaching_trust * 0.3 +
            factors.organizational_stability * 0.2
        ) / 100 * 20; // Máximo 20 puntos de bonus
        
        // Bonus por experiencias compartidas
        const experienceBonus = factors.adversityOvercome + factors.successesShared;
        
        return Math.max(0, Math.min(100, unitCohesionAvg + externalBonus + experienceBonus));
    }
    
    /**
     * Calcula la sinergia de experiencia
     */
    private static calculateExperienceSynergy(
        players: PlayerTeamworkProfile[],
        teamworkSystem: CompleteTeamworkSystem
    ): number {
        // Promedio de años con el equipo
        const avgYearsWithTeam = players.reduce((sum, p) => sum + p.yearsWithTeam, 0) / players.length;
        
        // Bonus por tiempo juntos (máximo en 4 años)
        const timeBonus = Math.min(25, avgYearsWithTeam * 6);
        
        // Balance veteranos-rookies
        const veterans = players.filter(p => p.yearsWithTeam >= 3).length;
        const rookies = players.filter(p => p.yearsWithTeam === 0).length;
        
        let balanceScore = 50;
        const veteranRatio = veterans / players.length;
        
        if (veteranRatio >= 0.4 && veteranRatio <= 0.7) {
            balanceScore += 15; // Buen balance
        } else if (veteranRatio > 0.8) {
            balanceScore -= 10; // Demasiado veterano
        } else if (veteranRatio < 0.3) {
            balanceScore -= 15; // Demasiado joven
        }
        
        // Bonus por integración de rookies
        const integrationBonus = teamworkSystem.unitCohesion.rookieIntegration / 100 * 10;
        
        return Math.max(0, Math.min(100, balanceScore + timeBonus + integrationBonus));
    }
    
    /**
     * Calcula conflictos internos que reducen la sinergia
     */
    static calculateInternalConflicts(players: PlayerTeamworkProfile[]): number {
        let conflictScore = 0;
        
        players.forEach(player => {
            // Penalty por conflictos directos
            conflictScore += player.conflictsWith.length * 5;
            
            // Penalty por personalidades problemáticas
            if (player.personality.teamFirst < 40) {
                conflictScore += 8; // Jugador egoísta
            }
            
            if (player.personality.accountability < 50) {
                conflictScore += 5; // No acepta responsabilidad
            }
            
            if (player.personality.conflictResolution < 40) {
                conflictScore += 3; // Mal manejando conflictos
            }
        });
        
        return Math.min(50, conflictScore); // Máximo 50 puntos de penalty
    }
    
    /**
     * Identifica conexiones fuertes que mejoran la sinergia
     */
    static calculateStrongConnections(players: PlayerTeamworkProfile[]): number {
        let connectionBonus = 0;
        
        players.forEach(player => {
            // Bonus por conexiones fuertes
            connectionBonus += player.strongConnections.length * 2;
        });
        
        // Evitar doble conteo (A conectado con B = B conectado con A)
        connectionBonus = connectionBonus / 2;
        
        return Math.min(25, connectionBonus); // Máximo 25 puntos de bonus
    }
    
    /**
     * Calcula el factor de "clutch" del equipo basado en personalidades
     */
    static calculateTeamClutchFactor(players: PlayerTeamworkProfile[]): number {
        // Jugadores que rinden bajo presión
        const clutchPlayers = players.filter(p => 
            p.personality.resilience >= 80 && 
            p.fiveCs.confidence >= 75 &&
            p.fiveCs.commitment >= 80
        );
        
        // Jugadores que se desmoronan bajo presión
        const chokers = players.filter(p => 
            p.personality.resilience < 50 || 
            p.fiveCs.confidence < 50
        );
        
        let clutchScore = 50; // Base
        
        // Bonus por jugadores clutch
        clutchScore += clutchPlayers.length * 8;
        
        // Penalty por jugadores que se presionan
        clutchScore -= chokers.length * 6;
        
        // Bonus por líderes que mantienen la calma
        const calmLeaders = players.filter(p => 
            p.personality.leadership >= 75 && 
            p.personality.resilience >= 80
        );
        clutchScore += calmLeaders.length * 5;
        
        return Math.max(0, Math.min(100, clutchScore));
    }
}

// Factory para crear perfiles de trabajo en equipo
export class TeamworkProfileFactory {
    
    /**
     * Crea un perfil de trabajo en equipo para un jugador
     */
    static createPlayerProfile(
        playerId: string,
        baseAttributes: any, // Atributos del jugador
        yearsWithTeam: number = 1,
        personality?: Partial<PersonalityTraits>
    ): PlayerTeamworkProfile {
        
        // Derivar 5 C's de atributos base
        const fiveCs = this.deriveFiveCsFromAttributes(baseAttributes);
        
        // Generar o usar personalidad proporcionada
        const fullPersonality = this.generatePersonality(baseAttributes, personality);
        
        return {
            playerId,
            fiveCs,
            personality: fullPersonality,
            strongConnections: [],
            conflictsWith: [],
            yearsWithTeam,
            previousTeamExperience: Math.max(0, (baseAttributes.experience || 0) - yearsWithTeam)
        };
    }
    
    /**
     * Deriva las 5 C's de los atributos base del jugador
     */
    private static deriveFiveCsFromAttributes(attributes: any): TeamworkFiveCs {
        return {
            communication: Math.min(100, (attributes.intelligence || 50) + (attributes.leadership || 50)) / 2,
            coordination: Math.min(100, (attributes.awareness || 50) + (attributes.intelligence || 50)) / 2,
            cooperation: Math.min(100, (attributes.leadership || 50) + (attributes.composure || 50)) / 2,
            commitment: Math.min(100, (attributes.leadership || 50) + (attributes.stamina || 50)) / 2,
            confidence: Math.min(100, (attributes.composure || 50) + (attributes.leadership || 50)) / 2
        };
    }
    
    /**
     * Genera personalidad basada en atributos
     */
    private static generatePersonality(
        attributes: any,
        override?: Partial<PersonalityTraits>
    ): PersonalityTraits {
        const base = {
            leadership: attributes.leadership || 50 + Math.random() * 30,
            followership: 100 - (attributes.leadership || 50) + Math.random() * 20,
            adaptability: attributes.intelligence || 50 + Math.random() * 25,
            competitiveness: attributes.strength || 50 + Math.random() * 30,
            emotionalIntelligence: attributes.composure || 50 + Math.random() * 25,
            conflictResolution: attributes.composure || 50 + Math.random() * 20,
            empathy: Math.max(20, 80 - (attributes.leadership || 50) + Math.random() * 30),
            teamFirst: 70 + Math.random() * 25,
            accountability: attributes.composure || 50 + Math.random() * 30,
            resilience: attributes.composure || 50 + Math.random() * 25
        };
        
        // Aplicar overrides
        return { ...base, ...override };
    }
    
    /**
     * Crea sistema de trabajo en equipo completo para un equipo
     */
    static createTeamworkSystem(
        players: PlayerTeamworkProfile[],
        teamHistory?: Partial<CohesionFactors>
    ): CompleteTeamworkSystem {
        
        return {
            fiveCs: this.calculateTeamFiveCs(players),
            personality: this.calculateTeamPersonality(players),
            unitCohesion: this.calculateUnitCohesion(players),
            cohesionFactors: this.generateCohesionFactors(teamHistory)
        };
    }
    
    private static calculateTeamFiveCs(players: PlayerTeamworkProfile[]): TeamworkFiveCs {
        const avgFiveCs = players.reduce((acc, player) => ({
            communication: acc.communication + player.fiveCs.communication,
            coordination: acc.coordination + player.fiveCs.coordination,
            cooperation: acc.cooperation + player.fiveCs.cooperation,
            commitment: acc.commitment + player.fiveCs.commitment,
            confidence: acc.confidence + player.fiveCs.confidence
        }), { communication: 0, coordination: 0, cooperation: 0, commitment: 0, confidence: 0 });
        
        const playerCount = players.length;
        return {
            communication: avgFiveCs.communication / playerCount,
            coordination: avgFiveCs.coordination / playerCount,
            cooperation: avgFiveCs.cooperation / playerCount,
            commitment: avgFiveCs.commitment / playerCount,
            confidence: avgFiveCs.confidence / playerCount
        };
    }
    
    private static calculateTeamPersonality(players: PlayerTeamworkProfile[]): PersonalityTraits {
        const avgPersonality = players.reduce((acc, player) => ({
            leadership: acc.leadership + player.personality.leadership,
            followership: acc.followership + player.personality.followership,
            adaptability: acc.adaptability + player.personality.adaptability,
            competitiveness: acc.competitiveness + player.personality.competitiveness,
            emotionalIntelligence: acc.emotionalIntelligence + player.personality.emotionalIntelligence,
            conflictResolution: acc.conflictResolution + player.personality.conflictResolution,
            empathy: acc.empathy + player.personality.empathy,
            teamFirst: acc.teamFirst + player.personality.teamFirst,
            accountability: acc.accountability + player.personality.accountability,
            resilience: acc.resilience + player.personality.resilience
        }), {
            leadership: 0, followership: 0, adaptability: 0, competitiveness: 0,
            emotionalIntelligence: 0, conflictResolution: 0, empathy: 0,
            teamFirst: 0, accountability: 0, resilience: 0
        });
        
        const playerCount = players.length;
        return {
            leadership: avgPersonality.leadership / playerCount,
            followership: avgPersonality.followership / playerCount,
            adaptability: avgPersonality.adaptability / playerCount,
            competitiveness: avgPersonality.competitiveness / playerCount,
            emotionalIntelligence: avgPersonality.emotionalIntelligence / playerCount,
            conflictResolution: avgPersonality.conflictResolution / playerCount,
            empathy: avgPersonality.empathy / playerCount,
            teamFirst: avgPersonality.teamFirst / playerCount,
            accountability: avgPersonality.accountability / playerCount,
            resilience: avgPersonality.resilience / playerCount
        };
    }
    
    private static calculateUnitCohesion(players: PlayerTeamworkProfile[]): UnitCohesion {
        // Simplificado - en implementación real se basaría en posiciones específicas
        const baseCohesion = 60 + Math.random() * 25;
        
        return {
            offensiveLineCohesion: baseCohesion + Math.random() * 15,
            qbReceiversCohesion: baseCohesion + Math.random() * 15,
            runGameCohesion: baseCohesion + Math.random() * 15,
            frontSevenCohesion: baseCohesion + Math.random() * 15,
            secondaryCohesion: baseCohesion + Math.random() * 15,
            passRushCoverage: baseCohesion + Math.random() * 15,
            specialTeamsCohesion: baseCohesion + Math.random() * 15,
            veteranLeadership: baseCohesion + Math.random() * 15,
            rookieIntegration: baseCohesion + Math.random() * 15,
            crossUnitChemistry: baseCohesion + Math.random() * 15
        };
    }
    
    private static generateCohesionFactors(override?: Partial<CohesionFactors>): CohesionFactors {
        const base = {
            timeTogetherBonus: Math.random() * 15,
            adversityOvercome: Math.random() * 10,
            successesShared: Math.random() * 10,
            locker_room_culture: 60 + Math.random() * 30,
            leadership_structure: 60 + Math.random() * 30,
            coaching_trust: 60 + Math.random() * 30,
            organizational_stability: 60 + Math.random() * 30
        };
        
        return { ...base, ...override };
    }
}