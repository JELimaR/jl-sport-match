import { PlayerRole } from './Types';
import { PlayerMatch, TeamMatch } from './Players';

// --- SISTEMA DE ESTADÍSTICAS ---

export interface PlayerStats {
  playerId: string;
  role: PlayerRole;

  // Estadísticas Ofensivas
  passingAttempts: number;
  passingCompletions: number;
  passingYards: number;
  passingTouchdowns: number;
  interceptions: number;

  rushingAttempts: number;
  rushingYards: number;
  rushingTouchdowns: number;

  receptions: number;
  receivingYards: number;
  receivingTouchdowns: number;

  // Estadísticas Defensivas
  tackles: number;
  sacks: number;
  interceptionsDefense: number;
  passesDefended: number;
  forcedFumbles: number;

  // Estadísticas de Equipos Especiales
  fieldGoalAttempts: number;
  fieldGoalsMade: number;
  extraPointAttempts: number;
  extraPointsMade: number;
  punts: number;
  puntYards: number;

  // Rendimiento
  playsParticipated: number;
  averageEffectiveness: number;
  fatigueLevel: number;
  peakPerformance: number;
  consistencyRating: number;
}

export interface QuarterStats {
  quarter: number;
  points: number;
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  plays: number;
  touchdowns: number;
  fieldGoals: number;
  turnovers: number;
  timeOfPossession: number;
  efficiency: number;
}

export interface DriveStats {
  driveNumber: number;
  startingPosition: number;
  endingPosition: number;
  plays: number;
  yards: number;
  timeConsumed: number;
  result: 'Touchdown' | 'FieldGoal' | 'Punt' | 'Turnover' | 'EndOfHalf' | 'Incomplete';
  points: number;
}

export interface TeamStats {
  teamName: string;

  // Estadísticas Ofensivas
  totalPlays: number;
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  touchdowns: number;
  fieldGoals: number;
  firstDowns: number;
  thirdDownConversions: number;
  thirdDownAttempts: number;
  fourthDownConversions: number;
  fourthDownAttempts: number;
  turnovers: number;

  // Estadísticas Defensivas
  allowedYards: number;
  allowedPassingYards: number;
  allowedRushingYards: number;
  allowedTouchdowns: number;
  sacks: number;
  interceptions: number;
  forcedTurnovers: number;

  // Eficiencia
  offensiveEfficiency: number;
  defensiveEfficiency: number;
  redZoneEfficiency: number;
  timeOfPossession: number;

  // Estadísticas por Cuarto
  quarterStats: QuarterStats[];

  // Estadísticas por Serie
  drives: DriveStats[];
}

export interface MatchStats {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  finalScore: { home: number; away: number };
  duration: number;
  totalPlays: number;

  // Estadísticas por Equipo
  teamStats: Map<string, TeamStats>;

  // Estadísticas Individuales
  playerStats: Map<string, PlayerStats>;

  // Análisis de Rendimiento
  mvpOffense: string;
  mvpDefense: string;
  keyMoments: string[];

  // Métricas Avanzadas
  offensiveBalance: { home: number; away: number }; // Balance entre pase y carrera
  defensivePressure: { home: number; away: number }; // Presión defensiva generada
  strategicAdaptation: { home: number; away: number }; // Capacidad de adaptación estratégica
}

export class StatsMatch {
  private matchStats: MatchStats;
  private currentQuarter: number = 1;
  private currentDrive: DriveStats | null = null;
  private driveStartTime: number = 0;

  constructor(homeTeam: string, awayTeam: string, matchId: string = '') {
    this.matchStats = {
      matchId: matchId || `${homeTeam}_vs_${awayTeam}_${Date.now()}`,
      homeTeam,
      awayTeam,
      finalScore: { home: 0, away: 0 },
      duration: 0,
      totalPlays: 0,
      teamStats: new Map(),
      playerStats: new Map(),
      mvpOffense: '',
      mvpDefense: '',
      keyMoments: [],
      offensiveBalance: { home: 0, away: 0 },
      defensivePressure: { home: 0, away: 0 },
      strategicAdaptation: { home: 0, away: 0 }
    };

    // Inicializar estadísticas de equipos
    this.initializeTeamStats(homeTeam);
    this.initializeTeamStats(awayTeam);
  }

