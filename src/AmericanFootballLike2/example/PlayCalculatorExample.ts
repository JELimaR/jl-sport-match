// Ejemplo de uso del nuevo sistema PlayCalculator + SimpleMatch
// Demuestra cómo las acciones se combinan para calcular resultados de jugadas

import { SimpleMatch } from '../core/SimpleMatch';
import { OffensiveActionSet, DefensiveActionSet } from '../core/PlayCalculator';
import {
  RunningPlayAction,
  PassingPlayAction,
  DefensiveFormationAction
} from '../core/Actions';
import { TeamMatch } from '../teams/TeamMatch';
import { createEliteTeam, createDefensiveTeam } from './exampleTeams';

/**
 * Ejemplo de uso del nuevo sistema basado en PlayCalculator
 */
export class PlayCalculatorExample {

  /**
   * Crea equipos de ejemplo usando las funciones de exampleTeams
   */
  static createExampleTeams(): { teamX: TeamMatch, teamY: TeamMatch } {
    // Usar las funciones robustas de exampleTeams
    const teamX = createEliteTeam("Eagles");
    const teamY = createDefensiveTeam("Ravens", "good");

    console.log(`✅ Equipos creados: ${teamX.name} vs ${teamY.name}`);
    return { teamX, teamY };
  }

  /**
   * Ejemplo de jugada de carrera
   */
  static exampleRunningPlay() {
    console.log('=== EJEMPLO: Jugada de Carrera ===');

    const { teamX, teamY } = this.createExampleTeams();
    const match = new SimpleMatch(teamX, teamY);

    // Crear acciones ofensivas
    const runningAction: RunningPlayAction = {
      actionType: 'running',
      playType: 'power',
      direction: 'center',
      gap: 'A',
      purpose: 'short_yardage',
      riskLevel: 'low',
      expectedYards: 3,
      teamStrength: 75
    };

    const offensiveActions: OffensiveActionSet = {
      primaryAction: runningAction,
      formation: 'I-Formation',
      personnel: '21' // 2 RB, 1 TE
    };

    // Crear acciones defensivas
    const defensiveFormation: DefensiveFormationAction = {
      formation: '4-3',
      personnel: {
        defensiveLinemen: [],
        linebackers: [],
        cornerbacks: [],
        safeties: []
      },
      strengths: ['run_defense', 'versatility'],
      weaknesses: ['deep_coverage']
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: defensiveFormation,
      adjustments: ['stack_box', 'gap_control']
    };

    // Ejecutar jugada
    const result = match.executePlay(offensiveActions, defensiveActions);

    console.log('Estado después de la jugada:', match.getCurrentState());
    console.log('Resultado:', result);

    return result;
  }

  /**
   * Ejemplo de jugada de pase
   */
  static examplePassingPlay() {
    console.log('\n=== EJEMPLO: Jugada de Pase ===');

    const { teamX, teamY } = this.createExampleTeams();
    const match = new SimpleMatch(teamX, teamY);

    // Establecer situación de pase (3rd & 8)
    match.state.down = 3;
    match.state.yardsToGo = 8;
    match.state.ballPosition = 45;

    // Crear acciones ofensivas
    const passingAction: PassingPlayAction = {
      actionType: 'passing',
      playType: 'slant',
      protection: 'slide',
      routeDepth: 8,
      routeComplexity: 'simple',
      purpose: 'move_chains',
      riskLevel: 'medium',
      expectedYards: 10,
      completionProbability: 70,
      teamPassingStrength: 80
    };

    const offensiveActions: OffensiveActionSet = {
      primaryAction: passingAction,
      formation: 'Shotgun',
      personnel: '11' // 1 RB, 1 TE, 3 WR
    };

    // Crear acciones defensivas
    const defensiveFormation: DefensiveFormationAction = {
      formation: 'nickel',
      personnel: {
        defensiveLinemen: [],
        linebackers: [],
        cornerbacks: [],
        safeties: []
      },
      strengths: ['pass_coverage', 'pass_rush'],
      weaknesses: ['run_gaps']
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: defensiveFormation,
      coverageAction: {
        coverageType: 'cover_2',
        assignments: [],
        deepCoverage: 75,
        shortCoverage: 65,
        vulnerabilities: ['deep_middle']
      },
      adjustments: ['press_coverage', 'underneath_zone']
    };

    // Ejecutar jugada
    const result = match.executePlay(offensiveActions, defensiveActions);

    console.log('Estado después de la jugada:', match.getCurrentState());
    console.log('Resultado:', result);

    return result;
  }

