// TeamMatch - Representa el equipo completo con roster y staff
// Este es el equipo que participa en el partido con todos sus jugadores disponibles

import { Player } from "../core/Player";
import { CoachingStaff } from "../teams/coaches/CoachingStaff";
import { TeamAttributeSystem } from "./TeamAttributes";
import { TeamAttributeCalculator } from "./TeamAttributeCalculator";
import { PlayerTeamworkProfile, CompleteTeamworkSystem } from "./TeamworkAttributes";
import { TeamCamp } from "./units/TeamCamp";
import { OffensiveTeam } from "./units/OffensiveTeam";
import { DefensiveTeam } from "./units/DefensiveTeam";
import { SpecialTeam } from "./units/SpecialTeam";
import { KickerTeam } from "./units/KickerTeam";
import { ReturnerTeam } from "./units/ReturnerTeam";

import { Position } from "../Positions/PositionTypes";

export interface TeamMatchConfig {
    name: string;
    players: Player[];
    coachingStaff: CoachingStaff;
    teamAttributes?: TeamAttributeSystem;
    teamworkProfiles?: PlayerTeamworkProfile[];
    teamworkSystem?: CompleteTeamworkSystem;
}

export class TeamMatch {
    public readonly name: string;
    public readonly players: Player[];
    public readonly coachingStaff: CoachingStaff;
    public readonly teamAttributes: TeamAttributeSystem;

    // Sistema de trabajo en equipo
    public readonly teamworkProfiles: PlayerTeamworkProfile[];
    public readonly teamworkSystem: CompleteTeamworkSystem;

    // Estado dinámico del equipo
    public morale: number = 75;
    public fatigue: number = 0;

    constructor(config: TeamMatchConfig) {
        this.name = config.name;
        this.players = config.players;
        this.coachingStaff = config.coachingStaff;

        // Inicializar sistema de trabajo en equipo
        this.teamworkProfiles = config.teamworkProfiles || [];
        this.teamworkSystem = config.teamworkSystem || {} as CompleteTeamworkSystem;

        // Calcular atributos dinámicamente a partir de jugadores y trabajo en equipo
        const calculatedAttributes = TeamAttributeCalculator.calculateTeamAttributes(
            this.players,
            this.coachingStaff,
            this.teamworkProfiles.length > 0 ? this.teamworkProfiles : undefined,
            Object.keys(this.teamworkSystem).length > 0 ? this.teamworkSystem : undefined
        );

        // Crear sistema de atributos con los valores calculados
        this.teamAttributes = config.teamAttributes || new TeamAttributeSystem({
            teamId: `team-${this.name.toLowerCase().replace(/\s+/g, '-')}`,
            teamName: this.name,
            attributes: calculatedAttributes
        });

        this.validateTeam();
    }

    /**
     * Valida que el equipo tenga la configuración mínima necesaria
     */
    private validateTeam(): void {
        if (this.players.length < 22) {
            throw new Error(`El equipo ${this.name} debe tener al menos 22 jugadores para formar unidades ofensivas y defensivas`);
        }
    }

    /**
     * Obtiene jugadores por posición específica
     */
    public getPlayersByPosition(position: Position): Player[] {
        return this.players.filter(player => player.position === position);
    }

    /**
     * Obtiene el quarterback principal del equipo
     */
    public getQuarterback(): Player | undefined {
        return this.players.find(player => player.position === 'QB');
    }

    /**
     * Crea una unidad ofensiva para el campo
     */
    public createOffensiveUnit(formation: string = 'standard'): OffensiveTeam {
        const offensivePlayers: Player[] = [];

        // QB (1)
        const qb = this.getPlayersByPosition('QB')[0];
        if (qb) offensivePlayers.push(qb);

        // RB (1-2 dependiendo de la formación)
        const rbs = this.getPlayersByPosition('RB');
        if (formation === 'two_back' && rbs.length >= 2) {
            offensivePlayers.push(rbs[0], rbs[1]);
        } else if (rbs.length >= 1) {
            offensivePlayers.push(rbs[0]);
        }

        // WR (2-5 dependiendo de la formación)
        const wrs = this.getPlayersByPosition('WR');
        const wrCount = formation === 'five_wide' ? 5 : formation === 'four_wide' ? 4 : 3;
        offensivePlayers.push(...wrs.slice(0, Math.min(wrCount, wrs.length)));

        // TE (0-2 dependiendo de la formación)
        const tes = this.getPlayersByPosition('TE');
        const teCount = formation === 'heavy' ? 2 : formation === 'spread' ? 0 : 1;
        if (teCount > 0) {
            offensivePlayers.push(...tes.slice(0, Math.min(teCount, tes.length)));
        }

        // Línea Ofensiva (5)
        const centers = this.getPlayersByPosition('C');
        const guards = this.getPlayersByPosition('G');
        const tackles = this.getPlayersByPosition('T');

        if (centers.length >= 1) offensivePlayers.push(centers[0]);
        offensivePlayers.push(...guards.slice(0, Math.min(2, guards.length)));
        offensivePlayers.push(...tackles.slice(0, Math.min(2, tackles.length)));

        // Completar hasta 11 jugadores si faltan (sin añadir más QBs)
        while (offensivePlayers.length < 11) {
            const availablePlayers = this.players.filter(p =>
                !offensivePlayers.includes(p) &&
                ['RB', 'WR', 'TE', 'C', 'G', 'T'].includes(p.position)
            );
            if (availablePlayers.length > 0) {
                offensivePlayers.push(availablePlayers[0]);
            } else {
                break;
            }
        }

        return new OffensiveTeam({
            teamName: this.name,
            players: offensivePlayers.slice(0, 11),
            unitType: 'offensive',
            formation,
            coachingStaff: this.coachingStaff,
            teamworkProfiles: this.teamworkProfiles,
            teamworkSystem: this.teamworkSystem
        });
    }

