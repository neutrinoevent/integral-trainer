import { intTex, linTex, quadTex } from '../lib/tex'
import type { Problem, Variant } from './types'
import type { RNG } from '../lib/rng'

/**
 * Completing the square: quadratics x² + 2bx + (b² + k²) with negative
 * discriminant, or k² − (x+b)² inside a square root.
 */

const shiftTex = (b: number) => linTex(1, b) // x + b

// ∫ dx/(x² + 2bx + c) = (1/k) arctan((x+b)/k), c = b² + k²
const rationalArctan: Variant = (rng) => {
  const b = rng.nonzeroInt(-4, 4)
  const k = rng.int(1, 4)
  const c = b * b + k * k
  const arg = k === 1 ? `${shiftTex(b)}` : `\\frac{${shiftTex(b)}}{${k}}`
  return {
    technique: 'compsq',
    latex: intTex(`\\frac{1}{${quadTex(2 * b, c)}}`),
    integrand: (x) => 1 / (x * x + 2 * b * x + c),
    domain: [-b - 2 * k, -b + 2 * k],
    solutionLatex: `${k === 1 ? '' : `\\frac{1}{${k}}`}\\arctan\\!\\left(${arg}\\right)`,
    solution: (x) => Math.atan((x + b) / k) / k,
    hint: `Complete the square: the quadratic is (x ${b > 0 ? '+' : '−'} ${Math.abs(b)})² + ${k * k}.`,
  }
}

// ∫ dx/√(c − 2bx − x²) = arcsin((x+b)/k), where c = k² − b²
const sqrtArcsin: Variant = (rng) => {
  const b = rng.nonzeroInt(-3, 3)
  const k = rng.int(2, 4)
  const c = k * k - b * b
  // radicand: c − 2bx − x²
  const terms = [c !== 0 ? String(c) : '', `${-2 * b === 1 ? '' : -2 * b === -1 ? '-' : -2 * b}x`, '-x^2']
  const radicand = terms
    .filter(Boolean)
    .reduce((acc, t) => (acc === '' ? t : t.startsWith('-') ? `${acc} - ${t.slice(1)}` : `${acc} + ${t}`), '')
  const arg = `\\frac{${shiftTex(b)}}{${k}}`
  return {
    technique: 'compsq',
    latex: intTex(`\\frac{1}{\\sqrt{${radicand}}}`),
    integrand: (x) => 1 / Math.sqrt(c - 2 * b * x - x * x),
    domain: [-b - 0.85 * k, -b + 0.85 * k],
    solutionLatex: `\\arcsin\\!\\left(${arg}\\right)`,
    solution: (x) => Math.asin((x + b) / k),
    hint: `Complete the square: the radicand is ${k * k} − (x ${b > 0 ? '+' : '−'} ${Math.abs(b)})².`,
  }
}

// ∫ dx/√(x² + 2bx + c) = ln(x + b + √(x²+2bx+c)), c = b² + k²
const sqrtLog: Variant = (rng) => {
  const b = rng.nonzeroInt(-4, 4)
  const k = rng.int(1, 4)
  const c = b * b + k * k
  const quad = quadTex(2 * b, c)
  return {
    technique: 'compsq',
    latex: intTex(`\\frac{1}{\\sqrt{${quad}}}`),
    integrand: (x) => 1 / Math.sqrt(x * x + 2 * b * x + c),
    domain: [-b - 3, -b + 3],
    solutionLatex: `\\ln\\!\\left(${shiftTex(b)} + \\sqrt{${quad}}\\right)`,
    solution: (x) => Math.log(x + b + Math.sqrt(x * x + 2 * b * x + c)),
    hint: `Complete the square: the radicand is (x ${b > 0 ? '+' : '−'} ${Math.abs(b)})² + ${k * k}.`,
  }
}

// ∫ (x+d)/(x² + 2bx + c) dx = ½ln(x²+2bx+c) + ((d−b)/k)arctan((x+b)/k)
const linearOverQuad: Variant = (rng) => {
  const b = rng.nonzeroInt(-3, 3)
  const k = rng.int(1, 3)
  const c = b * b + k * k
  let d = b
  while (d === b) d = rng.int(-4, 4)
  const quad = quadTex(2 * b, c)
  const m = d - b
  const arg = k === 1 ? `${shiftTex(b)}` : `\\frac{${shiftTex(b)}}{${k}}`
  const atanCoefNum = m
  const atanTex = `\\arctan\\!\\left(${arg}\\right)`
  const atanTerm =
    k === 1
      ? `${atanCoefNum === 1 ? '' : atanCoefNum === -1 ? '-' : atanCoefNum}${atanTex}`
      : `${atanCoefNum < 0 ? '-' : ''}\\frac{${Math.abs(atanCoefNum)}}{${k}}${atanTex}`
  return {
    technique: 'compsq',
    latex: intTex(`\\frac{${linTex(1, d)}}{${quad}}`),
    integrand: (x) => (x + d) / (x * x + 2 * b * x + c),
    domain: [-b - 2 * k, -b + 2 * k],
    solutionLatex: `\\frac{1}{2}\\ln\\!\\left(${quad}\\right)${atanTerm.startsWith('-') ? ` - ${atanTerm.slice(1)}` : ` + ${atanTerm}`}`,
    solution: (x) =>
      0.5 * Math.log(x * x + 2 * b * x + c) + (m / k) * Math.atan((x + b) / k),
    hint: 'Split the numerator: (x+d) = ½(2x+2b) + (d−b), then ln + arctan.',
  }
}

const variants: Variant[] = [rationalArctan, rationalArctan, sqrtArcsin, sqrtLog, linearOverQuad, linearOverQuad]

export function generateCompSq(rng: RNG): Problem {
  return rng.pick(variants)(rng)
}
