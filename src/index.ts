
import {
    PlayerRole,
    PlayerMatch,
    IPlayerAttributesMatch,
    SpecializationMatrix,
    TeamMatch,
    IMatchState,
    MatchEngine,
    DynamicStrategy,
    StatsMatch,
    Coach,
    CoachRole,
    CoachSpecialty,
    ICoachAttributes,
    CoachingStaff
} from './MatchModels';

// --- 1. FUNCIÓN DE AYUDA: CREACIÓN DE JUGADORES Y EQUIPOS ---

/** Crea un set de jugadores aleatorios con roles definidos. */
function createRandomPlayers(prefix: string, roleMap: { role: PlayerRole, count: number }[]): PlayerMatch[] {
    const players: PlayerMatch[] = [];
    let idCounter = 1;

    for (const { role, count } of roleMap) {
        for (let i = 0; i < count; i++) {
            const baseAttr: IPlayerAttributesMatch = {
                // Físicos Básicos
                stamina: Math.floor(Math.random() * 30) + 70,
                strength: Math.floor(Math.random() * 40) + 60,
                speed: Math.floor(Math.random() * 40) + 60,
                agility: Math.floor(Math.random() * 40) + 60,

                // Habilidades Técnicas (varían según rol)
                catching: role === 'Runner' ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30) + 40,
                throwing: role === 'Quarterback' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20) + 30,
                blocking: role === 'Blocker' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30) + 40,
                tackling: ['ZoneDefender', 'ManDefender'].includes(role) ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30) + 40,
                coverage: ['ZoneDefender', 'ManDefender'].includes(role) ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20) + 30,

                // Mentales/Cognitivos
                awareness: Math.floor(Math.random() * 40) + 60,
                intelligence: Math.floor(Math.random() * 40) + 60,
                disciplineComposure: Math.floor(Math.random() * 40) + 60,
                concentration: Math.floor(Math.random() * 40) + 60,
                leadership: role === 'Quarterback' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 50,

                // Especializados
                kickAccuracy: role === 'Kicker' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20) + 30,
                kickPower: role === 'Kicker' ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20) + 30,
            };
            players.push(new PlayerMatch(`${prefix}-${role.charAt(0)}${idCounter++}`, role, baseAttr));
        }
    }
    return players;
}

/** Genera una matriz de especialización aleatoria. */
function createRandomSpecialization(): SpecializationMatrix {
    const randomVal = () => Math.floor(Math.random() * 50) + 50; // 50-100
    return {
        JTP: randomVal(),
        JTE: randomVal(),
        PCM: randomVal(),
        PP: randomVal(),
    };
}

// --- 2. SETUP INICIAL DEL PARTIDO ---

// Definición de roles (simplificado a 11 jugadores por lado)
const roleDistribution: { role: PlayerRole, count: number }[] = [
    { role: 'Quarterback', count: 1 },
    { role: 'Runner', count: 3 },
    { role: 'Blocker', count: 4 },
    { role: 'ZoneDefender', count: 2 },
    { role: 'ManDefender', count: 1 },
    { role: 'Kicker', count: 1 },
];

// Función para crear estrategia inicial
function createInitialStrategy(teamName: string, comprensionTactics: number): DynamicStrategy {
    // Estrategia base según la personalidad del equipo
    const isConservative = comprensionTactics > 75;

    return {
        axes: {
            aggression: isConservative ? 30 : 70, // Conservadores menos agresivos
            verticalDepth: isConservative ? 40 : 60, // Conservadores más horizontales
            positionalFocus: comprensionTactics * 0.8   // Especialización basada en CT
        },
        modifiers: {
            tempo: isConservative ? 0.3 : 0.6, // Ritmo más controlado si son conservadores
            deception: comprensionTactics * 0.01    // Engaño basada en CT
        },
        name: `${teamName} Base Strategy`
    };
}