    /**
     * Crea una unidad defensiva para el campo
     */
    public createDefensiveUnit(formation: string = '4-3'): DefensiveTeam {
        const defensivePlayers: Player[] = [];

        // Línea Defensiva
        const des = this.getPlayersByPosition('DE');
        const dts = this.getPlayersByPosition('DT');

        if (formation === '4-3' || formation === '4-2-5') {
            // 4 linemen
            defensivePlayers.push(...des.slice(0, Math.min(2, des.length)));
            defensivePlayers.push(...dts.slice(0, Math.min(2, dts.length)));
        } else if (formation === '3-4') {
            // 3 linemen
            defensivePlayers.push(...des.slice(0, Math.min(1, des.length)));
            defensivePlayers.push(...dts.slice(0, Math.min(2, dts.length)));
        }

        // Linebackers
        const olbs = this.getPlayersByPosition('OLB');
        const ilbs = this.getPlayersByPosition('ILB');

        if (formation === '4-3') {
            defensivePlayers.push(...ilbs.slice(0, Math.min(3, ilbs.length)));
        } else if (formation === '3-4') {
            defensivePlayers.push(...olbs.slice(0, Math.min(2, olbs.length)));
            defensivePlayers.push(...ilbs.slice(0, Math.min(2, ilbs.length)));
        } else if (formation === '4-2-5') {
            defensivePlayers.push(...ilbs.slice(0, Math.min(2, ilbs.length)));
        }

        // Defensive Backs
        const cbs = this.getPlayersByPosition('CB');
        const safeties = [...this.getPlayersByPosition('SS'), ...this.getPlayersByPosition('FS')];

        if (formation === '4-2-5') {
            // 5 DBs
            defensivePlayers.push(...cbs.slice(0, Math.min(3, cbs.length)));
            defensivePlayers.push(...safeties.slice(0, Math.min(2, safeties.length)));
        } else {
            // 4 DBs estándar
            defensivePlayers.push(...cbs.slice(0, Math.min(2, cbs.length)));
            defensivePlayers.push(...safeties.slice(0, Math.min(2, safeties.length)));
        }

        // Completar hasta 11 jugadores si faltan
        while (defensivePlayers.length < 11) {
            const availablePlayers = this.players.filter(p =>
                !defensivePlayers.includes(p) &&
                ['DE', 'DT', 'NT', 'OLB', 'ILB', 'CB', 'SS', 'FS'].includes(p.position)
            );
            if (availablePlayers.length > 0) {
                defensivePlayers.push(availablePlayers[0]);
            } else {
                break;
            }
        }

        return new DefensiveTeam({
            teamName: this.name,
            players: defensivePlayers.slice(0, 11),
            unitType: 'defensive',
            formation,
            coachingStaff: this.coachingStaff,
            teamworkProfiles: this.teamworkProfiles,
            teamworkSystem: this.teamworkSystem
        });
    }

