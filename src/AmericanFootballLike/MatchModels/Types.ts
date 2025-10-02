// --- TIPOS Y INTERFACES BÁSICAS ---

// Roles abstractos del jugador, ligados a los atributos específicos
export type PlayerRole = 'Runner' | 'Blocker' | 'Quarterback' | 'ZoneDefender' | 'ManDefender' | 'Kicker';

// Tipos de jugadas especiales
export type SpecialPlayType = 'Punt' | 'FieldGoal' | 'ExtraPoint' | 'Kickoff';

// Tipos de entrenadores
export type CoachRole = 'HeadCoach' | 'OffensiveCoordinator' | 'DefensiveCoordinator' | 'SpecialTeamsCoordinator';

// Especialidades de entrenadores
export type CoachSpecialty = 'GameManagement' | 'PlayerDevelopment' | 'StrategyInnovation' | 'Motivation' | 'Analytics';

// Ejes de Estrategia Dinámica (0-100)
export interface StrategicAxes {
  aggression: number; // Agresividad en Duelos (0=Conservador, 100=Agresivo)
  verticalDepth: number; // Profundidad Vertical (0=Corto/Horizontal, 100=Largo/Profundo)
  positionalFocus: number; // Enfoque Posicional (0=Generalista, 100=Especialista)
}

// Modificadores de Ejecución (0.0-1.0)
export interface ExecutionModifiers {
  tempo: number; // Modificador de Ritmo (0.0=Lento/Control, 1.0=Rápido)
  deception: number; // Modificador de Engaño (0.0=Directo, 1.0=Alto Engaño)
}

// Estrategia Completa
export interface DynamicStrategy {
  axes: StrategicAxes;
  modifiers: ExecutionModifiers;
  name?: string; // Opcional para debugging
}

// Matriz de Especialización: Valores de 1 a 100
export interface SpecializationMatrix {
  JTP: number;
  JTE: number;
  PCM: number;
  PP: number;
}

// Atributos de jugadores
export interface IPlayerAttributesMatch {
  // Físicos Básicos
  stamina: number; // Resistencia física
  strength: number; // Fuerza bruta
  speed: number; // Velocidad pura
  agility: number; // Agilidad y cambios de dirección

  // Habilidades Técnicas
  catching: number; // Capacidad de recepción
  throwing: number; // Precisión y potencia de pase
  blocking: number; // Habilidad de bloqueo
  tackling: number; // Habilidad de placaje
  coverage: number; // Cobertura defensiva

  // Mentales/Cognitivos
  awareness: number; // Conciencia situacional
  intelligence: number; // Inteligencia de juego
  disciplineComposure: number; // Disciplina y compostura bajo presión
  concentration: number; // Concentración y enfoque
  leadership: number; // Liderazgo y comunicación

  // Especializados
  kickAccuracy: number; // Precisión de pateo
  kickPower: number; // Potencia de pateo
}

// Vector de jugada
export interface IPlayVector {
  // Intención de Avance (Suma debe ser ~1.0)
  T_Con: number;
  A_Prec: number;
  A_Prof: number;
  T_Eva: number;

  // Riesgo / Control (Suma debe ser ~1.0)
  R: number; // Riesgo (0.0 a 1.0)
  C: number; // Control (0.0 a 1.0)

  // Reparto de Responsabilidad (0.0 a 1.0)
  Bl_Conc: number; // Concentración de Bloqueo
  Ej_Espec: number; // Énfasis en el Ejecutor
}

// Estado del partido
export interface IMatchState {
  down: number; // 1, 2, 3, 4
  yardsToGo: number;
  offenseYardLine: number; // Posición de la ofensiva
  timeRemaining: number;
  quarter: number; // 1, 2, 3, 4
  quarterTimeRemaining: number; // Tiempo restante en el cuarto actual (15 min = 900s)
}