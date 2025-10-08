import { calculateDamage } from './damage'
import { GameCamp } from './gameCamp';
import { GameNode, IConnection } from './node';
// -----------------------------------------------------------
// 1. DEFINICIÓN DE INTERFACES Y CLASE DE JUGADOR
// -----------------------------------------------------------

interface PlayerStats {
  //
  critChance: number;      // Probabilidad de crítico (0.0 a 1.0)
  critMultiplier: number;  // Multiplicador de daño crítico (ej. 1.5)
  //
  health: number;
  maxHealth: number;

  attack: number;
  defense: number;
  baseDamage: number;
  attackSpeed: number; // Tasa de ataque (ej. 1 a 100). Valores más altos = turnos más rápidos.
  speed: number;

  tactic: number;      // Inteligencia/Táctica para la IA (ej. 0 a 100)
}

export class Player {
  name: string;
  stats: PlayerStats;
  turnCharge: number = 0;
  team: 'Alpha' | 'Beta'; // Nuevo: Identificador de equipo

  constructor(name: string, stats: PlayerStats, team: 'Alpha' | 'Beta') {
    this.name = name;
    this.stats = stats;
    this.team = team;
  }

  isAlive(): boolean {
    return this.stats.health > 0;
  }

  getHealthPercentage(): number {
    return this.stats.health / this.stats.maxHealth;
  }
}

// ===========================================================
// IA DE FOCALIZACIÓN (TARGETING AI)
// ===========================================================

/**
* Calcula la utilidad de atacar a un objetivo específico. 
* La IA pondera entre rematar (vida baja) y eficiencia (defensa baja),
* usando Táctica para modular la estrategia.
*/
function getTargetUtility(attacker: Player, target: Player): number {
  const TACT_MAX = 100;

  // --- 1. Factores Brutos ---

  // a) Factor de Remate (Finishing): Alto si el objetivo tiene poca vida
  const lifeLostRatio = 1.0 - target.getHealthPercentage();

  // b) Factor de Eficiencia (Blandura): Alto si la defensa es baja
  // Se usa una inversa de la defensa para que sea más alto para objetivos blandos.
  const efficiencyFactor = attacker.stats.baseDamage / (target.stats.defense + 10);

  // --- 2. Ponderación por Táctica ---

  // Jugador Táctico (TACT alta) prioriza el Remate (concentrar daño).
  // Jugador Tonto (TACT baja) prioriza la Eficiencia (pegar al objetivo más blando).
  const remateWeight = 0.5 + (attacker.stats.tactic / TACT_MAX) * 0.5; // 0.5 (tonto) a 1.0 (listo)
  const efficiencyWeight = 1.0 - remateWeight; // Complementario (1.5 a 0.5)

  // --- 3. Utilidad Final ---
  return (lifeLostRatio * remateWeight) + (efficiencyFactor * efficiencyWeight);
}

/**
* El jugador activo elige el mejor objetivo del equipo enemigo.
*/
function chooseTarget(activePlayer: Player, enemyPlayers: Player[]): Player {
  let bestTarget: Player | null = null;
  let maxUtility = -Infinity;

  for (const enemy of enemyPlayers) {
    if (enemy.isAlive()) {
      const utility = getTargetUtility(activePlayer, enemy);
      if (utility > maxUtility) {
        maxUtility = utility;
        bestTarget = enemy;
      }
    }
  }
  // Si no hay objetivos vivos (esto no debería pasar en el bucle principal)
  return bestTarget!;
}


// ===========================================================
// LÓGICA DE ACCIÓN (ATAQUE/HUIR) - Reutilizamos la función chooseAction anterior
// ===========================================================

/**
 * La IA del jugador elige la mejor acción evaluando la utilidad de todas las acciones posibles.
 * @returns La acción con el puntaje de utilidad más alto: 'Escape' o 'Basic Attack'
 */