    /**
     * Crea una unidad de equipos especiales
     */
    public createSpecialTeamsUnit(specialPlay: 'kickoff' | 'punt' | 'field_goal' | 'return'): SpecialTeam {
        const specialPlayers: Player[] = [];

        if (specialPlay === 'field_goal' || specialPlay === 'kickoff') {
            // Kicker
            const kickers = this.getPlayersByPosition('K');
            if (kickers.length > 0) specialPlayers.push(kickers[0]);

            // Línea ofensiva para protección
            const centers = this.getPlayersByPosition('C');
            const guards = this.getPlayersByPosition('G');
            const tackles = this.getPlayersByPosition('T');

            if (centers.length >= 1) specialPlayers.push(centers[0]);
            specialPlayers.push(...guards.slice(0, Math.min(2, guards.length)));
            specialPlayers.push(...tackles.slice(0, Math.min(2, tackles.length)));

            // Completar con jugadores rápidos para cobertura
            const fastPlayers = this.players
                .filter(p => !specialPlayers.includes(p))
                .sort((a, b) => b.attributes.speed - a.attributes.speed);

            specialPlayers.push(...fastPlayers.slice(0, 11 - specialPlayers.length));

        } else if (specialPlay === 'punt') {
            // Punter
            const punters = this.getPlayersByPosition('P');
            if (punters.length > 0) specialPlayers.push(punters[0]);

            // Long Snapper si existe, sino center
            const longSnappers = this.getPlayersByPosition('LS');
            if (longSnappers.length > 0) {
                specialPlayers.push(longSnappers[0]);
            } else {
                const centers = this.getPlayersByPosition('C');
                if (centers.length > 0) specialPlayers.push(centers[0]);
            }

            // Completar con jugadores para cobertura
            const coveragePlayers = this.players
                .filter(p => !specialPlayers.includes(p))
                .sort((a, b) => (b.attributes.speed + b.attributes.tackling) - (a.attributes.speed + a.attributes.tackling));

            specialPlayers.push(...coveragePlayers.slice(0, 11 - specialPlayers.length));

        } else if (specialPlay === 'return') {
            // Returner (mejor combinación de speed, agility, catching)
            const returners = this.players
                .sort((a, b) => {
                    const aScore = a.attributes.speed + a.attributes.agility + a.attributes.catching;
                    const bScore = b.attributes.speed + b.attributes.agility + b.attributes.catching;
                    return bScore - aScore;
                });

            if (returners.length > 0) specialPlayers.push(returners[0]);

            // Blockers para el return
            const blockers = this.players
                .filter(p => !specialPlayers.includes(p))
                .sort((a, b) => (b.attributes.blocking + b.attributes.speed) - (a.attributes.blocking + a.attributes.speed));

            specialPlayers.push(...blockers.slice(0, 10));
        }

        // Mapear specialPlay a specialTeamType
        let specialTeamType: 'kicking' | 'punting' | 'field_goal' | 'return_kickoff' | 'return_punt';
        switch (specialPlay) {
            case 'kickoff':
                specialTeamType = 'kicking';
                break;
            case 'punt':
                specialTeamType = 'punting';
                break;
            case 'field_goal':
                specialTeamType = 'field_goal';
                break;
            case 'return':
                // Por defecto return_kickoff, se puede especificar mejor en el futuro
                specialTeamType = 'return_kickoff';
                break;
            default:
                specialTeamType = 'kicking';
        }

        return new SpecialTeam({
            teamName: this.name,
            players: specialPlayers.slice(0, 11),
            unitType: 'special_teams',
            formation: specialPlay,
            specialTeamType: specialTeamType,
            coachingStaff: this.coachingStaff,
            teamworkProfiles: this.teamworkProfiles,
            teamworkSystem: this.teamworkSystem
        });
    }

    /**
     * Crea una unidad especializada para retornar punts o kickoffs
     */
    public createReturnUnit(returnType: 'kickoff' | 'punt'): SpecialTeam {
        const returnPlayers: Player[] = [];

        // Returner principal (mejor combinación de speed, agility, catching)
        const potentialReturners = this.players
            .filter(p => ['WR', 'RB', 'CB'].includes(p.position))
            .sort((a, b) => {
                const aScore = a.attributes.speed + a.attributes.agility + a.attributes.catching;
                const bScore = b.attributes.speed + b.attributes.agility + b.attributes.catching;
                return bScore - aScore;
            });

        if (potentialReturners.length > 0) {
            returnPlayers.push(potentialReturners[0]);
        }

        // Blockers para el return (jugadores rápidos y buenos bloqueadores)
        const blockers = this.players
            .filter(p => !returnPlayers.includes(p) && !['K', 'P'].includes(p.position))
            .sort((a, b) => {
                const aScore = a.attributes.speed + a.attributes.blocking + a.attributes.awareness;
                const bScore = b.attributes.speed + b.attributes.blocking + b.attributes.awareness;
                return bScore - aScore;
            });

        returnPlayers.push(...blockers.slice(0, 10));

        const specialTeamType = returnType === 'kickoff' ? 'return_kickoff' : 'return_punt';

        return new SpecialTeam({
            teamName: this.name,
            players: returnPlayers.slice(0, 11),
            unitType: 'special_teams',
            formation: `return_${returnType}`,
            specialTeamType: specialTeamType,
            coachingStaff: this.coachingStaff,
            teamworkProfiles: this.teamworkProfiles,
            teamworkSystem: this.teamworkSystem
        });
    }

