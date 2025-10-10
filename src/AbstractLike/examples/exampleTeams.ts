import { MTeam } from "../MTeam";

interface ICreateTeamOptions {}
export function createTeam(opts: ICreateTeamOptions): MTeam {
  return new MTeam();
}



export function showTeamStats(team: MTeam) {
  console.log(team)
}