function chooseAction(activePlayer: Player, targetPlayer: Player): 'Escape' | 'Basic Attack' {
  const TACT_MAX = 100;

  // Objeto para almacenar la utilidad de cada acción.
  const actionUtilities: { [action: string]: number } = {};

  // ----------------------------------------------------
  // 1. EVALUACIÓN DE ATAQUE BÁSICO
  // ----------------------------------------------------
  // La utilidad de atacar es mayor si el enemigo tiene más vida (hay más que ganar).
  const targetHealthRatio = targetPlayer.stats.health / targetPlayer.stats.maxHealth;
  actionUtilities['Basic Attack'] = 1.0 + (targetHealthRatio * 0.5);

  // ----------------------------------------------------
  // 2. EVALUACIÓN DE HUIR (Escape)
  // ----------------------------------------------------
  const activeHealthRatio = activePlayer.stats.health / activePlayer.stats.maxHealth;

  // Utilidad Base: Aumenta a medida que la salud del jugador cae.
  const baseEscapeUtility = Math.min(1.0, Math.max(0, 1.5 - activeHealthRatio * 1.5));

  // Factor Táctico (Experiencia): Jugadores con alta TACT valoran más la supervivencia
  // TACT baja (0) da un factor de 1.0 (no hay bono de supervivencia).
  // TACT alta (100) da un factor de 2.0 (gran bono de supervivencia).
  const tacticalFactor = 1.0 + (activePlayer.stats.tactic / TACT_MAX);

  // Utilidad de Huir: Base * Factor Táctico
  actionUtilities['Escape'] = baseEscapeUtility * tacticalFactor;

  // ******************************************************
  // FUTURO: Habilidad de Alto Daño (Ejemplo para Escalabilidad)
  // 
  // actionUtilities['Nuke'] = calculateNukeUtility(activePlayer, targetPlayer);
  // ******************************************************


  // ----------------------------------------------------
  // 3. DECISIÓN FINAL (Elegir la máxima utilidad)
  // ----------------------------------------------------
  let bestAction: 'Escape' | 'Basic Attack' = 'Basic Attack';
  let maxUtility = actionUtilities['Basic Attack'];

  // Iterar sobre las acciones para encontrar la mejor
  for (const action in actionUtilities) {
    const utility = actionUtilities[action];
    if (utility > maxUtility) {
      maxUtility = utility;
      bestAction = action as 'Escape' | 'Basic Attack';
    }
  }

  // Registro de la decisión (para debugging y simulación)
  console.log(`   💡 Utilidades: Ataque: ${actionUtilities['Basic Attack'].toFixed(2)}, Huir: ${actionUtilities['Escape'].toFixed(2)} -> Elige: ${bestAction}`);

  return bestAction;
}

/**
* Resuelve la acción de escape de un jugador.
* @returns true si la huida es exitosa, false si falla.
*/
function resolveEscape(activePlayer: Player, targetPlayer: Player): boolean {
  // Probabilidad de Huida = (Velocidad del Activo) - (Attack del Objetivo)
  // Se divide por una constante (ej. 100) y se añade una base (ej. 0.5)
  const BASE_CHANCE = 0.5;

  let escapeProbability = BASE_CHANCE + (activePlayer.stats.speed - targetPlayer.stats.attack) / 100;

  // Clamp para mantener entre un mínimo (ej. 10%) y un máximo (ej. 90%)
  escapeProbability = Math.max(0.10, Math.min(0.90, escapeProbability));

  console.log(`   🏃 Intentando Huir! Probabilidad: ${Math.round(escapeProbability * 100)}%`);

  if (Math.random() < escapeProbability) {
    return true;
  } else {
    return false;
  }
}

// -----------------------------------------------------------
// 3. FUNCIÓN DE SIMULACIÓN DE COMBATE MÚLTIPLE
// -----------------------------------------------------------