    /**
     * Crea una unidad especializada de pateo (KickerTeam)
     */
    public createKickerTeam(kickType: 'kickoff' | 'punt' | 'field_goal' | 'extra_point'): KickerTeam {
        const kickerPlayers: Player[] = [];

        if (kickType === 'kickoff') {
            // Kicker
            const kickers = this.getPlayersByPosition('K');
            if (kickers.length > 0) kickerPlayers.push(kickers[0]);

            // Línea ofensiva para protección
            const centers = this.getPlayersByPosition('C');
            const guards = this.getPlayersByPosition('G');
            const tackles = this.getPlayersByPosition('T');

            if (centers.length >= 1) kickerPlayers.push(centers[0]);
            kickerPlayers.push(...guards.slice(0, Math.min(2, guards.length)));
            kickerPlayers.push(...tackles.slice(0, Math.min(2, tackles.length)));

            // Completar con jugadores rápidos para cobertura
            const fastPlayers = this.players
                .filter(p => !kickerPlayers.includes(p) && !['K', 'P'].includes(p.position))
                .sort((a, b) => b.attributes.speed - a.attributes.speed);

            kickerPlayers.push(...fastPlayers.slice(0, 11 - kickerPlayers.length));

        } else if (kickType === 'punt') {
            // Punter
            const punters = this.getPlayersByPosition('P');
            if (punters.length > 0) kickerPlayers.push(punters[0]);

            // Long Snapper si existe, sino center
            const longSnappers = this.getPlayersByPosition('LS');
            if (longSnappers.length > 0) {
                kickerPlayers.push(longSnappers[0]);
            } else {
                const centers = this.getPlayersByPosition('C');
                if (centers.length > 0) kickerPlayers.push(centers[0]);
            }

            // Completar con jugadores para cobertura y protección
            const coveragePlayers = this.players
                .filter(p => !kickerPlayers.includes(p) && !['K', 'P'].includes(p.position))
                .sort((a, b) => (b.attributes.speed + b.attributes.tackling) - (a.attributes.speed + a.attributes.tackling));

            kickerPlayers.push(...coveragePlayers.slice(0, 11 - kickerPlayers.length));

        } else if (kickType === 'field_goal' || kickType === 'extra_point') {
            // Kicker
            const kickers = this.getPlayersByPosition('K');
            if (kickers.length > 0) kickerPlayers.push(kickers[0]);

            // Long Snapper si existe, sino center
            const longSnappers = this.getPlayersByPosition('LS');
            if (longSnappers.length > 0) {
                kickerPlayers.push(longSnappers[0]);
            } else {
                const centers = this.getPlayersByPosition('C');
                if (centers.length > 0) kickerPlayers.push(centers[0]);
            }

            // Holder (normalmente el punter o QB backup)
            const punters = this.getPlayersByPosition('P');
            if (punters.length > 0) {
                kickerPlayers.push(punters[0]);
            } else {
                const qbs = this.getPlayersByPosition('QB');
                if (qbs.length > 1) kickerPlayers.push(qbs[1]);
            }

            // Línea ofensiva para protección
            const guards = this.getPlayersByPosition('G');
            const tackles = this.getPlayersByPosition('T');
            kickerPlayers.push(...guards.slice(0, Math.min(2, guards.length)));
            kickerPlayers.push(...tackles.slice(0, Math.min(2, tackles.length)));

            // Completar con jugadores grandes para protección
            const protectionPlayers = this.players
                .filter(p => !kickerPlayers.includes(p) && ['TE', 'T', 'G', 'C'].includes(p.position))
                .sort((a, b) => (b.attributes.blocking + b.attributes.strength) - (a.attributes.blocking + a.attributes.strength));

            kickerPlayers.push(...protectionPlayers.slice(0, 11 - kickerPlayers.length));
        }

        return new KickerTeam({
            teamName: this.name,
            players: kickerPlayers.slice(0, 11),
            unitType: 'special_teams',
            formation: kickType,
            kickerTeamType: kickType,
            coachingStaff: this.coachingStaff,
            teamworkProfiles: this.teamworkProfiles,
            teamworkSystem: this.teamworkSystem
        });
    }

    /**
     * Crea una unidad especializada de retorno/defensa (ReturnerTeam)
     */
    public createReturnerTeam(returnType: 'kickoff_return' | 'punt_return' | 'field_goal_defense' | 'extra_point_defense'): ReturnerTeam {
        const returnerPlayers: Player[] = [];

        if (returnType === 'kickoff_return' || returnType === 'punt_return') {
            // Returner principal (mejor combinación de speed, agility, catching)
            const potentialReturners = this.players
                .filter(p => ['WR', 'RB', 'CB'].includes(p.position))
                .sort((a, b) => {
                    const aScore = a.attributes.speed + a.attributes.agility + a.attributes.catching;
                    const bScore = b.attributes.speed + b.attributes.agility + b.attributes.catching;
                    return bScore - aScore;
                });

            if (potentialReturners.length > 0) {
                returnerPlayers.push(potentialReturners[0]);
            }

            // Blockers para el return (jugadores rápidos y buenos bloqueadores)
            const blockers = this.players
                .filter(p => !returnerPlayers.includes(p) && !['K', 'P'].includes(p.position))
                .sort((a, b) => {
                    const aScore = a.attributes.speed + a.attributes.blocking + a.attributes.awareness;
                    const bScore = b.attributes.speed + b.attributes.blocking + b.attributes.awareness;
                    return bScore - aScore;
                });

            returnerPlayers.push(...blockers.slice(0, 10));

        } else if (returnType === 'field_goal_defense' || returnType === 'extra_point_defense') {
            // Rushers para bloquear el pateo (jugadores rápidos y altos)
            const rushers = this.players
                .filter(p => ['DE', 'DT', 'OLB', 'ILB'].includes(p.position))
                .sort((a, b) => {
                    const aScore = a.attributes.speed + a.attributes.strength + a.attributes.agility;
                    const bScore = b.attributes.speed + b.attributes.strength + b.attributes.agility;
                    return bScore - aScore;
                });

            returnerPlayers.push(...rushers.slice(0, 6));

            // Defensive backs para cobertura y posible return
            const dbs = this.players
                .filter(p => ['CB', 'SS', 'FS'].includes(p.position))
                .sort((a, b) => (b.attributes.speed + b.attributes.agility) - (a.attributes.speed + a.attributes.agility));

            returnerPlayers.push(...dbs.slice(0, 5));
        }

        return new ReturnerTeam({
            teamName: this.name,
            players: returnerPlayers.slice(0, 11),
            unitType: 'special_teams',
            formation: returnType,
            returnerTeamType: returnType,
            coachingStaff: this.coachingStaff,
            teamworkProfiles: this.teamworkProfiles,
            teamworkSystem: this.teamworkSystem
        });
    }

