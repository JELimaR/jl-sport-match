/**
 * full_match.ts
 *
 * Implementación completa (no simplificada) del modelo descrito en:
 * "Documentacion_General___sport___match.pdf"
 *
 * - Un solo archivo TypeScript
 * - Simula un partido discretizado en intervalos de 5 minutos (T = 18)
 * - Incluye: habilidades, adaptabilidad con α(a), energía, moral, entrenamiento P_{X,k},
 *   selección de estrategia, p_exec, Araw, ajuste por efectividades F_atk/F_def,
 *   ocasiones (Poisson), goles (Binomial), dinámica de energía y moral (con rachas),
 *   momentum (µ), y logging detallado por intervalo.
 *
 * Nota: el PDF define algunos parámetros sin valor numérico (ej. pr en α). He elegido
 * valores razonables y explícitos en la sección de PARÁMETROS globales abajo. Si quieres
 * otros valores, dímelos y los cambio.
 */

/* ---------------------------
   Tipos y utilidades
   --------------------------- */
type Vector = number[];

interface Strategy {
  id: number;         // índice
  name: string;
  dk: number;         // dificultad de ejecución > 0
  rk: number;         // riesgo [0,1]
  bk: number;         // beneficio ofensivo base > 0
  ck: number;         // costo energético base > 0 (no usado directamente pero lo guardamos)
  Ik: number;         // intensidad táctica [0,1]
  w: Vector;          // vector requerimiento habilidades (length = n)
}

class Team {
  name: string;
  skills: Vector;                 // sX (componentes en [0,1] por conveniencia)
  adaptability: number;           // aX ∈ [0,1]
  energy: number;                 // EX(t) ∈ [0,1]
  morale: number;                 // mX(t) ∈ [0.7,1.3]
  training: Map<number, number>;  // PX,k ∈ [0,1] por estrategia id
  score: number;                  // goles acumulados
  streakPos: number;              // racha positiva (consecutivos intervalos con > rival)
  streakNeg: number;              // racha negativa
  momentum: number;               // µX(t) diferencia de goles acumulada (ScoreX - ScoreY), pero guardamos localmente
  constructor(name: string, skills: Vector, adaptability: number) {
    this.name = name;
    this.skills = skills.slice();
    this.adaptability = clamp01(adaptability);
    this.energy = 1.0;
    this.morale = 1.0; // empezamos neutros (en [0.7,1.3] veremos truncamiento más tarde)
    this.training = new Map();
    this.score = 0;
    this.streakPos = 0;
    this.streakNeg = 0;
    this.momentum = 0;
  }

  // habilidad media s̄X
  avgSkill(): number {
    const s = this.skills.reduce((a, b) => a + b, 0);
    return s / this.skills.length;
  }

  // θX,k = coseno entre sX y wk (se asume vectores no nulos)
  theta(strategy: Strategy): number {
    const n = this.skills.length;
    if (strategy.w.length !== n) {
      throw new Error("Dimensiones de habilidades y w no coinciden");
    }
    let dot = 0;
    let normS2 = 0;
    let normW2 = 0;
    for (let i = 0; i < n; i++) {
      dot += this.skills[i] * strategy.w[i];
      normS2 += this.skills[i] * this.skills[i];
      normW2 += strategy.w[i] * strategy.w[i];
    }
    const normS = Math.sqrt(normS2);
    const normW = Math.sqrt(normW2);
    if (normS === 0 || normW === 0) return 0;
    // resultado en [0,1] si componentes no negativas; si hay negativos podría ser [-1,1].
    const cos = dot / (normS * normW);
    // clamp por seguridad
    return clamp(cos, 0, 1);
  }

  // α(aX) según el documento:
  // α(aX) = { 1 - exp(-(aX - 0.5)/pr), aX > 0.5
  //          exp(-(0.5 - aX)/pr) - 1, aX <= 0.5 }
  alpha(pr: number): number {
    const a = this.adaptability;
    if (a > 0.5) {
      return 1 - Math.exp(-(a - 0.5) / pr);
    } else {
      return Math.exp(-(0.5 - a) / pr) - 1;
    }
  }

  // pX,k(t) = α(aX) * θX,k * (s̄X / (s̄X + dk)) * PX,k * EX(t)
  pExec(strategy: Strategy, pr: number): number {
    const alpha = this.alpha(pr);
    const theta = this.theta(strategy);
    const sBar = this.avgSkill();
    const P = this.training.get(strategy.id) ?? 0.5; // si no hay valor, 0.5 por defecto
    const denom = sBar + strategy.dk;
    const frac = denom > 0 ? sBar / denom : 0;
    const val = alpha * theta * frac * P * this.energy;
    return clamp(val, 0, 1);
  }
}