/** Crea un entrenador con atributos específicos según su calidad */
function createCoach(id: string, name: string, role: CoachRole, specialty: CoachSpecialty, quality: 'Elite' | 'Poor'): Coach {
    let baseRange: [number, number];

    if (quality === 'Elite') {
        baseRange = [85, 100]; // Entrenadores élite: 85-100
    } else {
        baseRange = [25, 45]; // Entrenadores pobres: 25-45
    }

    const randomInRange = () => Math.floor(Math.random() * (baseRange[1] - baseRange[0] + 1)) + baseRange[0];

    // Ajustar algunos atributos según el rol
    const attributes: ICoachAttributes = {
        // Habilidades Tácticas
        tacticalKnowledge: randomInRange(),
        gameManagement: role === 'HeadCoach' ? Math.min(100, randomInRange() + 10) : randomInRange(),
        adaptability: randomInRange(),
        decisionMaking: role === 'HeadCoach' ? Math.min(100, randomInRange() + 5) : randomInRange(),

        // Habilidades de Liderazgo
        leadership: role === 'HeadCoach' ? Math.min(100, randomInRange() + 15) : randomInRange(),
        communication: randomInRange(),
        motivation: randomInRange(),
        temperament: randomInRange(),

        // Habilidades Técnicas
        offensiveSchemes: role === 'OffensiveCoordinator' ? Math.min(100, randomInRange() + 10) : randomInRange(),
        defensiveSchemes: role === 'DefensiveCoordinator' ? Math.min(100, randomInRange() + 10) : randomInRange(),
        specialTeamsKnowledge: role === 'SpecialTeamsCoordinator' ? Math.min(100, randomInRange() + 10) : randomInRange(),
        playerDevelopment: randomInRange(),

        // Habilidades Analíticas
        analytics: specialty === 'Analytics' ? Math.min(100, randomInRange() + 15) : randomInRange(),
        scouting: randomInRange(),
        innovation: specialty === 'StrategyInnovation' ? Math.min(100, randomInRange() + 15) : randomInRange(),

        // Experiencia
        experience: quality === 'Elite' ? Math.min(100, randomInRange() + 10) : Math.max(10, randomInRange() - 10),
        bigGameExperience: quality === 'Elite' ? Math.min(100, randomInRange() + 5) : Math.max(5, randomInRange() - 15)
    };

    return new Coach(id, name, role, specialty, attributes);
}

/** Crea un staff completo de entrenadores */
function createCoachingStaff(teamName: string, quality: 'Elite' | 'Poor'): CoachingStaff {
    const qualityLabel = quality === 'Elite' ? 'Elite' : 'Poor';

    const headCoach = createCoach(
        `${teamName}-HC`,
        `${teamName} Head Coach (${qualityLabel})`,
        'HeadCoach',
        'GameManagement',
        quality
    );

    const offensiveCoordinator = createCoach(
        `${teamName}-OC`,
        `${teamName} OC (${qualityLabel})`,
        'OffensiveCoordinator',
        'StrategyInnovation',
        quality
    );

    const defensiveCoordinator = createCoach(
        `${teamName}-DC`,
        `${teamName} DC (${qualityLabel})`,
        'DefensiveCoordinator',
        'Analytics',
        quality
    );

    const specialTeamsCoordinator = createCoach(
        `${teamName}-STC`,
        `${teamName} STC (${qualityLabel})`,
        'SpecialTeamsCoordinator',
        'PlayerDevelopment',
        quality
    );

    const staff = {
        headCoach,
        offensiveCoordinator,
        defensiveCoordinator,
        specialTeamsCoordinator,
        overallRating: 0,
        chemistryRating: 0,
        adaptabilityRating: 0
    };

    return new CoachingStaff(staff);
}

// Equipos
const playersA = createRandomPlayers('A', roleDistribution);
const teamAData = {
    name: 'Águilas',
    players: playersA,

    // Atributos Tácticos
    tacticalComprehension: 85,
    baseCohesion: 80,
    adaptability: 75,
    communication: 82,

    // Especializaciones
    offenseSpecialization: createRandomSpecialization(),
    defenseSpecialization: createRandomSpecialization(),

    // Filosofía de Juego
    offensivePhilosophy: 'Balanced' as const,
    defensivePhilosophy: 'Disciplined' as const,

    // Atributos de Coaching
    offensiveCoaching: 88,
    defensiveCoaching: 85,
    specialTeamsCoaching: 80,

    // Preparación y Condición
    conditioning: 85,
    preparation: 90,
    experience: 78,

    currentStrategy: createInitialStrategy('Águilas', 85),

    // Staff de Entrenadores ÉLITE
    coachingStaff: createCoachingStaff('Águilas', 'Elite')
};
const teamA = new TeamMatch(teamAData);

