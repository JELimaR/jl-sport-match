// Players
export interface IMPlayer {
  attributes: IMPlayerAttributes;
}
export interface IMPlayerAttributes {}
// Coaches
export interface IMCoach {
  attributes: IMPlayerAttributes;
}
export interface IMCoachAttributes {}
export interface IMCoachingStaff {
  attributes: IMCoachingStaffAttributes;
}
export interface IMCoachingStaffAttributes {}
// equipo en el match
export interface IMTeam {}
// atributos generales (mejor unit? o de otra forma?)
export interface ITeamAttributes {}
// equipo en campo
export interface IMUnit {
  attributes: IUnitAttributes;
}
// atributos de equipo en campo
export interface IUnitAttributes {}
// ==========================================================================================================================
// 
// ==========================================================================================================================
// motor de simulacion
export interface IMEngine {
  A: IMTeam;
  B: IMTeam;
  state: IMState;
  eventHistory: IMEvent[];
  narrator: IMNarrator;
  runStep: () => TNarratorSpeech;
  isFinished: () => boolean;
}
// state
export interface IMState {}
//
export interface IMEvent {
  id: string;
  startState: IMState;
  endState: IMState;
}
//
export type TNarratorSpeech = string;
export interface IMNarrator {
  calc: (event: IMEvent) => TNarratorSpeech;
}