/* ---------------------------
   Parámetros globales (ajustables)
   --------------------------- */
// Tiempo
const INTERVAL_MIN = 5;
const T = 18; // 18 intervalos x 5 min = 90 minutos

// Probabilidades / factores
const ETA = 0.9;       // η factor de ocasiones creadas por Ã (ajustado mayor a 0)
const Q0 = 0.12;       // q0 prob base de convertir una ocasión (baja)
const KAPPA = 0.6;     // κ en prob de convertir
const LAMBDA = 0.06;   // λ consumo de energía por intensidad
const BETA = 1.0;      // β factor que multiplica rk en consumo energético
const DELTA = 0.06;    // δ impacto general de goles en moral
const ZETA = 0.04;     // ζ bonificación por racha positiva
const XI = 0.04;       // ξ penalización por racha negativa
const MORALE_MIN = 0.7;
const MORALE_MAX = 1.3;
const PR_ALPHA = 0.12; // pr usado en α(aX) (valor elegido)
const OMEGA_D = 0.5;   // ωd en ajuste defensivo (peso de penalización)
const RNG_SEED = undefined; // opcional: si quieres reproducibilidad, puedes implementar RNG con seed

/* ---------------------------
   Utilidades numéricas y probabilísticas
   --------------------------- */
function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}
function clamp01(x: number) {
  return clamp(x, 0, 1);
}
// Poisson por método de Knuth
function poissonSample(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  while (p > L) {
    k++;
    p *= Math.random();
    // protección por si lambda enorme (no ocurre aquí)
    if (k > 1e6) break;
  }
  return k - 1;
}
// Binomial por ensayo (si n pequeño) - n será razonable (ocasiones)
function binomialSample(n: number, p: number): number {
  if (n <= 0 || p <= 0) return 0;
  if (p >= 1) return n;
  let s = 0;
  for (let i = 0; i < n; i++) if (Math.random() < p) s++;
  return s;
}

/* ---------------------------
   Matrices de efectividad
   --------------------------- */
/**
 * F_atk[k][j] mide ventaja de estrategia k en ataque contra estrategia j defensiva.
 * F_def[j][k] mide capacidad de j defensiva para contrarrestar k ofensiva.
 *
 * Ambos en [0.6, 1.4] según PDF.
 *
 * Implementaremos matrices cuadradas de tamaño |S| x |S| (strategies.length).
 * Para dar variedad, generamos valores aleatorios en [0.8,1.2] centrados en 1,
 * pero dejando espacio a 0.6 y 1.4 si se desea (aquí usamos 0.7-1.3 para estabilidad).
 *
 * Si quieres valores reproducibles o determinísticos, reemplaza la función por constantes.
 */
function makeEffectivenessMatrices(S: Strategy[]) {
  const n = S.length;
  const F_atk: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  const F_def: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // generar valor en [0.7, 1.3] con ligero sesgo
      F_atk[i][j] = clamp(0.7 + (Math.random() * 0.6) + (S[i].bk - 0.8) * 0.1, 0.6, 1.4);
      F_def[j][i] = clamp(0.7 + (Math.random() * 0.6) + (S[j].Ik - 0.6) * 0.1, 0.6, 1.4);
    }
  }
  return { F_atk, F_def };
}

/* ---------------------------
   Función que calcula Araw y Atil
   --------------------------- */
/**
 * Araw_X(t) = bk · pX,k(t) · mX(t) · (1 + γ µX(t))
 * (en PDF γ aparece sin valor. Elegimos γ = 0.03 por defecto: momentum tiene efecto pequeño)
 *
 * ÃX(t) = Araw_X(t) · F_atk[kX,kY] · (1 - ωd * (F_def[kY,kX] - 1))
 *
 * - Si (F_def - 1) es positivo, resta algo según ωd.
 * - Clamp final para evitar negativos.
 */
const GAMMA_MOMENTUM = 0.03;

function computeAraw(team: Team, strat: Strategy): number {
  const p = team.pExec(strat, PR_ALPHA);
  const mu = team.momentum; // puede ser negativo
  const Araw = strat.bk * p * team.morale * (1 + GAMMA_MOMENTUM * mu);
  return Math.max(0, Araw);
}

