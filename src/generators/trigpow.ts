import { intTex } from '../lib/tex'
import type { Problem, Variant } from './types'
import type { RNG } from '../lib/rng'

const axTex = (a: number) => (a === 1 ? 'x' : `${a}x`)

// ∫ sin²(ax) dx = x/2 − sin(2ax)/(4a);  ∫ cos²(ax) dx = x/2 + sin(2ax)/(4a)
const squares: Variant = (rng) => {
  const a = rng.int(1, 3)
  const isSin = rng.sign() > 0
  const ax = axTex(a)
  const two = axTex(2 * a)
  return {
    technique: 'trigpow',
    latex: intTex(`\\${isSin ? 'sin' : 'cos'}^2(${ax})`),
    integrand: (x) => (isSin ? Math.sin(a * x) : Math.cos(a * x)) ** 2,
    domain: [-3, 3],
    solutionLatex: `\\frac{x}{2} ${isSin ? '-' : '+'} \\frac{\\sin(${two})}{${4 * a}}`,
    solution: (x) => x / 2 + ((isSin ? -1 : 1) * Math.sin(2 * a * x)) / (4 * a),
    hint: 'Use the half-angle identity sin² = (1−cos 2θ)/2, cos² = (1+cos 2θ)/2.',
  }
}

// ∫ sin³x dx = cos³x/3 − cos x;  ∫ cos³x dx = sin x − sin³x/3
const cubes: Variant = (rng) => {
  if (rng.sign() > 0)
    return {
      technique: 'trigpow',
      latex: intTex('\\sin^3 x'),
      integrand: (x) => Math.sin(x) ** 3,
      domain: [-3, 3],
      solutionLatex: '\\frac{\\cos^3 x}{3} - \\cos x',
      solution: (x) => Math.cos(x) ** 3 / 3 - Math.cos(x),
      hint: 'Split off one sin x and write the rest via cos²: sin³ = (1−cos²)sin.',
    }
  return {
    technique: 'trigpow',
    latex: intTex('\\cos^3 x'),
    integrand: (x) => Math.cos(x) ** 3,
    domain: [-3, 3],
    solutionLatex: '\\sin x - \\frac{\\sin^3 x}{3}',
    solution: (x) => Math.sin(x) - Math.sin(x) ** 3 / 3,
    hint: 'Split off one cos x and write the rest via sin²: cos³ = (1−sin²)cos.',
  }
}

// odd-power mixed products
const mixedOdd: Variant = (rng) => {
  if (rng.sign() > 0)
    return {
      technique: 'trigpow',
      latex: intTex('\\sin^3 x \\cos^2 x'),
      integrand: (x) => Math.sin(x) ** 3 * Math.cos(x) ** 2,
      domain: [-3, 3],
      solutionLatex: '\\frac{\\cos^5 x}{5} - \\frac{\\cos^3 x}{3}',
      solution: (x) => Math.cos(x) ** 5 / 5 - Math.cos(x) ** 3 / 3,
      hint: 'Odd sin power: peel one sin x, substitute u = cos x.',
    }
  return {
    technique: 'trigpow',
    latex: intTex('\\sin^2 x \\cos^3 x'),
    integrand: (x) => Math.sin(x) ** 2 * Math.cos(x) ** 3,
    domain: [-3, 3],
    solutionLatex: '\\frac{\\sin^3 x}{3} - \\frac{\\sin^5 x}{5}',
    solution: (x) => Math.sin(x) ** 3 / 3 - Math.sin(x) ** 5 / 5,
    hint: 'Odd cos power: peel one cos x, substitute u = sin x.',
  }
}

// ∫ tan²x dx, ∫ tan³x dx
const tanPow: Variant = (rng) => {
  if (rng.sign() > 0)
    return {
      technique: 'trigpow',
      latex: intTex('\\tan^2 x'),
      integrand: (x) => Math.tan(x) ** 2,
      domain: [-1.2, 1.2],
      solutionLatex: '\\tan x - x',
      solution: (x) => Math.tan(x) - x,
      hint: 'Use tan² = sec² − 1.',
    }
  return {
    technique: 'trigpow',
    latex: intTex('\\tan^3 x'),
    integrand: (x) => Math.tan(x) ** 3,
    domain: [-1.2, 1.2],
    solutionLatex: '\\frac{\\tan^2 x}{2} + \\ln|\\cos x|',
    solution: (x) => Math.tan(x) ** 2 / 2 + Math.log(Math.abs(Math.cos(x))),
    hint: 'Write tan³ = tan(sec² − 1).',
  }
}

