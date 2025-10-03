// DefensivePositions - Evaluación de posiciones defensivas basada en documentación LaTeX

import { PlayerAttributes } from "../core/Player";
import { 
    DefensiveEndType, DefensiveTackleType, LinebackerType, 
    CornerbackType, SafetyType, QualitativeAssessment 
} from "./PositionTypes";

// ===== DEFENSIVE END (DE) =====
export class DefensiveEndEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): DefensiveEndType {
        const speed = attributes.speed;
        const strength = attributes.strength;
        const tackling = attributes.tackling;
        const agility = attributes.agility;
        
        // Pass Rush Specialist: Velocidad + Agilidad
        if (speed >= 80 && agility >= 75) {
            return 'pass_rush_specialist';
        }
        
        // Set the Edge: Fuerza + Tackling
        if (strength >= 80 && tackling >= 75) {
            return 'set_the_edge';
        }
        
        // Hybrid: Balanceado
        return 'hybrid_de';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            speed: 0.20,         // Velocidad para doblar esquina
            strength: 0.20,      // Fuerza vs tackles
            tackling: 0.15,      // Contención de carrera
            agility: 0.15,       // Técnica de rush
            awareness: 0.15,     // Lectura de jugadas
            stamina: 0.15        // Resistencia
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: DefensiveEndType): QualitativeAssessment {
        const assessments = {
            'pass_rush_specialist': {
                strengths: [
                    "Velocidad excepcional para doblar esquina",
                    "Técnica de rush refinada",
                    "Presión constante al QB",
                    "Permite cobertura profunda"
                ],
                weaknesses: [
                    "Vulnerable al play action",
                    "Puede ser movido en carrera",
                    "Disciplina de carrera inconsistente"
                ],
                strategicImpact: "Maximiza pass rush en 3er down, permite esquemas agresivos de cobertura.",
                riskFactors: [
                    "Engañado por play action",
                    "Carreras largas por su lado"
                ],
                adaptations: {
                    offensive: ["RBs/TEs para ayuda en bloqueo", "Pases de liberación rápida"],
                    defensive: ["Wide-9 technique", "Stunts y twists coordinados"]
                }
            },
            'set_the_edge': {
                strengths: [
                    "Contención superior de carrera",
                    "Fuerza para resistir bloqueos dobles",
                    "Disciplina posicional",
                    "Confiable en goal line"
                ],
                weaknesses: [
                    "Pass rush limitado",
                    "Velocidad insuficiente vs tackles ágiles",
                    "Menos impacto en 3er down"
                ],
                strategicImpact: "Prioriza detener carrera, fuerza pases aéreos del rival.",
                riskFactors: [
                    "Explotado en situaciones de pase",
                    "Tackles pueden bloquearlo 1-on-1"
                ],
                adaptations: {
                    offensive: ["Más pases aéreos vs él", "Ataques de velocidad"],
                    defensive: ["Formaciones 4-3/5-2", "Énfasis en run stuffing"]
                }
            },
            'hybrid_de': {
                strengths: [
                    "Versatilidad completa",
                    "Impredecible pre-snap",
                    "Efectivo vs carrera y pase",
                    "Permite múltiples esquemas"
                ],
                weaknesses: [
                    "No élite en ningún área",
                    "Posible confusión de rol",
                    "Demandas técnicas altas"
                ],
                strategicImpact: "Máxima flexibilidad defensiva, sin indicadores de jugada.",
                riskFactors: [
                    "Sobrecarga de responsabilidades",
                    "Inconsistencia en ejecución"
                ],
                adaptations: {
                    offensive: ["Bloqueo 1-on-1 más tiempo", "No puede predecir su enfoque"],
                    defensive: ["Múltiples alineaciones", "Rotaciones frecuentes"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== DEFENSIVE TACKLE (DT) / NOSE TACKLE (NT) =====
export class DefensiveTackleEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): DefensiveTackleType {
        const strength = attributes.strength;
        const speed = attributes.speed;
        const agility = attributes.agility;
        const tackling = attributes.tackling;
        
        // Penetrator: Velocidad + Agilidad
        if (speed >= 70 && agility >= 70) {
            return 'penetrator';
        }
        
        // Three-Down: Balanceado
        if (strength >= 75 && speed >= 65 && tackling >= 70) {
            return 'three_down_dt';
        }
        
        // Nose Tackle: Pura fuerza
        return 'nose_tackle';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            strength: 0.30,      // Fuerza vs bloqueos dobles
            tackling: 0.20,      // Detener carrera
            agility: 0.15,       // Penetración de gaps
            awareness: 0.15,     // Lectura de jugadas
            stamina: 0.10,       // Resistencia
            speed: 0.10          // Persecución
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: DefensiveTackleType): QualitativeAssessment {
        const assessments = {
            'nose_tackle': {
                strengths: [
                    "Absorbe bloqueos dobles consistentemente",
                    "Anula juego terrestre interior",
                    "Libera linebackers",
                    "Ancla la defensa"
                ],
                weaknesses: [
                    "Presión de pase mínima",
                    "Agotamiento rápido",
                    "Vulnerable a cut blocks",
                    "Indicador de jugada en 3er down"
                ],
                strategicImpact: "Base de defensa 3-4, contención terrestre y confusión de blitz.",
                riskFactors: [
                    "Fatiga por bloqueos dobles constantes",
                    "Explotado en situaciones de pase"
                ],
                adaptations: {
                    offensive: ["Play actions en medio del campo", "Ataques al perímetro"],
                    defensive: ["Rotaciones frecuentes", "Blitzes de linebackers"]
                }
            },
            'penetrator': {
                strengths: [
                    "Presión central rápida",
                    "Colapsa el pocket",
                    "Penetración de gaps",
                    "Disruptor en backfield"
                ],
                weaknesses: [
                    "Vulnerable a misdirection",
                    "Puede ser rodeado",
                    "Menos efectivo vs bloqueos dobles",
                    "Disciplina de gap inconsistente"
                ],
                strategicImpact: "Presión de pase central rápida, común en defensas 4-3.",
                riskFactors: [
                    "Engañado por traps y counters",
                    "Neutralizado por bloqueo doble"
                ],
                adaptations: {
                    offensive: ["Bloqueo doble constante", "Pases de liberación inmediata"],
                    defensive: ["Stunts coordinados", "Penetración agresiva"]
                }
            },
            'three_down_dt': {
                strengths: [
                    "Versatilidad completa",
                    "Efectivo en todas las situaciones",
                    "Permite esquemas complejos",
                    "Sin sustituciones necesarias"
                ],
                weaknesses: [
                    "No dominante en área específica",
                    "Demandas físicas altas",
                    "Costo de oportunidad"
                ],
                strategicImpact: "Máxima flexibilidad, permite blitzes complejos sin cambios de personal.",
                riskFactors: [
                    "Fatiga por uso excesivo",
                    "Inconsistencia en roles múltiples"
                ],
                adaptations: {
                    offensive: ["No hay indicadores de jugada", "Debe prepararse para todo"],
                    defensive: ["Múltiples formaciones", "Esquemas complejos"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== LINEBACKER (OLB/ILB) =====
export class LinebackerEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): LinebackerType {
        const tackling = attributes.tackling;
        const coverage = attributes.coverage;
        const speed = attributes.speed;
        const intelligence = attributes.intelligence;
        const awareness = attributes.awareness;
        
        const iq = (intelligence + awareness) / 2;
        
        // Coverage Backer: Cobertura + Velocidad
        if (coverage >= 75 && speed >= 70) {
            return 'coverage_backer';
        }
        
        // Hybrid: Balanceado
        if (tackling >= 70 && coverage >= 65 && iq >= 70) {
            return 'hybrid_lb';
        }
        
        // The General: IQ + Tackling
        return 'the_general';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            tackling: 0.25,      // Tacleo principal
            coverage: 0.20,      // Cobertura de pase
            awareness: 0.15,     // Lectura de jugadas
            speed: 0.15,         // Rango y persecución
            intelligence: 0.15,  // IQ defensivo
            strength: 0.10       // Resistencia a bloqueos
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: LinebackerType): QualitativeAssessment {
        const assessments = {
            'the_general': {
                strengths: [
                    "IQ defensivo excepcional",
                    "Tacleo confiable",
                    "Liderazgo en campo",
                    "Lectura superior de jugadas"
                ],
                weaknesses: [
                    "Rango limitado en cobertura",
                    "Vulnerable a TEs rápidos",
                    "Velocidad insuficiente vs spread"
                ],
                strategicImpact: "Base de defensa sólida, organiza esquemas base con confianza.",
                riskFactors: [
                    "Explotado por ofensivas rápidas",
                    "Mismatches vs receptores"
                ],
                adaptations: {
                    offensive: ["Bloqueos directos de guards", "Ataques con TEs"],
                    defensive: ["Esquemas base 4-3/3-4", "Comunicación pre-snap"]
                }
            },
            'coverage_backer': {
                strengths: [
                    "Neutraliza TEs receptores",
                    "Rango excelente en cobertura",
                    "Permite esquemas de presión",
                    "Versátil en nickel/dime"
                ],
                weaknesses: [
                    "Fuerza física limitada",
                    "Vulnerable a power runs",
                    "Puede ser bloqueado fácilmente"
                ],
                strategicImpact: "Permite presión agresiva al neutralizar amenazas de recepción.",
                riskFactors: [
                    "Explotado en juego terrestre",
                    "Bloqueos directos efectivos"
                ],
                adaptations: {
                    offensive: ["Power runs hacia su zona", "Bloqueos de guards/centers"],
                    defensive: ["Esquemas de cobertura", "Rotaciones con DBs"]
                }
            },
            'hybrid_lb': {
                strengths: [
                    "Versatilidad completa",
                    "Efectivo en todas las situaciones",
                    "Permite múltiples esquemas",
                    "Agente libre sin debilidades"
                ],
                weaknesses: [
                    "No élite en área específica",
                    "Demandas mentales altas",
                    "Posible sobrecarga"
                ],
                strategicImpact: "Máxima versatilidad, dicta ritmo de jugada sin debilidades obvias.",
                riskFactors: [
                    "Confusión de responsabilidades",
                    "Fatiga por múltiples roles"
                ],
                adaptations: {
                    offensive: ["Evitar su zona completamente", "No hay debilidades obvias"],
                    defensive: ["Esquemas múltiples", "Rotaciones constantes"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== CORNERBACK (CB) =====
export class CornerbackEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): CornerbackType {
        const speed = attributes.speed;
        const coverage = attributes.coverage;
        const strength = attributes.strength;
        const tackling = attributes.tackling;
        const agility = attributes.agility;
        
        // Physical Nickel: Fuerza + Tackling
        if (strength >= 75 && tackling >= 70) {
            return 'physical_nickel';
        }
        
        // Press Man: Velocidad + Cobertura + Agilidad
        if (speed >= 80 && coverage >= 80 && agility >= 75) {
            return 'press_man';
        }
        
        // Zone Coverage: Cobertura + Awareness
        return 'zone_coverage';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            coverage: 0.30,      // Cobertura principal
            speed: 0.25,         // Velocidad para recovery
            agility: 0.15,       // Cambios de dirección
            awareness: 0.15,     // Anticipación
            tackling: 0.10,      // Run support
            strength: 0.05       // Contested catches
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: CornerbackType): QualitativeAssessment {
        const assessments = {
            'press_man': {
                strengths: [
                    "Cobertura personal élite",
                    "Anula receptor principal",
                    "Permite blitzes agresivos",
                    "Recovery speed excepcional"
                ],
                weaknesses: [
                    "Vulnerable a double moves",
                    "Riesgo de interferencia de pase",
                    "Menos efectivo en zona"
                ],
                strategicImpact: "Marcaje personal agresivo, libera safeties para presión/run support.",
                riskFactors: [
                    "Superado en rutas complejas",
                    "Penalizaciones por contacto"
                ],
                adaptations: {
                    offensive: ["Rutas físicas y de contacto", "Double moves y stop-and-go"],
                    defensive: ["Press coverage constante", "Blitzes de safeties"]
                }
            },
            'zone_coverage': {
                strengths: [
                    "Excelente visión de QB",
                    "Anticipación de rutas",
                    "Potencial de intercepción",
                    "Cobertura de área efectiva"
                ],
                weaknesses: [
                    "Vulnerable a flooding routes",
                    "Menos efectivo en man coverage",
                    "Puede ser superado por velocidad"
                ],
                strategicImpact: "Prioriza intercepciones y romper pases con visión de QB.",
                riskFactors: [
                    "Saturación de su zona",
                    "Rutas de inundación"
                ],
                adaptations: {
                    offensive: ["Rutas de flooding", "Saturar su zona con receptores"],
                    defensive: ["Esquemas Cover 2/3", "Rotaciones de zona"]
                }
            },
            'physical_nickel': {
                strengths: [
                    "Neutraliza slot receivers",
                    "Run support efectivo",
                    "Físico en rutas cortas",
                    "Versátil en formaciones"
                ],
                weaknesses: [
                    "Velocidad limitada vs WRs rápidos",
                    "Menos efectivo en exterior",
                    "Vulnerable a rutas largas"
                ],
                strategicImpact: "Fuerte vs slot receivers, permite esquemas híbridos de cobertura.",
                riskFactors: [
                    "Superado por velocidad pura",
                    "Limitado a interior del campo"
                ],
                adaptations: {
                    offensive: ["Rutas largas desde slot", "Ataques de velocidad"],
                    defensive: ["Cobertura de slot", "Híbrido LB/CB"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== SAFETY (SS/FS) =====
export class SafetyEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): SafetyType {
        const tackling = attributes.tackling;
        const coverage = attributes.coverage;
        const speed = attributes.speed;
        const strength = attributes.strength;
        const awareness = attributes.awareness;
        
        // Enforcer: Tackling + Strength
        if (tackling >= 80 && strength >= 75) {
            return 'enforcer';
        }
        
        // Hybrid: Balanceado
        if (coverage >= 70 && tackling >= 70 && speed >= 70) {
            return 'hybrid_safety';
        }
        
        // Basic: Predecible
        return 'basic_safety';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            coverage: 0.25,      // Cobertura profunda
            tackling: 0.20,      // Run support
            speed: 0.20,         // Rango
            awareness: 0.15,     // Lectura de QB
            strength: 0.10,      // Físico
            intelligence: 0.10   // Comunicación
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: SafetyType): QualitativeAssessment {
        const assessments = {
            'enforcer': {
                strengths: [
                    "Tacleo devastador",
                    "Run support élite",
                    "Intimidación física",
                    "Fuerte vs TEs"
                ],
                weaknesses: [
                    "Rango limitado en cobertura",
                    "Vulnerable a rutas profundas",
                    "Propenso a penalizaciones"
                ],
                strategicImpact: "Disuasión física, enfoque en fuerza y contacto duro.",
                riskFactors: [
                    "Explotado en cobertura profunda",
                    "Penalizaciones por contacto"
                ],
                adaptations: {
                    offensive: ["Juego aéreo para forzar cobertura", "Evitar contacto físico"],
                    defensive: ["Esquemas de run support", "Blitzes físicos"]
                }
            },
            'hybrid_safety': {
                strengths: [
                    "Versatilidad máxima",
                    "Rotaciones efectivas",
                    "Confunde QBs",
                    "Múltiples esquemas"
                ],
                weaknesses: [
                    "No dominante en área específica",
                    "Demandas mentales altas",
                    "Posible confusión de rol"
                ],
                strategicImpact: "Máxima versatilidad, permite rotaciones complejas de cobertura.",
                riskFactors: [
                    "Sobrecarga de responsabilidades",
                    "Errores de comunicación"
                ],
                adaptations: {
                    offensive: ["Play actions para comprometer", "Ataques múltiples simultáneos"],
                    defensive: ["Rotaciones constantes", "Esquemas híbridos"]
                }
            },
            'basic_safety': {
                strengths: [
                    "Confiable en rol asignado",
                    "Comunicación clara",
                    "Esquemas simples efectivos",
                    "Bajo riesgo de error"
                ],
                weaknesses: [
                    "Predecible",
                    "Limitado en versatilidad",
                    "Vulnerable a mismatches"
                ],
                strategicImpact: "Esquemas simples de Cover 2, posición asignada sin variación.",
                riskFactors: [
                    "Explotado por ofensivas complejas",
                    "Predecibilidad pre-snap"
                ],
                adaptations: {
                    offensive: ["Ataques directos a debilidades", "Formaciones complejas"],
                    defensive: ["Esquemas básicos", "Comunicación simple"]
                }
            }
        };
        
        return assessments[type];
    }
}