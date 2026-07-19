/** Small deterministic PRNG (mulberry32) so problem generation is seedable and testable. */
export class RNG {
  private s: number

  constructor(seed: number) {
    this.s = seed >>> 0
  }

  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0
    let t = this.s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Uniform integer in [a, b] inclusive. */
  int(a: number, b: number): number {
    return a + Math.floor(this.next() * (b - a + 1))
  }

  nonzeroInt(a: number, b: number): number {
    let v = 0
    do {
      v = this.int(a, b)
    } while (v === 0)
    return v
  }

  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }

  sign(): number {
    return this.next() < 0.5 ? -1 : 1
  }
}