const playersB = createRandomPlayers('B', roleDistribution);
const teamBData = {
    name: 'Lobos',
    players: playersB,

    // Atributos Tácticos
    tacticalComprehension: 65,
    baseCohesion: 60,
    adaptability: 70,
    communication: 58,

    // Especializaciones
    offenseSpecialization: createRandomSpecialization(),
    defenseSpecialization: createRandomSpecialization(),

    // Filosofía de Juego
    offensivePhilosophy: 'Explosive' as const,
    defensivePhilosophy: 'Aggressive' as const,

    // Atributos de Coaching
    offensiveCoaching: 72,
    defensiveCoaching: 68,
    specialTeamsCoaching: 65,

    // Preparación y Condición
    conditioning: 75,
    preparation: 70,
    experience: 62,

    currentStrategy: createInitialStrategy('Lobos', 65),

    // Staff de Entrenadores POBRE
    coachingStaff: createCoachingStaff('Lobos', 'Poor')
};
const teamB = new TeamMatch(teamBData);

// Estado inicial del partido
let state: IMatchState = {
    down: 1,
    yardsToGo: 10,
    offenseYardLine: 25, // Ofensiva inicia en la yarda 25
    timeRemaining: 3600, // 60 minutos total (4 cuartos de 15 min)
    quarter: 1,
    quarterTimeRemaining: 900 // 15 minutos por cuarto
};

let offensiveTeam = teamA;
let defensiveTeam = teamB;
let currentScoreA = 0;
let currentScoreB = 0;

// --- 3. BUCLE PRINCIPAL DE SIMULACIÓN ---

// Inicializar sistema de estadísticas
const matchStats = new StatsMatch(teamA.data.name, teamB.data.name);

// Inicializar estadísticas de todos los jugadores
[...teamA.data.players, ...teamB.data.players].forEach(player => {
    matchStats.initializePlayerStats(player);
});

console.log("=========================================");
console.log(`🏈 INICIO DEL PARTIDO: ${teamA.data.name} vs ${teamB.data.name} 🏈`);
console.log("=========================================");

let playCount = 0;
let currentDriveStarted = false;

// Iniciar primera serie
matchStats.startNewDrive(offensiveTeam.data.name, state.offenseYardLine, state.timeRemaining);
currentDriveStarted = true;

