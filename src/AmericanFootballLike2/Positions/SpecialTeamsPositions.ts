// SpecialTeamsPositions - Evaluación de posiciones de equipos especiales

import { PlayerAttributes } from "../core/Player";
import { KickerType, PunterType, QualitativeAssessment } from "./PositionTypes";

// ===== KICKER (K) =====
export class KickerEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): KickerType {
        const kickAccuracy = attributes.kickAccuracy;
        const kickPower = attributes.kickPower;
        const composure = attributes.composure;
        
        // Elite Range: Poder + Precisión
        if (kickPower >= 85 && kickAccuracy >= 80) {
            return 'elite_range';
        }
        
        // Kickoff Specialist: Poder alto, precisión media
        if (kickPower >= 80 && kickAccuracy < 75) {
            return 'kickoff_specialist';
        }
        
        // Inconsistent: Baja compostura o precisión
        return 'inconsistent';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            kickAccuracy: 0.40,  // Precisión principal
            kickPower: 0.30,     // Rango de patada
            composure: 0.20,     // Presión mental
            intelligence: 0.10   // Lectura de situaciones
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: KickerType): QualitativeAssessment {
        const assessments = {
            'elite_range': {
                strengths: [
                    "Rango excepcional (50+ yardas)",
                    "Precisión consistente",
                    "Compostura bajo presión",
                    "Expande zona de anotación"
                ],
                weaknesses: [
                    "Presión de expectativas altas",
                    "Costo de oportunidad en roster",
                    "Vulnerable a bloqueos si es lento"
                ],
                strategicImpact: "Zona roja expandida, decisiones agresivas de 4to down desde yarda 35+.",
                riskFactors: [
                    "Presión mental en momentos clave",
                    "Dependencia excesiva del equipo"
                ],
                adaptations: {
                    offensive: ["Presión fuerte en 3er down", "Blitzes para evitar FG"],
                    defensive: ["Agresividad en 4to down temprano", "Confianza en FG largos"]
                }
            },
            'inconsistent': {
                strengths: [
                    "Potencial en condiciones ideales",
                    "Costo de roster bajo",
                    "Puede mejorar con experiencia"
                ],
                weaknesses: [
                    "Falla patadas clave",
                    "Inconsistencia bajo presión",
                    "Limita estrategia ofensiva"
                ],
                strategicImpact: "Entrenador evita FGs, más agresivo en 4to down y conversiones.",
                riskFactors: [
                    "Patadas fallidas en momentos críticos",
                    "Pérdida de confianza del equipo"
                ],
                adaptations: {
                    offensive: ["Defensa conservadora en 3er down", "Menos presión en red zone"],
                    defensive: ["Conversiones de 4to down", "Despejes en territorio rival"]
                }
            },
            'kickoff_specialist': {
                strengths: [
                    "Touchbacks consistentes",
                    "Control de posición de campo",
                    "Patadas estratégicas (squib/onside)",
                    "Fuerza de pierna excepcional"
                ],
                weaknesses: [
                    "Precisión limitada en FGs",
                    "Rango inconsistente",
                    "Menos confiable en clutch"
                ],
                strategicImpact: "Batalla de posición de campo, rival inicia consistentemente en yarda 25.",
                riskFactors: [
                    "Fallas en FGs de rango medio",
                    "Limitaciones en situaciones de puntuación"
                ],
                adaptations: {
                    offensive: ["Jugadas de engaño en retorno", "Ataques al centro vs hang time"],
                    defensive: ["Touchbacks garantizados", "Control de posición"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== PUNTER (P) =====
export class PunterEvaluator {
    
    static evaluateType(attributes: PlayerAttributes): PunterType {
        const kickPower = attributes.kickPower;
        const kickAccuracy = attributes.kickAccuracy;
        const intelligence = attributes.intelligence;
        
        // Control Punter: Precisión + IQ
        if (kickAccuracy >= 80 && intelligence >= 75) {
            return 'control_punter';
        }
        
        // Power Punter: Poder alto, control bajo
        return 'power_punter';
    }
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            kickPower: 0.30,     // Distancia de punt
            kickAccuracy: 0.30,  // Control y precisión
            intelligence: 0.20,  // Situational awareness
            composure: 0.20      // Bajo presión
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes, type: PunterType): QualitativeAssessment {
        const assessments = {
            'control_punter': {
                strengths: [
                    "Coffin corner precision",
                    "Alto hang time consistente",
                    "Control de posición de campo",
                    "Situational awareness"
                ],
                weaknesses: [
                    "Distancia limitada en emergencias",
                    "Vulnerable si cobertura falla",
                    "Menos efectivo con viento"
                ],
                strategicImpact: "Juego defensivo y territorial, prioriza patear en 4to down.",
                riskFactors: [
                    "Patadas accidentales a end zone",
                    "Dependencia de unidad de cobertura"
                ],
                adaptations: {
                    offensive: ["Engaños de blitz tardíos", "Alineaciones defensivas complejas"],
                    defensive: ["Patadas de precisión", "Esquemas de protección complejos"]
                }
            },
            'power_punter': {
                strengths: [
                    "Distancia excepcional",
                    "Saca equipo de problemas",
                    "Efectivo desde end zone propia",
                    "Fuerza bruta de pierna"
                ],
                weaknesses: [
                    "Hang time inconsistente",
                    "Control limitado",
                    "Patadas impredecibles",
                    "Cobertura debe ser rápida"
                ],
                strategicImpact: "Debe reforzar unidad de cobertura, énfasis en velocidad de gunners.",
                riskFactors: [
                    "Regresos largos por bajo hang time",
                    "Inconsistencia en posición final"
                ],
                adaptations: {
                    offensive: ["DTs rápidos para penetración", "Ataques de velocidad en cobertura"],
                    defensive: ["Gunners muy rápidos", "Cobertura agresiva"]
                }
            }
        };
        
        return assessments[type];
    }
}

// ===== LONG SNAPPER (LS) =====
export class LongSnapperEvaluator {
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            intelligence: 0.30,  // Precisión y timing
            strength: 0.25,      // Velocidad de snap
            awareness: 0.20,     // Lectura de rush
            blocking: 0.15,      // Bloqueo post-snap
            composure: 0.10      // Bajo presión
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes): QualitativeAssessment {
        const isElite = attributes.intelligence >= 80 && attributes.strength >= 75;
        
        if (isElite) {
            return {
                strengths: [
                    "Precisión perfecta del snap",
                    "Velocidad excepcional (<0.75s)",
                    "Bloqueo post-snap confiable",
                    "Consistencia absoluta"
                ],
                weaknesses: [
                    "Especialización extrema",
                    "Limitado a una función",
                    "Costo de roster"
                ],
                strategicImpact: "Nunca preocuparse por mecánica de patada, enfoque en estrategia.",
                riskFactors: [
                    "Lesión afecta todas las patadas",
                    "Dependencia total del equipo"
                ],
                adaptations: {
                    offensive: ["Concentración en rush/cobertura", "Sin defensores extra"],
                    defensive: ["Patadas rápidas y limpias", "Timing perfecto"]
                }
            };
        } else {
            return {
                strengths: [
                    "Funcional en condiciones normales",
                    "Costo de roster razonable",
                    "Experiencia básica"
                ],
                weaknesses: [
                    "Snaps erráticos ocasionales",
                    "Velocidad inconsistente",
                    "Vulnerable bajo presión",
                    "Problemas en mal clima"
                ],
                strategicImpact: "Formaciones de protección conservadoras, ralentizar jugadas.",
                riskFactors: [
                    "Patadas bloqueadas por snaps lentos",
                    "Fumbles por snaps erráticos"
                ],
                adaptations: {
                    offensive: ["Más tiempo para rush", "Protección extra necesaria"],
                    defensive: ["Snaps más lentos", "Formaciones conservadoras"]
                }
            };
        }
    }
}

// ===== HOLDER (H) =====
export class HolderEvaluator {
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            catching: 0.35,      // Manos confiables
            agility: 0.25,       // Rapidez de colocación
            composure: 0.20,     // Bajo presión
            intelligence: 0.20   // Situational awareness
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes): QualitativeAssessment {
        const isElite = attributes.catching >= 85 && attributes.agility >= 75;
        
        if (isElite) {
            return {
                strengths: [
                    "Manos absolutamente confiables",
                    "Colocación perfecta (<1.3s)",
                    "Maneja snaps imperfectos",
                    "Compostura en clutch"
                ],
                weaknesses: [
                    "Función muy específica",
                    "Limitado a equipos especiales",
                    "Presión de perfección"
                ],
                strategicImpact: "Kicker siempre tiene superficie estable, minimiza riesgo de bloqueo.",
                riskFactors: [
                    "Presión mental en momentos clave",
                    "Dependencia del long snapper"
                ],
                adaptations: {
                    offensive: ["Movimientos de spin constantes", "Presión en colocación"],
                    defensive: ["Patadas rápidas y precisas", "Fakes ocasionales"]
                }
            };
        } else {
            return {
                strengths: [
                    "Funcional en situaciones normales",
                    "Experiencia básica",
                    "Costo de oportunidad bajo"
                ],
                weaknesses: [
                    "Muffs ocasionales",
                    "Colocación lenta o imprecisa",
                    "Pánico en jugadas rotas",
                    "Vulnerable bajo presión"
                ],
                strategicImpact: "Riesgo en patadas críticas, puede arruinar puntos garantizados.",
                riskFactors: [
                    "Fumbles en momentos críticos",
                    "Colocación imperfecta afecta precisión"
                ],
                adaptations: {
                    offensive: ["Rush agresivo para forzar errores", "Presión constante"],
                    defensive: ["Protección extra", "Patadas más lentas"]
                }
            };
        }
    }
}

// ===== RETURNER (KR/PR) =====
export class ReturnerEvaluator {
    
    static calculateRating(attributes: PlayerAttributes): number {
        const weights = {
            speed: 0.25,         // Velocidad pura
            agility: 0.20,       // Cutting ability
            catching: 0.20,      // Manos confiables
            awareness: 0.15,     // Visión de campo
            strength: 0.10,      // Romper tacleos
            composure: 0.10      // Decisiones bajo presión
        };
        
        return Object.entries(weights).reduce((total, [attr, weight]) => {
            return total + (attributes[attr as keyof PlayerAttributes] * weight);
        }, 0);
    }
    
    static getQualitativeAssessment(attributes: PlayerAttributes): QualitativeAssessment {
        const isExplosive = attributes.speed >= 85 && attributes.agility >= 80;
        const isSafe = attributes.catching >= 85 && attributes.composure >= 75;
        
        if (isExplosive && !isSafe) {
            return {
                strengths: [
                    "Velocidad explosiva",
                    "Potencial de touchdown",
                    "Cambia momentum del juego",
                    "Fuerza cobertura agresiva"
                ],
                weaknesses: [
                    "Riesgo alto de fumble",
                    "Decisiones cuestionables",
                    "Inconsistencia en recepción"
                ],
                strategicImpact: "Prioriza potencial explosivo, acepta riesgo de turnover.",
                riskFactors: [
                    "Turnovers en momentos críticos",
                    "Malas decisiones de field position"
                ],
                adaptations: {
                    offensive: ["Gunners más rápidos", "Cobertura agresiva"],
                    defensive: ["Regresos agresivos", "Búsqueda de big plays"]
                }
            };
        } else if (isSafe && !isExplosive) {
            return {
                strengths: [
                    "Manos absolutamente confiables",
                    "Decisiones inteligentes",
                    "Posición de campo garantizada",
                    "Bajo riesgo de turnover"
                ],
                weaknesses: [
                    "Potencial explosivo limitado",
                    "Fácil de taclear",
                    "No cambia momentum"
                ],
                strategicImpact: "Prioriza seguridad y field position, minimiza riesgo.",
                riskFactors: [
                    "Falta de big plays",
                    "Momentum perdido"
                ],
                adaptations: {
                    offensive: ["Cobertura estándar", "Menos preocupación por velocidad"],
                    defensive: ["Fair catches frecuentes", "Ganancias modestas"]
                }
            };
        } else if (isExplosive && isSafe) {
            return {
                strengths: [
                    "Combinación perfecta",
                    "Explosivo pero seguro",
                    "Amenaza constante",
                    "Decisiones inteligentes"
                ],
                weaknesses: [
                    "Expectativas muy altas",
                    "Target para lesiones",
                    "Costo de oportunidad"
                ],
                strategicImpact: "Arma completa, cambia estrategia rival completamente.",
                riskFactors: [
                    "Lesión por uso excesivo",
                    "Presión de expectativas"
                ],
                adaptations: {
                    offensive: ["Cobertura élite necesaria", "Patadas estratégicas"],
                    defensive: ["Amenaza dual constante", "Flexibilidad máxima"]
                }
            };
        } else {
            return {
                strengths: [
                    "Funcional básico",
                    "Costo de roster bajo",
                    "Experiencia mínima"
                ],
                weaknesses: [
                    "Sin amenaza explosiva",
                    "Manos inconsistentes",
                    "Decisiones pobres"
                ],
                strategicImpact: "Liability en equipos especiales, debe ser reemplazado.",
                riskFactors: [
                    "Turnovers frecuentes",
                    "Mala posición de campo constante"
                ],
                adaptations: {
                    offensive: ["Ataques agresivos", "Presión constante"],
                    defensive: ["Fair catches forzados", "Conservadurismo extremo"]
                }
            };
        }
    }
}