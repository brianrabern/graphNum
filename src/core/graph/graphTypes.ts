/**
 * Graph data structures
 */

export interface Node {
  id: string;
  color: string; // color name matching revelation.tex mapping
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string; // node id
  target: string; // node id
}

export interface Graph {
  nodes: Node[];
  edges: Edge[]; // intensional structure - doesn't affect number
}

/**
 * Create a new node
 */
export function createNode(
  id: string,
  color: string,
  x: number = 0,
  y: number = 0
): Node {
  return { id, color, x, y };
}

/**
 * Create a new edge
 */
export function createEdge(id: string, source: string, target: string): Edge {
  return { id, source, target };
}

/**
 * Generate a unique ID
 */
let idCounter = 0;
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}