  private initializeQuarterStats(): QuarterStats[] {
    const quarters: QuarterStats[] = [];
    for (let i = 1; i <= 4; i++) {
      quarters.push({
        quarter: i,
        points: 0,
        totalYards: 0,
        passingYards: 0,
        rushingYards: 0,
        plays: 0,
        touchdowns: 0,
        fieldGoals: 0,
        turnovers: 0,
        timeOfPossession: 0,
        efficiency: 0
      });
    }
    return quarters;
  }

  private initializeTeamStats(teamName: string): void {
    const stats: TeamStats = {
      teamName,
      totalPlays: 0,
      totalYards: 0,
      passingYards: 0,
      rushingYards: 0,
      touchdowns: 0,
      fieldGoals: 0,
      firstDowns: 0,
      thirdDownConversions: 0,
      thirdDownAttempts: 0,
      fourthDownConversions: 0,
      fourthDownAttempts: 0,
      turnovers: 0,
      allowedYards: 0,
      allowedPassingYards: 0,
      allowedRushingYards: 0,
      allowedTouchdowns: 0,
      sacks: 0,
      interceptions: 0,
      forcedTurnovers: 0,
      offensiveEfficiency: 0,
      defensiveEfficiency: 0,
      redZoneEfficiency: 0,
      timeOfPossession: 0,
      quarterStats: this.initializeQuarterStats(),
      drives: []
    };

    this.matchStats.teamStats.set(teamName, stats);
  }

  public startNewDrive(team: string, startingPosition: number, gameTime: number): void {
    const teamStats = this.matchStats.teamStats.get(team)!;
    const driveNumber = teamStats.drives.length + 1;

    this.currentDrive = {
      driveNumber,
      startingPosition: Math.round(startingPosition),
      endingPosition: Math.round(startingPosition),
      plays: 0,
      yards: 0,
      timeConsumed: 0,
      result: 'Incomplete',
      points: 0
    };

    this.driveStartTime = gameTime;
  }

  public endCurrentDrive(team: string, endingPosition: number, result: DriveStats['result'], points: number, gameTime: number): void {
    if (this.currentDrive) {
      this.currentDrive.endingPosition = Math.round(endingPosition);
      this.currentDrive.result = result;
      this.currentDrive.points = points;
      this.currentDrive.timeConsumed = this.driveStartTime - gameTime;
      this.currentDrive.yards = Math.abs(Math.round(endingPosition) - this.currentDrive.startingPosition);

      const teamStats = this.matchStats.teamStats.get(team)!;
      teamStats.drives.push({ ...this.currentDrive });

      this.currentDrive = null;
    }
  }

  public updateCurrentQuarter(quarter: number): void {
    this.currentQuarter = quarter;
  }

  public initializePlayerStats(player: PlayerMatch): void {
    if (!this.matchStats.playerStats.has(player.id)) {
      const stats: PlayerStats = {
        playerId: player.id,
        role: player.role,
        passingAttempts: 0,
        passingCompletions: 0,
        passingYards: 0,
        passingTouchdowns: 0,
        interceptions: 0,
        rushingAttempts: 0,
        rushingYards: 0,
        rushingTouchdowns: 0,
        receptions: 0,
        receivingYards: 0,
        receivingTouchdowns: 0,
        tackles: 0,
        sacks: 0,
        interceptionsDefense: 0,
        passesDefended: 0,
        forcedFumbles: 0,
        fieldGoalAttempts: 0,
        fieldGoalsMade: 0,
        extraPointAttempts: 0,
        extraPointsMade: 0,
        punts: 0,
        puntYards: 0,
        playsParticipated: 0,
        averageEffectiveness: 0,
        fatigueLevel: 0,
        peakPerformance: 0,
        consistencyRating: 0
      };

      this.matchStats.playerStats.set(player.id, stats);
    }
  }

