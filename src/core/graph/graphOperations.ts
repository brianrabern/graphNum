/**
 * Graph operations from revelation.tex
 * Operations on graphs that correspond to arithmetic operations
 */

import { Graph, Edge, createNode, createEdge, generateId } from './graphTypes';
import { graphToNumber } from './graphToNumber';
import { numberToGraph } from './numberToGraph';
import { PrimeFactor } from '../math/factorization';

/**
 * Connect nodes in a grid/square pattern
 * Arranges nodes in a grid and connects them horizontally and vertically
 */
function connectNodesInGrid(graph: Graph): Graph {
  if (graph.nodes.length === 0 || graph.nodes.length === 1) {
    return graph;
  }

  // Arrange nodes vertically - each node gets a unique Y coordinate
  // Nodes can share X coordinates (be in columns) but must have different Y
  const verticalSpacing = 50;
  const baseX = 0; // All nodes start at same X, or can be grouped by color

  // Assign unique Y positions - ensure no two nodes share the same Y coordinate
  const nodesWithUniquePositions = graph.nodes.map((node, index) => ({
    ...node,
    y: index * verticalSpacing,
    x: baseX, // All nodes in same column, or could group by color if needed
  }));

  // Create edges connecting consecutive nodes
  const edges: Edge[] = [];

  // Connect each node to the next one
  for (let i = 0; i < nodesWithUniquePositions.length - 1; i++) {
    edges.push(createEdge(
      generateId('edge'),
      nodesWithUniquePositions[i].id,
      nodesWithUniquePositions[i + 1].id
    ));
  }

  return {
    nodes: nodesWithUniquePositions,
    edges: edges,
  };
}

/**
 * Star operation (multiplication): Creates a connected graph combining both graphs
 * The result represents the product (multiplication) of the two numbers
 * Special case: multiplying by 1 (white node) returns the other graph unchanged
 */
export function starOperation(graph1: Graph, graph2: Graph): Graph {
  // Get numbers from graphs to check for special cases
  const num1 = graphToNumber(graph1).number;
  const num2 = graphToNumber(graph2).number;

  // Ensure all nodes have unique Y coordinates
  const verticalSpacing = 50;
  const horizontalSpacing = 40;

  // Special case: if one graph is 0 (empty), return empty graph (0 * anything = 0)
  if (num1 === 0n || num2 === 0n) {
    return { nodes: [], edges: [] };
  }

  // Special case: if one graph is 1 (white node), return the other graph
  // Special case: if both graphs are 1, return white node (1 * 1 = 1)
  if (num1 === 1n && num2 === 1n) {
    return { nodes: [createNode(generateId('node'), 'white', 0, 0)], edges: [] };
  }

  if (num1 === 1n) {
    // Return graph2 with new IDs to avoid conflicts, ensuring unique Y coordinates
    const idMap = new Map<string, string>();
    const newNodes = graph2.nodes.map((node, index) => {
      const newId = generateId('node');
      idMap.set(node.id, newId);
      return createNode(newId, node.color, 0, index * verticalSpacing);
    });
    const newEdges = graph2.edges.map(edge => {
      const newSource = idMap.get(edge.source) || edge.source;
      const newTarget = idMap.get(edge.target) || edge.target;
      return createEdge(generateId('edge'), newSource, newTarget);
    });
    return { nodes: newNodes, edges: newEdges };
  }

  if (num2 === 1n) {
    // Return graph1 with new IDs to avoid conflicts, ensuring unique Y coordinates
    const idMap = new Map<string, string>();
    const newNodes = graph1.nodes.map((node, index) => {
      const newId = generateId('node');
      idMap.set(node.id, newId);
      return createNode(newId, node.color, 0, index * verticalSpacing);
    });
    const newEdges = graph1.edges.map(edge => {
      const newSource = idMap.get(edge.source) || edge.source;
      const newTarget = idMap.get(edge.target) || edge.target;
      return createEdge(generateId('edge'), newSource, newTarget);
    });
    return { nodes: newNodes, edges: newEdges };
  }

  // For non-1 cases, create a connected graph combining both
  // Ensure all nodes have unique Y coordinates

  // Map old IDs to new IDs to avoid conflicts
  const idMap1 = new Map<string, string>();
  const idMap2 = new Map<string, string>();

  // Assign unique Y coordinates to all nodes
  let yIndex = 0;
  const newNodes1 = graph1.nodes.map(node => {
    const newId = generateId('node');
    idMap1.set(node.id, newId);
    return createNode(newId, node.color, 0, yIndex++ * verticalSpacing);
  });

  const newNodes2 = graph2.nodes.map(node => {
    const newId = generateId('node');
    idMap2.set(node.id, newId);
    return createNode(newId, node.color, horizontalSpacing, yIndex++ * verticalSpacing);
  });

  // Create new edges with updated node IDs
  const newEdges1 = graph1.edges.map(edge => {
    const newSource = idMap1.get(edge.source) || edge.source;
    const newTarget = idMap1.get(edge.target) || edge.target;
    return createEdge(generateId('edge'), newSource, newTarget);
  });

  const newEdges2 = graph2.edges.map(edge => {
    const newSource = idMap2.get(edge.source) || edge.source;
    const newTarget = idMap2.get(edge.target) || edge.target;
    return createEdge(generateId('edge'), newSource, newTarget);
  });

  // Combine all nodes and edges
  const allNodes = [...newNodes1, ...newNodes2];
  const allEdges = [...newEdges1, ...newEdges2];

  // Add connecting edges between the two graphs to make it connected
  // Connect each graph's nodes to create a bridge between the graphs
  if (newNodes1.length > 0 && newNodes2.length > 0) {
    // Connect the first node of graph1 to the first node of graph2
    const bridgeEdge = createEdge(
      generateId('edge'),
      newNodes1[0].id,
      newNodes2[0].id
    );
    allEdges.push(bridgeEdge);

    // If there are multiple nodes, add more connections for better connectivity
    if (newNodes1.length > 1 && newNodes2.length > 1) {
      const bridgeEdge2 = createEdge(
        generateId('edge'),
        newNodes1[newNodes1.length - 1].id,
        newNodes2[newNodes2.length - 1].id
      );
      allEdges.push(bridgeEdge2);
    }
  }

  return {
    nodes: allNodes,
    edges: allEdges,
  };
}

