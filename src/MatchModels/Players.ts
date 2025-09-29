import { PlayerRole, IPlayerAttributesMatch, SpecializationMatrix, DynamicStrategy, IPlayVector } from './Types';
import { CoachingStaff } from './Coaches';

// --- CLASE PLAYERMATCH ---

export class PlayerMatch {
  public id: string;
  public role: PlayerRole;
  private baseAttr: IPlayerAttributesMatch;

  // Estados Dinámicos (0-100%)
  public energy: number;
  public moral: number;

  constructor(id: string, role: PlayerRole, baseAttr: IPlayerAttributesMatch) {
    this.id = id;
    this.role = role;
    this.baseAttr = baseAttr;
    this.energy = 100; // Inicia al máximo
    this.moral = 50; // Inicia neutral
  }

  /**
   * Función de Impacto de la Fatiga (Sigmoide Invertida)
   * Determina el multiplicador de rendimiento. Decae fuertemente después de cierto umbral.
   * @param k - Constante de forma. Se relaciona con la Resistencia (R): k = 0.2 - (0.1 * R / 100)
   * @returns Multiplicador de 0 a 1.
   */
  private getFatigueFactor(k: number = 0.15): number {
    // La penalización total será menor cuanto mayor sea la Resistencia.
    const staminaFactor = (100 - this.baseAttr.stamina) / 100;
    const S = 0.5 + staminaFactor * 0.5; // S: Factor de sensibilidad (máx 1.0 si stamina=0, min 0.5 si stamina=100)

    const sigmoide = 1 / (1 + Math.exp(k * (this.energy - 50)));
    return Math.max(0.1, 1 - sigmoide * S); // Asegura que no baje de 0.1
  }

  /**
   * Calcula el valor efectivo de un atributo, aplicando fatiga y concentración.
   */
  public getEffectiveAttribute(attrName: keyof IPlayerAttributesMatch): number {
    const baseValue = this.baseAttr[attrName];
    const F_Fatiga = this.getFatigueFactor();

    // C_Factor: Concentración mitiga la penalización de la fatiga
    const concentrationProtection = (this.baseAttr.concentration / 100) * 0.2; // Max 20% de mitigación
    const concentrationFactor = 1 + concentrationProtection * (1 - F_Fatiga);

    return Math.min(100, baseValue * F_Fatiga * concentrationFactor);
  }

  /**
   * Reduce la energía después de una jugada intensa.
   * @param intensity - Intensidad del esfuerzo (0.1 a 1.0)
   */
  public loseEnergy(intensity: number): void {
    const stamina = this.baseAttr.stamina;
    // La pérdida es inversamente proporcional a la resistencia.
    const loss = intensity * (1 - stamina / 100) * 15; // Max 15 de pérdida si stamina=0
    this.energy = Math.max(0, this.energy - loss);
  }
}

// --- CLASE TEAMMATCH ---

interface ITeamMatch {
  name: string;
  players: PlayerMatch[];

  // Atributos Tácticos
  tacticalComprehension: number; // Comprensión táctica (1-100)
  baseCohesion: number; // Cohesión base (1-100)
  adaptability: number; // Capacidad de adaptación (1-100)
  communication: number; // Comunicación del equipo (1-100)

  // Especializaciones
  offenseSpecialization: SpecializationMatrix;
  defenseSpecialization: SpecializationMatrix;

  // Filosofía de Juego
  offensivePhilosophy: 'Balanced' | 'RunHeavy' | 'PassHeavy' | 'Explosive' | 'Methodical';
  defensivePhilosophy: 'Aggressive' | 'Conservative' | 'Opportunistic' | 'Disciplined';

  // Atributos de Coaching
  offensiveCoaching: number; // Calidad del coaching ofensivo (1-100)
  defensiveCoaching: number; // Calidad del coaching defensivo (1-100)
  specialTeamsCoaching: number; // Calidad del coaching de equipos especiales (1-100)

  // Preparación y Condición
  conditioning: number; // Preparación física del equipo (1-100)
  preparation: number; // Preparación para el partido (1-100)
  experience: number; // Experiencia del equipo (1-100)

  // Estrategia Dinámica
  currentStrategy: DynamicStrategy;

  // Staff de Entrenadores
  coachingStaff: CoachingStaff;
}

export class TeamMatch {
  public data: ITeamMatch;
  public currentYardLine: number; // 0 (end zone) to 100 (oponent's end zone)

  constructor(data: ITeamMatch) {
    this.data = data;
    this.currentYardLine = 20; // Inicia en la yarda 20 (abstracta)
  }

  /**
   * Calcula la Cohesión de Equipo (CE) ajustada.
   * @returns Cohesión (1-100) con bonus por comprensión táctica.
   */
  public getAdjustedCohesion(): number {
    // Bono directo de Comprensión Táctica a la Cohesión
    const CT_Bonus = (this.data.tacticalComprehension / 100) * 20; // Máx +20
    return Math.min(100, this.data.baseCohesion + CT_Bonus);
  }

  /**
   * Calcula la Fuerza Táctica Bruta (FTC Bruta) para una jugada.
   * FTC Bruta = Suma Ponderada de Atributos Efectivos relevantes.
   */
  public calculateFTCBruta(playVector: IPlayVector, isOffense: boolean): number {
    let ftcSum = 0;
    const playersInvolved = this.data.players; // Simplificado: todos participan

    for (const player of playersInvolved) {
      let playerWeight = 0;
      let relevantAttr: keyof IPlayerAttributesMatch = 'awareness'; // Atributo por defecto

      // Definición de pesos y atributos por rol y tipo de jugada (simplificado)
      switch (player.role) {
        case 'Blocker':
          playerWeight = playVector.Bl_Conc;
          relevantAttr = 'blocking';
          break;
        case 'Quarterback':
          playerWeight = playVector.Ej_Espec;
          relevantAttr = 'throwing'; // Precisión Aérea
          break;
        case 'Runner':
          playerWeight = playVector.Ej_Espec;
          relevantAttr = 'agility'; // Evasión/Velocidad
          break;
        case 'ManDefender':
        case 'ZoneDefender':
          // En defensa, la FTC Bruta es más uniforme (depende de la estrategia)
          playerWeight = isOffense ? 0 : 0.8;
          relevantAttr = 'tackling'; // Placaje/Cobertura
          break;
        case 'Kicker':
          playerWeight = 0.1; // Los kickers no participan en jugadas normales
          relevantAttr = 'kickAccuracy';
          break;
        default:
          playerWeight = 0.1;
      }

      ftcSum += player.getEffectiveAttribute(relevantAttr) * playerWeight;
    }

    return ftcSum;
  }
}