    /**
     * El staff decide la formación y jugadores en campo
     */
    public selectPlayersForField(
        unitType: 'offensive' | 'defensive' | 'special_teams',
        situation: {
            down?: number;
            yardsToGo?: number;
            fieldPosition?: number;
            timeRemaining?: number;
            scoreDifference?: number;
            specialPlay?: 'kickoff' | 'punt' | 'field_goal' | 'extra_point' | 'return';
        }
    ): OffensiveTeam | DefensiveTeam | KickerTeam | ReturnerTeam {
        if (unitType === 'offensive') {
            // El coordinador ofensivo decide la formación
            let formation = 'standard';

            if (situation.yardsToGo && situation.yardsToGo >= 7) {
                formation = 'spread'; // Más receivers para pases largos
            } else if (situation.yardsToGo && situation.yardsToGo <= 2) {
                formation = 'heavy'; // Más tight ends para carrera
            } else if (situation.timeRemaining && situation.timeRemaining < 120) {
                formation = 'four_wide'; // Más opciones de pase
            }

            return this.createOffensiveUnit(formation);

        } else if (unitType === 'defensive') {
            // El coordinador defensivo decide la formación
            let formation = '4-3';

            if (situation.yardsToGo && situation.yardsToGo >= 7) {
                formation = '4-2-5'; // Más defensive backs contra pase
            } else if (situation.yardsToGo && situation.yardsToGo <= 2) {
                formation = '4-3'; // Formación estándar contra carrera
            }

            return this.createDefensiveUnit(formation);

        } else {
            // Equipos especiales - usar las nuevas clases especializadas
            const specialPlay = situation.specialPlay || 'kickoff';
            
            if (specialPlay === 'return') {
                // Crear unidad de retorno (por defecto kickoff return)
                return this.createReturnerTeam('kickoff_return');
            } else if (specialPlay === 'kickoff' || specialPlay === 'punt' || specialPlay === 'field_goal' || specialPlay === 'extra_point') {
                // Crear unidad de pateo
                return this.createKickerTeam(specialPlay);
            } else {
                // Fallback - crear unidad de kickoff por defecto
                return this.createKickerTeam('kickoff');
            }
        }
    }

