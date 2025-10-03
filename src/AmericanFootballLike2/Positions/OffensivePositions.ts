// OffensivePositions - Evaluación de posiciones ofensivas basada en documentación LaTeX

import { PlayerAttributes } from "../core/Player";
import { 
    QuarterbackType, RunningBackType, FullbackType, WideReceiverType, 
    TightEndType, CenterType, GuardType, TackleType,
    QualitativeAssessment, QualitativeRating 
} from "./PositionTypes";

// ===== QUARTERBACK (QB) =====
export class QuarterbackEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): QuarterbackType {
        const mobility = (attributes.speed + attributes.agility) / 2;
        const armStrength = attributes.throwing;
        const iq = (attributes.intelligence + attributes.awareness) / 2;
        const precision = attributes.throwing;
        
        // Dual-Threat: Alta movilidad
        if (mobility >= 75 && armStrength >= 70) {
            return 'dual_threat';
        }
        
        // Gunslinger: Brazo fuerte, menos precisión/IQ
        if (armStrength >= 85 && (precision < 80 || iq < 75)) {
            return 'gunslinger';
        }
        
        // The General: Alta precisión/IQ, baja movilidad
        return 'the_general';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            throwing: 0.30,      // Precisión del Pase
            intelligence: 0.20,   // IQ y Toma de Decisiones
            awareness: 0.15,     // Visión y Lectura
            leadership: 0.15,    // Liderazgo y Manejo
            composure: 0.10,     // Manejo del Pocket
            agility: 0.10        // Movilidad
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: QuarterbackType): QualitativeAssessment {
        const assessments = {
            'the_general': {
                strengths: [
                    "Precisión del pase excepcional",
                    "Excelente lectura de defensas",
                    "Manejo superior del pocket",
                    "Liderazgo y comunicación pre-snap"
                ],
                weaknesses: [
                    "Movilidad limitada",
                    "Vulnerable a presión por las bandas",
                    "Dependiente de protección de línea"
                ],
                strategicImpact: "Ofensiva basada en tiempos perfectos y Play Action. Protección de pase prioritaria.",
                riskFactors: [
                    "Sacks por presión exterior",
                    "Jugadas rotas por movilidad limitada"
                ],
                adaptations: {
                    offensive: ["Blitzes por las bandas", "Cobertura por zona para lecturas difíciles"],
                    defensive: ["Max-protect con RBs bloqueando", "Pases de liberación rápida"]
                }
            },
            'dual_threat': {
                strengths: [
                    "Movilidad excepcional",
                    "Capacidad de extender jugadas",
                    "Amenaza de carrera diseñada",
                    "Versatilidad en RPO"
                ],
                weaknesses: [
                    "Precisión inconsistente bajo presión",
                    "Riesgo de lesión por contacto",
                    "Lecturas más simples"
                ],
                strategicImpact: "Ofensiva basada en RPO y carreras diseñadas. Explota movimiento para ventajas numéricas.",
                riskFactors: [
                    "Lesiones por contacto",
                    "Turnovers por decisiones apresuradas"
                ],
                adaptations: {
                    offensive: ["Spy defender para contener", "DEs priorizan contención sobre presión"],
                    defensive: ["Bootlegs y rollouts", "Carreras diseñadas del QB"]
                }
            },
            'gunslinger': {
                strengths: [
                    "Brazo excepcionalmente fuerte",
                    "Capacidad de pases profundos",
                    "Jugadas explosivas",
                    "Confianza en ventanas cerradas"
                ],
                weaknesses: [
                    "Propenso a intercepciones",
                    "Decisiones arriesgadas",
                    "Inconsistencia en pases cortos"
                ],
                strategicImpact: "Ofensiva basada en pases profundos y jugadas explosivas. Acepta turnovers como riesgo.",
                riskFactors: [
                    "Intercepciones en zona intermedia",
                    "Turnovers costosos en momentos clave"
                ],
                adaptations: {
                    offensive: ["Safeties muy profundos (Cover 4/6)", "Forzar intercepciones en zonas intermedias"],
                    defensive: ["Rutas profundas frecuentes", "Receptores corren rutas largas"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== RUNNING BACK (RB) =====
export class RunningBackEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): RunningBackType {
        const vision = (attributes.awareness + attributes.intelligence) / 2;
        const power = (attributes.strength + attributes.stamina) / 2;
        const receiving = attributes.catching;
        const blocking = attributes.blocking;
        const speed = attributes.speed;
        
        // Three-Down Back: Balanceado en todo
        if (vision >= 70 && power >= 70 && receiving >= 65 && blocking >= 60) {
            return 'three_down_back';
        }
        
        // Receiving Back: Especialista aéreo
        if (receiving >= 75 && blocking >= 65 && speed >= 70) {
            return 'receiving_back';
        }
        
        // Workhorse: Poder y visión
        return 'workhorse';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            speed: 0.20,
            agility: 0.15,
            strength: 0.15,
            awareness: 0.15,    // Visión
            catching: 0.10,
            blocking: 0.10,
            stamina: 0.10,
            intelligence: 0.05
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: RunningBackType): QualitativeAssessment {
        const assessments = {
            'workhorse': {
                strengths: [
                    "Visión excepcional de carrera",
                    "Poder para romper tacleos",
                    "Resistencia para alto volumen",
                    "Confiable en yardaje corto"
                ],
                weaknesses: [
                    "Velocidad explosiva limitada",
                    "Habilidades de recepción básicas",
                    "Vulnerable en 3er down obvio"
                ],
                strategicImpact: "Juego de carrera de control para agotar defensa y controlar reloj.",
                riskFactors: [
                    "Predecibilidad en situaciones de pase",
                    "Fatiga por alto uso"
                ],
                adaptations: {
                    offensive: ["Defensas base (4-3/3-4) con 7 en la caja", "Concentración en parar carrera"],
                    defensive: ["Esquemas de zona running", "Carreras de poder repetitivas"]
                }
            },
            'receiving_back': {
                strengths: [
                    "Amenaza dinámica en juego aéreo",
                    "Versatilidad en formaciones",
                    "Bloqueo de pase competente",
                    "Desajuste contra linebackers"
                ],
                weaknesses: [
                    "Poder limitado entre tackles",
                    "Vulnerable a press coverage",
                    "Menos efectivo en goal line"
                ],
                strategicImpact: "RB como receptor clave en slot, permite protección sigilosa y screens.",
                riskFactors: [
                    "Exposición a hits de safeties",
                    "Dependencia de protección en pases"
                ],
                adaptations: {
                    offensive: ["LBs/Safeties con habilidades de CB", "Cobertura doble en medio"],
                    defensive: ["Screens y wheel routes", "Formaciones 12 personnel flexibles"]
                }
            },
            'three_down_back': {
                strengths: [
                    "Versatilidad completa",
                    "Sin situaciones obvias",
                    "Máxima flexibilidad ofensiva",
                    "Amenaza constante"
                ],
                weaknesses: [
                    "Maestro de nada",
                    "Posible fatiga por uso excesivo",
                    "Costo de oportunidad alto"
                ],
                strategicImpact: "Máxima incertidumbre pre-snap. Formaciones idénticas para carrera y pase.",
                riskFactors: [
                    "Sobrecarga de responsabilidades",
                    "Lesión afecta múltiples facetas"
                ],
                adaptations: {
                    offensive: ["Esquemas equilibrados sin pistas", "Disciplina posicional extrema"],
                    defensive: ["Formaciones múltiples sin sustituciones", "Audibles constantes"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== WIDE RECEIVER (WR) =====
export class WideReceiverEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): WideReceiverType {
        const speed = attributes.speed;
        const catching = attributes.catching;
        const blocking = attributes.blocking;
        const strength = attributes.strength;
        const agility = attributes.agility;
        
        // Alpha Receiver: Velocidad + Catching élite
        if (speed >= 80 && catching >= 85 && agility >= 75) {
            return 'alpha_receiver';
        }
        
        // Blocking Receiver: Bloqueo fuerte
        if (blocking >= 75 && strength >= 70) {
            return 'blocking_receiver';
        }
        
        // Slot Receiver: Agilidad y catching
        return 'slot_receiver';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            catching: 0.25,
            speed: 0.20,
            agility: 0.15,
            awareness: 0.10,
            strength: 0.10,     // YAC y contested catches
            blocking: 0.10,
            intelligence: 0.10
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: WideReceiverType): QualitativeAssessment {
        const assessments = {
            'alpha_receiver': {
                strengths: [
                    "Velocidad explosiva para rutas profundas",
                    "Separación consistente vs CBs élite",
                    "Amenaza de touchdown constante",
                    "Atrae doble cobertura"
                ],
                weaknesses: [
                    "Vulnerable a press coverage física",
                    "Posible ego/demanda de balón",
                    "Menos efectivo en bloqueo"
                ],
                strategicImpact: "Ofensiva diseñada para crear desajustes y forzar doble marcaje.",
                riskFactors: [
                    "Dependencia excesiva",
                    "Lesión afecta toda la ofensiva"
                ],
                adaptations: {
                    offensive: ["Doble cobertura constante", "Rotación de safeties"],
                    defensive: ["Motion para crear desajustes", "Rutas de liberación rápida"]
                }
            },
            'slot_receiver': {
                strengths: [
                    "Excelente en rutas de precisión",
                    "Especialista en 3er down",
                    "YAC en espacios reducidos",
                    "Timing perfecto con QB"
                ],
                weaknesses: [
                    "Limitado en rutas profundas",
                    "Vulnerable a hits de safeties",
                    "Menos efectivo en exterior"
                ],
                strategicImpact: "Pases cortos y rápidos desde slot, especialista en RPO.",
                riskFactors: [
                    "Exposición a contacto interior",
                    "Predecibilidad en 3er down"
                ],
                adaptations: {
                    offensive: ["CB Nickel atlético y rápido", "Cobertura cerrada en centro"],
                    defensive: ["Rutas de precisión desde slot", "Screens y quick slants"]
                }
            },
            'blocking_receiver': {
                strengths: [
                    "Bloqueo élite para carreras",
                    "Sostiene bloqueos en screens",
                    "Físico en rutas de contacto",
                    "Versátil en formaciones"
                ],
                weaknesses: [
                    "Velocidad y separación limitadas",
                    "Menos amenaza vertical",
                    "Predecible como indicador"
                ],
                strategicImpact: "Enfoque en juego terrestre y screens, bloqueo exterior garantizado.",
                riskFactors: [
                    "Telegrafía intenciones ofensivas",
                    "Limitaciones en juego aéreo"
                ],
                adaptations: {
                    offensive: ["Marcaje personal agresivo", "Menos ayuda en cobertura profunda"],
                    defensive: ["Carreras hacia su lado", "Screens elaborados"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== TIGHT END (TE) =====
export class TightEndEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): TightEndType {
        const blocking = attributes.blocking;
        const catching = attributes.catching;
        const strength = attributes.strength;
        const speed = attributes.speed;
        
        // Receiving TE: Catching + Speed
        if (catching >= 75 && speed >= 65) {
            return 'receiving_te';
        }
        
        // Hybrid: Balanceado
        if (blocking >= 70 && catching >= 65) {
            return 'hybrid_te';
        }
        
        // Blocking TE: Fuerza y bloqueo
        return 'blocking_te';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            blocking: 0.25,
            catching: 0.20,
            strength: 0.15,
            awareness: 0.10,
            speed: 0.10,
            agility: 0.10,
            intelligence: 0.10
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: TightEndType): QualitativeAssessment {
        const assessments = {
            'blocking_te': {
                strengths: [
                    "Bloqueo de carrera dominante",
                    "Establece orilla de línea",
                    "Protección de pase confiable",
                    "Físico en goal line"
                ],
                weaknesses: [
                    "Amenaza de recepción limitada",
                    "Telegrafía jugadas de carrera",
                    "Rutas básicas solamente"
                ],
                strategicImpact: "Juego terrestre de poder y protección del pocket prioritarios.",
                riskFactors: [
                    "Predecibilidad cuando está en campo",
                    "Limitaciones en red zone"
                ],
                adaptations: {
                    offensive: ["Cobertura ligera cuando TE en campo", "Más defensores en box"],
                    defensive: ["Power runs hacia su lado", "Formaciones 21/22 personnel"]
                }
            },
            'receiving_te': {
                strengths: [
                    "Desajuste vs linebackers",
                    "Amenaza en seam routes",
                    "Flexibilidad en formaciones",
                    "Red zone target"
                ],
                weaknesses: [
                    "Bloqueo de carrera limitado",
                    "Vulnerable a press coverage",
                    "Menos físico en línea"
                ],
                strategicImpact: "Explotación de mismatches, TE como receptor primario en formaciones flexibles.",
                riskFactors: [
                    "Exposición en bloqueo de carrera",
                    "Dependencia de protección"
                ],
                adaptations: {
                    offensive: ["Safety libre con buen rango", "Cobertura doble en medio"],
                    defensive: ["Flexed out para forzar mismatch", "Seam routes frecuentes"]
                }
            },
            'hybrid_te': {
                strengths: [
                    "Máxima versatilidad",
                    "Incertidumbre pre-snap",
                    "Amenaza dual constante",
                    "Sin indicadores obvios"
                ],
                weaknesses: [
                    "Maestro de nada",
                    "Posible confusión de rol",
                    "Demandas físicas altas"
                ],
                strategicImpact: "Máxima incertidumbre. Puede bloquear o recibir desde formación idéntica.",
                riskFactors: [
                    "Sobrecarga de responsabilidades",
                    "Errores de comunicación"
                ],
                adaptations: {
                    offensive: ["Disciplina posicional extrema", "Personal equilibrado siempre"],
                    defensive: ["Formaciones idénticas para ambos roles", "Audibles frecuentes"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== LÍNEA OFENSIVA =====
export class OffensiveLineEvaluator {
    
    // CENTER
    static evaluateCenterType(attributes: PlayerAttributes): CenterType {
        const intelligence = (attributes.intelligence + attributes.awareness) / 2;
        const strength = attributes.strength;
        const agility = attributes.agility;
        
        if (agility >= 75 && intelligence >= 70) {
            return 'athletic_center';
        }
        
        if (strength >= 85) {
            return 'dominator';
        }
        
        return 'the_general';
    }
    
    static calculateCenterRating(attributes: PlayerAttributes): number {
        const weights = {
            intelligence: 0.25,  // IQ y liderazgo
            strength: 0.20,      // Bloqueo de carrera
            awareness: 0.15,     // Comunicación
            agility: 0.15,       // Bloqueo de zona
            blocking: 0.15,      // Técnica general
            stamina: 0.10        // Durabilidad
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    // GUARD
    static evaluateGuardType(attributes: PlayerAttributes): GuardType {
        const strength = attributes.strength;
        const agility = attributes.agility;
        const blocking = attributes.blocking;
        
        if (agility >= 75 && blocking >= 70) {
            return 'athletic_guard';
        }
        
        if (blocking < 60) {
            return 'holding_prone';
        }
        
        return 'power_guard';
    }
    
    static calculateGuardRating(attributes: PlayerAttributes): number {
        const weights = {
            strength: 0.25,      // Poder
            blocking: 0.20,      // Técnica
            agility: 0.15,       // Pulling
            awareness: 0.15,     // Lectura de blitz
            stamina: 0.15,       // Resistencia
            intelligence: 0.10   // Comunicación
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    // TACKLE
    static evaluateTackleType(attributes: PlayerAttributes): TackleType {
        const agility = attributes.agility;
        const strength = attributes.strength;
        const blocking = attributes.blocking;
        
        if (blocking < 60 || strength < 60) {
            return 'weak_tackle';
        }
        
        if (agility >= 75 && blocking >= 80) {
            return 'pass_wall';
        }
        
        return 'run_blocker';
    }
    
    static calculateTackleRating(attributes: PlayerAttributes): number {
        const weights = {
            agility: 0.25,       // Footwork lateral
            strength: 0.20,      // Anclaje
            blocking: 0.20,      // Técnica
            awareness: 0.15,     // Lectura de rush
            stamina: 0.10,       // Resistencia
            intelligence: 0.10   // Comunicación
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
}