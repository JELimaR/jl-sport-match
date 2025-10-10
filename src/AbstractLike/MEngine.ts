import { IMEngine, IMEvent, IMNarrator, IMState, IMTeam, TNarratorSpeech } from "./interfaces/primaries";
interface IMEngineConfig {
  A: IMTeam;
B: IMTeam;
}
export class MEngine implements IMEngine {
  private _A: IMTeam;
  private _B: IMTeam;
  private _state: IMState;
  private _eventHistory: IMEvent[];
  private _narrator: IMNarrator;

  constructor(entry: IMEngineConfig) {
    this._A = entry.A;
    this._B = entry.B;
    this._state = {};
    this._eventHistory = [];
    this._narrator = {
      calc: (E: IMEvent) => {
        return `${E.id}`
      }
    };
  }

  get A(): IMTeam { return this._A }
  get B(): IMTeam { return this._B }
  get state(): IMState { return this._state }
  get eventHistory(): IMEvent[] { return this._eventHistory }
  get narrator(): IMNarrator { return this._narrator }
  runStep(): TNarratorSpeech {
    const event: IMEvent = {
      id: toPrecistion(this._eventHistory.length + 1, 4),
       startState: this._state,
       endState: {}
    };
    this._eventHistory.push(event);
    return this._narrator.calc(event);
    throw new Error(`Not implemented yet`)
  }
  isFinished(): boolean {
    throw new Error(`Not implemented yet`)
  }
}

function toPrecistion(num: number, digits: number) {
  return num.toString().padStart(digits, '0');
}