  /**
   * Ejemplo de secuencia de jugadas
   */
  static examplePlaySequence() {
    console.log('\n=== EJEMPLO: Secuencia de Jugadas ===');

    const { teamX, teamY } = this.createExampleTeams();
    const match = new SimpleMatch(teamX, teamY);

    console.log('Estado inicial:', match.getCurrentState());

    // Jugada 1: Carrera por el centro
    console.log('\n--- Jugada 1: Carrera ---');
    const runResult = this.createAndExecuteRun(match);

    // Jugada 2: Pase corto
    console.log('\n--- Jugada 2: Pase ---');
    const passResult = this.createAndExecutePass(match);

    // Jugada 3: Carrera exterior
    console.log('\n--- Jugada 3: Carrera exterior ---');
    const sweepResult = this.createAndExecuteSweep(match);

    console.log('\n=== RESUMEN DE LA SECUENCIA ===');
    console.log('Estado final:', match.getCurrentState());

    return {
      runResult,
      passResult,
      sweepResult,
      finalState: match.getCurrentState()
    };
  }

  /**
   * Crea y ejecuta una carrera
   */
  private static createAndExecuteRun(match: SimpleMatch) {
    const offensiveActions: OffensiveActionSet = {
      primaryAction: {
        actionType: 'running',
        playType: 'inside_zone',
        direction: 'center',
        gap: 'B',
        purpose: 'control_clock',
        riskLevel: 'low',
        expectedYards: 4,
        teamStrength: 70
      },
      formation: 'Shotgun',
      personnel: '11'
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: '4-3',
        personnel: { defensiveLinemen: [], linebackers: [], cornerbacks: [], safeties: [] },
        strengths: ['run_defense'],
        weaknesses: ['deep_coverage']
      },
      adjustments: ['gap_control']
    };

    return match.executePlay(offensiveActions, defensiveActions);
  }

  /**
   * Crea y ejecuta un pase
   */
  private static createAndExecutePass(match: SimpleMatch) {
    const offensiveActions: OffensiveActionSet = {
      primaryAction: {
        actionType: 'passing',
        playType: 'hitch',
        routeDepth: 6,
        routeComplexity: 'simple',
        purpose: 'move_chains',
        riskLevel: 'low',
        expectedYards: 7,
        completionProbability: 75,
        teamPassingStrength: 75
      },
      formation: 'Shotgun',
      personnel: '11'
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: '4-3',
        personnel: { defensiveLinemen: [], linebackers: [], cornerbacks: [], safeties: [] },
        strengths: ['versatility'],
        weaknesses: []
      },
      coverageAction: {
        coverageType: 'cover_1',
        assignments: [],
        deepCoverage: 70,
        shortCoverage: 75,
        vulnerabilities: ['deep_routes']
      },
      adjustments: ['man_coverage']
    };

    return match.executePlay(offensiveActions, defensiveActions);
  }

  /**
   * Crea y ejecuta una carrera exterior
   */
  private static createAndExecuteSweep(match: SimpleMatch) {
    const offensiveActions: OffensiveActionSet = {
      primaryAction: {
        actionType: 'running',
        playType: 'sweep',
        direction: 'right',
        gap: 'D',
        purpose: 'exploit_speed',
        riskLevel: 'medium',
        expectedYards: 6,
        teamStrength: 65
      },
      formation: 'I-Formation',
      personnel: '21'
    };

    const defensiveActions: DefensiveActionSet = {
      formationAction: {
        formation: '4-3',
        personnel: { defensiveLinemen: [], linebackers: [], cornerbacks: [], safeties: [] },
        strengths: ['run_defense'],
        weaknesses: ['mobility']
      },
      adjustments: ['edge_set', 'contain']
    };

    return match.executePlay(offensiveActions, defensiveActions);
  }

  /**
   * Ejecuta todos los ejemplos
   */
  static runAllExamples() {
    console.log('🏈 EJEMPLOS DEL NUEVO SISTEMA PLAYCALCULATOR 🏈\n');

    this.exampleRunningPlay();
    this.examplePassingPlay();
    this.examplePlaySequence();

    console.log('\n✅ Todos los ejemplos ejecutados correctamente!');
    console.log('\nEl nuevo sistema:');
    console.log('- ✅ Elimina ActionCalculator');
    console.log('- ✅ Usa PlayCalculator que combina acciones ofensivas y defensivas');
    console.log('- ✅ Las acciones son componentes de las jugadas, no tienen resultados propios');
    console.log('- ✅ Los cálculos se basan en atributos de equipos');
    console.log('- ✅ SimpleMatch simplificado y limpio');
    console.log('- ✅ Sistema más realista y modular');
  }
}

// Ejecutar ejemplos si se ejecuta directamente
if (require.main === module) {
  PlayCalculatorExample.runAllExamples();
}