function adjustWithMatchup(
  Araw: number,
  atkIdx: number,
  defIdx: number,
  F_atk: number[][],
  F_def: number[][]
): number {
  const Fatk = F_atk[atkIdx][defIdx];
  const Fdef = F_def[defIdx][atkIdx];
  const factorDef = 1 - OMEGA_D * (Fdef - 1);
  const Atil = Araw * Fatk * factorDef;
  return Math.max(0, Atil);
}

/* ---------------------------
   Selección de estrategia
   ---------------------------
   El documento no fija un mecanismo concreto. Implemento:
   - Calcular pExec para cada estrategia k.
   - Convertirlos a probabilidades (softmax-like, pero usando valores no exponenciales):
     prob_k ∝ max(pExec_k, epsilon)
   - Seleccionar aleatoriamente según prob_k.
   Esto refleja que un equipo tiende a elegir estrategias con mayor probabilidad de ejecutarlas.
*/
function pickStrategyProbabilistic(team: Team, strategies: Strategy[]): Strategy {
  const eps = 1e-6;
  const weights = strategies.map((s) => Math.max(team.pExec(s, PR_ALPHA), eps));
  const sum = weights.reduce((a, b) => a + b, 0);
  const r = Math.random() * sum;
  let acc = 0;
  for (let i = 0; i < strategies.length; i++) {
    acc += weights[i];
    if (r <= acc) return strategies[i];
  }
  return strategies[strategies.length - 1];
}

/* ---------------------------
   Actualización de energía y moral
   --------------------------- */
/**
 * EX(t+1) = EX(t) − λ · IkX(t) · (1 + β rkX(t))
 * mX(t+1) = mX(t) + δ · (GX(t) − GY(t)) + ζ · 1_racha_pos - ξ · 1_racha_neg
 * luego truncar mX en [0.7, 1.3]
 *
 * Rachas: definimos que una "racha positiva" ocurre si el equipo marcó >=1 gol
 * en este intervalo y además mantiene una racha positiva acumulada (se actualiza en función del resultado).
 *
 * En práctica actualizamos rachas según (GX - GY).
 */
function updateEnergy(team: Team, strategy: Strategy) {
  const cons = LAMBDA * strategy.Ik * (1 + BETA * strategy.rk);
  team.energy = clamp01(team.energy - cons);
}

function updateMoraleAndStreaks(team: Team, goalsFor: number, goalsAgainst: number) {
  const diff = goalsFor - goalsAgainst;
  // actualizar rachas
  if (diff > 0) {
    team.streakPos += 1;
    team.streakNeg = 0;
  } else if (diff < 0) {
    team.streakNeg += 1;
    team.streakPos = 0;
  } else {
    // empate en el intervalo: no se rompe pero tampoco suma racha
    // para este modelo dejamos rachas como estaban
  }
  const rachaPosBonus = team.streakPos > 0 ? ZETA * team.streakPos : 0;
  const rachaNegPenalty = team.streakNeg > 0 ? XI * team.streakNeg : 0;

  team.morale = team.morale + DELTA * diff + rachaPosBonus - rachaNegPenalty;
  team.morale = clamp(team.morale, MORALE_MIN, MORALE_MAX);
}

/* ---------------------------
   Simulación del partido (función principal)
   --------------------------- */