  public recordPlay(offensiveTeam: TeamMatch, defensiveTeam: TeamMatch,
    playResult: { yards: number; playType: string; success: boolean }): void {
    this.matchStats.totalPlays++;

    const offStats = this.matchStats.teamStats.get(offensiveTeam.data.name)!;
    const defStats = this.matchStats.teamStats.get(defensiveTeam.data.name)!;

    // Actualizar estadísticas generales
    offStats.totalPlays++;
    offStats.totalYards += playResult.yards;

    if (playResult.playType.includes('Pass')) {
      offStats.passingYards += playResult.yards;
      if (playResult.playType === 'DeepPass') {
        // Registrar pases profundos por separado si es necesario
      }
    } else if (playResult.playType === 'Rush') {
      offStats.rushingYards += playResult.yards;
    }

    // Actualizar estadísticas defensivas
    defStats.allowedYards += playResult.yards;

    // Actualizar estadísticas del cuarto actual
    const currentQuarterStats = offStats.quarterStats[this.currentQuarter - 1];
    currentQuarterStats.plays++;
    currentQuarterStats.totalYards += playResult.yards;

    if (playResult.playType.includes('Pass')) {
      currentQuarterStats.passingYards += playResult.yards;
    } else if (playResult.playType === 'Rush') {
      currentQuarterStats.rushingYards += playResult.yards;
    }

    // Actualizar serie actual
    if (this.currentDrive) {
      this.currentDrive.plays++;
      this.currentDrive.yards += playResult.yards;
    }

    // Actualizar estadísticas de jugadores
    this.updatePlayerStats(offensiveTeam, defensiveTeam, playResult);
  }

  private updatePlayerStats(offensiveTeam: TeamMatch, defensiveTeam: TeamMatch,
    playResult: { yards: number; playType: string; success: boolean }): void {
    // Actualizar estadísticas de jugadores ofensivos
    offensiveTeam.data.players.forEach((player: PlayerMatch) => {
      const stats = this.matchStats.playerStats.get(player.id);
      if (stats) {
        stats.playsParticipated++;
        stats.averageEffectiveness = (stats.averageEffectiveness + player.getEffectiveAttribute('awareness')) / 2;
        stats.fatigueLevel = 100 - player.energy;
      }
    });

    // Actualizar estadísticas de jugadores defensivos
    defensiveTeam.data.players.forEach((player: PlayerMatch) => {
      const stats = this.matchStats.playerStats.get(player.id);
      if (stats) {
        stats.playsParticipated++;
        if (playResult.yards <= 0) {
          stats.tackles += 0.1; // Contribución al tackle
        }
      }
    });
  }

  public recordScore(team: string, points: number, scoreType: 'touchdown' | 'fieldgoal' | 'safety'): void {
    const stats = this.matchStats.teamStats.get(team)!;

    if (scoreType === 'touchdown') {
      stats.touchdowns++;
    } else if (scoreType === 'fieldgoal') {
      stats.fieldGoals++;
    }

    // Actualizar estadísticas del cuarto actual
    const currentQuarterStats = stats.quarterStats[this.currentQuarter - 1];
    currentQuarterStats.points += points;

    if (scoreType === 'touchdown') {
      currentQuarterStats.touchdowns++;
    } else if (scoreType === 'fieldgoal') {
      currentQuarterStats.fieldGoals++;
    }

    // Actualizar marcador final
    if (team === this.matchStats.homeTeam) {
      this.matchStats.finalScore.home += points;
    } else {
      this.matchStats.finalScore.away += points;
    }
  }

