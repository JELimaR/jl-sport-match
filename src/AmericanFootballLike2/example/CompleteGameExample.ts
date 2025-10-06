// Ejemplo completo de simulación de partido usando el nuevo sistema PlayCalculator
// Demuestra cómo simular múltiples jugadas y drives completos

import { SimpleMatch } from '../core/SimpleMatch';
import { createEliteTeam, createOffensiveTeam, showTeamStats } from './exampleTeams';

/**
 * Simulador de partido completo usando PlayCalculator
 */
export class CompleteGameExample {

  /**
   * Simula un partido completo (4 cuartos)
   */
  static simulateCompleteGame(): void {
    console.log('🏈 === SIMULACIÓN DE PARTIDO COMPLETO ===\n');

    const teamX = createEliteTeam("Patriots");
    const teamY = createOffensiveTeam("Chiefs", 'poor');
    showTeamStats(teamX);
    showTeamStats(teamY);

    console.log(`${teamX.name} vs ${teamY.name}`);
    console.log('='.repeat(60));

    const match = new SimpleMatch(teamX, teamY);
    const teamNames = { X: teamX.name, Y: teamY.name };

    try {
      while (match.state.gamePhase !== 'finished') {
        // Generar narrativa del estado del juego
        const gameNarratives = match.narrative.generateGameNarrative({
          quarter: match.state.quarter,
          timeRemaining: match.state.timeRemaining,
          scoreX: match.state.scoreX,
          scoreY: match.state.scoreY,
          possession: match.state.possession,
          down: match.state.down,
          yardsToGo: match.state.yardsToGo,
          ballPosition: match.state.ballPosition
        }, teamNames);

        // Mostrar narrativas del estado del juego
        gameNarratives.forEach(narrative => console.log(narrative));

        // Ejecutar la siguiente jugada
        const result = match.nextPlay();

        // Mostrar narrativa de la jugada si es importante
        if (match.narrative.shouldShowPlay(result)) {
          console.log(`   ${match.narrative.lastPlay()}`);
        }

        // Generar y mostrar narrativa de eventos especiales
        const eventNarratives = match.narrative.generateEventNarrative(result, {
          possession: match.state.possession
        }, teamNames);

        eventNarratives.forEach(narrative => console.log(narrative));
      }
    } catch (error) {
      console.log(`\n⚠️ Simulación terminada por error: ${error}`);
    }

    // Resultado final
    console.log('\n🏆 RESULTADO FINAL:');
    console.log(`${teamX.name} ${match.state.scoreX} - ${teamY.name} ${match.state.scoreY}`);

    if (match.state.scoreX > match.state.scoreY) {
      console.log(`🎉 ¡${teamX.name} gana!`);
    } else if (match.state.scoreY > match.state.scoreX) {
      console.log(`🎉 ¡${teamY.name} gana!`);
    } else {
      console.log(`🤝 ¡Empate!`);
    }
  }
}