/**
 * Prime number utilities
 */

/**
 * Check if a number is prime
 */
export function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n === 2n) return true;
  if (n % 2n === 0n) return false;

  for (let i = 3n; i * i <= n; i += 2n) {
    if (n % i === 0n) return false;
  }

  return true;
}

/**
 * Generate primes up to a limit (for testing/utilities)
 */
export function generatePrimes(limit: number): number[] {
  const primes: number[] = [];
  const sieve = new Array(limit + 1).fill(true);

  for (let p = 2; p * p <= limit; p++) {
    if (sieve[p]) {
      for (let i = p * p; i <= limit; i += p) {
        sieve[i] = false;
      }
    }
  }

  for (let i = 2; i <= limit; i++) {
    if (sieve[i]) {
      primes.push(i);
    }
  }

  return primes;
}
