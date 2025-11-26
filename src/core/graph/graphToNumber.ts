/**
 * Convert graph to number (projection: count nodes, ignore edges)
 * Based on revelation.tex: number = ∏ p^(#nodes of color p)
 */

import { Graph } from "./graphTypes";
import { getPrimeForColor } from "../math/colorMapping";
import { formatFactorization, PrimeFactor } from "../math/factorization";

export interface GraphNumberResult {
  number: bigint;
  factorization: PrimeFactor[];
  factorizationString: string;
}

/**
 * Convert graph to number
 * Edges are ignored - they are intensional structure
 */
export function graphToNumber(graph: Graph): GraphNumberResult {
  // Count nodes by color
  const colorCounts = new Map<string, number>();

  for (const node of graph.nodes) {
    const count = colorCounts.get(node.color) || 0;
    colorCounts.set(node.color, count + 1);
  }

  // Handle special cases
  if (graph.nodes.length === 0) {
    return {
      number: 0n,
      factorization: [],
      factorizationString: "0",
    };
  }

  // Check if all nodes are white/gray (they all represent 1, so result is 1)
  const allWhiteOrGray = graph.nodes.every(
    (node) => node.color === "white" || node.color === "gray"
  );
  if (allWhiteOrGray) {
    return {
      number: 1n,
      factorization: [{ prime: 1n, exponent: 1 }],
      factorizationString: "1",
    };
  }

  // Build prime factors from color counts
  const factors: PrimeFactor[] = [];

  for (const [color, count] of colorCounts.entries()) {
    const prime = getPrimeForColor(color);

    if (prime === undefined) {
      console.warn(`Unknown color: ${color}`);
      continue;
    }

    // Skip white/gray nodes in the product (they represent 1)
    if (prime === 1) {
      continue;
    }

    if (count > 0) {
      factors.push({
        prime: BigInt(prime),
        exponent: count,
      });
    }
  }

  // Compute number
  let number = 1n;
  for (const factor of factors) {
    for (let i = 0; i < factor.exponent; i++) {
      number *= factor.prime;
    }
  }

  // Sort factors by prime (descending)
  factors.sort((a, b) => {
    if (a.prime > b.prime) return -1;
    if (a.prime < b.prime) return 1;
    return 0;
  });

  return {
    number,
    factorization: factors,
    factorizationString: formatFactorization(factors),
  };
}
