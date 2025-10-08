
export interface IConnection {
  target: GameNode;
  distance: number; // Nueva propiedad: la distancia entre los dos nodos
}

export interface IPosition {
  x: number;
  y: number;
}

export interface Tower {
  team: 'Alpha' | 'Beta';
  health: number;
  attack: number;
  rangeNodes: string[];
}

export class GameNode {
  id: string;
  type: 'Lane' | 'Jungle' | 'Base';
  laneId: number | null; // 1, 2, 3 para carriles; null para jungla/base
  position: IPosition;
  tower?: Tower;
  // connections: Set<GameNode> = new Set<GameNode>();
  connections: IConnection[] = []; // Cambiamos el tipo de array

  constructor(id: string, type: 'Lane' | 'Jungle' | 'Base', laneId: number | null = null, position: IPosition = { x: 0, y: 0 }, tower: Tower | undefined = undefined) {
    this.id = id;
    this.type = type;
    this.laneId = laneId;
    this.position = position; // Asignamos la posición
    this.tower = tower;
  }

  addConnection(connection: IConnection) {
    this.connections.push(connection);
  }
}