  public recordSpecialPlay(team: string, playType: string, success: boolean, yards?: number): void {
    // Registrar jugadas especiales
    if (playType === 'FieldGoal') {
      const kicker = this.findKicker(team);
      if (kicker) {
        kicker.fieldGoalAttempts++;
        if (success) kicker.fieldGoalsMade++;
      }
    }
  }

  private findKicker(teamName: string): PlayerStats | undefined {
    for (const [playerId, stats] of this.matchStats.playerStats) {
      if (stats.role === 'Kicker') {
        return stats;
      }
    }
    return undefined;
  }

  public calculateFinalStats(): void {
    // Calcular eficiencias finales
    for (const [teamName, stats] of this.matchStats.teamStats) {
      stats.offensiveEfficiency = stats.totalYards / Math.max(1, stats.totalPlays);
      stats.defensiveEfficiency = stats.allowedYards / Math.max(1, stats.totalPlays);
    }

    // Determinar MVPs
    this.determineMVPs();

    // Calcular métricas avanzadas
    this.calculateAdvancedMetrics();
  }

  private determineMVPs(): void {
    let bestOffensiveRating = 0;
    let bestDefensiveRating = 0;

    for (const [playerId, stats] of this.matchStats.playerStats) {
      // Calcular rating ofensivo
      const offensiveRating = (stats.passingYards * 0.1) + (stats.rushingYards * 0.15) +
        (stats.receivingYards * 0.12) + (stats.passingTouchdowns * 6) +
        (stats.rushingTouchdowns * 6) + (stats.receivingTouchdowns * 6);

      // Calcular rating defensivo
      const defensiveRating = (stats.tackles * 1.5) + (stats.sacks * 3) +
        (stats.interceptionsDefense * 4) + (stats.passesDefended * 1);

      if (offensiveRating > bestOffensiveRating) {
        bestOffensiveRating = offensiveRating;
        this.matchStats.mvpOffense = playerId;
      }

      if (defensiveRating > bestDefensiveRating) {
        bestDefensiveRating = defensiveRating;
        this.matchStats.mvpDefense = playerId;
      }
    }
  }

  private calculateAdvancedMetrics(): void {
    // Calcular balance ofensivo, presión defensiva, etc.
    for (const [teamName, stats] of this.matchStats.teamStats) {
      const passRatio = stats.passingYards / Math.max(1, stats.totalYards);
      const rushRatio = stats.rushingYards / Math.max(1, stats.totalYards);

      if (teamName === this.matchStats.homeTeam) {
        this.matchStats.offensiveBalance.home = Math.abs(passRatio - rushRatio);
      } else {
        this.matchStats.offensiveBalance.away = Math.abs(passRatio - rushRatio);
      }
    }
  }

  public getMatchStats(): MatchStats {
    return this.matchStats;
  }

  public generateReport(): string {
    let report = `\n📊 REPORTE ESTADÍSTICO DEL PARTIDO\n`;
    report += `${this.matchStats.homeTeam} ${this.matchStats.finalScore.home} - ${this.matchStats.finalScore.away} ${this.matchStats.awayTeam}\n`;
    report += `Total de jugadas: ${this.matchStats.totalPlays}\n\n`;

    // Estadísticas por equipo
    for (const [teamName, stats] of this.matchStats.teamStats) {
      report += `📈 ${teamName.toUpperCase()}\n`;
      report += `  Yardas totales: ${stats.totalYards}\n`;
      report += `  Yardas por pase: ${stats.passingYards} (${((stats.passingYards / Math.max(1, stats.totalYards)) * 100).toFixed(1)}%)\n`;
      report += `  Yardas por carrera: ${stats.rushingYards} (${((stats.rushingYards / Math.max(1, stats.totalYards)) * 100).toFixed(1)}%)\n`;
      report += `  Balance ofensivo: ${stats.passingYards > stats.rushingYards ? 'Aéreo' : 'Terrestre'}\n`;
      report += `  Touchdowns: ${stats.touchdowns}\n`;
      report += `  Field Goals: ${stats.fieldGoals}\n`;
      report += `  Eficiencia ofensiva: ${stats.offensiveEfficiency.toFixed(2)} yardas/jugada\n`;
      report += `  Eficiencia defensiva: ${stats.defensiveEfficiency.toFixed(2)} yardas permitidas/jugada\n\n`;
    }

    // MVPs
    report += `🏆 MVP OFENSIVO: ${this.matchStats.mvpOffense}\n`;
    report += `🛡️ MVP DEFENSIVO: ${this.matchStats.mvpDefense}\n\n`;

    return report;
  }

