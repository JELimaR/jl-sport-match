import { CoachRole, CoachSpecialty, DynamicStrategy, StrategicAxes, ExecutionModifiers } from './Types';

// --- SISTEMA DE ENTRENADORES ---

export interface ICoachAttributes {
  // Habilidades Tácticas
  tacticalKnowledge: number; // Conocimiento táctico (1-100)
  gameManagement: number; // Gestión del partido (1-100)
  adaptability: number; // Capacidad de adaptación (1-100)
  decisionMaking: number; // Toma de decisiones bajo presión (1-100)
  
  // Habilidades de Liderazgo
  leadership: number; // Liderazgo (1-100)
  communication: number; // Comunicación (1-100)
  motivation: number; // Capacidad de motivación (1-100)
  temperament: number; // Control del temperamento (1-100)
  
  // Habilidades Técnicas
  offensiveSchemes: number; // Conocimiento de esquemas ofensivos (1-100)
  defensiveSchemes: number; // Conocimiento de esquemas defensivos (1-100)
  specialTeamsKnowledge: number; // Conocimiento de equipos especiales (1-100)
  playerDevelopment: number; // Desarrollo de jugadores (1-100)
  
  // Habilidades Analíticas
  analytics: number; // Uso de analíticas (1-100)
  scouting: number; // Capacidad de scouting (1-100)
  innovation: number; // Innovación estratégica (1-100)
  
  // Experiencia
  experience: number; // Años de experiencia (1-100)
  bigGameExperience: number; // Experiencia en partidos importantes (1-100)
}

export class Coach {
  public id: string;
  public name: string;
  public role: CoachRole;
  public specialty: CoachSpecialty;
  public attributes: ICoachAttributes;
  
  // Estados dinámicos durante el partido
  public confidence: number; // Confianza actual (0-100)
  public stress: number; // Nivel de estrés (0-100)
  public adaptationRate: number; // Velocidad de adaptación en el partido
  
  constructor(id: string, name: string, role: CoachRole, specialty: CoachSpecialty, attributes: ICoachAttributes) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.specialty = specialty;
    this.attributes = attributes;
    this.confidence = 75; // Inicia con confianza moderada-alta
    this.stress = 25; // Inicia con poco estrés
    this.adaptationRate = this.calculateAdaptationRate();
  }
  
  private calculateAdaptationRate(): number {
    // La velocidad de adaptación se basa en experiencia, adaptabilidad y gestión del partido
    const baseRate = (this.attributes.adaptability + this.attributes.gameManagement + this.attributes.experience) / 3;
    return Math.min(100, baseRate * 1.1); // Pequeño bonus
  }
  
  /**
   * Calcula la efectividad del entrenador considerando estrés y confianza
   */
  public getEffectiveAttribute(attrName: keyof ICoachAttributes): number {
    const baseValue = this.attributes[attrName];
    
    // Factor de confianza (más confianza = mejor rendimiento)
    const confidenceFactor = 0.8 + (this.confidence / 100) * 0.4; // 0.8 a 1.2
    
    // Factor de estrés (más estrés = peor rendimiento)
    const stressFactor = 1.2 - (this.stress / 100) * 0.4; // 1.2 a 0.8
    
    return Math.min(100, Math.max(10, baseValue * confidenceFactor * stressFactor));
  }
  
  /**
   * Ajusta el estrés y confianza basado en el resultado de una jugada
   */
  public adjustMentalState(playSuccess: boolean, gameContext: { score: number, timeRemaining: number }): void {
    const stressIncrease = gameContext.timeRemaining < 300 ? 2 : 1; // Más estrés en los últimos 5 minutos
    
    if (playSuccess) {
      this.confidence = Math.min(100, this.confidence + 1);
      this.stress = Math.max(0, this.stress - 0.5);
    } else {
      this.confidence = Math.max(0, this.confidence - 0.5);
      this.stress = Math.min(100, this.stress + stressIncrease);
    }
  }
}

export interface ICoachingStaff {
  headCoach: Coach;
  offensiveCoordinator: Coach;
  defensiveCoordinator: Coach;
  specialTeamsCoordinator: Coach;
  
  // Métricas del staff
  overallRating: number;
  chemistryRating: number; // Qué tan bien trabajan juntos
  adaptabilityRating: number; // Capacidad colectiva de adaptación
}

export class CoachingStaff {
  public staff: ICoachingStaff;
  
  constructor(staff: ICoachingStaff) {
    this.staff = staff;
    this.calculateStaffMetrics();
  }
  
