import { Player, PlayerConfig, PlayerAttributes } from '../core/Player';
import { CoachingStaff, CoachingStaffFactory } from '../teams/coaches/CoachingStaff';
import { TeamMatch, TeamMatchConfig } from '../teams/TeamMatch';
import { Position } from '../Positions/PositionTypes';

export type PlayerQuality = 'elite' | 'good' | 'average' | 'poor';
export type TeamFocus = 'offensive' | 'defensive' | 'balanced';
export type PhysicalCondition = 'excellent' | 'good' | 'average' | 'poor';

interface TeamCreationOptions {
  playerQuality: PlayerQuality;
  qbQuality: PlayerQuality;
  teamFocus: TeamFocus;
  physicalCondition: PhysicalCondition;
  coachQuality: PlayerQuality;
}

// Función para generar atributos completos según calidad
function generatePlayerAttributes(quality: PlayerQuality, position: Position): PlayerAttributes {
  const baseRanges = {
    elite: { min: 85, max: 99 },
    good: { min: 70, max: 84 },
    average: { min: 55, max: 69 },
    poor: { min: 40, max: 54 }
  };

  const range = baseRanges[quality];
  const variation = 5;

  // Generar valores base
  const generateValue = () => {
    const base = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const adjust = Math.floor(Math.random() * variation * 2) - variation;
    return Math.max(1, Math.min(99, base + adjust));
  };

  // Atributos físicos básicos
  const height = position === 'QB' || position === 'WR' || position === 'TE' ? 180 + Math.random() * 20 : 175 + Math.random() * 25;
  const weight = position === 'G' || position === 'T' || position === 'DT' ? 120 + Math.random() * 40 : 80 + Math.random() * 40;

  return {
    height,
    weight,
    strength: generateValue(),
    speed: generateValue(),
    agility: generateValue(),
    stamina: generateValue(),
    catching: generateValue(),
    throwing: generateValue(),
    blocking: generateValue(),
    tackling: generateValue(),
    coverage: generateValue(),
    awareness: generateValue(),
    intelligence: generateValue(),
    leadership: generateValue(),
    composure: generateValue(),
    kickAccuracy: generateValue(),
    kickPower: generateValue()
  };
}

// Función para ajustar atributos según condición física
function adjustForPhysicalCondition(
  attributes: PlayerAttributes,
  condition: PhysicalCondition
): PlayerAttributes {
  const adjustments = {
    excellent: { physical: 10, mental: 5, technical: 0 },
    good: { physical: 5, mental: 2, technical: 0 },
    average: { physical: 0, mental: 0, technical: 0 },
    poor: { physical: -10, mental: -5, technical: -2 }
  };

  const adj = adjustments[condition];

  return {
    ...attributes,
    strength: Math.max(1, Math.min(100, attributes.strength + adj.physical)),
    speed: Math.max(1, Math.min(100, attributes.speed + adj.physical)),
    agility: Math.max(1, Math.min(100, attributes.agility + adj.physical)),
    stamina: Math.max(1, Math.min(100, attributes.stamina + adj.physical)),
    awareness: Math.max(1, Math.min(100, attributes.awareness + adj.mental)),
    intelligence: Math.max(1, Math.min(100, attributes.intelligence + adj.mental)),
    composure: Math.max(1, Math.min(100, attributes.composure + adj.mental)),
    throwing: Math.max(1, Math.min(100, attributes.throwing + adj.technical)),
    catching: Math.max(1, Math.min(100, attributes.catching + adj.technical))
  };
}