/**
* Simula una pelea multijugador por turnos, manejando la carga de turno y la focalización.
* @param allPlayers Lista de todos los jugadores que participan en el combate.
*/
function simulateFightMultiple(allPlayers: Player[]): string {
  console.log(`\n⚔️ INICIO DEL COMBATE MÚLTIPLE: ${allPlayers.map(p => p.name).join(', ')} ⚔️`);

  const CHARGE_MAX = 1000;
  let turnCount = 1;

  // Inicializar cargas
  allPlayers.forEach(p => p.turnCharge = p.stats.speed);

  // Obtener equipos (Asumiendo que el equipo del primer jugador es 'A', el resto es 'B' por defecto)
  const teamA = allPlayers.filter(p => p.team === 'Alpha');
  const teamB = allPlayers.filter(p => p.team !== 'Alpha');

  // Función de chequeo rápido
  const isTeamAlive = (team: Player[]) => team.some(p => p.isAlive());

  let escapeResult: Player | null = null;

  while (isTeamAlive(teamA) && isTeamAlive(teamB) && turnCount < 200 && escapeResult === null) {

    // --- Paso 1: Determinar el Jugador Activo ---
    let timePassed = Infinity;
    let activePlayer: Player | null = null;
    let availablePlayers = allPlayers.filter(p => p.isAlive());

    // Encontrar el jugador que actuará más rápido
    for (const p of availablePlayers) {
      const tta = (CHARGE_MAX - p.turnCharge) / p.stats.attackSpeed;
      if (tta < timePassed) {
        timePassed = tta;
        activePlayer = p;
      }
    }

    if (!activePlayer) break; // No quedan jugadores vivos

    // --- Paso 2: Avanzar las barras de carga ---
    for (const p of availablePlayers) {
      p.turnCharge += p.stats.attackSpeed * timePassed;
    }
    activePlayer.turnCharge -= CHARGE_MAX;

    // --- Paso 3: Identificar Objetivos y Decisión ---
    const enemyTeam = activePlayer.team === 'Alpha' ? teamB : teamA;
    const enemyTargets = enemyTeam.filter(p => p.isAlive());

    if (enemyTargets.length === 0) break; // El equipo enemigo fue aniquilado o huyó.

    // Elegir un objetivo inicial (necesario para la IA de huida)
    const dummyTarget = enemyTargets[0];

    console.log(`\n--- Turno ${turnCount}: ${activePlayer.name} (Equipo ${activePlayer.team}) Actúa --- (HP: ${Math.round(activePlayer.stats.health)})`);

    // La IA decide (Ataque o Huir)
    const action = chooseAction(activePlayer, dummyTarget);

    if (action === 'Escape') {
      if (resolveEscape(activePlayer, dummyTarget)) { // Usamos un target dummy para el cálculo de escape
        console.log(`   🎉 ¡ÉXITO! ${activePlayer.name} ha escapado del combate.`);
        escapeResult = activePlayer;
        // Lo sacamos de la lista para que no siga tomando turnos
        allPlayers = allPlayers.filter(p => p !== activePlayer);
      } else {
        console.log(`   🚨 ¡FALLO! ${activePlayer.name} no pudo huir.`);
      }

    } else { // Basic Attack - ¡FOCALIZACIÓN!

      const targetPlayer = chooseTarget(activePlayer, enemyTargets); // La IA elige el mejor objetivo
      console.log(`   🎯 Focaliza a: ${targetPlayer.name} (Utilidad Máx)`);

      // Probabilidad de Golpe (P_hit)
      let hitProbability = (activePlayer.stats.attack - targetPlayer.stats.defense) / 100 + 0.5;
      hitProbability = Math.max(0.05, Math.min(0.95, hitProbability));

      if (Math.random() < hitProbability) {
        // Asumiendo que calculateDamage está implementado en otro lugar
        const damageCalc = calculateDamage(activePlayer, targetPlayer);

        targetPlayer.stats.health -= damageCalc.finalDamage;

        const critText = damageCalc.isCritical ? "💥 ¡GOLPE CRÍTICO!" : "✅ ¡Golpe acertado!";
        console.log(`   ${critText} Inflige ${damageCalc.finalDamage.toFixed(0)} de daño.`);
        console.log(`   ${targetPlayer.name} Salud restante: ${Math.max(0, targetPlayer.stats.health).toFixed(0)}/${targetPlayer.stats.maxHealth}`);
      } else {
        console.log(`   ❌ ${activePlayer.name} falla el golpe.`);
      }
    }

    turnCount++;
  }

  // 4. Resultado Final
  let resultMessage: string;

  if (escapeResult) {
    resultMessage = `🚪 FIN DEL COMBATE: ${escapeResult.name} ha escapado.`;
    return 'Escape';
  }

  const winnerTeam = isTeamAlive(teamA) ? 'Equipo A' : 'Equipo B';
  const loserTeam = isTeamAlive(teamA) ? 'Equipo B' : 'Equipo A';
  resultMessage = `👑 ¡FIN DEL COMBATE! ${winnerTeam} ha derrotado a ${loserTeam}.`;

  console.log(`\n════════════════════════════════`);
  console.log(resultMessage);
  console.log(`════════════════════════════════`);

  return winnerTeam;
}

/// -----------------------------------------------------------
// 4. EJEMPLO DE USO (2v1)
// -----------------------------------------------------------

// PlayerStats base (se asume que están definidas con tactic, crit, etc.)

const player1Stats: PlayerStats = { health: 20000, maxHealth: 20000, attack: 100, defense: 50, baseDamage: 50, speed: 100, attackSpeed: 80, critChance: 0.20, critMultiplier: 1.5, tactic: 90 };
const player2Stats: PlayerStats = { health: 1800, maxHealth: 1800, attack: 120, defense: 30, baseDamage: 70, speed: 60, attackSpeed: 90, critChance: 0.30, critMultiplier: 1.8, tactic: 80 };
const player3Stats: PlayerStats = { health: 3000, maxHealth: 3000, attack: 80, defense: 120, baseDamage: 40, speed: 40, attackSpeed: 50, critChance: 0.05, critMultiplier: 1.2, tactic: 10 };

// CREACIÓN DE JUGADORES Y ASIGNACIÓN DE EQUIPOS
const dps_A = new Player("DPS_A", player1Stats, 'Alpha');
const dps_B = new Player("DPS_B", player2Stats, 'Beta'); // Equipo B
const tank_B = new Player("Tank_B", player3Stats, 'Beta'); // Equipo B

// Simulación 1v2


function printSeparator() {
  console.log('='.repeat(60))
}

export function runMobaGameSimulation() {
  printSeparator()
  simulateFightMultiple([dps_A, dps_B, tank_B]);

  //
  printSeparator()
  const camp = new GameCamp()
  camp.nodes.forEach((n: GameNode) => {
    console.log(n.id, n.position)
    console.log('connections: ')
    const arr: string[] = []
    n.connections.forEach((conn: IConnection) => {
      arr.push(`${conn.target.id} - ${conn.distance.toFixed(1)}`)
    })
    console.log(arr)
    printSeparator()
  })
}