function simulateMatchFull(teamX: Team, teamY: Team, strategies: Strategy[]) {
  console.log(`\n=== Partido completo: ${teamX.name} vs ${teamY.name} ===`);
  // matrices de efectividad
  const { F_atk, F_def } = makeEffectivenessMatrices(strategies);

  // parámetros de simulación (ya definidos arriba)
  const timeline: {
    minute: number;
    stratX: Strategy;
    stratY: Strategy;
    pX: number;
    pY: number;
    ArawX: number;
    ArawY: number;
    AtilX: number;
    AtilY: number;
    occX: number;
    occY: number;
    gx: number;
    gy: number;
    energyX: number;
    energyY: number;
    moraleX: number;
    moraleY: number;
  }[] = [];

  // Inicializamos momentum (µ) como diferencia de goles acumulada (ScoreX - ScoreY)
  teamX.momentum = teamX.score - teamY.score;
  teamY.momentum = teamY.score - teamX.score;

  for (let t = 1; t <= T; t++) {
    const minute = t * INTERVAL_MIN;
    console.log(`\n--- Intervalo ${t} (min ${minute}) ---`);

    // Selección de estrategias por probabilidad basada en pExec
    const stratX = pickStrategyProbabilistic(teamX, strategies);
    const stratY = pickStrategyProbabilistic(teamY, strategies);

    // Probabilidad efectiva de ejecución pX,k(t)
    const pX = teamX.pExec(stratX, PR_ALPHA);
    const pY = teamY.pExec(stratY, PR_ALPHA);

    console.log(
      `${teamX.name} elige "${stratX.name}" (p_exec=${pX.toFixed(4)}, Ik=${stratX.Ik}, rk=${stratX.rk.toFixed(
        2
      )})`
    );
    console.log(
      `${teamY.name} elige "${stratY.name}" (p_exec=${pY.toFixed(4)}, Ik=${stratY.Ik}, rk=${stratY.rk.toFixed(
        2
      )})`
    );

    // potencia ofensiva cruda
    const ArawX = computeAraw(teamX, stratX);
    const ArawY = computeAraw(teamY, stratY);

    // ajustada con efectividades
    const AtilX = adjustWithMatchup(ArawX, stratX.id, stratY.id, F_atk, F_def);
    const AtilY = adjustWithMatchup(ArawY, stratY.id, stratX.id, F_atk, F_def);

    // tasas de ocasiones ΛX(t) = η · ÃX(t)
    const lambdaX = ETA * AtilX;
    const lambdaY = ETA * AtilY;

    // numero de ocasiones OX(t) ~ Poisson(ΛX)
    const occX = poissonSample(lambdaX);
    const occY = poissonSample(lambdaY);

    // prob convertir cada ocasión qX(t) = q0 * ÃX / (ÃX + κ)
    const qprobX = AtilX + KAPPA > 0 ? Q0 * (AtilX / (AtilX + KAPPA)) : 0;
    const qprobY = AtilY + KAPPA > 0 ? Q0 * (AtilY / (AtilY + KAPPA)) : 0;

    // goles en intervalo GX(t) ~ Binomial(OX, qX)
    const gx = binomialSample(occX, clamp(qprobX, 0, 1));
    const gy = binomialSample(occY, clamp(qprobY, 0, 1));

    // actualizar score provisional
    teamX.score += gx;
    teamY.score += gy;

    // Actualizar momentum (diferencia acumulada de goles)
    teamX.momentum = teamX.score - teamY.score;
    teamY.momentum = teamY.score - teamX.score;

    // Logs detallados del intervalo
    console.log(
      `${teamX.name} -> Araw=${ArawX.toFixed(4)}, Atil=${AtilX.toFixed(
        4
      )}, Λ=${lambdaX.toFixed(4)}, ocasiones=${occX}, q=${qprobX.toFixed(
        4
      )}, goles=${gx}`
    );
    console.log(
      `${teamY.name} -> Araw=${ArawY.toFixed(4)}, Atil=${AtilY.toFixed(
        4
      )}, Λ=${lambdaY.toFixed(4)}, ocasiones=${occY}, q=${qprobY.toFixed(
        4
      )}, goles=${gy}`
    );
    console.log(
      `Marcador parcial: ${teamX.name} ${teamX.score} - ${teamY.score} ${teamY.name}`
    );

    // actualizar energía por estrategia escogida
    updateEnergy(teamX, stratX);
    updateEnergy(teamY, stratY);

    // actualizar moral y rachas según goles del intervalo
    updateMoraleAndStreaks(teamX, gx, gy);
    updateMoraleAndStreaks(teamY, gy, gx);

    // Guardar snapshot en timeline
    timeline.push({
      minute,
      stratX,
      stratY,
      pX,
      pY,
      ArawX,
      ArawY,
      AtilX,
      AtilY,
      occX,
      occY,
      gx,
      gy,
      energyX: teamX.energy,
      energyY: teamY.energy,
      moraleX: teamX.morale,
      moraleY: teamY.morale,
    });

    // Mostrar estado de energía/moral
    console.log(
      `${teamX.name} -> Energía=${teamX.energy.toFixed(3)}, Moral=${teamX.morale.toFixed(
        3
      )}, Racha+=${teamX.streakPos}, Racha-=${teamX.streakNeg}, Momentum=${teamX.momentum}`
    );
    console.log(
      `${teamY.name} -> Energía=${teamY.energy.toFixed(3)}, Moral=${teamY.morale.toFixed(
        3
      )}, Racha+=${teamY.streakPos}, Racha-=${teamY.streakNeg}, Momentum=${teamY.momentum}`
    );
  }

  // Resultado final
  console.log(
    `\n=== Resultado final: ${teamX.name} ${teamX.score} - ${teamY.score} ${teamY.name} ===`
  );

  return { timeline, F_atk, F_def };
}

