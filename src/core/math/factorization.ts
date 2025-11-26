/**
 * Prime factorization utilities using BigInt
 */

export interface PrimeFactor {
  prime: bigint;
  exponent: number;
}

/**
 * Factor a number into its prime factors
 * Returns array of {prime, exponent} pairs
 */
export function factorize(n: bigint): PrimeFactor[] {
  if (n === 0n) {
    return [];
  }

  if (n === 1n) {
    return [{ prime: 1n, exponent: 1 }];
  }

  const factors: PrimeFactor[] = [];
  let num = n < 0n ? -n : n; // Handle negative numbers

  // Handle 2 separately
  let count = 0;
  while (num % 2n === 0n) {
    num /= 2n;
    count++;
  }
  if (count > 0) {
    factors.push({ prime: 2n, exponent: count });
  }

  // Check odd factors
  for (let i = 3n; i * i <= num; i += 2n) {
    count = 0;
    while (num % i === 0n) {
      num /= i;
      count++;
    }
    if (count > 0) {
      factors.push({ prime: i, exponent: count });
    }
  }

  // If num is still > 1, it's a prime
  if (num > 1n) {
    factors.push({ prime: num, exponent: 1 });
  }

  return factors;
}

/**
 * Format factorization as string (e.g., "2² × 3² × 5¹")
 */
export function formatFactorization(factors: PrimeFactor[]): string {
  if (factors.length === 0) {
    return "0";
  }

  if (factors.length === 1 && factors[0].prime === 1n) {
    return "1";
  }

  const superscripts = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

  return factors
    .filter((f) => f.prime !== 1n)
    .map((f) => {
      let exp = "";
      if (f.exponent < 10) {
        exp = superscripts[f.exponent] || `^${f.exponent}`;
      } else {
        // For exponents >= 10, convert each digit
        exp = f.exponent
          .toString()
          .split("")
          .map((d) => superscripts[parseInt(d)] || d)
          .join("");
      }
      return `${f.prime}${exp}`;
    })
    .join(" × ");
}

/**
 * Reconstruct number from prime factors
 */
export function reconstructNumber(factors: PrimeFactor[]): bigint {
  if (factors.length === 0) {
    return 0n;
  }

  let result = 1n;
  for (const factor of factors) {
    for (let i = 0; i < factor.exponent; i++) {
      result *= factor.prime;
    }
  }

  return result;
}