// ∫ tanⁿx sec²x dx = tanⁿ⁺¹x/(n+1)
const tanSec2: Variant = (rng) => {
  const n = rng.int(1, 4)
  return {
    technique: 'trigpow',
    latex: intTex(`\\tan^{${n}} x \\sec^2 x`),
    integrand: (x) => Math.tan(x) ** n / Math.cos(x) ** 2,
    domain: [-1.1, 1.1],
    solutionLatex: `\\frac{\\tan^{${n + 1}} x}{${n + 1}}`,
    solution: (x) => Math.tan(x) ** (n + 1) / (n + 1),
    hint: 'Substitute u = tan x, du = sec²x dx.',
  }
}

// ∫ sec x dx and ∫ sec³x dx
const secant: Variant = (rng) => {
  if (rng.sign() > 0)
    return {
      technique: 'trigpow',
      latex: intTex('\\sec x'),
      integrand: (x) => 1 / Math.cos(x),
      domain: [-1.2, 1.2],
      solutionLatex: '\\ln|\\sec x + \\tan x|',
      solution: (x) => Math.log(Math.abs(1 / Math.cos(x) + Math.tan(x))),
      hint: 'Multiply by (sec x + tan x)/(sec x + tan x).',
    }
  return {
    technique: 'trigpow',
    latex: intTex('\\sec^3 x'),
    integrand: (x) => 1 / Math.cos(x) ** 3,
    domain: [-1.2, 1.2],
    solutionLatex: '\\frac{1}{2}\\left(\\sec x \\tan x + \\ln|\\sec x + \\tan x|\\right)',
    solution: (x) =>
      0.5 *
      ((1 / Math.cos(x)) * Math.tan(x) +
        Math.log(Math.abs(1 / Math.cos(x) + Math.tan(x)))),
    hint: 'Integration by parts with u = sec x, dv = sec²x dx, then solve for the integral.',
  }
}

// products with different frequencies — product-to-sum identities
const productToSum: Variant = (rng) => {
  const a = rng.int(1, 4)
  let b = a
  while (b === a) b = rng.int(1, 4)
  const s = a + b
  const d = a - b
  const ad = Math.abs(d) // cos(dx)=cos(|d|x); sin(dx)/(2d)=sin(|d|x)/(2|d|)
  const kind = rng.pick(['sincos', 'sinsin', 'coscos'] as const)
  const ax = axTex(a)
  const bx = axTex(b)
  if (kind === 'sincos') {
    // −cos(sx)/(2s) − cos(dx)/(2d); with |d| the second term's sign flips when d<0
    const secondSign = d > 0 ? '-' : '+'
    return {
      technique: 'trigpow',
      latex: intTex(`\\sin(${ax})\\cos(${bx})`),
      integrand: (x) => Math.sin(a * x) * Math.cos(b * x),
      domain: [-3, 3],
      solutionLatex: `-\\frac{\\cos(${axTex(s)})}{${2 * s}} ${secondSign} \\frac{\\cos(${axTex(ad)})}{${2 * ad}}`,
      solution: (x) => -Math.cos(s * x) / (2 * s) - Math.cos(d * x) / (2 * d),
      hint: 'Use sin A cos B = ½[sin(A+B) + sin(A−B)].',
    }
  }
  if (kind === 'sinsin')
    return {
      technique: 'trigpow',
      latex: intTex(`\\sin(${ax})\\sin(${bx})`),
      integrand: (x) => Math.sin(a * x) * Math.sin(b * x),
      domain: [-3, 3],
      solutionLatex: `\\frac{\\sin(${axTex(ad)})}{${2 * ad}} - \\frac{\\sin(${axTex(s)})}{${2 * s}}`,
      solution: (x) => Math.sin(d * x) / (2 * d) - Math.sin(s * x) / (2 * s),
      hint: 'Use sin A sin B = ½[cos(A−B) − cos(A+B)].',
    }
  return {
    technique: 'trigpow',
    latex: intTex(`\\cos(${ax})\\cos(${bx})`),
    integrand: (x) => Math.cos(a * x) * Math.cos(b * x),
    domain: [-3, 3],
    solutionLatex: `\\frac{\\sin(${axTex(ad)})}{${2 * ad}} + \\frac{\\sin(${axTex(s)})}{${2 * s}}`,
    solution: (x) => Math.sin(d * x) / (2 * d) + Math.sin(s * x) / (2 * s),
    hint: 'Use cos A cos B = ½[cos(A−B) + cos(A+B)].',
  }
}

const variants: Variant[] = [squares, cubes, mixedOdd, tanPow, tanSec2, secant, productToSum]

export function generateTrigPow(rng: RNG): Problem {
  return rng.pick(variants)(rng)
}
