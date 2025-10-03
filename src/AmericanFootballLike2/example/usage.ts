import {
  createCompleteTeam,
  createEliteTeam,
  createPoorTeam,
  createOffensiveTeam,
  createDefensiveTeam,
  createTeamWithCondition,
  showTeamStats,
  compareTeams,
  demonstrateTeamCamp,
  simulatePlayWithUnits,
  PlayerQuality
} from './exampleTeams';

// Ejemplos de uso de las funciones de creación de equipos

console.log('🏈 CREANDO EQUIPOS DE EJEMPLO 🏈\n');

// 1. Crear un equipo elite completo
console.log('1. Creando equipo elite...');
const patriots = createEliteTeam('New England Patriots');
showTeamStats(patriots);

// 2. Crear un equipo pobre
console.log('\n2. Creando equipo pobre...');
const browns = createPoorTeam('Cleveland Browns');
showTeamStats(browns);

// 3. Crear un equipo ofensivo
console.log('\n3. Creando equipo ofensivo...');
const chiefs = createOffensiveTeam('Kansas City Chiefs', 'elite');
showTeamStats(chiefs);

// 4. Crear un equipo defensivo
console.log('\n4. Creando equipo defensivo...');
const steelers = createDefensiveTeam('Pittsburgh Steelers', 'good');
showTeamStats(steelers);

// 5. Crear equipo con mala condición física
console.log('\n5. Creando equipo con mala condición física...');
const injuredTeam = createTeamWithCondition('Injured Team', 'poor', 'good');
showTeamStats(injuredTeam);

// 6. Crear equipo personalizado
console.log('\n6. Creando equipo personalizado...');
const customTeam = createCompleteTeam('Custom Team', {
  playerQuality: 'good',
  qbQuality: 'elite',
  teamFocus: 'offensive',
  physicalCondition: 'excellent',
  coachQuality: 'average'
});
showTeamStats(customTeam);

// 7. Comparar equipos
console.log('\n7. Comparando equipos...');
compareTeams(patriots, browns);
compareTeams(chiefs, steelers);

// 8. Mostrar análisis detallado de un equipo
console.log('\n8. Análisis detallado del equipo elite...');
const detailedAnalysis = patriots.getDetailedTeamAnalysis();
console.log('\nAnálisis detallado:');
console.log(`Rating General: ${detailedAnalysis.overallRating.toFixed(1)}`);
console.log(`Rating Ofensivo: ${detailedAnalysis.offensiveRating.toFixed(1)}`);
console.log(`Rating Defensivo: ${detailedAnalysis.defensiveRating.toFixed(1)}`);
console.log(`Rating Equipos Especiales: ${detailedAnalysis.specialTeamsRating.toFixed(1)}`);

console.log('\nAtributos clave:');
console.log(`Clutch Factor: ${detailedAnalysis.keyAttributes.clutchFactor}`);
console.log(`Disciplina: ${detailedAnalysis.keyAttributes.teamDiscipline}`);
console.log(`Resistencia: ${detailedAnalysis.keyAttributes.resilience}`);
console.log(`Margen de Turnovers: ${detailedAnalysis.keyAttributes.netTurnoverMargin}`);

// 9. Crear varios equipos con diferentes enfoques
console.log('\n9. Creando liga de ejemplo...');
const teams = [
  createEliteTeam('Elite Team'),
  createOffensiveTeam('Offensive Powerhouse', 'elite'),
  createDefensiveTeam('Defensive Wall', 'elite'),
  createTeamWithCondition('Injury Prone', 'poor', 'good'),
  createCompleteTeam('Balanced Squad', {
    playerQuality: 'good',
    qbQuality: 'good',
    teamFocus: 'balanced',
    physicalCondition: 'good',
    coachQuality: 'good'
  })
];

console.log('\nRankings de la liga:');
teams
  .sort((a, b) => b.getOverallRating() - a.getOverallRating())
  .forEach((team, index) => {
    console.log(`${index + 1}. ${team.name}: ${team.getOverallRating().toFixed(1)} ` +
      `(Off: ${team.getOffensiveRating().toFixed(1)}, ` +
      `Def: ${team.getDefensiveRating().toFixed(1)})`);
  });

console.log('\n🏆 ¡Equipos creados exitosamente! 🏆');

// 10. Demostrar el nuevo sistema TeamMatch/TeamCamp
console.log('\n10. Demostrando sistema TeamMatch/TeamCamp...');
demonstrateTeamCamp(patriots);

// 11. Simular jugadas con unidades específicas
console.log('\n11. Simulando jugadas con unidades...');
simulatePlayWithUnits(patriots, browns, {
  down: 3,
  yardsToGo: 7,
  fieldPosition: 35
});

simulatePlayWithUnits(chiefs, steelers, {
  down: 1,
  yardsToGo: 10,
  fieldPosition: 20
});

console.log('\n🏆 ¡Sistema TeamMatch/TeamCamp funcionando perfectamente! 🏆');