// Crear jugador con posición específica
function createPlayerWithPosition(
  name: string,
  position: Position,
  quality: PlayerQuality,
  physicalCondition: PhysicalCondition,
  teamFocus: TeamFocus
): Player {
  let attributes = generatePlayerAttributes(quality, position);

  // Ajustar según enfoque del equipo
  const isOffensive = ['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'T'].includes(position);
  const isDefensive = ['DE', 'DT', 'NT', 'OLB', 'ILB', 'CB', 'SS', 'FS'].includes(position);

  if (teamFocus === 'offensive' && isOffensive) {
    attributes.throwing = Math.min(100, attributes.throwing + 5);
    attributes.catching = Math.min(100, attributes.catching + 5);
  } else if (teamFocus === 'defensive' && isDefensive) {
    attributes.strength = Math.min(100, attributes.strength + 5);
    attributes.tackling = Math.min(100, attributes.tackling + 5);
  }

  attributes = adjustForPhysicalCondition(attributes, physicalCondition);

  const playerConfig: PlayerConfig = {
    id: `${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    position,
    attributes,
    age: 22 + Math.floor(Math.random() * 8) // 22-30 años
  };

  return new Player(playerConfig);
}

// Crear lista de jugadores para un equipo
export function createTeamPlayers(options: TeamCreationOptions): Player[] {
  const players: Player[] = [];

  // Quarterbacks (2)
  players.push(
    createPlayerWithPosition('QB1', 'QB', options.qbQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('QB2', 'QB',
      options.qbQuality === 'elite' ? 'good' :
        options.qbQuality === 'good' ? 'average' : 'poor',
      options.physicalCondition, options.teamFocus)
  );

  // Running Backs (3)
  for (let i = 1; i <= 3; i++) {
    players.push(
      createPlayerWithPosition(`RB${i}`, 'RB',
        i === 1 ? options.playerQuality :
          options.playerQuality === 'elite' ? 'good' :
            options.playerQuality === 'good' ? 'average' : 'poor',
        options.physicalCondition, options.teamFocus)
    );
  }

  // Wide Receivers (5)
  for (let i = 1; i <= 5; i++) {
    players.push(
      createPlayerWithPosition(`WR${i}`, 'WR',
        i <= 2 ? options.playerQuality :
          options.playerQuality === 'elite' ? 'good' :
            options.playerQuality === 'good' ? 'average' : 'poor',
        options.physicalCondition, options.teamFocus)
    );
  }

  // Tight End (2)
  for (let i = 1; i <= 2; i++) {
    players.push(
      createPlayerWithPosition(`TE${i}`, 'TE', options.playerQuality, options.physicalCondition, options.teamFocus)
    );
  }

  // Offensive Line (5) - Center, Guards, Tackles
  players.push(
    createPlayerWithPosition('C1', 'C', options.playerQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('LG1', 'G', options.playerQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('RG1', 'G', options.playerQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('LT1', 'T', options.playerQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('RT1', 'T', options.playerQuality, options.physicalCondition, options.teamFocus)
  );

  // Defensive Line (4)
  for (let i = 1; i <= 2; i++) {
    players.push(
      createPlayerWithPosition(`DE${i}`, 'DE', options.playerQuality, options.physicalCondition, options.teamFocus)
    );
  }
  for (let i = 1; i <= 2; i++) {
    players.push(
      createPlayerWithPosition(`DT${i}`, 'DT', options.playerQuality, options.physicalCondition, options.teamFocus)
    );
  }

  // Linebackers (4)
  for (let i = 1; i <= 2; i++) {
    players.push(
      createPlayerWithPosition(`OLB${i}`, 'OLB', options.playerQuality, options.physicalCondition, options.teamFocus)
    );
  }
  for (let i = 1; i <= 2; i++) {
    players.push(
      createPlayerWithPosition(`ILB${i}`, 'ILB', options.playerQuality, options.physicalCondition, options.teamFocus)
    );
  }

  // Defensive Backs (5)
  for (let i = 1; i <= 3; i++) {
    players.push(
      createPlayerWithPosition(`CB${i}`, 'CB', options.playerQuality, options.physicalCondition, options.teamFocus)
    );
  }
  players.push(
    createPlayerWithPosition('SS1', 'SS', options.playerQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('FS1', 'FS', options.playerQuality, options.physicalCondition, options.teamFocus)
  );

  // Kickers y Especialistas (3)
  players.push(
    createPlayerWithPosition('K1', 'K', options.playerQuality, options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('P1', 'P',
      options.playerQuality === 'elite' ? 'good' :
        options.playerQuality === 'good' ? 'average' : 'poor',
      options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('LS1', 'LS', 'average', options.physicalCondition, options.teamFocus)
  );

  // JUGADORES ADICIONALES PARA ROSTER COMPLETO (40+ jugadores)

  // Más Offensive Line (3 adicionales)
  for (let i = 2; i <= 3; i++) {
    players.push(
      createPlayerWithPosition(`C${i}`, 'C', 'average', options.physicalCondition, options.teamFocus),
      createPlayerWithPosition(`G${i + 1}`, 'G', 'average', options.physicalCondition, options.teamFocus)
    );
  }
  players.push(
    createPlayerWithPosition('T3', 'T', 'average', options.physicalCondition, options.teamFocus)
  );

  // Más Running Backs (2 adicionales)
  for (let i = 4; i <= 5; i++) {
    players.push(
      createPlayerWithPosition(`RB${i}`, 'RB', 'average', options.physicalCondition, options.teamFocus)
    );
  }

  // Más Wide Receivers (3 adicionales)
  for (let i = 6; i <= 8; i++) {
    players.push(
      createPlayerWithPosition(`WR${i}`, 'WR', 'average', options.physicalCondition, options.teamFocus)
    );
  }

  // Más Tight Ends (2 adicionales)
  for (let i = 3; i <= 4; i++) {
    players.push(
      createPlayerWithPosition(`TE${i}`, 'TE', 'average', options.physicalCondition, options.teamFocus)
    );
  }

  // Más Defensive Line (4 adicionales)
  for (let i = 3; i <= 4; i++) {
    players.push(
      createPlayerWithPosition(`DE${i}`, 'DE', 'average', options.physicalCondition, options.teamFocus),
      createPlayerWithPosition(`DT${i}`, 'DT', 'average', options.physicalCondition, options.teamFocus)
    );
  }

  // Nose Tackle
  players.push(
    createPlayerWithPosition('NT1', 'NT', options.playerQuality, options.physicalCondition, options.teamFocus)
  );

  // Más Linebackers (4 adicionales)
  for (let i = 3; i <= 4; i++) {
    players.push(
      createPlayerWithPosition(`OLB${i}`, 'OLB', 'average', options.physicalCondition, options.teamFocus),
      createPlayerWithPosition(`ILB${i}`, 'ILB', 'average', options.physicalCondition, options.teamFocus)
    );
  }

  // Más Defensive Backs (5 adicionales)
  for (let i = 4; i <= 6; i++) {
    players.push(
      createPlayerWithPosition(`CB${i}`, 'CB', 'average', options.physicalCondition, options.teamFocus)
    );
  }
  for (let i = 2; i <= 3; i++) {
    players.push(
      createPlayerWithPosition(`SS${i}`, 'SS', 'average', options.physicalCondition, options.teamFocus),
      createPlayerWithPosition(`FS${i}`, 'FS', 'average', options.physicalCondition, options.teamFocus)
    );
  }

  // Jugadores de práctica y reservas (5 adicionales)
  players.push(
    createPlayerWithPosition('QB3', 'QB', 'poor', options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('RB6', 'RB', 'poor', options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('WR9', 'WR', 'poor', options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('LB5', 'ILB', 'poor', options.physicalCondition, options.teamFocus),
    createPlayerWithPosition('DB7', 'CB', 'poor', options.physicalCondition, options.teamFocus)
  );

  console.log(`✅ Equipo creado con ${players.length} jugadores`);
  return players;
}

// Crear staff técnico
export function createCoachingStaff(
  coachQuality: PlayerQuality,
  teamFocus: TeamFocus
): CoachingStaff {
  const experienceLevel = coachQuality === 'elite' ? 'elite' :
    coachQuality === 'good' ? 'veteran' : 'rookie';

  if (teamFocus === 'balanced') {
    return CoachingStaffFactory.createRandomStaff('team', experienceLevel);
  } else {
    const philosophy = teamFocus === 'offensive' ? 'innovative' :
      teamFocus === 'defensive' ? 'aggressive' : 'balanced';
    return CoachingStaffFactory.createStaffWithPhilosophy('team', philosophy);
  }
}

// Crear equipo completo
export function createCompleteTeam(
  teamName: string,
  options: TeamCreationOptions
): TeamMatch {
  // Crear jugadores
  const players = createTeamPlayers(options);

  // Crear staff técnico
  const coachingStaff = createCoachingStaff(options.coachQuality, options.teamFocus);

  // Crear configuración del equipo
  const teamConfig: TeamMatchConfig = {
    name: teamName,
    players,
    coachingStaff
  };

  return new TeamMatch(teamConfig);
}

// Funciones de conveniencia para crear equipos predefinidos
export function createEliteTeam(teamName: string): TeamMatch {
  return createCompleteTeam(teamName, {
    playerQuality: 'elite',
    qbQuality: 'elite',
    teamFocus: 'balanced',
    physicalCondition: 'excellent',
    coachQuality: 'elite'
  });
}

export function createPoorTeam(teamName: string): TeamMatch {
  return createCompleteTeam(teamName, {
    playerQuality: 'poor',
    qbQuality: 'poor',
    teamFocus: 'balanced',
    physicalCondition: 'poor',
    coachQuality: 'poor'
  });
}

export function createOffensiveTeam(teamName: string, quality: PlayerQuality = 'good'): TeamMatch {
  return createCompleteTeam(teamName, {
    playerQuality: quality,
    qbQuality: 'elite',
    teamFocus: 'offensive',
    physicalCondition: 'good',
    coachQuality: quality
  });
}

export function createDefensiveTeam(teamName: string, quality: PlayerQuality = 'good'): TeamMatch {
  return createCompleteTeam(teamName, {
    playerQuality: quality,
    qbQuality: 'average',
    teamFocus: 'defensive',
    physicalCondition: 'excellent',
    coachQuality: quality
  });
}

// Función para crear equipos con diferentes condiciones físicas
export function createTeamWithCondition(
  teamName: string,
  condition: PhysicalCondition,
  quality: PlayerQuality = 'average'
): TeamMatch {
  return createCompleteTeam(teamName, {
    playerQuality: quality,
    qbQuality: quality,
    teamFocus: 'balanced',
    physicalCondition: condition,
    coachQuality: quality
  });
}

// Funcion para mostrar estadisticas completas de un equipo
export function showTeamStats(team: TeamMatch): void {
  console.log(`\n=== ${team.name} - ANÁLISIS COMPLETO ===`);

  const players = team.players;

  // Información básica del roster
  const qbs = players.filter(p => p.position === 'QB');
  const rbs = players.filter(p => p.position === 'RB');
  const wrs = players.filter(p => p.position === 'WR');
  const tes = players.filter(p => p.position === 'TE');
  const centers = players.filter(p => p.position === 'C');
  const guards = players.filter(p => p.position === 'G');
  const tackles = players.filter(p => p.position === 'T');
  const des = players.filter(p => p.position === 'DE');
  const dts = players.filter(p => p.position === 'DT');
  const olbs = players.filter(p => p.position === 'OLB');
  const ilbs = players.filter(p => p.position === 'ILB');
  const cbs = players.filter(p => p.position === 'CB');
  const safeties = players.filter(p => ['SS', 'FS'].includes(p.position));
  const kickers = players.filter(p => p.position === 'K');
  const punters = players.filter(p => p.position === 'P');

  console.log(`📊 ROSTER: ${players.length} jugadores totales`);
  console.log(`   Ofensiva: QB(${qbs.length}) RB(${rbs.length}) WR(${wrs.length}) TE(${tes.length}) OL(${centers.length + guards.length + tackles.length})`);
  console.log(`   Defensiva: DL(${des.length + dts.length}) LB(${olbs.length + ilbs.length}) DB(${cbs.length + safeties.length})`);
  console.log(`   Especiales: K(${kickers.length}) P(${punters.length})`);

  // Obtener atributos completos del equipo
  const completeAttributes = team.getCompleteTeamAttributes();

  console.log(`\n🏈 RATINGS GENERALES:`);
  console.log(`   Overall: ${team.getOverallRating().toFixed(1)}`);
  console.log(`   Ofensivo: ${team.getOffensiveRating().toFixed(1)}`);
  console.log(`   Defensivo: ${team.getDefensiveRating().toFixed(1)}`);
  console.log(`   Equipos Especiales: ${team.getSpecialTeamsRating().toFixed(1)}`);

  // Mostrar atributos ofensivos detallados
  console.log(`\n📈 ATRIBUTOS OFENSIVOS DETALLADOS:`);
  const offensiveAttrs = completeAttributes.offensive;
  console.log(`   Pase:`);
  console.log(`     • Precisión de Pase: ${offensiveAttrs.passingAccuracy.toFixed(1)}`);
  console.log(`     • Separación de Receptores: ${offensiveAttrs.receiverSeparation.toFixed(1)}`);
  console.log(`     • Protección de Pase: ${offensiveAttrs.passProtectionAnchor.toFixed(1)}`);

  console.log(`   Carrera:`);
  console.log(`     • Bloqueo de Poder: ${offensiveAttrs.powerRunBlocking.toFixed(1)}`);
  console.log(`     • Agilidad de Zona: ${offensiveAttrs.zoneBlockingAgility.toFixed(1)}`);
  console.log(`     • Habilidad Explosiva: ${offensiveAttrs.breakawayAbility.toFixed(1)}`);

  console.log(`   Situaciones Especiales:`);
  console.log(`     • Eficiencia en Zona Roja: ${offensiveAttrs.redZoneEfficiency.toFixed(1)}`);
  console.log(`     • Conversiones de Tercero: ${offensiveAttrs.thirdDownConversion.toFixed(1)}`);

  // Mostrar atributos defensivos detallados
  console.log(`\n🛡️ ATRIBUTOS DEFENSIVOS DETALLADOS:`);
  const defensiveAttrs = completeAttributes.defensive;
  console.log(`   Contra Carrera:`);
  console.log(`     • Disciplina vs Carrera: ${defensiveAttrs.runFitDiscipline.toFixed(1)}`);
  console.log(`     • Tackles por Pérdida: ${defensiveAttrs.tacklesForLoss.toFixed(1)}`);

  console.log(`   Contra Pase:`);
  console.log(`     • Cobertura Man: ${defensiveAttrs.pressManCoverage.toFixed(1)}`);
  console.log(`     • Coordinación de Zona: ${defensiveAttrs.zoneCoverageCoordination.toFixed(1)}`);
  console.log(`     • Presión con 4: ${defensiveAttrs.fourManRushPressure.toFixed(1)}`);

  console.log(`   Situaciones Especiales:`);
  console.log(`     • Defensa de Zona Roja: ${defensiveAttrs.redZoneDefense.toFixed(1)}`);
  console.log(`     • Generación de Turnovers: ${defensiveAttrs.turnoverGeneration.toFixed(1)}`);

  // Mostrar atributos de equipos especiales detallados
  console.log(`\n⚡ EQUIPOS ESPECIALES DETALLADOS:`);
  const specialAttrs = completeAttributes.specialTeams;
  console.log(`   Pateo:`);
  console.log(`     • Rango de Pateador: ${specialAttrs.kickerRange.toFixed(1)}`);
  console.log(`     • Compostura de Pateador: ${specialAttrs.kickerComposure.toFixed(1)}`);
  console.log(`     • Colocación de Despeje: ${specialAttrs.punterPlacement.toFixed(1)}`);
  console.log(`     • Tiempo de Vuelo: ${specialAttrs.punterHangTime.toFixed(1)}`);

  console.log(`   Cobertura y Retornos:`);
  console.log(`     • Velocidad de Cobertura: ${specialAttrs.coverageSpeed.toFixed(1)}`);
  console.log(`     • Explosividad de Retorno: ${specialAttrs.returnExplosiveness.toFixed(1)}`);
  console.log(`     • Seguridad del Balón: ${specialAttrs.ballSecurity.toFixed(1)}`);

  // Mostrar fortalezas y debilidades específicas
  console.log(`\n💪 TOP 5 FORTALEZAS:`);
  const strengths = team.getTeamStrengths();
  strengths.slice(0, 5).forEach((strength: any, index: number) => {
    console.log(`   ${index + 1}. ${strength.attribute}: ${strength.rating.toFixed(1)} (${strength.evaluation.qualitativeRating})`);
  });

  console.log(`\n⚠️ TOP 5 DEBILIDADES:`);
  const weaknesses = team.getTeamWeaknesses();
  weaknesses.slice(0, 5).forEach((weakness: any, index: number) => {
    console.log(`   ${index + 1}. ${weakness.attribute}: ${weakness.rating.toFixed(1)} (${weakness.evaluation.qualitativeRating})`);
  });

  // Mostrar análisis de trabajo en equipo si está disponible
  const detailedAnalysis = team.getDetailedTeamAnalysis();
  if (detailedAnalysis && detailedAnalysis.teamworkAnalysis) {
    console.log(`\n🤝 ANÁLISIS DE TRABAJO EN EQUIPO:`);
    const teamwork = detailedAnalysis.teamworkAnalysis;
    console.log(`   Multiplicador de Sinergia: ${teamwork.synergyMultiplier.toFixed(2)}`);

    if (teamwork.fiveCs) {
      console.log(`   Las 5 C's del Trabajo en Equipo:`);
      console.log(`     • Comunicación: ${teamwork.fiveCs.communication.toFixed(1)}`);
      console.log(`     • Coordinación: ${teamwork.fiveCs.coordination.toFixed(1)}`);
      console.log(`     • Cooperación: ${teamwork.fiveCs.cooperation.toFixed(1)}`);
      console.log(`     • Confianza: ${teamwork.fiveCs.confidence.toFixed(1)}`);
      console.log(`     • Compromiso: ${teamwork.fiveCs.commitment.toFixed(1)}`);
    }

    if (teamwork.cohesionFactors) {
      console.log(`   Factores de Cohesión:`);
      console.log(`     • Tiempo Juntos: ${teamwork.cohesionFactors.timeTogetherBonus.toFixed(1)}`);
      console.log(`     • Adversidades Superadas: ${teamwork.cohesionFactors.adversityOvercome.toFixed(1)}`);
      console.log(`     • Éxitos Compartidos: ${teamwork.cohesionFactors.successesShared.toFixed(1)}`);
      console.log(`     • Cultura del Vestuario: ${teamwork.cohesionFactors.locker_room_culture.toFixed(1)}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
}

// Función para comparar dos equipos
export function compareTeams(team1: TeamMatch, team2: TeamMatch): void {
  console.log(`\n=== COMPARACIÓN: ${team1.name} vs ${team2.name} ===`);

  const comparison = team1.compareWith(team2);

  console.log(`\nRatings Generales:`);
  console.log(`${team1.name}: ${team1.getOverallRating().toFixed(1)}`);
  console.log(`${team2.name}: ${team2.getOverallRating().toFixed(1)}`);
  console.log(`Diferencia: ${comparison.overallDifference.toFixed(1)}`);

  console.log(`\nRatings Ofensivos:`);
  console.log(`${team1.name}: ${team1.getOffensiveRating().toFixed(1)}`);
  console.log(`${team2.name}: ${team2.getOffensiveRating().toFixed(1)}`);
  console.log(`Diferencia: ${(team1.getOffensiveRating() - team2.getOffensiveRating()).toFixed(1)}`);

  console.log(`\nRatings Defensivos:`);
  console.log(`${team1.name}: ${team1.getDefensiveRating().toFixed(1)}`);
  console.log(`${team2.name}: ${team2.getDefensiveRating().toFixed(1)}`);
  console.log(`Diferencia: ${(team1.getDefensiveRating() - team2.getDefensiveRating()).toFixed(1)}`);

  console.log(`\nVentajas de ${team1.name}:`);
  comparison.advantages.forEach((adv: string) => {
    console.log(`- ${adv}`);
  });

  console.log(`\nDesventajas de ${team1.name}:`);
  comparison.disadvantages.forEach((disadv: string) => {
    console.log(`- ${disadv}`);
  });
}

// Función para demostrar el sistema de TeamCamp
export function demonstrateTeamCamp(team: TeamMatch): void {
  console.log(`\n🏈 DEMOSTRACIÓN DE UNIDADES EN CAMPO - ${team.name}`);
  console.log("=".repeat(60));

  // Crear unidad ofensiva
  console.log("\n📈 UNIDAD OFENSIVA:");
  const offensiveUnit = team.createOffensiveUnit('spread');
  console.log(`   ${offensiveUnit.getUnitSummary()}`);

  const offAnalysis = offensiveUnit.getDetailedAnalysis();
  console.log(`   Rating Específico: ${offAnalysis.specificRating.toFixed(1)}`);
  console.log(`   Posiciones: ${offAnalysis.positionBreakdown.map(p => `${p.position}(${p.count})`).join(', ')}`);

  if (offAnalysis.strengths.length > 0) {
    console.log(`   Fortalezas: ${offAnalysis.strengths.join(', ')}`);
  }
  if (offAnalysis.weaknesses.length > 0) {
    console.log(`   Debilidades: ${offAnalysis.weaknesses.join(', ')}`);
  }

  // Crear unidad defensiva
  console.log("\n🛡️ UNIDAD DEFENSIVA:");
  const defensiveUnit = team.createDefensiveUnit('4-3');
  console.log(`   ${defensiveUnit.getUnitSummary()}`);

  const defAnalysis = defensiveUnit.getDetailedAnalysis();
  console.log(`   Rating Específico: ${defAnalysis.specificRating.toFixed(1)}`);
  console.log(`   Posiciones: ${defAnalysis.positionBreakdown.map(p => `${p.position}(${p.count})`).join(', ')}`);

  if (defAnalysis.strengths.length > 0) {
    console.log(`   Fortalezas: ${defAnalysis.strengths.join(', ')}`);
  }
  if (defAnalysis.weaknesses.length > 0) {
    console.log(`   Debilidades: ${defAnalysis.weaknesses.join(', ')}`);
  }

  // Crear unidad de equipos especiales
  console.log("\n⚡ EQUIPOS ESPECIALES:");
  const specialUnit = team.createSpecialTeamsUnit('field_goal');
  console.log(`   ${specialUnit.getUnitSummary()}`);

  const stAnalysis = specialUnit.getDetailedAnalysis();
  console.log(`   Rating Específico: ${stAnalysis.specificRating.toFixed(1)}`);
  console.log(`   Posiciones: ${stAnalysis.positionBreakdown.map(p => `${p.position}(${p.count})`).join(', ')}`);

  // Demostrar selección automática por situación
  console.log("\n🎯 SELECCIÓN AUTOMÁTICA POR SITUACIÓN:");

  // Situación 1: 3ro y largo
  const thirdAndLong = team.selectPlayersForField('offensive', {
    down: 3,
    yardsToGo: 12,
    fieldPosition: 35
  });
  console.log(`   3ro y 12: ${thirdAndLong.formation} (${thirdAndLong.getReceivers().length} receivers)`);

  // Situación 2: 4to y corto
  const fourthAndShort = team.selectPlayersForField('offensive', {
    down: 4,
    yardsToGo: 1,
    fieldPosition: 45
  });
  console.log(`   4to y 1: ${fourthAndShort.formation} (formación de poder)`);

  // Situación 3: Defensa contra pase
  const passDefense = team.selectPlayersForField('defensive', {
    down: 2,
    yardsToGo: 15,
    fieldPosition: 25
  });
  console.log(`   Defensa vs pase: ${passDefense.formation} (${passDefense.getDefensiveBacks().length} DBs)`);

  console.log("\n💡 El staff técnico selecciona automáticamente la mejor formación según la situación!");
}

// Función para simular una jugada completa con ambas unidades
export function simulatePlayWithUnits(
  offensiveTeam: TeamMatch,
  defensiveTeam: TeamMatch,
  situation: {
    down: number;
    yardsToGo: number;
    fieldPosition: number;
  }
): void {
  console.log(`\n🎬 SIMULACIÓN DE JUGADA`);
  console.log("=".repeat(40));
  console.log(`Situación: ${situation.down}° y ${situation.yardsToGo}, yarda ${situation.fieldPosition}`);

  // Crear unidades
  const offense = offensiveTeam.selectPlayersForField('offensive', situation);
  const defense = defensiveTeam.selectPlayersForField('defensive', situation);

  console.log(`\n${offensiveTeam.name} Ofensiva:`);
  console.log(`   Formación: ${offense.formation}`);
  console.log(`   Rating: ${offense.getSpecificRating().toFixed(1)}`);
  console.log(`   QB: ${offense.getQuarterback()?.name || 'N/A'}`);
  console.log(`   Receivers: ${offense.getReceivers().length}`);

  console.log(`\n${defensiveTeam.name} Defensiva:`);
  console.log(`   Formación: ${defense.formation}`);
  console.log(`   Rating: ${defense.getSpecificRating().toFixed(1)}`);
  console.log(`   Línea Defensiva: ${defense.getDefensiveLine().length}`);
  console.log(`   Defensive Backs: ${defense.getDefensiveBacks().length}`);

  // Calcular ventaja
  const offensiveAdvantage = offense.getSpecificRating() - defense.getSpecificRating();
  console.log(`\nVentaja Ofensiva: ${offensiveAdvantage >= 0 ? '+' : ''}${offensiveAdvantage.toFixed(1)}`);

  if (offensiveAdvantage > 5) {
    console.log("🟢 Ventaja clara para la ofensiva");
  } else if (offensiveAdvantage < -5) {
    console.log("🔴 Ventaja clara para la defensiva");
  } else {
    console.log("🟡 Matchup equilibrado");
  }
}