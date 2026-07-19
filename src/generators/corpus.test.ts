import { describe, expect, it } from 'vitest'
import { RNG } from '../lib/rng'
import { checkAntiderivative, checkAnswer } from '../lib/checker'
import { TECHNIQUES } from './index'

/**
 * Corpus self-test: for every technique, generate many seeded problems and
 * verify that the exemplar solution really is an antiderivative of the
 * integrand (numerically, on the problem's own domain). This is the same
 * check applied to user answers, so it also exercises the checker.
 */
const RUNS = 300

describe.each(TECHNIQUES.map((t) => [t.id, t] as const))('technique %s', (_id, tech) => {
  it('every generated exemplar solution differentiates back to the integrand', () => {
    for (let seed = 1; seed <= RUNS; seed++) {
      const rng = new RNG(seed * 2654435761)
      const p = tech.generate(rng)
      const res = checkAntiderivative(p.solution, p.integrand, p.domain)
      if (!res.ok) {
        throw new Error(
          `seed ${seed}: exemplar failed for ${p.latex}\nsolution: ${p.solutionLatex}\nvalid points: ${res.validPoints}`,
        )
      }
    }
  })

  it('a plainly wrong answer is rejected', () => {
    const rng = new RNG(1234567)
    const p = tech.generate(rng)
    const res = checkAntiderivative((x) => p.solution(x) + 0.5 * x, p.integrand, p.domain)
    expect(res.ok).toBe(false)
  })
})

describe('answer parsing pipeline', () => {
  const integrand = (x: number) => x * Math.exp(x * x)
  const domain: [number, number] = [-1.4, 1.4]

  it('accepts calculator syntax with implicit multiplication and + C', () => {
    expect(checkAnswer('e^(x^2)/2 + C', integrand, domain).ok).toBe(true)
    expect(checkAnswer('(1/2)e^(x^2)', integrand, domain).ok).toBe(true)
    expect(checkAnswer('0.5exp(x^2)', integrand, domain).ok).toBe(true)
  })

  it('accepts alternative-but-equivalent forms', () => {
    // differs by a constant
    expect(checkAnswer('e^(x^2)/2 + 17', integrand, domain).ok).toBe(true)
  })

  it('accepts ln| | notation and arc-function aliases', () => {
    const g = (x: number) => 1 / x
    expect(checkAnswer('ln|x|', g, [0.3, 4]).ok).toBe(true)
    const h = (x: number) => 1 / (1 + x * x)
    expect(checkAnswer('arctan(x)', h, [-2, 2]).ok).toBe(true)
  })

  it('rejects the integrand itself with a specific message', () => {
    const v = checkAnswer('x e^(x^2)', integrand, domain)
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.code).toBe('integrand')
  })

  it('rejects wrong answers and garbage', () => {
    expect(checkAnswer('e^(x^2)', integrand, domain).ok).toBe(false)
    expect(checkAnswer('x^2/2', integrand, domain).ok).toBe(false)
    expect(checkAnswer('foo(x)', integrand, domain).ok).toBe(false)
    expect(checkAnswer('', integrand, domain).ok).toBe(false)
  })
})
