// AmericanFootballLike2 - Simulación completa de fútbol americano
// Sistema integrado con Actions, Coach, Team y ExpandedPlayState

import { createEliteTeam, createDefensiveTeam } from "./example/exampleTeams";
import { SimpleMatch } from "./core/SimpleMatch";

// Función para mostrar atributos completos de un equipo
function displayTeamAttributes(team: any): void {
    console.log(`\n=== ${team.name} ===`);
    console.log(`Rating General: ${team.getOverallRating().toFixed(1)}`);
    console.log(`Rating Ofensivo: ${team.getOffensiveRating().toFixed(1)}`);
    console.log(`Rating Defensivo: ${team.getDefensiveRating().toFixed(1)}`);
    console.log(`Rating Equipos Especiales: ${team.getSpecialTeamsRating().toFixed(1)}`);
    
    // Mostrar fortalezas principales
    const strengths = team.getTeamStrengths();
    if (strengths.length > 0) {
        console.log(`Fortalezas principales:`);
        strengths.slice(0, 3).forEach((strength: any) => {
            console.log(`  - ${strength.attribute}: ${strength.rating.toFixed(1)}`);
        });
    }
    
    // Mostrar debilidades principales
    const weaknesses = team.getTeamWeaknesses();
    if (weaknesses.length > 0) {
        console.log(`Debilidades principales:`);
        weaknesses.slice(0, 3).forEach((weakness: any) => {
            console.log(`  - ${weakness.attribute}: ${weakness.rating.toFixed(1)}`);
        });
    }
}

// Función para simular partido con logs jugada a jugada detallados
function simulateGameWithLogs(match: SimpleMatch): any {
    const gameResult = match.playFullGame();
    
    console.log("\n🏈 JUGADAS DEL PARTIDO:");
    console.log("=".repeat(80));
    
    gameResult.gameLog.forEach((play: any, index: number) => {
        // Mostrar TODAS las jugadas con detalle completo
        console.log(`\nQ${play.quarter} ${play.time} | Marcador: ${play.score.teamX} - ${play.score.teamY}`);
        console.log(`${play.possession} tiene posesión`);
        console.log(`${play.down}° y ${play.yardsToGo}, yarda ${play.ballPosition}`);
        
        // Mostrar contexto del juego
        if (play.gameContext) {
            console.log(`🎯 CONTEXTO: ${play.gameContext}`);
        }
        
        // Mostrar decisiones estratégicas
        if (play.playType === 'kickoff') {
            console.log(`🦶 KICKOFF - El equipo patea para iniciar o después de anotación`);
        } else {
            // Mostrar estrategias usando la información capturada
            if (play.offensiveStrategy) {
                console.log(`📈 OFENSIVA: ${play.offensiveStrategy}`);
            }
            if (play.defensiveStrategy) {
                console.log(`🛡️ DEFENSIVA: ${play.defensiveStrategy}`);
            }
        }
        
        // Resultado de la jugada
        console.log(`📋 RESULTADO: ${play.result}`);
        
        // Mostrar cambio de marcador si hubo puntos (comparar con marcador post-jugada)
        if (play.postPlayScore && (play.postPlayScore.teamX !== play.score.teamX || play.postPlayScore.teamY !== play.score.teamY)) {
            const pointsScored = (play.postPlayScore.teamX - play.score.teamX) + (play.postPlayScore.teamY - play.score.teamY);
            console.log(`🏈 ¡ANOTACIÓN! +${pointsScored} puntos para ${play.possession}`);
            console.log(`📊 MARCADOR ACTUALIZADO: ${play.postPlayScore.teamX} - ${play.postPlayScore.teamY}`);
        }
        
        // Análisis del impacto de la jugada
        if (play.result.includes('TOUCHDOWN')) {
            console.log(`🎉 ¡TOUCHDOWN! Jugada explosiva que cambia el momentum del partido`);
        } else if (play.result.includes('FUMBLE') || play.result.includes('INTERCEPCIÓN')) {
            console.log(`💥 ¡TURNOVER! Cambio dramático de posesión - error costoso`);
        } else if (play.result.includes('Field Goal BUENO')) {
            console.log(`✅ Field Goal exitoso - 3 puntos importantes en el marcador`);
        } else if (play.result.includes('+') && parseInt(play.result.replace('+', '').split(' ')[0]) >= 15) {
            console.log(`⚡ ¡JUGADA EXPLOSIVA! Ganancia significativa que avanza el drive`);
        } else if (play.result.includes('Pase incompleto')) {
            console.log(`❌ Pase incompleto - No hay ganancia, reloj se detiene`);
        }
        
        console.log("-".repeat(60));
    });
    
    return gameResult;
}

