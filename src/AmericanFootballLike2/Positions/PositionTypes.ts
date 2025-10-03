// PositionTypes - Tipos y enums para el sistema de posiciones

// Posiciones Ofensivas
export type OffensivePosition = 
    | 'QB'  // Quarterback
    | 'RB'  // Running Back
    | 'FB'  // Fullback
    | 'WR'  // Wide Receiver
    | 'TE'  // Tight End
    | 'C'   // Center
    | 'G'   // Guard
    | 'T';  // Tackle

// Posiciones Defensivas
export type DefensivePosition = 
    | 'DE'  // Defensive End
    | 'DT'  // Defensive Tackle
    | 'NT'  // Nose Tackle
    | 'OLB' // Outside Linebacker
    | 'ILB' // Inside Linebacker
    | 'CB'  // Cornerback
    | 'SS'  // Strong Safety
    | 'FS'; // Free Safety

// Posiciones de Equipos Especiales
export type SpecialTeamsPosition = 
    | 'K'   // Kicker
    | 'P'   // Punter
    | 'LS'  // Long Snapper
    | 'H'   // Holder
    | 'KR'  // Kick Returner
    | 'PR'; // Punt Returner

// Todas las posiciones
export type Position = OffensivePosition | DefensivePosition | SpecialTeamsPosition;

// Tipos de jugador según documentación
export type QuarterbackType = 
    | 'the_general'     // Precisión/IQ alto, Movilidad baja
    | 'dual_threat'     // Móvil/Atlético
    | 'gunslinger';     // Brazo fuerte, Riesgo alto

export type RunningBackType = 
    | 'workhorse'       // Poder/Visión - "Caballo de Batalla"
    | 'receiving_back'  // Receptor/Bloqueador - "Especialista Aéreo"
    | 'three_down_back'; // Completo - "Three-Down Back"

export type FullbackType = 
    | 'pure_blocker'    // Poder alto, Recepción baja
    | 'hybrid_hback'    // Recepción y Movilidad
    | 'misdirection';   // Engaño

export type WideReceiverType = 
    | 'alpha_receiver'  // El "No. 1"
    | 'slot_receiver'   // Receptor de Espacio
    | 'blocking_receiver'; // Receptor de Bloqueo

export type TightEndType = 
    | 'blocking_te'     // Tradicional
    | 'receiving_te'    // Receiving Tight End
    | 'hybrid_te';      // Dual-Threat

export type CenterType = 
    | 'the_general'     // IQ alto, Agilidad media
    | 'dominator'       // Fuerza, Poder
    | 'athletic_center'; // Bloqueo de Zona

export type GuardType = 
    | 'power_guard'     // Mauler
    | 'athletic_guard'  // Puller
    | 'holding_prone';  // Con problemas de Holding

export type TackleType = 
    | 'pass_wall'       // "Muro de Pase" (Izquierdo)
    | 'run_blocker'     // "Bloqueador de Carrera" (Derecho)
    | 'weak_tackle';    // Débil en ambos lados

// Tipos defensivos
export type DefensiveEndType = 
    | 'pass_rush_specialist' // Especialista en Pase
    | 'set_the_edge'        // Contención Fuerte
    | 'hybrid_de';          // Dual-Threat

export type DefensiveTackleType = 
    | 'nose_tackle'     // "Tapón"
    | 'penetrator'      // "Penetrador"
    | 'three_down_dt';  // Híbrido

export type LinebackerType = 
    | 'the_general'     // Run Stopper/Communicator
    | 'coverage_backer' // Coverage Backer
    | 'hybrid_lb';      // Three-Down Backer

export type CornerbackType = 
    | 'press_man'       // "Perro de Presión"
    | 'zone_coverage'   // Zone Coverage
    | 'physical_nickel'; // Físico (Nickel/Slot CB)

export type SafetyType = 
    | 'enforcer'        // Físico/Tacleador
    | 'hybrid_safety'   // Hybrid Safety
    | 'basic_safety';   // Básico (Predecible)

// Tipos de equipos especiales
export type KickerType = 
    | 'elite_range'     // Kicker de Rango Élite
    | 'inconsistent'    // Kicker Inconsistente
    | 'kickoff_specialist'; // Especialista en Kickoffs

export type PunterType = 
    | 'control_punter'  // Alto IQ
    | 'power_punter';   // Bajo Control

// Calidad cualitativa
export type QualitativeRating = 
    | 'elite'           // 90-100
    | 'very_good'       // 80-89
    | 'good'            // 70-79
    | 'average'         // 60-69
    | 'below_average'   // 50-59
    | 'poor';           // 0-49

// Fortalezas y debilidades cualitativas
export interface QualitativeAssessment {
    strengths: string[];        // Fortalezas principales
    weaknesses: string[];       // Debilidades principales
    strategicImpact: string;    // Impacto estratégico macro
    riskFactors: string[];      // Factores de riesgo
    adaptations: {
        offensive: string[];    // Adaptaciones ofensivas esperadas
        defensive: string[];    // Adaptaciones defensivas esperadas
    };
}

// Rating específico por tipo
export interface TypeRating {
    // Rating basado en potencial (solo atributos)
    potentialRating: number;           // Potencial basado en atributos físicos/mentales (0-100)
    
