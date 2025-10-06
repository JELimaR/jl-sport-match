// Test para verificar que los atributos de los equipos impacten correctamente en los resultados

import { SimpleMatch } from '../core/SimpleMatch';
import { createCompleteTeam } from './exampleTeams';

/**
 * Prueba el impacto de los atributos en los resultados del juego
 */
export function testAttributeImpact() {
  console.log('=== TEST DE IMPACTO DE ATRIBUTOS ===\n');

  // Crear equipo elite vs equipo pobre para ver diferencias claras
  const eliteTeam = createCompleteTeam('Elite Team', {
    playerQuality: 'elite',
    qbQuality: 'elite',
    teamFocus: 'balanced',
    physicalCondition: 'excellent',
    coachQuality: 'elite'
  });

  const poorTeam = createCompleteTeam('Poor Team', {
    playerQuality: 'poor',
    qbQuality: 'poor',
    teamFocus: 'balanced',
    physicalCondition: 'poor',
    coachQuality: 'poor'
  });

  console.log('=== COMPARACIÓN DE ATRIBUTOS ===');

  // Mostrar atributos ofensivos
  const eliteOffAttrs = eliteTeam.createOffensiveUnit().getOffensiveAttributes();
  const poorOffAttrs = poorTeam.createOffensiveUnit().getOffensiveAttributes();

  console.log('\n📈 ATRIBUTOS OFENSIVOS:');
  console.log(`Elite Team - Passing Accuracy: ${eliteOffAttrs.passingAccuracy.toFixed(1)}`);
  console.log(`Poor Team - Passing Accuracy: ${poorOffAttrs.passingAccuracy.toFixed(1)}`);
  console.log(`Elite Team - Power Run Blocking: ${eliteOffAttrs.powerRunBlocking.toFixed(1)}`);
  console.log(`Poor Team - Power Run Blocking: ${poorOffAttrs.powerRunBlocking.toFixed(1)}`);

  // Mostrar atributos defensivos
  const eliteDefAttrs = eliteTeam.createDefensiveUnit().getDefensiveAttributes();
  const poorDefAttrs = poorTeam.createDefensiveUnit().getDefensiveAttributes();

  console.log('\n🛡️ ATRIBUTOS DEFENSIVOS:');
  console.log(`Elite Team - Run Fit Discipline: ${eliteDefAttrs.runFitDiscipline.toFixed(1)}`);
  console.log(`Poor Team - Run Fit Discipline: ${poorDefAttrs.runFitDiscipline.toFixed(1)}`);
  console.log(`Elite Team - Press Man Coverage: ${eliteDefAttrs.pressManCoverage.toFixed(1)}`);
  console.log(`Poor Team - Press Man Coverage: ${poorDefAttrs.pressManCoverage.toFixed(1)}`);

  // Simular múltiples partidos para ver tendencias
  console.log('\n=== SIMULACIÓN DE MÚLTIPLES PARTIDOS ===');

  let eliteWins = 0;
  let poorWins = 0;
  let totalElitePoints = 0;
  let totalPoorPoints = 0;
  const numGames = 100;

  for (let i = 0; i < numGames; i++) {
    console.log(`\n--- Partido ${i + 1} ---`);

    // Alternar quién recibe el kickoff inicial
    const match = i % 2 === 0 ?
      new SimpleMatch(eliteTeam, poorTeam) :
      new SimpleMatch(poorTeam, eliteTeam);

    // Simular jugadas hasta que termine el juego o se alcance un límite
    let playCount = 0;
    const maxPlays = 100; // Límite para evitar bucles infinitos

    try {
      while (playCount < maxPlays) {
        const state = match.getCurrentState();

        if (state.gamePhase === 'finished') {
          break;
        }

        match.nextPlay();
        playCount++;
      }

      const finalState = match.getCurrentState();

      // Determinar ganador basándose en la posición de los equipos
      let eliteScore, poorScore;
      if (i % 2 === 0) {
        // Elite es X, Poor es Y
        eliteScore = finalState.scoreX;
        poorScore = finalState.scoreY;
      } else {
        // Poor es X, Elite es Y
        eliteScore = finalState.scoreY;
        poorScore = finalState.scoreX;
      }

      console.log(`Resultado: Elite ${eliteScore} - Poor ${poorScore}`);

      if (eliteScore > poorScore) {
        eliteWins++;
      } else if (poorScore > eliteScore) {
        poorWins++;
      }

      totalElitePoints += eliteScore;
      totalPoorPoints += poorScore;

    } catch (error) {
      console.log(`Error en partido ${i + 1}: ${error}`);
    }
  }

  console.log('\n=== RESULTADOS FINALES ===');
  console.log(`Elite Team: ${eliteWins} victorias`);
  console.log(`Poor Team: ${poorWins} victorias`);
  console.log(`Empates: ${numGames - eliteWins - poorWins}`);
  console.log(`Promedio puntos Elite: ${(totalElitePoints / numGames).toFixed(1)}`);
  console.log(`Promedio puntos Poor: ${(totalPoorPoints / numGames).toFixed(1)}`);

  const winPercentage = (eliteWins / numGames) * 100;
  console.log(`Porcentaje de victorias Elite: ${winPercentage.toFixed(1)}%`);

  // Análisis
  console.log('\n=== ANÁLISIS ===');
  if (winPercentage >= 70) {
    console.log('✅ EXCELENTE: Los atributos tienen un impacto fuerte en los resultados');
  } else if (winPercentage >= 60) {
    console.log('✅ BUENO: Los atributos tienen un impacto moderado en los resultados');
  } else if (winPercentage >= 55) {
    console.log('⚠️ REGULAR: Los atributos tienen un impacto leve en los resultados');
  } else {
    console.log('❌ MALO: Los resultados parecen demasiado aleatorios');
  }

  const avgPointDiff = (totalElitePoints - totalPoorPoints) / numGames;
  console.log(`Diferencia promedio de puntos: ${avgPointDiff.toFixed(1)} (a favor del equipo elite)`);

  if (avgPointDiff >= 10) {
    console.log('✅ La diferencia de puntos refleja bien la diferencia de atributos');
  } else if (avgPointDiff >= 5) {
    console.log('⚠️ La diferencia de puntos es moderada');
  } else {
    console.log('❌ La diferencia de puntos es muy pequeña para la diferencia de atributos');
  }
}