/**
 * Dagger operation (addition): Constructs a new graph matching the sum
 * The result is a connected graph (edges added to connect all nodes)
 */
export function daggerOperation(graph1: Graph, graph2: Graph): Graph {
  // Get numbers from graphs
  const num1 = graphToNumber(graph1).number;
  const num2 = graphToNumber(graph2).number;

  // Add the numbers
  const sum = num1 + num2;

  // Convert sum back to canonical graph
  const resultGraph = numberToGraph(sum);

  // If result is 0 (empty graph), return it as-is
  if (resultGraph.nodes.length === 0) {
    return resultGraph;
  }

  // Make the graph connected in a grid pattern
  return connectNodesInGrid(resultGraph);
}

/**
 * GCD operation: Takes minimum of exponents for each prime
 */
export function gcdOperation(graph1: Graph, graph2: Graph): Graph {
  const num1 = graphToNumber(graph1);
  const num2 = graphToNumber(graph2);

  // Special case: if one is 0, GCD is the other number (GCD(0, n) = n for n > 0)
  // If both are 0, GCD is 0
  if (num1.number === 0n) {
    return num2.number === 0n
      ? { nodes: [], edges: [] }
      : numberToGraph(num2.number);
  }
  if (num2.number === 0n) {
    return numberToGraph(num1.number);
  }

  // Get prime factors
  const factors1 = new Map<bigint, number>();
  num1.factorization.forEach(f => {
    if (f.prime !== 1n) {
      factors1.set(f.prime, f.exponent);
    }
  });

  const factors2 = new Map<bigint, number>();
  num2.factorization.forEach(f => {
    if (f.prime !== 1n) {
      factors2.set(f.prime, f.exponent);
    }
  });

  // Find common primes and take minimum exponent
  const gcdFactors: PrimeFactor[] = [];
  const allPrimes = new Set([...factors1.keys(), ...factors2.keys()]);

  for (const prime of allPrimes) {
    const exp1 = factors1.get(prime) || 0;
    const exp2 = factors2.get(prime) || 0;
    const minExp = Math.min(exp1, exp2);

    if (minExp > 0) {
      gcdFactors.push({ prime, exponent: minExp });
    }
  }

  // Convert to number and then to graph
  if (gcdFactors.length === 0) {
    // GCD is 1, return white node for consistency
    return { nodes: [createNode(generateId('node'), 'white', 0, 0)], edges: [] };
  }

  let gcdNumber = 1n;
  for (const factor of gcdFactors) {
    for (let i = 0; i < factor.exponent; i++) {
      gcdNumber *= factor.prime;
    }
  }

  const resultGraph = numberToGraph(gcdNumber);

  // Make the graph connected in a grid pattern
  return connectNodesInGrid(resultGraph);
}

/**
 * LCM operation: Takes maximum of exponents for each prime
 */
export function lcmOperation(graph1: Graph, graph2: Graph): Graph {
  const num1 = graphToNumber(graph1);
  const num2 = graphToNumber(graph2);

  // Special case: if one is 0, LCM is 0 (LCM(0, n) = 0)
  if (num1.number === 0n || num2.number === 0n) {
    return { nodes: [], edges: [] };
  }

  // Get prime factors
  const factors1 = new Map<bigint, number>();
  num1.factorization.forEach(f => {
    if (f.prime !== 1n) {
      factors1.set(f.prime, f.exponent);
    }
  });

  const factors2 = new Map<bigint, number>();
  num2.factorization.forEach(f => {
    if (f.prime !== 1n) {
      factors2.set(f.prime, f.exponent);
    }
  });

  // Take maximum exponent for each prime
  const lcmFactors: PrimeFactor[] = [];
  const allPrimes = new Set([...factors1.keys(), ...factors2.keys()]);

  for (const prime of allPrimes) {
    const exp1 = factors1.get(prime) || 0;
    const exp2 = factors2.get(prime) || 0;
    const maxExp = Math.max(exp1, exp2);

    if (maxExp > 0) {
      lcmFactors.push({ prime, exponent: maxExp });
    }
  }

  // Convert to number and then to graph
  if (lcmFactors.length === 0) {
    return { nodes: [createNode(generateId('node'), 'white', 0, 0)], edges: [] }; // LCM is 1
  }

  let lcmNumber = 1n;
  for (const factor of lcmFactors) {
    for (let i = 0; i < factor.exponent; i++) {
      lcmNumber *= factor.prime;
    }
  }

  const resultGraph = numberToGraph(lcmNumber);

  // Make the graph connected in a grid pattern
  return connectNodesInGrid(resultGraph);
}
