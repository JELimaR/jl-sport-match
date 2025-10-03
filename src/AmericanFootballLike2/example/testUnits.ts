import { createEliteTeam } from './exampleTeams';

// Test rápido para verificar que las unidades se crean correctamente
const team = createEliteTeam('Test Team');

console.log('🧪 TESTING UNIT CREATION');
console.log('='.repeat(40));

// Test unidad ofensiva
const offUnit = team.createOffensiveUnit('spread');
const qbs = offUnit.getPlayersByPosition('QB');
const rbs = offUnit.getPlayersByPosition('RB');
const wrs = offUnit.getPlayersByPosition('WR');

console.log(`\n📈 UNIDAD OFENSIVA (${offUnit.formation}):`);
console.log(`   Total jugadores: ${offUnit.players.length}`);
console.log(`   QBs: ${qbs.length} (debería ser 1)`);
console.log(`   RBs: ${rbs.length}`);
console.log(`   WRs: ${wrs.length}`);
console.log(`   Rating: ${offUnit.getSpecificRating().toFixed(1)}`);

if (qbs.length !== 1) {
    console.log('❌ ERROR: Debería haber exactamente 1 QB');
} else {
    console.log('✅ CORRECTO: Exactamente 1 QB en campo');
}

// Test unidad defensiva
const defUnit = team.createDefensiveUnit('4-3');
const des = defUnit.getPlayersByPosition('DE');
const dts = defUnit.getPlayersByPosition('DT');
const lbs = defUnit.getLinebackers();
const dbs = defUnit.getDefensiveBacks();

console.log(`\n🛡️ UNIDAD DEFENSIVA (${defUnit.formation}):`);
console.log(`   Total jugadores: ${defUnit.players.length}`);
console.log(`   DEs: ${des.length}`);
console.log(`   DTs: ${dts.length}`);
console.log(`   LBs: ${lbs.length}`);
console.log(`   DBs: ${dbs.length}`);
console.log(`   Rating: ${defUnit.getSpecificRating().toFixed(1)}`);

if (defUnit.players.length !== 11) {
    console.log('❌ ERROR: Debería haber exactamente 11 jugadores');
} else {
    console.log('✅ CORRECTO: Exactamente 11 jugadores en campo');
}

// Test equipos especiales
const stUnit = team.createSpecialTeamsUnit('field_goal');
const kickers = stUnit.getPlayersByPosition('K');

console.log(`\n⚡ EQUIPOS ESPECIALES (${stUnit.formation}):`);
console.log(`   Total jugadores: ${stUnit.players.length}`);
console.log(`   Kickers: ${kickers.length}`);
console.log(`   Rating: ${stUnit.getSpecificRating().toFixed(1)}`);

console.log('\n🎯 Test completado!');