while (state.timeRemaining > 0) {
    playCount++;

    // Mostrar información del cuarto
    const quarterTimeMin = Math.floor(state.quarterTimeRemaining / 60);
    const quarterTimeSec = state.quarterTimeRemaining % 60;
    const timeDisplay = `${quarterTimeMin}:${quarterTimeSec.toString().padStart(2, '0')}`;

    console.log(`\n--- JUGADA ${playCount} (Q${state.quarter}) ---`);
    console.log(`MARCADOR: ${teamA.data.name} ${currentScoreA} - ${teamB.data.name} ${currentScoreB}`);
    console.log(`TIEMPO: ${timeDisplay} - POSICIÓN: Down ${state.down} y ${Math.round(state.yardsToGo)} para avanzar, en la Yarda ${Math.round(state.offenseYardLine)} del rival.`);

    // Verificar si se debe intentar una jugada especial
    const specialPlay = MatchEngine.shouldAttemptSpecialPlay(offensiveTeam, state);

    let yardsGained = 0;
    let pointsScored = 0;

    if (specialPlay) {
        const result = MatchEngine.executeSpecialPlay(specialPlay, offensiveTeam, state);
        console.log(`JUGADA ESPECIAL: ${result.description}`);

        // Registrar jugada especial en estadísticas
        matchStats.recordSpecialPlay(offensiveTeam.data.name, specialPlay, result.success, result.yardsGained);

        if (specialPlay === 'FieldGoal') {
            if (result.success) {
                if (offensiveTeam === teamA) {
                    currentScoreA += 3;
                } else {
                    currentScoreB += 3;
                }
                matchStats.recordScore(offensiveTeam.data.name, 3, 'fieldgoal');

                // Finalizar serie actual
                if (currentDriveStarted) {
                    matchStats.endCurrentDrive(offensiveTeam.data.name, state.offenseYardLine, 'FieldGoal', 3, state.timeRemaining);
                    currentDriveStarted = false;
                }

                // Cambio de posesión después de field goal
                [offensiveTeam, defensiveTeam] = [defensiveTeam, offensiveTeam];
                state.offenseYardLine = 25;
                state.down = 1;
                state.yardsToGo = 10;

                // Iniciar nueva serie
                matchStats.startNewDrive(offensiveTeam.data.name, state.offenseYardLine, state.timeRemaining);
                currentDriveStarted = true;
            } else {
                // Field goal fallido, cambio de posesión en el lugar del intento
                [offensiveTeam, defensiveTeam] = [defensiveTeam, offensiveTeam];
                state.offenseYardLine = Math.round(100 - state.offenseYardLine);
                state.down = 1;
                state.yardsToGo = 10;
            }
        } else if (specialPlay === 'Punt') {
            // Finalizar serie actual
            if (currentDriveStarted) {
                matchStats.endCurrentDrive(offensiveTeam.data.name, state.offenseYardLine, 'Punt', 0, state.timeRemaining);
                currentDriveStarted = false;
            }

            // Cambio de posesión, la nueva ofensiva empieza donde llegó el punt
            [offensiveTeam, defensiveTeam] = [defensiveTeam, offensiveTeam];
            state.offenseYardLine = Math.round(Math.max(5, 100 - (state.offenseYardLine + result.yardsGained)));
            state.down = 1;
            state.yardsToGo = 10;

            // Iniciar nueva serie
            matchStats.startNewDrive(offensiveTeam.data.name, state.offenseYardLine, state.timeRemaining);
            currentDriveStarted = true;
        }
    } else {
        // Jugada normal
        const { playVector: offPlay, strategy: offStrategy } = MatchEngine.selectStrategyAndPlay(offensiveTeam, state, true);
        const { playVector: defPlay, strategy: defStrategy } = MatchEngine.selectStrategyAndPlay(defensiveTeam, state, false);

        console.log(`- Ofensiva (${offensiveTeam.data.name}) estrategia: ${offStrategy.name}`);

        // Analizar tipo de jugada una sola vez
        const isPassPlay = (offPlay.A_Prec + offPlay.A_Prof) > (offPlay.T_Con + offPlay.T_Eva);
        const isDeepPass = offPlay.A_Prof > 0.4;
        let jugadaTipo = '';
        let playType = 'Rush';

        if (isDeepPass) {
            jugadaTipo = '🎯 PASE PROFUNDO';
            playType = 'DeepPass';
        } else if (isPassPlay) {
            jugadaTipo = '� CPASE CORTO/MEDIO';
            playType = 'ShortPass';
        } else if (offPlay.T_Con > offPlay.T_Eva) {
            jugadaTipo = '💪 CARRERA DE PODER';
            playType = 'Rush';
        } else {
            jugadaTipo = '⚡ CARRERA DE EVASIÓN';
            playType = 'Rush';
        }

        console.log(`  ${jugadaTipo} - Riesgo: ${offPlay.R.toFixed(2)}, Tempo: ${offStrategy.modifiers.tempo.toFixed(2)}`);
        console.log(`- Defensiva (${defensiveTeam.data.name}) estrategia: ${defStrategy.name}`);

        // Resolver la jugada
        const offScore = offensiveTeam === teamA ? currentScoreA : currentScoreB;
        const defScore = offensiveTeam === teamA ? currentScoreB : currentScoreA;
        yardsGained = MatchEngine.runPlay(offensiveTeam, defensiveTeam, state, offScore, defScore);

        // Calcular tiempo consumido
        let timeConsumed = 30; // Base de 30 segundos
        const tempoFactor = offStrategy.modifiers.tempo;

        if (isDeepPass) {
            timeConsumed = Math.round(25 + (Math.random() * 15)); // 25-40 segundos
        } else if (isPassPlay) {
            timeConsumed = Math.round(20 + (Math.random() * 20)); // 20-40 segundos
        } else {
            timeConsumed = Math.round(15 + (Math.random() * 25)); // 15-40 segundos
        }

        // Ajustar por tempo del equipo
        if (tempoFactor > 0.7) {
            timeConsumed = Math.round(timeConsumed * 0.7);
        } else if (tempoFactor < 0.3) {
            timeConsumed = Math.round(timeConsumed * 1.3);
        }

        // Si la jugada fue exitosa y ganó muchas yardas, el reloj corre más
        if (yardsGained > 8 && !isPassPlay) {
            timeConsumed += Math.round(yardsGained * 0.5);
        }

        console.log(`RESULTADO: Se ganan ${yardsGained.toFixed(1)} yardas (${timeConsumed}s).`);

        // Registrar jugada en estadísticas
        matchStats.recordPlay(offensiveTeam, defensiveTeam, {
            yards: yardsGained,
            playType: playType,
            success: yardsGained > 0
        });

        // Consumir tiempo de la jugada
        state.timeRemaining -= timeConsumed;
        state.quarterTimeRemaining -= timeConsumed;
    }

    // --- ACTUALIZACIÓN DEL ESTADO (solo para jugadas normales) ---
    if (!specialPlay) {
        state.offenseYardLine = Math.round(state.offenseYardLine + yardsGained);
        state.yardsToGo = Math.round(state.yardsToGo - yardsGained);
        state.down++;
        // El tiempo ya se restó arriba

        // 1. Primer Down (o Touchdown)
        if (state.yardsToGo <= 0) {
            if (state.offenseYardLine >= 100) {
                // Touchdown!
                console.log("¡TOUCHDOWN! 🤩");
                if (offensiveTeam === teamA) {
                    currentScoreA += 6; // 6 puntos por touchdown
                } else {
                    currentScoreB += 6;
                }

                // Registrar touchdown en estadísticas
                matchStats.recordScore(offensiveTeam.data.name, 6, 'touchdown');

                // Intento de punto extra
                const extraPointResult = MatchEngine.executeSpecialPlay('ExtraPoint', offensiveTeam, state);
                console.log(extraPointResult.description);
                if (extraPointResult.success) {
                    if (offensiveTeam === teamA) {
                        currentScoreA += 1;
                    } else {
                        currentScoreB += 1;
                    }
                    matchStats.recordScore(offensiveTeam.data.name, 1, 'fieldgoal'); // Punto extra
                }

                // Finalizar serie actual
                if (currentDriveStarted) {
                    matchStats.endCurrentDrive(offensiveTeam.data.name, state.offenseYardLine, 'Touchdown', 7, state.timeRemaining);
                    currentDriveStarted = false;
                }

                // Reiniciar posesión al equipo contrario
                [offensiveTeam, defensiveTeam] = [defensiveTeam, offensiveTeam];
                state.offenseYardLine = 25; // Kickoff desde la 25
                state.down = 1;
                state.yardsToGo = 10;

                // Iniciar nueva serie
                matchStats.startNewDrive(offensiveTeam.data.name, state.offenseYardLine, state.timeRemaining);
                currentDriveStarted = true;
            } else {
                // Primer Down conseguido
                console.log(`¡PRIMER DOWN! 🎉 La ofensiva avanza. Ahora en Yarda ${Math.round(state.offenseYardLine)}.`);
                state.down = 1;
                state.yardsToGo = 10;
            }
        }
        // 2. Turnover on Downs (Pérdida de Posesión en 4to Down)
        else if (state.down > 4) {
            console.log("¡4to DOWN FALLIDO!  turnover on downs.");

            // Finalizar serie actual
            if (currentDriveStarted) {
                matchStats.endCurrentDrive(offensiveTeam.data.name, state.offenseYardLine, 'Turnover', 0, state.timeRemaining);
                currentDriveStarted = false;
            }

            // Cambio de posesión
            [offensiveTeam, defensiveTeam] = [defensiveTeam, offensiveTeam];
            // La nueva ofensiva comienza donde quedó la anterior
            state.offenseYardLine = Math.round(100 - state.offenseYardLine);
            state.down = 1;
            state.yardsToGo = 10;

            // Iniciar nueva serie
            matchStats.startNewDrive(offensiveTeam.data.name, state.offenseYardLine, state.timeRemaining);
            currentDriveStarted = true;
        }
    }

    // Consumo de tiempo para jugadas especiales
    if (specialPlay) {
        const timeConsumed = specialPlay === 'Punt' ? 45 : 35;
        state.timeRemaining -= timeConsumed;
        state.quarterTimeRemaining -= timeConsumed;
    }
    // El tiempo para jugadas normales ya se calculó arriba

    // 3. Revisión de Fatiga (Solo para mostrar el impacto)
    const fatigaCheck = offensiveTeam.data.players[0].getEffectiveAttribute('disciplineComposure');
    console.log(`[FATIGA/DD]: DD efectiva del QB (${offensiveTeam.data.name}) es ${fatigaCheck.toFixed(2)}.`);

    // Mostrar información de entrenadores cada 10 jugadas
    if (playCount % 10 === 0) {
        console.log(`[ENTRENADORES]: HC ${offensiveTeam.data.name} - Confianza: ${offensiveTeam.data.coachingStaff.staff.headCoach.confidence.toFixed(0)}%, Estrés: ${offensiveTeam.data.coachingStaff.staff.headCoach.stress.toFixed(0)}%`);
    }

    // Verificar cambio de cuarto
    if (state.quarterTimeRemaining <= 0 && state.quarter < 4) {
        // Finalizar serie actual
        if (currentDriveStarted) {
            matchStats.endCurrentDrive(offensiveTeam.data.name, state.offenseYardLine, 'EndOfHalf', 0, state.timeRemaining);
            currentDriveStarted = false;
        }

        state.quarter++;
        state.quarterTimeRemaining = 900; // 15 minutos
        matchStats.updateCurrentQuarter(state.quarter);

        console.log(`\n🏈 ===== FIN DEL CUARTO ${state.quarter - 1} =====`);
        console.log(`🏈 ===== INICIO DEL CUARTO ${state.quarter} =====`);

        // Cambio de posesión entre cuartos (simplificado)
        if (state.quarter === 2 || state.quarter === 4) {
            [offensiveTeam, defensiveTeam] = [defensiveTeam, offensiveTeam];
            state.offenseYardLine = 25;
            state.down = 1;
            state.yardsToGo = 10;

            // Iniciar nueva serie
            matchStats.startNewDrive(offensiveTeam.data.name, state.offenseYardLine, state.timeRemaining);
            currentDriveStarted = true;
        }
    }
}