  private calculateStaffMetrics(): void {
    const coaches = [
      this.staff.headCoach,
      this.staff.offensiveCoordinator,
      this.staff.defensiveCoordinator,
      this.staff.specialTeamsCoordinator
    ];
    
    // Rating general (promedio ponderado, head coach tiene más peso)
    this.staff.overallRating = (
      this.staff.headCoach.getEffectiveAttribute('tacticalKnowledge') * 0.4 +
      this.staff.offensiveCoordinator.getEffectiveAttribute('offensiveSchemes') * 0.2 +
      this.staff.defensiveCoordinator.getEffectiveAttribute('defensiveSchemes') * 0.2 +
      this.staff.specialTeamsCoordinator.getEffectiveAttribute('specialTeamsKnowledge') * 0.2
    );
    
    // Química del staff (basada en comunicación y liderazgo)
    const avgCommunication = coaches.reduce((sum, coach) => sum + coach.getEffectiveAttribute('communication'), 0) / 4;
    const avgLeadership = coaches.reduce((sum, coach) => sum + coach.getEffectiveAttribute('leadership'), 0) / 4;
    this.staff.chemistryRating = (avgCommunication + avgLeadership) / 2;
    
    // Adaptabilidad colectiva
    const avgAdaptability = coaches.reduce((sum, coach) => sum + coach.getEffectiveAttribute('adaptability'), 0) / 4;
    this.staff.adaptabilityRating = avgAdaptability;
  }
  
  /**
   * Influencia del staff de entrenadores en la generación de estrategias
   */
  public influenceStrategy(baseStrategy: DynamicStrategy, gameContext: { 
    isOffense: boolean, 
    score: number, 
    timeRemaining: number,
    down: number 
  }): DynamicStrategy {
    const relevantCoach = gameContext.isOffense ? 
      this.staff.offensiveCoordinator : 
      this.staff.defensiveCoordinator;
    
    const headCoachInfluence = this.staff.headCoach.getEffectiveAttribute('gameManagement') / 100;
    const coordinatorInfluence = relevantCoach.getEffectiveAttribute(
      gameContext.isOffense ? 'offensiveSchemes' : 'defensiveSchemes'
    ) / 100;
    
    // Ajustar ejes estratégicos basado en las habilidades de los entrenadores
    const modifiedAxes: StrategicAxes = {
      aggression: this.adjustAxisValue(
        baseStrategy.axes.aggression,
        this.staff.headCoach.getEffectiveAttribute('decisionMaking'),
        relevantCoach.getEffectiveAttribute('tacticalKnowledge')
      ),
      verticalDepth: this.adjustAxisValue(
        baseStrategy.axes.verticalDepth,
        relevantCoach.getEffectiveAttribute('innovation'),
        this.staff.headCoach.getEffectiveAttribute('analytics')
      ),
      positionalFocus: this.adjustAxisValue(
        baseStrategy.axes.positionalFocus,
        relevantCoach.getEffectiveAttribute('playerDevelopment'),
        this.staff.chemistryRating
      )
    };
    
    // Ajustar modificadores
    const modifiedModifiers: ExecutionModifiers = {
      tempo: Math.min(1.0, baseStrategy.modifiers.tempo * (1 + headCoachInfluence * 0.2)),
      deception: Math.min(1.0, baseStrategy.modifiers.deception * (1 + coordinatorInfluence * 0.3))
    };
    
    return {
      axes: modifiedAxes,
      modifiers: modifiedModifiers,
      name: `${baseStrategy.name} [Coach+]`
    };
  }
  
  private adjustAxisValue(baseValue: number, primaryInfluence: number, secondaryInfluence: number): number {
    const influenceFactor = (primaryInfluence * 0.7 + secondaryInfluence * 0.3) / 100;
    const adjustment = (influenceFactor - 0.5) * 20; // -10 a +10 de ajuste
    return Math.min(100, Math.max(0, baseValue + adjustment));
  }
  
  /**
   * Actualiza el estado mental de todos los entrenadores después de una jugada
   */
  public updateStaffMentalState(playSuccess: boolean, gameContext: { score: number, timeRemaining: number }): void {
    [
      this.staff.headCoach,
      this.staff.offensiveCoordinator,
      this.staff.defensiveCoordinator,
      this.staff.specialTeamsCoordinator
    ].forEach(coach => {
      coach.adjustMentalState(playSuccess, gameContext);
    });
    
    // Recalcular métricas del staff
    this.calculateStaffMetrics();
  }
}