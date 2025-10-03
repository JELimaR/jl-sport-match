import { calculateDamage } from './damage'
// -----------------------------------------------------------
// 1. DEFINICIÓN DE INTERFACES Y CLASE DE JUGADOR
// -----------------------------------------------------------

/**
 * Define los atributos mínimos para un jugador (Player o Campeón).
 */
interface PlayerStats {
  critChance: number;      // Probabilidad de crítico (0.0 a 1.0)
  critMultiplier: number;  // Multiplicador de daño crítico (ej. 1.5)
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  baseDamage: number;
  speed: number;
  attackSpeed: number; // Tasa de ataque (ej. 1 a 100). Valores más altos = turnos más rápidos.
  tactic: number;      // NUEVO: Inteligencia/Táctica para la IA (ej. 0 a 100)
}

export class Player {
  name: string;
  stats: PlayerStats;
  turnCharge: number = 0;

  constructor(name: string, stats: PlayerStats) {
    this.name = name;
    this.stats = stats;
  }

  isAlive(): boolean {
    return this.stats.health > 0;
  }

  getHealthPercentage(): number {
    return this.stats.health / this.stats.maxHealth;
  }
}

// ===========================================================
// FUNCIONES DE LA IA Y RESOLUCIÓN DE ACCIONES
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
// 3. FUNCIÓN DE SIMULACIÓN DE COMBATE (Con Carga de Turno AS)
// -----------------------------------------------------------

/**
* Simula una pelea cuerpo a cuerpo por turnos entre dos jugadores, usando el modelo de Carga de Turno (AS).
*/
function simulateFightWithAS(playerA: Player, playerB: Player): string {
  console.log(`\n⚔️ INICIO DEL COMBATE AS: ${playerA.name} vs ${playerB.name} ⚔️`);

  let turnCount = 1;
  const CHARGE_MAX = 1000;
  let escapeResult: 'None' | 'A_Escaped' | 'B_Escaped' = 'None'; // Variable para terminar el bucle

  playerA.turnCharge = playerA.stats.speed;
  playerB.turnCharge = playerB.stats.speed;

  while (playerA.isAlive() && playerB.isAlive() && turnCount < 200 && escapeResult === 'None') {

    // --- Paso 1 y 2: Determinar atacante y avanzar carga (Igual que antes) ---
    let timeToActA = (CHARGE_MAX - playerA.turnCharge) / playerA.stats.attackSpeed;
    let timeToActB = (CHARGE_MAX - playerB.turnCharge) / playerB.stats.attackSpeed;

    let timePassed: number;
    let activePlayer: Player;
    let targetPlayer: Player;

    if (timeToActA <= timeToActB) {
      timePassed = timeToActA;
      activePlayer = playerA;
      targetPlayer = playerB;
    } else {
      timePassed = timeToActB;
      activePlayer = playerB;
      targetPlayer = playerA;
    }

    playerA.turnCharge += playerA.stats.attackSpeed * timePassed;
    playerB.turnCharge += playerB.stats.attackSpeed * timePassed;

    activePlayer.turnCharge -= CHARGE_MAX;

    // --- Paso 3: Resolución de la Acción (IA) ---

    console.log(`\n--- Turno ${turnCount}: ${activePlayer.name} Actúa --- (HP: ${Math.round(activePlayer.stats.health)})`);

    const action = chooseAction(activePlayer, targetPlayer); // La IA elige

    if (action === 'Escape') {

      if (resolveEscape(activePlayer, targetPlayer)) {
        console.log(`   🎉 ¡ÉXITO! ${activePlayer.name} ha escapado del combate.`);
        escapeResult = (activePlayer === playerA) ? 'A_Escaped' : 'B_Escaped';
      } else {
        console.log(`   🚨 ¡FALLO! ${activePlayer.name} no pudo huir y permanece en combate.`);
      }

    } else { // Basic Attack

      // Probabilidad de Golpe (P_hit)
      let hitProbability = (activePlayer.stats.attack - targetPlayer.stats.defense) / 100 + 0.5;
      hitProbability = Math.max(0.05, Math.min(0.95, hitProbability));

      if (Math.random() < hitProbability) {
        const damageCalc = calculateDamage(activePlayer, targetPlayer);
        // el daño real es damageCalc o targetplater.health

        targetPlayer.stats.health -= damageCalc.finalDamage;

        const critText = damageCalc.isCritical ? "💥 ¡GOLPE CRÍTICO!" : "✅ ¡Golpe acertado!";
        console.log(`   ${critText} Inflige ${damageCalc.finalDamage.toFixed(0)} de daño.`);
        console.log(`   ${targetPlayer.name} Salud restante: ${Math.max(0, targetPlayer.stats.health).toFixed(0)}/${targetPlayer.stats.maxHealth}`);
      } else {
        console.log(`   ❌ ${activePlayer.name} falla el golpe (Prob: ${Math.round(hitProbability * 100)}%).`);
      }

      if (!targetPlayer.isAlive()) {
        break;
      }
    }

    turnCount++;
  }

  // 4. Resultado Final
  let resultMessage: string;

  if (escapeResult !== 'None') {
    const escaper = escapeResult === 'A_Escaped' ? playerA.name : playerB.name;
    resultMessage = `🚪 FIN DEL COMBATE: ${escaper} ha escapado.`;
    return escaper;
  }

  const winner = playerA.isAlive() ? playerA.name : playerB.name;
  const loser = playerA.isAlive() ? playerB.name : playerA.name;
  resultMessage = `👑 FIN DEL COMBATE: ${winner} ha derrotado a ${loser}.`;

  console.log(`\n════════════════════════════════`);
  console.log(resultMessage);
  console.log(`════════════════════════════════`);

  return winner;
}

// -----------------------------------------------------------
// 4. EJEMPLO DE USO Y CALIBRACIÓN
// -----------------------------------------------------------

// Jugador 1: Rápido y DPs (Inteligente)
const fastStats: PlayerStats = {
  health: 2000, maxHealth: 2000,
  attack: 100, defense: 50,
  baseDamage: 50, speed: 50, attackSpeed: 80,
  critChance: 0.20, critMultiplier: 1.5,
  tactic: 90, // Alta Táctica: Huirá temprano
};
const fastPlayer = new Player("Látigo Táctico", fastStats);

// Jugador 2: Lento y Tanque (Agresivo/Tonto)
const slowStats: PlayerStats = {
  health: 2000, maxHealth: 2000,
  attack: 100, defense: 50,
  baseDamage: 130, speed: 50, attackSpeed: 30,
  critChance: 0.10, critMultiplier: 2.0,
  tactic: 10, // Baja Táctica: Esperará hasta casi morir para huir
};
const slowPlayer = new Player("Martillo Temerario", slowStats);

function printSeparator() {
  console.log('='.repeat(60))
}

export function runMobaGameSimulation() {
  printSeparator()
  fastPlayer.stats.health = fastStats.maxHealth;
  slowPlayer.stats.health = slowStats.maxHealth;
  fastPlayer.turnCharge = fastPlayer.stats.speed;
  slowPlayer.turnCharge = slowPlayer.stats.speed;
  simulateFightWithAS(fastPlayer, slowPlayer);
}

runMobaGameSimulation();