/* ---------------------------
   Construcción de equipos y estrategias aleatorias (para test)
   --------------------------- */
function randomInRange(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeRandomStrategy(id: number, nSkills: number, name?: string): Strategy {
  // generamos wk con componentes entre 0.3 y 1 para evitar vectores nulos
  const w = Array.from({ length: nSkills }, () => randomInRange(0.3, 1.0));
  return {
    id,
    name: name ?? `Estrategia ${id}`,
    dk: randomInRange(0.3, 1.2),
    rk: clamp01(randomInRange(0, 1)),
    bk: randomInRange(0.4, 1.6),
    ck: randomInRange(0.2, 1.0),
    Ik: clamp01(randomInRange(0, 1)),
    w,
  };
}

function makeRandomTeam(name: string, nSkills: number, strategies: Strategy[]): Team {
  const skills = Array.from({ length: nSkills }, () => randomInRange(0.1, 1.0));
  const adaptability = clamp01(randomInRange(0, 1));
  const team = new Team(name, skills, adaptability);
  // entrenamiento PX,k aleatorio en [0.2, 1]
  for (const s of strategies) {
    team.training.set(s.id, randomInRange(0.2, 1.0));
  }
  // inicializamos morale en 1 y energy en 1
  team.morale = 1.0;
  team.energy = 1.0;
  return team;
}

/* ---------------------------
   Ejecución de ejemplo
   --------------------------- */
function mainExample() {
  const nSkills = 6;
  // definimos algunas estrategias base realistas
  const strategies: Strategy[] = [
    {
      id: 0,
      name: "Ataque Rápido",
      dk: 0.6,
      rk: 0.45,
      bk: 1.2,
      ck: 0.5,
      Ik: 0.85,
      w: [0.9, 0.6, 0.4, 0.3, 0.7, 0.5],
    },
    {
      id: 1,
      name: "Defensa Sólida",
      dk: 0.5,
      rk: 0.2,
      bk: 0.7,
      ck: 0.4,
      Ik: 0.5,
      w: [0.4, 0.8, 1.0, 0.6, 0.4, 0.5],
    },
    {
      id: 2,
      name: "Posesión",
      dk: 0.7,
      rk: 0.25,
      bk: 0.9,
      ck: 0.45,
      Ik: 0.6,
      w: [0.8, 1.0, 0.6, 0.5, 0.6, 0.7],
    },
    {
      id: 3,
      name: "Presión Alta",
      dk: 0.9,
      rk: 0.55,
      bk: 1.3,
      ck: 0.8,
      Ik: 0.95,
      w: [0.8, 0.6, 0.5, 0.9, 0.7, 0.4],
    },
    {
      id: 4,
      name: "Contraataque",
      dk: 0.65,
      rk: 0.4,
      bk: 1.0,
      ck: 0.6,
      Ik: 0.75,
      w: [0.85, 0.6, 0.5, 0.4, 0.8, 0.6],
    },
  ];

  // crear equipos aleatorios con entrenamiento para cada estrategia
  const team1 = makeRandomTeam("Tigres", nSkills, strategies);
  const team2 = makeRandomTeam("Leones", nSkills, strategies);

  // opcional: imprimir configuración inicial
  console.log("=== Configuración inicial ===");
  console.log(`${team1.name} skills:`, team1.skills.map((v) => v.toFixed(3)));
  console.log(`${team2.name} skills:`, team2.skills.map((v) => v.toFixed(3)));
  console.log(`${team1.name} adaptabilidad: ${team1.adaptability.toFixed(3)}`);
  console.log(`${team2.name} adaptabilidad: ${team2.adaptability.toFixed(3)}`);
  console.log(`Estrategias disponibles:`);
  strategies.forEach((s) =>
    console.log(
      `  [${s.id}] ${s.name} (dk=${s.dk.toFixed(2)}, rk=${s.rk.toFixed(
        2
      )}, bk=${s.bk.toFixed(2)}, Ik=${s.Ik.toFixed(2)})`
    )
  );

  // ejecutar simulación completa
  simulateMatchFull(team1, team2, strategies);
}

mainExample();