    // Rating real (potencial + experiencia)
    actualRating: number;              // Rating real considerando experiencia (0-100)
    
    // Rating mostrado (el que se usa en el juego)
    rating: number;                    // Rating final = actualRating (0-100)
    
    // Metadatos
    qualitativeRating: QualitativeRating; // Rating cualitativo
    confidence: number;                // Confianza en la evaluación (0-100)
    experienceBonus: number;           // Bonus por experiencia (-20 a +20)
    assessment: QualitativeAssessment; // Análisis específico del tipo
}

// Estructura de ratings por posición y tipo
export interface PositionRatings {
    // Posiciones Ofensivas
    QB?: {
        the_general?: TypeRating;
        dual_threat?: TypeRating;
        gunslinger?: TypeRating;
    };
    RB?: {
        workhorse?: TypeRating;
        receiving_back?: TypeRating;
        three_down_back?: TypeRating;
    };
    FB?: {
        pure_blocker?: TypeRating;
        hybrid_hback?: TypeRating;
        misdirection?: TypeRating;
    };
    WR?: {
        alpha_receiver?: TypeRating;
        slot_receiver?: TypeRating;
        blocking_receiver?: TypeRating;
    };
    TE?: {
        blocking_te?: TypeRating;
        receiving_te?: TypeRating;
        hybrid_te?: TypeRating;
    };
    C?: {
        the_general?: TypeRating;
        dominator?: TypeRating;
        athletic_center?: TypeRating;
    };
    G?: {
        power_guard?: TypeRating;
        athletic_guard?: TypeRating;
        holding_prone?: TypeRating;
    };
    T?: {
        pass_wall?: TypeRating;
        run_blocker?: TypeRating;
        weak_tackle?: TypeRating;
    };
    
    // Posiciones Defensivas
    DE?: {
        pass_rush_specialist?: TypeRating;
        set_the_edge?: TypeRating;
        hybrid_de?: TypeRating;
    };
    DT?: {
        nose_tackle?: TypeRating;
        penetrator?: TypeRating;
        three_down_dt?: TypeRating;
    };
    NT?: {
        nose_tackle?: TypeRating;
        penetrator?: TypeRating;
        three_down_dt?: TypeRating;
    };
    OLB?: {
        the_general?: TypeRating;
        coverage_backer?: TypeRating;
        hybrid_lb?: TypeRating;
    };
    ILB?: {
        the_general?: TypeRating;
        coverage_backer?: TypeRating;
        hybrid_lb?: TypeRating;
    };
    CB?: {
        press_man?: TypeRating;
        zone_coverage?: TypeRating;
        physical_nickel?: TypeRating;
    };
    SS?: {
        enforcer?: TypeRating;
        hybrid_safety?: TypeRating;
        basic_safety?: TypeRating;
    };
    FS?: {
        enforcer?: TypeRating;
        hybrid_safety?: TypeRating;
        basic_safety?: TypeRating;
    };
    
    // Equipos Especiales
    K?: {
        elite_range?: TypeRating;
        inconsistent?: TypeRating;
        kickoff_specialist?: TypeRating;
    };
    P?: {
        control_punter?: TypeRating;
        power_punter?: TypeRating;
    };
    LS?: {
        elite?: TypeRating;
        standard?: TypeRating;
    };
    H?: {
        elite?: TypeRating;
        standard?: TypeRating;
    };
    KR?: {
        explosive?: TypeRating;
        safe?: TypeRating;
        complete?: TypeRating;
    };
    PR?: {
        explosive?: TypeRating;
        safe?: TypeRating;
        complete?: TypeRating;
    };
}

// Evaluación completa del jugador
export interface PlayerEvaluation {
    // Ratings por posición y tipo
    positionRatings: PositionRatings;
    
    // Posición y tipo primarios (los mejores)
    primaryPosition: Position;
    primaryType: string;
    primaryRating: number;
    
    // Top posiciones donde puede jugar
    viablePositions: {
        position: Position;
        bestType: string;
        rating: number;
        confidence: number;
    }[];
    
    // Análisis físico
    physicalProfile: {
        heightCategory: 'short' | 'average' | 'tall' | 'very_tall';
        weightCategory: 'light' | 'average' | 'heavy' | 'very_heavy';
        bmi: number;
        athleticism: number; // Combinación de speed, agility, strength
    };
    
    // Versatilidad del jugador
    versatility: {
        score: number;           // 0-100, qué tan versátil es
        multiPositional: boolean; // ¿Puede jugar múltiples posiciones?
        specialistLevel: number;  // 0-100, qué tan especializado es
    };
}

// Evaluación completa de posición (legacy, para compatibilidad)
export interface PositionEvaluation {
    position: Position;
    primaryType: string;        // Tipo principal del jugador
    overallRating: number;      // Rating general (0-100)
    qualitativeRating: QualitativeRating;
    positionFit: number;        // Qué tan bien encaja en la posición (0-100)
    
    // Ratings específicos por área
    physicalRating: number;     // Rating físico
    technicalRating: number;    // Rating técnico
    mentalRating: number;       // Rating mental
    
    // Análisis cualitativo
    assessment: QualitativeAssessment;
    
    // Comparación con otras posiciones
    alternativePositions: {
        position: Position;
        rating: number;
        fit: number;
    }[];
}