
import { GameNode, Tower } from './node';
// Asume que las importaciones de { Node, Tower } desde './node' están correctas.

/**
 * Define la estructura del campo de batalla (el mapa).
 */
export class GameCamp {
  // Uso de Map<string, Node> para gestión limpia de nodos
  nodes: Map<string, GameNode> = new Map<string, GameNode>();
  private TEAMS = ['Alpha', 'Beta'] as const;

  constructor() {
    this.initializeMap();
  }

  private initializeMap() {

    // ----------------------------------------------------
    // A. CREAR NODOS DE BASE
    // ----------------------------------------------------
    // BASE_A: Izquierda (X negativo)
    const baseA = new GameNode('BASE_A', 'Base', null, { x: -26, y: 0 }, this.createTower('BASE_A', 'Alpha', 50000, 850));

    // BASE_B: Derecha (X positivo)
    const baseB = new GameNode('BASE_B', 'Base', null, { x: 26, y: 0 }, this.createTower('BASE_A', 'Beta', 50000, 850));
    this.nodes.set(baseA.id, baseA);
    this.nodes.set(baseB.id, baseB);

    // ----------------------------------------------------
    // B. CREAR CARRILES Y NODOS NEUTRALES (LÍNEAS SIMPLES CON { x: 0, y: 0 })
    // ----------------------------------------------------
    let laneNodes: GameNode[] = [

      // --- Carril 1 (Top Lane) ---
      new GameNode('L1_T1_A', 'Lane', 1, { x: -21, y: 8 }, this.createTower('L1_T1_A', 'Alpha', 15000, 200)),
      new GameNode('L1_T2_A', 'Lane', 1, { x: -15, y: 12 }, this.createTower('L1_T2_A', 'Alpha', 12000, 150)),
      new GameNode('L1_T3_A', 'Lane', 1, { x: -7, y: 15 }, this.createTower('L1_T3_A', 'Alpha', 12000, 150)),
      new GameNode('L1_N_MID', 'Lane', 1, { x: 0, y: 16 }),
      new GameNode('L1_T3_B', 'Lane', 1, { x: 7, y: 15 }, this.createTower('L1_T3_B', 'Beta', 12000, 150)),
      new GameNode('L1_T2_B', 'Lane', 1, { x: 15, y: 12 }, this.createTower('L1_T2_B', 'Beta', 12000, 150)),
      new GameNode('L1_T1_B', 'Lane', 1, { x: 21, y: 8 }, this.createTower('L1_T1_B', 'Beta', 15000, 200)),

      // --- Carril 2 (Mid Lane) ---
      new GameNode('L2_T1_A', 'Lane', 2, { x: -19, y: 0 }, this.createTower('L2_T1_A', 'Alpha', 15000, 200)),
      new GameNode('L2_T2_A', 'Lane', 2, { x: -12, y: 0 }, this.createTower('L2_T2_A', 'Alpha', 12000, 150)),
      new GameNode('L2_T3_A', 'Lane', 2, { x:  -6, y: 0 }, this.createTower('L2_T3_A', 'Alpha', 12000, 150)),
      new GameNode('L2_N_MID', 'Lane', 2, { x:  0, y: 0 }),
      new GameNode('L2_T3_B', 'Lane', 2, { x:   6, y: 0 }, this.createTower('L2_T3_B', 'Beta', 12000, 150)),
      new GameNode('L2_T2_B', 'Lane', 2, { x:  12, y: 0 }, this.createTower('L2_T2_B', 'Beta', 12000, 150)),
      new GameNode('L2_T1_B', 'Lane', 2, { x:  19, y: 0 }, this.createTower('L2_T1_B', 'Beta', 15000, 200)),

      // --- Carril 3 (Bot Lane) ---
      new GameNode('L3_T1_A', 'Lane', 3, { x: -21, y: -8 }, this.createTower('L3_T1_A', 'Alpha', 15000, 200)),
      new GameNode('L3_T2_A', 'Lane', 3, { x: -15, y: -12 }, this.createTower('L3_T2_A', 'Alpha', 12000, 150)),
      new GameNode('L3_T3_A', 'Lane', 3, { x: -7, y: -15 }, this.createTower('L3_T3_A', 'Alpha', 12000, 150)),
      new GameNode('L3_N_MID', 'Lane', 3, { x: 0, y: -16 }),
      new GameNode('L3_T3_B', 'Lane', 3, { x: 7, y: -15 }, this.createTower('L3_T3_B', 'Beta', 12000, 150)),
      new GameNode('L3_T2_B', 'Lane', 3, { x: 15, y: -12 }, this.createTower('L3_T2_B', 'Beta', 12000, 150)),
      new GameNode('L3_T1_B', 'Lane', 3, { x: 21, y: -8 }, this.createTower('L3_T1_B', 'Beta', 15000, 200)),
    ];
    this.connectLinearly(laneNodes.slice(0, 7), baseA, baseB);
    this.connectLinearly(laneNodes.slice(7, 14), baseA, baseB);
    this.connectLinearly(laneNodes.slice(14, 22), baseA, baseB);
    laneNodes.forEach(N => this.nodes.set(N.id, N))

    // Obtener referencias de nodos de forma segura (usando .get())
    const get = (id: string) => this.nodes.get(id)!;

    // ----------------------------------------------------
    // C. CREAR Y CONECTAR 14 NODOS DE JUNGLA (Definición Final)
    // ----------------------------------------------------

    const jungleNodes = [
      // Mitad Superior (Y positiva, cerca de L1 y L2)
      // Alpha
      new GameNode('J_BUFF_TOP_A', 'Jungle', null, { x: -15, y: 6 }),
      new GameNode('J_FARM_A', 'Jungle', null, { x: -9, y: 8 }),
      new GameNode('J_GANK_TOP_A', 'Jungle', null, { x: -3, y: 11 }),
      // Centro
      new GameNode('J_CORE_TOP', 'Jungle', null, { x: 0, y: 6 }),
      // Beta
      new GameNode('J_GANK_TOP_B', 'Jungle', null, { x: 3, y: 11 }),
      new GameNode('J_FARM_B', 'Jungle', null, { x: 9, y: 8 }),
      new GameNode('J_BUFF_TOP_B', 'Jungle', null, { x: 15, y: 6 }),

      // Mitad Inferior (Y negativa, cerca de L2 y L3)
      // Alpha
      new GameNode('J_BUFF_BOT_A', 'Jungle', null, { x: -15, y: -6 }),
      new GameNode('J_EXP_A', 'Jungle', null, { x: -9, y: -8 }),
      new GameNode('J_GANK_BOT_A', 'Jungle', null, { x: -3, y: -11 }),
      // Centro
      new GameNode('J_CORE_BOT', 'Jungle', null, { x: 0, y: -6 }),
      // Beta
      new GameNode('J_GANK_BOT_B', 'Jungle', null, { x: 3, y: -11 }),
      new GameNode('J_EXP_B', 'Jungle', null, { x: 9, y: -8 }),
      new GameNode('J_BUFF_BOT_B', 'Jungle', null, { x: 15, y: -6 }),
    ];
    jungleNodes.forEach(node => this.nodes.set(node.id, node));

    // --- CONEXIONES INTERNAS DE LA JUNGLA ---

    // 1. Conexiones Lineales TOP (A hacia B)
    this.connectNodes(get('J_BUFF_TOP_A'), get('J_FARM_A'));
    this.connectNodes(get('J_FARM_A'), get('J_GANK_TOP_A'));
    this.connectNodes(get('J_FARM_A'), get('J_CORE_TOP'));
    this.connectNodes(get('J_GANK_TOP_A'), get('J_CORE_TOP'));
    this.connectNodes(get('J_GANK_TOP_A'), get('J_GANK_TOP_B'));
    this.connectNodes(get('J_CORE_TOP'), get('J_GANK_TOP_B'));
    this.connectNodes(get('J_CORE_TOP'), get('J_FARM_B'));
    this.connectNodes(get('J_GANK_TOP_B'), get('J_FARM_B'));
    this.connectNodes(get('J_FARM_B'), get('J_BUFF_TOP_B'));

    // 2. Conexiones Lineales BOT (A hacia B)
    this.connectNodes(get('J_BUFF_BOT_A'), get('J_EXP_A'));
    this.connectNodes(get('J_EXP_A'), get('J_GANK_BOT_A'));
    this.connectNodes(get('J_EXP_A'), get('J_CORE_BOT'));
    this.connectNodes(get('J_GANK_BOT_A'), get('J_CORE_BOT'));
    this.connectNodes(get('J_GANK_BOT_A'), get('J_GANK_BOT_B'));
    this.connectNodes(get('J_CORE_BOT'), get('J_GANK_BOT_B'));
    this.connectNodes(get('J_CORE_BOT'), get('J_EXP_B'));
    this.connectNodes(get('J_GANK_BOT_B'), get('J_EXP_B'));
    this.connectNodes(get('J_EXP_B'), get('J_BUFF_BOT_B'));

    // --- CONEXIONES JUNGLA A CARRILES (GANK POINTS) ---
    // 3. Conexiones TOP Lane
    this.connectNodes(get('L1_T1_A'), get('J_BUFF_TOP_A'));
    this.connectNodes(get('L1_T2_A'), get('J_BUFF_TOP_A'));
    this.connectNodes(get('L1_T2_A'), get('J_FARM_A'));
    this.connectNodes(get('L1_T3_A'), get('J_FARM_A'));
    this.connectNodes(get('L1_T3_A'), get('J_GANK_TOP_A'));

    this.connectNodes(get('L1_N_MID'), get('J_GANK_TOP_A'));
    this.connectNodes(get('L1_N_MID'), get('J_GANK_TOP_B'));

    this.connectNodes(get('L1_T3_B'), get('J_GANK_TOP_B'));
    this.connectNodes(get('L1_T3_B'), get('J_FARM_B'));
    this.connectNodes(get('L1_T2_B'), get('J_FARM_B'));
    this.connectNodes(get('L1_T2_B'), get('J_BUFF_TOP_B'));
    this.connectNodes(get('L1_T1_B'), get('J_BUFF_TOP_B'));

    // 4. Conexiones BOT Lane
    this.connectNodes(get('L3_T1_A'), get('J_BUFF_BOT_A'));
    this.connectNodes(get('L3_T2_A'), get('J_BUFF_BOT_A'));
    this.connectNodes(get('L3_T2_A'), get('J_EXP_A'));
    this.connectNodes(get('L3_T3_A'), get('J_EXP_A'));
    this.connectNodes(get('L3_T3_A'), get('J_GANK_BOT_A'));

    this.connectNodes(get('L3_N_MID'), get('J_GANK_BOT_A'));
    this.connectNodes(get('L3_N_MID'), get('J_GANK_BOT_B'));

    this.connectNodes(get('L3_T3_B'), get('J_GANK_BOT_B'));
    this.connectNodes(get('L3_T3_B'), get('J_EXP_B'));
    this.connectNodes(get('L3_T2_B'), get('J_EXP_B'));
    this.connectNodes(get('L3_T2_B'), get('J_BUFF_BOT_B'));
    this.connectNodes(get('L3_T1_B'), get('J_BUFF_BOT_B'));

    // 5. Conexiones MID Lane con TOP JUNGLE
    this.connectNodes(get('L2_T1_A'), get('J_BUFF_TOP_A'));
    this.connectNodes(get('L2_T2_A'), get('J_BUFF_TOP_A'));
    this.connectNodes(get('L2_T2_A'), get('J_FARM_A'));
    this.connectNodes(get('L2_T3_A'), get('J_FARM_A'));
    this.connectNodes(get('L2_T3_A'), get('J_CORE_TOP'));

    this.connectNodes(get('L2_N_MID'), get('J_CORE_TOP'));

    this.connectNodes(get('L2_T3_B'), get('J_CORE_TOP'));
    this.connectNodes(get('L2_T3_B'), get('J_FARM_B'));
    this.connectNodes(get('L2_T2_B'), get('J_FARM_B'));
    this.connectNodes(get('L2_T2_B'), get('J_BUFF_TOP_B'));
    this.connectNodes(get('L2_T1_B'), get('J_BUFF_TOP_B'));

    // 5. Conexiones MID Lane con BOT JUNGLE
    this.connectNodes(get('L2_T1_A'), get('J_BUFF_BOT_A'));
    this.connectNodes(get('L2_T2_A'), get('J_BUFF_BOT_A'));
    this.connectNodes(get('L2_T2_A'), get('J_EXP_A'));
    this.connectNodes(get('L2_T3_A'), get('J_EXP_A'));
    this.connectNodes(get('L2_T3_A'), get('J_CORE_BOT'));

    this.connectNodes(get('L2_N_MID'), get('J_CORE_BOT'));

    this.connectNodes(get('L2_T3_B'), get('J_CORE_BOT'));
    this.connectNodes(get('L2_T3_B'), get('J_EXP_B'));
    this.connectNodes(get('L2_T2_B'), get('J_EXP_B'));
    this.connectNodes(get('L2_T2_B'), get('J_BUFF_BOT_B'));
    this.connectNodes(get('L2_T1_B'), get('J_BUFF_BOT_B'));

    // ----------------------------------------------------
    // D. ESTABLECER ALCANCE DE TORRES
    // ----------------------------------------------------
    this.setTowerRanges();
  }

