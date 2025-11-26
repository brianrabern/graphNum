/**
 * Examples from revelation.tex
 * Pre-loaded demonstrations of the machine operations
 */

import { Graph, createNode, createEdge, generateId } from '../core/graph/graphTypes';

export interface RevelationExample {
  id: string;
  title: string;
  description: string;
  slot1: Graph;
  slot2: Graph;
  operation: 'star' | 'dagger' | 'gcd' | 'lcm';
  expectedResult: Graph;
}

// Helper to create a simple graph
function simpleGraph(color: string, x: number = 0, y: number = 0): Graph {
  return {
    nodes: [createNode(generateId('node'), color, x, y)],
    edges: [],
  };
}

// Helper to create two connected nodes
function connectedGraph(color1: string, color2: string, x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 50): Graph {
  const node1Id = generateId('node');
  const node2Id = generateId('node');
  const node1 = createNode(node1Id, color1, x1, y1);
  const node2 = createNode(node2Id, color2, x2, y2);
  return {
    nodes: [node1, node2],
    edges: [createEdge(generateId('edge'), node1.id, node2.id)],
  };
}

// Helper to create multiple nodes of same color
function multiNodeGraph(color: string, count: number, startX: number = 0, startY: number = 0, spacing: number = 50): Graph {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(createNode(generateId('node'), color, startX, startY + i * spacing));
  }
  return { nodes, edges: [] };
}

