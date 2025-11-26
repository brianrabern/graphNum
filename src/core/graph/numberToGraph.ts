/**
 * Convert number to canonical graph (no edges, pure multiset)
 */

import { Graph, Node, createNode, generateId } from "./graphTypes";
import { factorize } from "../math/factorization";
import { getColorForPrime } from "../math/colorMapping";

/**
 * Convert number to canonical graph
 * Returns graph with nodes arranged in grid layout, no edges
 */
export function numberToGraph(n: bigint | string | number): Graph {
  const num = typeof n === "bigint" ? n : BigInt(n);

  // Handle special cases
  if (num === 0n) {
    return { nodes: [], edges: [] };
  }

  if (num === 1n) {
    return {
      nodes: [createNode(generateId("node"), "white", 0, 0)],
      edges: [],
    };
  }

  // Factor the number
  const factors = factorize(num);

  // Filter out the 1 factor if present
  const primeFactors = factors.filter((f) => f.prime !== 1n);

  if (primeFactors.length === 0) {
    return {
      nodes: [createNode(generateId("node"), "white", 0, 0)],
      edges: [],
    };
  }

  // Create nodes for each prime factor
  const nodes: Node[] = [];
  let xOffset = 0;
  const nodeSpacing = 40;
  const verticalSpacing = 50;
  let currentY = 0;

  // Group by prime and arrange vertically (each node on its own row)
  for (const factor of primeFactors) {
    const color = getColorForPrime(Number(factor.prime));

    for (let i = 0; i < factor.exponent; i++) {
      const x = xOffset;
      const y = currentY;

      nodes.push(createNode(generateId("node"), color, x, y));
      currentY += verticalSpacing;
    }

    // Add spacing between prime groups
    xOffset += nodeSpacing + 30;
  }

  return {
    nodes,
    edges: [], // Canonical = no edges
  };
}