  private createTower(id: string, team: 'Alpha' | 'Beta', health: number, attack: number): Tower {
    return {
      team: team,
      health: health,
      attack: attack,
      rangeNodes: [id]
    };
  }

  // Conecta los nodos de un carril linealmente con sus bases
  private connectLinearly(laneNodes: GameNode[], baseA: GameNode, baseB: GameNode) {
    this.connectNodes(baseA, laneNodes[0]);

    for (let i = 0; i < laneNodes.length - 1; i++) {
      this.connectNodes(laneNodes[i], laneNodes[i + 1]);
    }

    this.connectNodes(baseB, laneNodes[laneNodes.length - 1]);
  }

  // Método de utilidad para crear conexiones bidireccionales
  private connectNodes(node1: GameNode, node2: GameNode) {
    // 1. Calcular la distancia euclidiana
    const dx = node2.position.x - node1.position.x;
    const dy = node2.position.y - node1.position.y;
    // Usamos Math.hypot para calcular la hipotenusa (distancia)
    const distance = Math.hypot(dx, dy);

    // 2. Crear las conexiones bidireccionales
    node1.addConnection({ target: node2, distance: distance });
    node2.addConnection({ target: node1, distance: distance });
  }

  // Define qué nodos son alcanzados por cada torre
  private setTowerRanges() {
    // La lógica de alcance de torres se mantiene simple (solo su propio nodo)
    // para cumplir con el requisito de que el nodo L_N_MID sea seguro.
  }

  // Permite obtener un nodo por ID (útil para la simulación)
  getNode(id: string): GameNode | undefined {
    return this.nodes.get(id);
  }
}