export const revelationExamples: RevelationExample[] = [
  {
    id: 'example-1',
    title: 'Two white balls → red ball',
    description: 'Two white balls in the machine produced a red ball when the dagger button was pressed.',
    slot1: simpleGraph('white', 0, 0),
    slot2: simpleGraph('white', 0, 0),
    operation: 'dagger',
    expectedResult: simpleGraph('red', 0, 0),
  },
  {
    id: 'example-2',
    title: 'White + red → blue',
    description: 'A white and a red ball in the machine produced a blue ball when the dagger button was pressed.',
    slot1: simpleGraph('white', 0, 0),
    slot2: simpleGraph('red', 0, 0),
    operation: 'dagger',
    expectedResult: simpleGraph('blue', 0, 0),
  },
  {
    id: 'example-3',
    title: 'Red * blue → red and blue connected',
    description: 'A red and blue ball with star makes just joins the balls by a black bar.',
    slot1: simpleGraph('red', 0, 0),
    slot2: simpleGraph('blue', 0, 0),
    operation: 'star',
    expectedResult: connectedGraph('red', 'blue', 0, 0, 0, 50),
  },
  {
    id: 'example-4',
    title: 'Red * white → red',
    description: 'A red and white ball with star gives just a red ball.',
    slot1: simpleGraph('red', 0, 0),
    slot2: simpleGraph('white', 0, 0),
    operation: 'star',
    expectedResult: simpleGraph('red', 0, 0),
  },
  {
    id: 'example-5',
    title: 'Blue * white → blue',
    description: 'A blue and white ball with star gives just a blue ball.',
    slot1: simpleGraph('blue', 0, 0),
    slot2: simpleGraph('white', 0, 0),
    operation: 'star',
    expectedResult: simpleGraph('blue', 0, 0),
  },
  {
    id: 'example-6',
    title: 'Red * red → two reds connected',
    description: 'Two red balls with star makes two red balls connected.',
    slot1: simpleGraph('red', 0, 0),
    slot2: simpleGraph('red', 0, 0),
    operation: 'star',
    expectedResult: connectedGraph('red', 'red', 0, 0, 0, 50),
  },
  {
    id: 'example-7',
    title: 'Two reds connected + red+blue → red+green',
    description: 'Two red balls connected (dagger) with red+blue connected produces red+green connected.',
    slot1: connectedGraph('red', 'red', 0, 0, 0, 50),
    slot2: connectedGraph('red', 'blue', 0, 0, 0, 50),
    operation: 'dagger',
    expectedResult: connectedGraph('red', 'green', 0, 0, 0, 50),
  },
  {
    id: 'example-8',
    title: 'Red+green + white → cyan',
    description: 'Red+green connected (dagger) white produces cyan.',
    slot1: connectedGraph('red', 'green', 0, 0, 0, 50),
    slot2: simpleGraph('white', 0, 0),
    operation: 'dagger',
    expectedResult: simpleGraph('cyan', 0, 0),
  },
  {
    id: 'example-9',
    title: 'Green + cyan → four reds',
    description: 'Green (dagger) cyan produces four red balls connected.',
    slot1: simpleGraph('green', 0, 0),
    slot2: simpleGraph('cyan', 0, 0),
    operation: 'dagger',
    expectedResult: multiNodeGraph('red', 4, 0, 0, 50),
  },
  {
    id: 'example-10',
    title: 'Red+cyan+cyan + red+yellow → many reds',
    description: 'Some sort of splitting - produces many red balls.',
    slot1: (() => {
      const n1Id = generateId('node');
      const n2Id = generateId('node');
      const n3Id = generateId('node');
      const n1 = createNode(n1Id, 'red', 0, 0);
      const n2 = createNode(n2Id, 'cyan', 0, 50);
      const n3 = createNode(n3Id, 'cyan', 0, 100);
      return {
        nodes: [n1, n2, n3],
        edges: [
          createEdge(generateId('edge'), n1.id, n2.id),
          createEdge(generateId('edge'), n2.id, n3.id),
        ],
      };
    })(),
    slot2: connectedGraph('red', 'yellow', 0, 0, 0, 50),
    operation: 'dagger',
    expectedResult: multiNodeGraph('red', 8, 0, 0, 50),
  },
  {
    id: 'example-11',
    title: 'GCD: Red+cyan+cyan + red+yellow → red',
    description: 'Greatest common divisor example.',
    slot1: (() => {
      const n1Id = generateId('node');
      const n2Id = generateId('node');
      const n3Id = generateId('node');
      const n1 = createNode(n1Id, 'red', 0, 0);
      const n2 = createNode(n2Id, 'cyan', 0, 50);
      const n3 = createNode(n3Id, 'cyan', 0, 100);
      return {
        nodes: [n1, n2, n3],
        edges: [
          createEdge(generateId('edge'), n1.id, n2.id),
          createEdge(generateId('edge'), n2.id, n3.id),
        ],
      };
    })(),
    slot2: connectedGraph('red', 'yellow', 0, 0, 0, 50),
    operation: 'gcd',
    expectedResult: simpleGraph('red', 0, 0),
  },
  {
    id: 'example-12',
    title: 'LCM: Red+cyan+cyan + red+yellow → red+cyan+cyan+yellow',
    description: 'Least common multiple example.',
    slot1: (() => {
      const n1Id = generateId('node');
      const n2Id = generateId('node');
      const n3Id = generateId('node');
      const n1 = createNode(n1Id, 'red', 0, 0);
      const n2 = createNode(n2Id, 'cyan', 0, 50);
      const n3 = createNode(n3Id, 'cyan', 0, 100);
      return {
        nodes: [n1, n2, n3],
        edges: [
          createEdge(generateId('edge'), n1.id, n2.id),
          createEdge(generateId('edge'), n2.id, n3.id),
        ],
      };
    })(),
    slot2: connectedGraph('red', 'yellow', 0, 0, 0, 50),
    operation: 'lcm',
    expectedResult: (() => {
      const n1Id = generateId('node');
      const n2Id = generateId('node');
      const n3Id = generateId('node');
      const n4Id = generateId('node');
      const n1 = createNode(n1Id, 'red', 0, 0);
      const n2 = createNode(n2Id, 'cyan', 0, 50);
      const n3 = createNode(n3Id, 'cyan', 0, 100);
      const n4 = createNode(n4Id, 'yellow', 0, 150);
      return {
        nodes: [n1, n2, n3, n4],
        edges: [
          createEdge(generateId('edge'), n1.id, n2.id),
          createEdge(generateId('edge'), n2.id, n3.id),
          createEdge(generateId('edge'), n3.id, n4.id),
          createEdge(generateId('edge'), n4.id, n1.id),
        ],
      };
    })(),
  },
];
