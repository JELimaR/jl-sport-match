// Test de debug para verificar que los atributos se están usando correctamente

import { SimpleMatch } from '../core/SimpleMatch';
import { createCompleteTeam } from './exampleTeams';
import { PlayCalculator } from '../core/PlayCalculator';

/**
 * Debug detallado de cómo se usan los atributos
 */
export function debugAttributeUsage() {
    console.log('=== DEBUG DE USO DE ATRIBUTOS ===\n');

    // Crear equipos con diferencias extremas
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

    console.log('=== VERIFICACIÓN DE ATRIBUTOS ===');
    
    // Crear unidades y verificar atributos
    const eliteOffensive = eliteTeam.createOffensiveUnit();
    const eliteDefensive = eliteTeam.createDefensiveUnit();
    const poorOffensive = poorTeam.createOffensiveUnit();
    const poorDefensive = poorTeam.createDefensiveUnit();

    const eliteOffAttrs = eliteOffensive.getOffensiveAttributes();
    const eliteDefAttrs = eliteDefensive.getDefensiveAttributes();
    const poorOffAttrs = poorOffensive.getOffensiveAttributes();
    const poorDefAttrs = poorDefensive.getDefensiveAttributes();

    console.log('\n📊 ATRIBUTOS OFENSIVOS:');
    console.log(`Elite - Passing Accuracy: ${eliteOffAttrs.passingAccuracy}`);
    console.log(`Poor - Passing Accuracy: ${poorOffAttrs.passingAccuracy}`);
    console.log(`Elite - Power Run Blocking: ${eliteOffAttrs.powerRunBlocking}`);
    console.log(`Poor - Power Run Blocking: ${poorOffAttrs.powerRunBlocking}`);
    console.log(`Elite - Zone Blocking Agility: ${eliteOffAttrs.zoneBlockingAgility}`);
    console.log(`Poor - Zone Blocking Agility: ${poorOffAttrs.zoneBlockingAgility}`);

    console.log('\n🛡️ ATRIBUTOS DEFENSIVOS:');
    console.log(`Elite - Run Fit Discipline: ${eliteDefAttrs.runFitDiscipline}`);
    console.log(`Poor - Run Fit Discipline: ${poorDefAttrs.runFitDiscipline}`);
    console.log(`Elite - Press Man Coverage: ${eliteDefAttrs.pressManCoverage}`);
    console.log(`Poor - Press Man Coverage: ${poorDefAttrs.pressManCoverage}`);

    // Verificar si hay diferencias significativas
    const passingDiff = eliteOffAttrs.passingAccuracy - poorOffAttrs.passingAccuracy;
    const runBlockingDiff = eliteOffAttrs.powerRunBlocking - poorOffAttrs.powerRunBlocking;
    const runDefenseDiff = eliteDefAttrs.runFitDiscipline - poorDefAttrs.runFitDiscipline;

    console.log('\n📈 DIFERENCIAS:');
    console.log(`Passing Accuracy: ${passingDiff.toFixed(1)} puntos`);
    console.log(`Power Run Blocking: ${runBlockingDiff.toFixed(1)} puntos`);
    console.log(`Run Fit Discipline: ${runDefenseDiff.toFixed(1)} puntos`);

    if (Math.abs(passingDiff) < 10 || Math.abs(runBlockingDiff) < 10 || Math.abs(runDefenseDiff) < 10) {
        console.log('⚠️ PROBLEMA: Las diferencias de atributos son muy pequeñas!');
        console.log('Esto explicaría por qué los resultados son aleatorios.');
    } else {
        console.log('✅ Las diferencias de atributos son significativas.');
    }

    // Simular una jugada específica para ver el cálculo paso a paso
    console.log('\n=== SIMULACIÓN DE JUGADA PASO A PASO ===');
    
    const match = new SimpleMatch(eliteTeam, poorTeam);
    
    // Crear una jugada de carrera manualmente para debug
    const runAction = {
        actionType: 'running' as const,
        playType: 'power' as const,
        expectedYards: 4,
        ballCarrier: 'RB1',
        direction: 'center' as const,
        tempo: 'normal' as const,
        gap: 'A' as const,
        purpose: 'short_yardage' as const,
        riskLevel: 'low' as const,
        teamStrength: 85
    };

    const offensiveActions = {
        primaryAction: runAction,
        formation: 'shotgun',
        personnel: '11'
    };

    const defensiveActions = {
        formationAction: {
            formation: '4-3' as const,
            personnel: {
                defensiveLinemen: [],
                linebackers: [],
                cornerbacks: [],
                safeties: []
            },
            strengths: ['run_defense' as const],
            weaknesses: []
        },
        adjustments: []
    };

    // Crear contexto simplificado
    const gameState = {
        globalContext: {
            currentQuarter: 1,
            timeRemainingInQuarter: 900,
            scoreTeamX: 0,
            scoreTeamY: 0,
            possessionTeam: eliteTeam,
            externalConditions: {
                weather: 'clear' as const,
                temperature: 72,
                windSpeed: 5,
                windDirection: 'north' as const,
                stadiumNoise: 50,
                fieldCondition: 'good' as const
            }
        },
        playContext: {
            down: 1,
            yardsToGo: 10,
            fieldPosition: {
                yardLine: 50,
                hashMark: 'center' as const,
                redZone: false,
                goalLine: false
            }
        },
        momentum: 'neutral' as const,
        pressure: 'low' as const
    } as any;

    const context = {
        gameState,
        offensiveActions,
        defensiveActions,
        offensiveTeam: eliteOffensive,
        defensiveTeam: poorDefensive
    };

    console.log('\n🔍 ANÁLISIS DEL MATCHUP:');
    console.log(`Elite Power Run Blocking: ${eliteOffAttrs.powerRunBlocking}`);
    console.log(`Poor Run Fit Discipline: ${poorDefAttrs.runFitDiscipline}`);
    console.log(`Ventaja esperada: ${eliteOffAttrs.powerRunBlocking - poorDefAttrs.runFitDiscipline}`);

    // Ejecutar el cálculo
    try {
        const calculation = PlayCalculator.calculatePlay(context);
        
        console.log('\n📊 RESULTADO DEL CÁLCULO:');
        console.log(`Offensive Rating: ${calculation.matchupAnalysis.offensiveRating}`);
        console.log(`Defensive Rating: ${calculation.matchupAnalysis.defensiveRating}`);
        console.log(`Matchup Advantage: ${calculation.matchupAnalysis.matchupAdvantage}`);
        console.log(`Offensive Execution: ${calculation.execution.offensiveExecution}`);
        console.log(`Defensive Execution: ${calculation.execution.defensiveExecution}`);
        console.log(`Random Factor: ${calculation.execution.randomFactor}`);
        console.log(`Resultado: ${calculation.result.type}`);
        
        if ('yardsGained' in calculation.result) {
            console.log(`Yardas ganadas: ${calculation.result.yardsGained}`);
        }

        console.log(`Narrativa: ${calculation.narrative}`);

        // Verificar si los ratings coinciden con los atributos
        if (calculation.matchupAnalysis.offensiveRating !== eliteOffAttrs.powerRunBlocking) {
            console.log('⚠️ PROBLEMA: El offensive rating no coincide con el atributo esperado!');
        }
        if (calculation.matchupAnalysis.defensiveRating !== poorDefAttrs.runFitDiscipline) {
            console.log('⚠️ PROBLEMA: El defensive rating no coincide con el atributo esperado!');
        }

    } catch (error) {
        console.log(`❌ Error en el cálculo: ${error}`);
    }

    console.log('\n=== FIN DEL DEBUG ===');
}

// Ejecutar debug si se ejecuta directamente
if (require.main === module) {
    debugAttributeUsage();
}