    /**
     * Obtiene los atributos completos del equipo basados en las unidades que puede formar
     */
    public getCompleteTeamAttributes() {
        // Crear unidades estándar para calcular atributos
        const standardOffense = this.createOffensiveUnit('standard');
        const standardDefense = this.createDefensiveUnit('4-3');
        const nickelDefense = this.createDefensiveUnit('4-2-5');
        // Special Teams - Unidades de pateo (KickerTeam)
        const kickoffUnit = this.createKickerTeam('kickoff');
        const puntUnit = this.createKickerTeam('punt');
        const fieldGoalUnit = this.createKickerTeam('field_goal');
        
        // Special Teams - Unidades de retorno/defensa (ReturnerTeam)
        const kickoffReturnUnit = this.createReturnerTeam('kickoff_return');
        const puntReturnUnit = this.createReturnerTeam('punt_return');

        // Calcular atributos ofensivos
        const offenseAttrs = standardOffense.getOffensiveAttributes();

        const offensiveAttributes = {
            powerRunBlocking: offenseAttrs.powerRunBlocking,
            zoneBlockingAgility: offenseAttrs.zoneBlockingAgility,
            passingAccuracy: offenseAttrs.passingAccuracy,
            receiverSeparation: offenseAttrs.receiverSeparation,
            breakawayAbility: offenseAttrs.breakawayAbility,
            passProtectionAnchor: offenseAttrs.passProtectionAnchor,
            thirdDownConversion: offenseAttrs.thirdDownConversion,
            redZoneEfficiency: offenseAttrs.redZoneEfficiency
        };

        // Calcular atributos defensivos promedio
        const defenseAttrs = standardDefense.getDefensiveAttributes();
        const nickelAttrs = nickelDefense.getDefensiveAttributes();

        const defensiveAttributes = {
            runFitDiscipline: defenseAttrs.runFitDiscipline,
            tacklesForLoss: defenseAttrs.tacklesForLoss,
            zoneCoverageCoordination: (defenseAttrs.zoneCoverageCoordination + nickelAttrs.zoneCoverageCoordination) / 2,
            turnoverGeneration: (defenseAttrs.turnoverGeneration + nickelAttrs.turnoverGeneration) / 2,
            fourManRushPressure: defenseAttrs.fourManRushPressure,
            pressManCoverage: (defenseAttrs.pressManCoverage + nickelAttrs.pressManCoverage) / 2,
            redZoneDefense: defenseAttrs.redZoneDefense
        };

        // Calcular atributos de equipos especiales usando las nuevas clases especializadas
        const kickoffKickingAttrs = kickoffUnit.getKickingAttributes();
        const puntKickingAttrs = puntUnit.getKickingAttributes();
        const fieldGoalKickingAttrs = fieldGoalUnit.getKickingAttributes();
        
        const kickoffReturnAttrs = kickoffReturnUnit.getReturnerAttributes();
        const puntReturnAttrs = puntReturnUnit.getReturnerAttributes();

        const specialTeamsAttributes = {
            // Atributos de pateo (ofensivos)
            kickerRange: (kickoffKickingAttrs.kickerRange + fieldGoalKickingAttrs.kickerRange) / 2,
            kickerComposure: (kickoffKickingAttrs.kickerComposure + fieldGoalKickingAttrs.kickerComposure) / 2,
            punterPlacement: puntKickingAttrs.punterPlacement,
            punterHangTime: puntKickingAttrs.punterHangTime,
            
            // Atributos de retorno (defensivos)
            returnExplosiveness: (kickoffReturnAttrs.returnExplosiveness + puntReturnAttrs.returnExplosiveness) / 2,
            ballSecurity: (kickoffReturnAttrs.ballSecurity + puntReturnAttrs.ballSecurity) / 2,
            
            // Atributos de cobertura (mixtos)
            coverageSpeed: (kickoffKickingAttrs.coverageSpeed + puntKickingAttrs.coverageSpeed) / 2
        };

        return {
            offensive: offensiveAttributes,
            defensive: defensiveAttributes,
            specialTeams: specialTeamsAttributes,
            general: this.teamAttributes.attributes.general // Usar los atributos generales existentes
        };
    }

    // Métodos heredados de Team original para compatibilidad
    public getTeamSummary(): string {
        return this.teamAttributes.getTeamSummary();
    }

    public getOverallRating(): number {
        return this.teamAttributes.getOverallTeamRating();
    }

    public getOffensiveRating(): number {
        return this.teamAttributes.getOffensiveRating();
    }

    public getDefensiveRating(): number {
        return this.teamAttributes.getDefensiveRating();
    }

    public getSpecialTeamsRating(): number {
        return this.teamAttributes.getSpecialTeamsRating();
    }

    public getTeamStrengths() {
        return this.teamAttributes.getTeamStrengths();
    }

    public getTeamWeaknesses() {
        return this.teamAttributes.getTeamWeaknesses();
    }

    public compareWith(otherTeam: TeamMatch) {
        return this.teamAttributes.compareWith(otherTeam.teamAttributes);
    }

    public getDetailedTeamAnalysis() {
        let teamworkAnalysis;

        if (this.teamworkProfiles.length > 0 && Object.keys(this.teamworkSystem).length > 0) {
            const synergyMultiplier = require('./TeamworkAttributes').TeamSynergyCalculator
                .calculateTeamSynergyMultiplier(this.teamworkProfiles, this.coachingStaff.getAllCoaches(), this.teamworkSystem);

            teamworkAnalysis = {
                synergyMultiplier,
                fiveCs: this.teamworkSystem.fiveCs,
                teamPersonality: this.teamworkSystem.personality,
                cohesionFactors: this.teamworkSystem.cohesionFactors
            };
        }

        return {
            overallRating: this.getOverallRating(),
            offensiveRating: this.getOffensiveRating(),
            defensiveRating: this.getDefensiveRating(),
            specialTeamsRating: this.getSpecialTeamsRating(),
            strengths: this.getTeamStrengths(),
            weaknesses: this.getTeamWeaknesses(),
            keyAttributes: {
                clutchFactor: this.teamAttributes.attributes.general.clutchFactor,
                teamDiscipline: this.teamAttributes.attributes.general.teamDiscipline,
                resilience: this.teamAttributes.attributes.general.resilience,
                netTurnoverMargin: this.teamAttributes.attributes.general.netTurnoverMargin
            },
            teamworkAnalysis
        };
    }

    /**
     * Toma decisiones estratégicas usando el equipo técnico
     */
    public makeFourthDownDecision(
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number,
        scoreDifference: number
    ) {
        return this.coachingStaff.makeFourthDownDecision(yardsToGo, fieldPosition, timeRemaining, scoreDifference);
    }

    /**
     * Selecciona jugada ofensiva usando el coordinador ofensivo
     */
    public selectOffensivePlay(
        down: number,
        yardsToGo: number,
        fieldPosition: number,
        timeRemaining: number
    ) {
        return this.coachingStaff.selectOffensivePlay(down, yardsToGo, fieldPosition, timeRemaining);
    }