// Finalizar estadísticas
matchStats.calculateFinalStats();

console.log("\n=========================================");
console.log("FIN DE LA SIMULACIÓN");
console.log(`MARCADOR FINAL: ${teamA.data.name} ${currentScoreA} - ${teamB.data.name} ${currentScoreB}`);
console.log("=========================================");

// Mostrar rendimiento de jugadores clave
console.log("\n📊 RENDIMIENTO DE JUGADORES:");
console.log(`\n${teamA.data.name}:`);
const qbA = teamA.data.players.find(p => p.role === 'Quarterback');
if (qbA) {
    console.log(`  QB ${qbA.id}: Energía ${qbA.energy.toFixed(0)}%, Disciplina efectiva: ${qbA.getEffectiveAttribute('disciplineComposure').toFixed(1)}`);
}

console.log(`\n${teamB.data.name}:`);
const qbB = teamB.data.players.find(p => p.role === 'Quarterback');
if (qbB) {
    console.log(`  QB ${qbB.id}: Energía ${qbB.energy.toFixed(0)}%, Disciplina efectiva: ${qbB.getEffectiveAttribute('disciplineComposure').toFixed(1)}`);
}

// Mostrar jugadores más fatigados
console.log("\n🥵 JUGADORES MÁS FATIGADOS:");
const allPlayers = [...teamA.data.players, ...teamB.data.players];
const mostFatigued = allPlayers
    .sort((a, b) => a.energy - b.energy)
    .slice(0, 3);

