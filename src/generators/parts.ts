import { coef, intTex, joinTerms, linTex } from '../lib/tex'
import type { Problem, Variant } from './types'
import type { RNG } from '../lib/rng'

const axTex = (a: number) => (a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`)

// ∫ x e^{ax} dx = e^{ax}(ax − 1)/a²
const xExp: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 3)
  return {
    technique: 'parts',
    latex: intTex(`x e^{${axTex(a)}}`),
    integrand: (x) => x * Math.exp(a * x),
    domain: [-2, 2],
    solutionLatex: `\\frac{(${linTex(a, -1)})e^{${axTex(a)}}}{${a * a}}`,
    solution: (x) => ((a * x - 1) * Math.exp(a * x)) / (a * a),
    hint: 'Parts with u = x, dv = e^{ax} dx.',
  }
}

// ∫ x² e^{ax} dx = e^{ax}(a²x² − 2ax + 2)/a³
const x2Exp: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 2)
  const inner = joinTerms([`${coef(a * a)}x^2`, `${coef(-2 * a)}x`, '2'])
  return {
    technique: 'parts',
    latex: intTex(`x^2 e^{${axTex(a)}}`),
    integrand: (x) => x * x * Math.exp(a * x),
    domain: [-2, 2],
    solutionLatex:
      Math.abs(a) === 1
        ? `${a < 0 ? '-' : ''}(${inner})e^{${axTex(a)}}`
        : `${a < 0 ? '-' : ''}\\frac{(${inner})e^{${axTex(a)}}}{${Math.abs(a ** 3)}}`,
    solution: (x) => ((a * a * x * x - 2 * a * x + 2) * Math.exp(a * x)) / a ** 3,
    hint: 'Apply integration by parts twice, u = x² first.',
  }
}

// ∫ x sin(ax) dx = (sin(ax) − ax cos(ax))/a²
const xSin: Variant = (rng) => {
  const a = rng.int(1, 3)
  const ax = axTex(a)
  return {
    technique: 'parts',
    latex: intTex(`x \\sin(${ax})`),
    integrand: (x) => x * Math.sin(a * x),
    domain: [-3, 3],
    solutionLatex: `\\frac{\\sin(${ax}) - ${ax}\\cos(${ax})}{${a * a}}`,
    solution: (x) => (Math.sin(a * x) - a * x * Math.cos(a * x)) / (a * a),
    hint: 'Parts with u = x, dv = sin(ax) dx.',
  }
}

// ∫ x cos(ax) dx = (cos(ax) + ax sin(ax))/a²
const xCos: Variant = (rng) => {
  const a = rng.int(1, 3)
  const ax = axTex(a)
  return {
    technique: 'parts',
    latex: intTex(`x \\cos(${ax})`),
    integrand: (x) => x * Math.cos(a * x),
    domain: [-3, 3],
    solutionLatex: `\\frac{\\cos(${ax}) + ${ax}\\sin(${ax})}{${a * a}}`,
    solution: (x) => (Math.cos(a * x) + a * x * Math.sin(a * x)) / (a * a),
    hint: 'Parts with u = x, dv = cos(ax) dx.',
  }
}

// ∫ xⁿ ln x dx = x^{n+1}((n+1)ln x − 1)/(n+1)²
const xnLn: Variant = (rng) => {
  const n = rng.int(0, 4)
  const front = n === 0 ? '' : n === 1 ? 'x ' : `x^{${n}} `
  const m = n + 1
  const solution = (x: number) => (x ** m * (m * Math.log(x) - 1)) / (m * m)
  if (n === 0)
    return {
      technique: 'parts',
      latex: intTex('\\ln x'),
      integrand: (x) => Math.log(x),
      domain: [0.3, 4],
      solutionLatex: 'x\\ln x - x',
      solution,
      hint: 'Parts with u = ln x, dv = dx.',
    }
  return {
    technique: 'parts',
    latex: intTex(`${front}\\ln x`),
    integrand: (x) => x ** n * Math.log(x),
    domain: [0.3, 4],
    solutionLatex: `\\frac{x^{${m}}\\left(${m}\\ln x - 1\\right)}{${m * m}}`,
    solution,
    hint: 'Parts with u = ln x, dv = xⁿ dx.',
  }
}

// ∫ arctan x dx = x arctan x − ln(1+x²)/2
const arctan: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 4)
  return {
    technique: 'parts',
    latex: intTex(`${coef(a)}\\arctan x`),
    integrand: (x) => a * Math.atan(x),
    domain: [-2, 2],
    solutionLatex: `${coef(a)}\\left(x\\arctan x - \\frac{1}{2}\\ln(1 + x^2)\\right)`,
    solution: (x) => a * (x * Math.atan(x) - 0.5 * Math.log(1 + x * x)),
    hint: 'Parts with u = arctan x, dv = dx.',
  }
}

// ∫ e^{ax} sin(bx) dx and cos version
const expTrig: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 2)
  const b = rng.int(1, 3)
  const d = a * a + b * b
  const ax = axTex(a)
  const bx = axTex(b)
  if (rng.sign() > 0)
    return {
      technique: 'parts',
      latex: intTex(`e^{${ax}} \\sin(${bx})`),
      integrand: (x) => Math.exp(a * x) * Math.sin(b * x),
      domain: [-2, 2],
      solutionLatex: `\\frac{e^{${ax}}\\left(${joinTerms([`${coef(a)}\\sin(${bx})`, `${coef(-b)}\\cos(${bx})`])}\\right)}{${d}}`,
      solution: (x) =>
        (Math.exp(a * x) * (a * Math.sin(b * x) - b * Math.cos(b * x))) / d,
      hint: 'Parts twice, then solve for the integral.',
    }
  return {
    technique: 'parts',
    latex: intTex(`e^{${ax}} \\cos(${bx})`),
    integrand: (x) => Math.exp(a * x) * Math.cos(b * x),
    domain: [-2, 2],
    solutionLatex: `\\frac{e^{${ax}}\\left(${joinTerms([`${coef(a)}\\cos(${bx})`, `${coef(b)}\\sin(${bx})`])}\\right)}{${d}}`,
    solution: (x) =>
      (Math.exp(a * x) * (a * Math.cos(b * x) + b * Math.sin(b * x))) / d,
    hint: 'Parts twice, then solve for the integral.',
  }
}

// ∫ x sec²x dx = x tan x + ln|cos x|
const xSec2: Variant = () => ({
  technique: 'parts',
  latex: intTex('x \\sec^2 x'),
  integrand: (x) => x / Math.cos(x) ** 2,
  domain: [-1.2, 1.2],
  solutionLatex: 'x\\tan x + \\ln|\\cos x|',
  solution: (x) => x * Math.tan(x) + Math.log(Math.abs(Math.cos(x))),
  hint: 'Parts with u = x, dv = sec²x dx.',
})

// ∫ √x ln x dx = (2/3)x^{3/2}ln x − (4/9)x^{3/2}
const sqrtLn: Variant = () => ({
  technique: 'parts',
  latex: intTex('\\sqrt{x}\\,\\ln x'),
  integrand: (x) => Math.sqrt(x) * Math.log(x),
  domain: [0.3, 4],
  solutionLatex: '\\frac{2}{3}x^{3/2}\\ln x - \\frac{4}{9}x^{3/2}',
  solution: (x) => (2 / 3) * x ** 1.5 * Math.log(x) - (4 / 9) * x ** 1.5,
  hint: 'Parts with u = ln x, dv = √x dx.',
})

const variants: Variant[] = [xExp, x2Exp, xSin, xCos, xnLn, xnLn, arctan, expTrig, xSec2, sqrtLn]

export function generateParts(rng: RNG): Problem {
  return rng.pick(variants)(rng)
}