    /**
     * Selecciona esquema defensivo usando el coordinador defensivo
     */
    public selectDefensiveScheme(
        down: number,
        yardsToGo: number,
        fieldPosition: number
    ) {
        return this.coachingStaff.selectDefensiveScheme(down, yardsToGo, fieldPosition);
    }

    /**
     * Realiza ajustes de medio tiempo
     */
    public performHalftimeAdjustments() {
        const adjustments = this.coachingStaff.performHalftimeAdjustments();

        if (adjustments.overallImprovement > 0) {
            this.adjustMorale(Math.min(10, adjustments.overallImprovement));
        }

        return adjustments;
    }

    /**
     * Ajusta la moral del equipo
     */
    public adjustMorale(amount: number): void {
        this.morale = Math.max(0, Math.min(100, this.morale + amount));

        this.players.forEach(player => {
            player.confidence = Math.max(0, Math.min(100, player.confidence + amount / 2));
        });
    }
}

// Integración con sistema de Actions
import { RunningPlayAction, PassingPlayAction } from "../core/Actions";

/**
 * Extensiones del TeamMatch para trabajar con Actions
 */
export interface TeamMatchActionsExtensions {
    /**
     * Crea una acción ofensiva usando el staff técnico completo
     */
    createOffensiveAction(
        offense: TeamCamp,
        defense: TeamCamp,
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
            timeRemaining: number;
            scoreDifference: number;
        }
    ): {
        action: RunningPlayAction | PassingPlayAction;
        confidence: number;
        reasoning: string;
        staffAnalysis: {
            coordinator: string;
            headCoachApproval: boolean;
            teamChemistry: number;
            overallEffectiveness: number;
        };
    };

    /**
     * Evalúa una acción ofensiva antes de ejecutarla
     */
    evaluateOffensiveAction(
        action: RunningPlayAction | PassingPlayAction,
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
        }
    ): {
        successProbability: number;
        riskAssessment: 'low' | 'medium' | 'high';
        teamAttributeBonus: number;
        reasoning: string;
    };

    /**
     * Crea respuesta defensiva coordinada
     */
    createDefensiveResponse(
        offense: TeamCamp,
        defense: TeamCamp,
        expectedOffensiveAction: 'run' | 'pass' | 'play_action',
        situation: {
            down: number;
            yardsToGo: number;
            fieldPosition: number;
        }
    ): {
        adjustments: any;
        confidence: number;
        reasoning: string;
        teamBonus: number;
    };
}

declare module "./TeamMatch" {
    interface TeamMatch extends TeamMatchActionsExtensions { }
}

TeamMatch.prototype.createOffensiveAction = function (
    offense: TeamCamp,
    defense: TeamCamp,
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
        timeRemaining: number;
        scoreDifference: number;
    }
): {
    action: RunningPlayAction | PassingPlayAction;
    confidence: number;
    reasoning: string;
    staffAnalysis: {
        coordinator: string;
        headCoachApproval: boolean;
        teamChemistry: number;
        overallEffectiveness: number;
    };
} {
    // Usar el CoachingStaff para crear la action
    const staffDecision = this.coachingStaff.createOffensiveDecision(offense, defense, situation);

    // Aplicar bonus de atributos del equipo
    let teamBonus = 0;
    const teamAttrs = this.teamAttributes.attributes;

    // Bonus por atributos generales del equipo
    if (teamAttrs.general.clutchFactor > 75 && (situation.down >= 3 || situation.timeRemaining < 300)) {
        teamBonus += 5; // Equipo clutch en situaciones críticas
    }

    if (teamAttrs.general.teamDiscipline > 80) {
        teamBonus += 3; // Equipo disciplinado ejecuta mejor
    }

    // Bonus específicos por tipo de action
    if (staffDecision.action.actionType === 'running') {
        // Bonus para carreras basado en atributos de equipo
        const runBonus = (teamAttrs.offensive.powerRunBlocking + teamAttrs.offensive.zoneBlockingAgility) / 50;
        teamBonus += runBonus;
    } else if (staffDecision.action.actionType === 'passing') {
        // Bonus para pases basado en atributos de equipo
        const passBonus = (teamAttrs.offensive.passingAccuracy + teamAttrs.offensive.receiverSeparation) / 50;
        teamBonus += passBonus;
    }

    // Ajustar confianza con bonus del equipo
    const finalConfidence = Math.min(100, staffDecision.confidence + teamBonus);

    // Análisis del staff
    const staffAnalysis = {
        coordinator: staffDecision.staffDecision.coordinator,
        headCoachApproval: staffDecision.staffDecision.headCoachApproval,
        teamChemistry: this.coachingStaff.teamChemistry,
        overallEffectiveness: this.coachingStaff.getOverallEffectiveness()
    };

    return {
        action: staffDecision.action,
        confidence: finalConfidence,
        reasoning: `${staffDecision.reasoning} + Bonus equipo: ${teamBonus.toFixed(1)}`,
        staffAnalysis
    };
};