mostFatigued.forEach((player, index) => {
    const teamName = teamA.data.players.includes(player) ? teamA.data.name : teamB.data.name;
    console.log(`  ${index + 1}. ${player.id} (${teamName}): ${player.energy.toFixed(0)}% energía, ${player.role}`);
});

// Mostrar reportes estadísticos completos
console.log(matchStats.generateReport());
console.log(matchStats.generateQuarterlyReport());
console.log(matchStats.generateDriveReport());

// Mostrar información de los staffs de entrenadores
console.log("\n👔 RENDIMIENTO DE LOS STAFFS DE ENTRENADORES:");
console.log(`\n${teamA.data.name} (ÉLITE):`);
console.log(`  Rating General: ${teamA.data.coachingStaff.staff.overallRating.toFixed(1)}`);
console.log(`  Química del Staff: ${teamA.data.coachingStaff.staff.chemistryRating.toFixed(1)}`);
console.log(`  Adaptabilidad: ${teamA.data.coachingStaff.staff.adaptabilityRating.toFixed(1)}`);
console.log(`  Head Coach - Confianza: ${teamA.data.coachingStaff.staff.headCoach.confidence.toFixed(0)}%, Estrés: ${teamA.data.coachingStaff.staff.headCoach.stress.toFixed(0)}%`);

console.log(`\n${teamB.data.name} (POBRE):`);
console.log(`  Rating General: ${teamB.data.coachingStaff.staff.overallRating.toFixed(1)}`);
console.log(`  Química del Staff: ${teamB.data.coachingStaff.staff.chemistryRating.toFixed(1)}`);
console.log(`  Adaptabilidad: ${teamB.data.coachingStaff.staff.adaptabilityRating.toFixed(1)}`);
console.log(`  Head Coach - Confianza: ${teamB.data.coachingStaff.staff.headCoach.confidence.toFixed(0)}%, Estrés: ${teamB.data.coachingStaff.staff.headCoach.stress.toFixed(0)}%`);