// Función principal de simulación
export function runAmericanFootballSimulation(): void {
    console.log("🏈 SIMULADOR DE FÚTBOL AMERICANO");
    console.log("=".repeat(60));
    
    // 1. Crear equipos de ejemplo
    const teamX = createEliteTeam("Águilas");  // Equipo completamente élite
    const teamY = createDefensiveTeam("Lobos", "poor");  // Equipo defensivo pobre
    
    console.log(`\n📋 EQUIPOS CREADOS:`);
    displayTeamAttributes(teamX);
    displayTeamAttributes(teamY);
    
    // 2. Crear y simular partido completo
    console.log("\n🏟️ INICIANDO PARTIDO COMPLETO...");
    console.log("=".repeat(60));
    
    const match = new SimpleMatch(teamX, teamY);
    
    // 3. Simular partido completo con logs jugada a jugada
    console.log(`🏈 INICIANDO PARTIDO: ${teamX.name} vs ${teamY.name}`);
    const gameResult = simulateGameWithLogs(match);
    
    // 4. Mostrar resumen del partido
    displayGameSummary(gameResult, teamX.name, teamY.name);
    
    // 5. Mostrar jugadas destacadas
    displayHighlights(gameResult.gameLog);
    
    // 6. Mostrar resumen por cuartos
    displayQuarterSummaries(gameResult.gameLog);
    
    console.log("\n🎯 Simulación de partido completo finalizada!");
}

// Función para mostrar resumen del partido
function displayGameSummary(gameResult: any, teamXName: string, teamYName: string): void {
    console.log("\n🏆 RESULTADO FINAL");
    console.log("=".repeat(50));
    console.log(`${teamXName}: ${gameResult.finalScore.teamX}`);
    console.log(`${teamYName}: ${gameResult.finalScore.teamY}`);
    
    if (gameResult.winner !== 'EMPATE') {
        console.log(`\n🏆 GANADOR: ${gameResult.winner}`);
    } else {
        console.log(`\n🤝 EMPATE`);
    }
    
    console.log(`\n📊 ESTADÍSTICAS DEL PARTIDO:`);
    console.log(`Total de jugadas: ${gameResult.totalPlays}`);
    console.log(`Total de drives: ${gameResult.totalDrives}`);
    console.log(`Jugadas registradas: ${gameResult.gameLog.length}`);
}

// Función para mostrar jugadas destacadas
function displayHighlights(gameLog: any[]): void {
    console.log("\n🎬 JUGADAS DESTACADAS");
    console.log("=".repeat(50));
    
    // Filtrar jugadas importantes
    const highlights = gameLog.filter(play => 
        play.result.includes('TOUCHDOWN') || 
        play.result.includes('INTERCEPCIÓN') || 
        play.result.includes('FUMBLE') ||
        play.result.includes('Field Goal BUENO') ||
        play.result.includes('EXTRA POINT') ||
        play.result.includes('CONVERSIÓN 2 PUNTOS') ||
        play.result.includes('SAFETY') ||
        (play.result.includes('+') && parseInt(play.result.replace('+', '').split(' ')[0]) >= 20)
    );
    
    if (highlights.length === 0) {
        console.log("No se registraron jugadas destacadas en este partido.");
        return;
    }
    
    highlights.slice(0, 10).forEach((play, index) => {
        console.log(`${index + 1}. Q${play.quarter} ${play.time} - ${play.possession}`);
        console.log(`   ${play.down}° y ${play.yardsToGo}, yarda ${play.ballPosition}`);
        console.log(`   ${play.result}`);
        console.log(`   Marcador: ${play.score.teamX} - ${play.score.teamY}`);
        console.log("");
    });
}

// Función para mostrar resumen por cuartos
function displayQuarterSummaries(gameLog: any[]): void {
    console.log("\n📊 RESUMEN POR CUARTOS");
    console.log("=".repeat(50));
    
    for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterPlays = gameLog.filter(play => play.quarter === quarter);
        const scores = quarterPlays.filter(play => 
            play.result.includes('TOUCHDOWN') || 
            play.result.includes('Field Goal BUENO') ||
            play.result.includes('EXTRA POINT BUENO') ||
            play.result.includes('CONVERSIÓN 2 PUNTOS EXITOSA') ||
            play.result.includes('SAFETY')
        );
        
        console.log(`\nCUARTO ${quarter}:`);
        console.log(`  Jugadas: ${quarterPlays.length}`);
        console.log(`  Anotaciones: ${scores.length}`);
        
        if (scores.length > 0) {
            scores.forEach(score => {
                console.log(`    ${score.time} - ${score.possession}: ${score.result}`);
            });
        }
    }
}