TeamMatch.prototype.evaluateOffensiveAction = function (
    action: RunningPlayAction | PassingPlayAction,
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
    }
): {
    successProbability: number;
    riskAssessment: 'low' | 'medium' | 'high';
    teamAttributeBonus: number;
    reasoning: string;
} {
    let baseProbability = 60; // Probabilidad base de éxito
    let teamBonus = 0;
    let reasoning = '';

    const teamAttrs = this.teamAttributes.attributes;

    if (action.actionType === 'running') {
        // Evaluar acción de carrera usando atributos de equipo
        baseProbability = 65; // Las carreras son más predecibles
        const runAction = action as RunningPlayAction;

        // Bonus por atributos ofensivos del equipo
        if (runAction.playType === 'power') {
            teamBonus += (teamAttrs.offensive.powerRunBlocking - 70) / 5;
            reasoning = `Carrera power - Bloqueo: ${teamAttrs.offensive.powerRunBlocking}`;
        } else {
            teamBonus += (teamAttrs.offensive.zoneBlockingAgility - 70) / 5;
            reasoning = `Carrera zone - Agilidad: ${teamAttrs.offensive.zoneBlockingAgility}`;
        }

        // Bonus por situación
        if (situation.yardsToGo <= 2 && runAction.playType === 'power') {
            teamBonus += 10; // Power run en yardas cortas
            reasoning += ' + Situación ideal para power';
        }

    } else if (action.actionType === 'passing') {
        // Evaluar acción de pase usando atributos de equipo
        const passAction = action as PassingPlayAction;
        baseProbability = passAction.completionProbability;

        // Bonus por atributos ofensivos del equipo
        teamBonus += (teamAttrs.offensive.passingAccuracy - 70) / 5;
        teamBonus += (teamAttrs.offensive.receiverSeparation - 70) / 8;

        reasoning = `Pase ${passAction.playType} - Precisión: ${teamAttrs.offensive.passingAccuracy}, Separación: ${teamAttrs.offensive.receiverSeparation}`;

        // Bonus por protección basado en complejidad de rutas
        if (passAction.routeDepth > 12) {
            teamBonus += (teamAttrs.offensive.passProtectionAnchor - 70) / 10;
            reasoning += ` + Protección: ${teamAttrs.offensive.passProtectionAnchor}`;
        }
    }

    // Bonus generales del equipo
    if (teamAttrs.general.clutchFactor > 75 && situation.down >= 3) {
        teamBonus += 8;
        reasoning += ' + Factor clutch';
    }

    if (teamAttrs.general.teamDiscipline > 80) {
        teamBonus += 3;
        reasoning += ' + Disciplina';
    }

    // Calcular probabilidad final
    const finalProbability = Math.max(20, Math.min(95, baseProbability + teamBonus));

    // Determinar nivel de riesgo
    let riskAssessment: 'low' | 'medium' | 'high';
    if (action.riskLevel === 'low' && finalProbability > 70) {
        riskAssessment = 'low';
    } else if (action.riskLevel === 'high' || finalProbability < 50) {
        riskAssessment = 'high';
    } else {
        riskAssessment = 'medium';
    }

    return {
        successProbability: finalProbability,
        riskAssessment,
        teamAttributeBonus: teamBonus,
        reasoning
    };
};

TeamMatch.prototype.createDefensiveResponse = function (
    offense: TeamCamp,
    defense: TeamCamp,
    expectedOffensiveAction: 'run' | 'pass' | 'play_action',
    situation: {
        down: number;
        yardsToGo: number;
        fieldPosition: number;
    }
): {
    adjustments: any;
    confidence: number;
    reasoning: string;
    teamBonus: number;
} {
    // Usar el CoachingStaff para crear la respuesta defensiva
    const staffResponse = this.coachingStaff.createDefensiveResponse(
        offense,
        defense,
        expectedOffensiveAction,
        situation
    );

    // Aplicar bonus de atributos defensivos del equipo
    let teamBonus = 0;
    const defAttrs = this.teamAttributes.attributes.defensive;

    if (expectedOffensiveAction === 'run') {
        // Bonus contra carrera
        teamBonus += (defAttrs.runFitDiscipline - 70) / 10;
        teamBonus += (defAttrs.tacklesForLoss - 70) / 15;
    } else {
        // Bonus contra pase
        teamBonus += (defAttrs.zoneCoverageCoordination - 70) / 10;
        teamBonus += (defAttrs.fourManRushPressure - 70) / 15;
    }

    // Bonus por generación de turnovers
    if (defAttrs.turnoverGeneration > 75) {
        teamBonus += 3;
    }

    // Aplicar bonus del equipo a los ajustes
    const finalAdjustments = [...staffResponse.adjustments];
    if (teamBonus > 0) {
        finalAdjustments.push(`team_bonus_${teamBonus.toFixed(1)}`);
    }

    return {
        adjustments: finalAdjustments,
        confidence: Math.min(100, staffResponse.confidence + teamBonus),
        reasoning: `${staffResponse.reasoning} + Bonus defensivo: ${teamBonus.toFixed(1)}`,
        teamBonus
    };
};