  public generateQuarterlyReport(): string {
    let report = `\n📊 ESTADÍSTICAS POR CUARTO\n`;
    report += `${''.padEnd(60, '=')}\n`;

    for (const [teamName, stats] of this.matchStats.teamStats) {
      report += `\n🏈 ${teamName.toUpperCase()}\n`;
      report += `${'Cuarto'.padEnd(8)} ${'Puntos'.padEnd(8)} ${'Yardas'.padEnd(8)} ${'Jugadas'.padEnd(8)} ${'Efic.'.padEnd(8)}\n`;
      report += `${''.padEnd(48, '-')}\n`;

      stats.quarterStats.forEach(quarter => {
        const efficiency = quarter.plays > 0 ? (quarter.totalYards / quarter.plays).toFixed(1) : '0.0';
        report += `Q${quarter.quarter}       ${quarter.points.toString().padEnd(8)} ${quarter.totalYards.toString().padEnd(8)} ${quarter.plays.toString().padEnd(8)} ${efficiency.padEnd(8)}\n`;
      });

      report += `\n`;
    }

    return report;
  }

  public generateDriveReport(): string {
    let report = `\n🚗 ESTADÍSTICAS POR SERIE OFENSIVA\n`;
    report += `${''.padEnd(80, '=')}\n`;

    for (const [teamName, stats] of this.matchStats.teamStats) {
      report += `\n🏈 ${teamName.toUpperCase()}\n`;
      report += `${'#'.padEnd(4)} ${'Inicio'.padEnd(8)} ${'Final'.padEnd(8)} ${'Jugadas'.padEnd(8)} ${'Yardas'.padEnd(8)} ${'Tiempo'.padEnd(8)} ${'Resultado'.padEnd(12)} ${'Pts'.padEnd(4)}\n`;
      report += `${''.padEnd(76, '-')}\n`;

      stats.drives.forEach(drive => {
        const timeMin = Math.floor(drive.timeConsumed / 60);
        const timeSec = drive.timeConsumed % 60;
        const timeStr = `${timeMin}:${timeSec.toString().padStart(2, '0')}`;

        report += `${drive.driveNumber.toString().padEnd(4)} `;
        report += `${drive.startingPosition.toString().padEnd(8)} `;
        report += `${drive.endingPosition.toString().padEnd(8)} `;
        report += `${drive.plays.toString().padEnd(8)} `;
        report += `${drive.yards.toString().padEnd(8)} `;
        report += `${timeStr.padEnd(8)} `;
        report += `${drive.result.padEnd(12)} `;
        report += `${drive.points.toString().padEnd(4)}\n`;
      });

      // Resumen de series
      const totalDrives = stats.drives.length;
      const scoringDrives = stats.drives.filter(d => d.points > 0).length;
      const avgYards = totalDrives > 0 ? (stats.drives.reduce((sum, d) => sum + d.yards, 0) / totalDrives).toFixed(1) : '0.0';

      report += `\nResumen: ${totalDrives} series, ${scoringDrives} anotadoras (${((scoringDrives / totalDrives) * 100).toFixed(1)}%), ${avgYards} yardas promedio\n\n`;
    }

    return report;
  }
}