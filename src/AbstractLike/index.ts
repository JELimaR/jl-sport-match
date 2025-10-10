import { MEngine } from "./MEngine";
import { createTeam, showTeamStats } from "./examples/exampleTeams";

export function runAsbtractGameSim() {
  console.log("SIMULADOR DE JUEGO ABSTRACTO");
  printLineSeparator()
  const team_X = createTeam({})
  showTeamStats(team_X)
  const team_Y = createTeam({})
  showTeamStats(team_Y)
  printLineSeparator()

  const engine = new MEngine({
    A: team_X,
    B: team_Y,
  })
  const speech = engine.runStep()
  console.log(speech)
}

function printLineSeparator() {
  console.log("=".repeat(60));
}

