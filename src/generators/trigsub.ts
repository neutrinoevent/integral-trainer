import { fracCoef, intTex } from '../lib/tex'
import type { Problem, Variant } from './types'
import type { RNG } from '../lib/rng'

// All variants parameterized by a ∈ 1..5 (a² appears in the radicand).

const invSqrtA2mX2: Variant = (rng) => {
  const a = rng.int(1, 5)
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{1}{\\sqrt{${a * a} - x^2}}`),
    integrand: (x) => 1 / Math.sqrt(a * a - x * x),
    domain: [-0.85 * a, 0.85 * a],
    solutionLatex: a === 1 ? '\\arcsin x' : `\\arcsin\\!\\left(\\frac{x}{${a}}\\right)`,
    solution: (x) => Math.asin(x / a),
    hint: `Substitute x = ${a} sin θ.`,
  }
}

const invA2pX2: Variant = (rng) => {
  const a = rng.int(1, 5)
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{1}{${a * a === 1 ? '1' : a * a} + x^2}`),
    integrand: (x) => 1 / (a * a + x * x),
    domain: [-2 * a, 2 * a],
    solutionLatex:
      a === 1 ? '\\arctan x' : `\\frac{1}{${a}}\\arctan\\!\\left(\\frac{x}{${a}}\\right)`,
    solution: (x) => Math.atan(x / a) / a,
    hint: `Substitute x = ${a} tan θ.`,
  }
}

const sqrtA2mX2: Variant = (rng) => {
  const a = rng.int(1, 4)
  const asinPart =
    a === 1 ? '\\frac{1}{2}\\arcsin x' : `\\frac{${a * a}}{2}\\arcsin\\!\\left(\\frac{x}{${a}}\\right)`
  return {
    technique: 'trigsub',
    latex: intTex(`\\sqrt{${a * a} - x^2}`),
    integrand: (x) => Math.sqrt(a * a - x * x),
    domain: [-0.85 * a, 0.85 * a],
    solutionLatex: `\\frac{x}{2}\\sqrt{${a * a} - x^2} + ${asinPart}`,
    solution: (x) =>
      (x / 2) * Math.sqrt(a * a - x * x) + ((a * a) / 2) * Math.asin(x / a),
    hint: `Substitute x = ${a} sin θ, then use cos²θ = (1+cos 2θ)/2.`,
  }
}

const invSqrtX2pA2: Variant = (rng) => {
  const a = rng.int(1, 5)
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{1}{\\sqrt{x^2 + ${a * a}}}`),
    integrand: (x) => 1 / Math.sqrt(x * x + a * a),
    domain: [-3, 3],
    solutionLatex: `\\ln\\!\\left(x + \\sqrt{x^2 + ${a * a}}\\right)`,
    solution: (x) => Math.log(x + Math.sqrt(x * x + a * a)),
    hint: `Substitute x = ${a} tan θ (or recognize arcsinh).`,
  }
}

const invSqrtX2mA2: Variant = (rng) => {
  const a = rng.int(1, 4)
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{1}{\\sqrt{x^2 - ${a * a}}}`),
    integrand: (x) => 1 / Math.sqrt(x * x - a * a),
    domain: [a + 0.3, a + 4],
    solutionLatex: `\\ln\\!\\left|x + \\sqrt{x^2 - ${a * a}}\\right|`,
    solution: (x) => Math.log(Math.abs(x + Math.sqrt(x * x - a * a))),
    hint: `Substitute x = ${a} sec θ.`,
  }
}

const x2OverSqrt: Variant = (rng) => {
  const a = rng.int(1, 4)
  const asinPart =
    a === 1 ? '\\frac{1}{2}\\arcsin x' : `\\frac{${a * a}}{2}\\arcsin\\!\\left(\\frac{x}{${a}}\\right)`
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{x^2}{\\sqrt{${a * a} - x^2}}`),
    integrand: (x) => (x * x) / Math.sqrt(a * a - x * x),
    domain: [-0.85 * a, 0.85 * a],
    solutionLatex: `${asinPart} - \\frac{x}{2}\\sqrt{${a * a} - x^2}`,
    solution: (x) =>
      ((a * a) / 2) * Math.asin(x / a) - (x / 2) * Math.sqrt(a * a - x * x),
    hint: `Substitute x = ${a} sin θ, then use sin²θ = (1−cos 2θ)/2.`,
  }
}

const invA2pX2Squared: Variant = (rng) => {
  const a = rng.int(1, 3)
  const a2 = a * a
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{1}{\\left(x^2 + ${a2}\\right)^2}`),
    integrand: (x) => 1 / (x * x + a2) ** 2,
    domain: [-2 * a, 2 * a],
    solutionLatex: `\\frac{x}{${2 * a2}\\left(x^2 + ${a2}\\right)} + ${fracCoef(1, 2 * a2 * a)}\\arctan\\!\\left(${a === 1 ? 'x' : `\\frac{x}{${a}}`}\\right)`,
    solution: (x) =>
      x / (2 * a2 * (x * x + a2)) + Math.atan(x / a) / (2 * a2 * a),
    hint: `Substitute x = ${a} tan θ; the integral reduces to ∫cos²θ dθ.`,
  }
}

const invXSqrtX2pA2: Variant = (rng) => {
  const a = rng.int(1, 3)
  const a2 = a * a
  return {
    technique: 'trigsub',
    latex: intTex(`\\frac{1}{x\\sqrt{x^2 + ${a2}}}`),
    integrand: (x) => 1 / (x * Math.sqrt(x * x + a2)),
    domain: [0.5, 4],
    solutionLatex: `${fracCoef(-1, a)}\\ln\\!\\left(\\frac{${a} + \\sqrt{x^2 + ${a2}}}{x}\\right)`,
    solution: (x) => (-1 / a) * Math.log((a + Math.sqrt(x * x + a2)) / x),
    hint: `Substitute x = ${a} tan θ, reducing to ∫csc θ dθ.`,
  }
}

const variants: Variant[] = [
  invSqrtA2mX2,
  invA2pX2,
  sqrtA2mX2,
  invSqrtX2pA2,
  invSqrtX2mA2,
  x2OverSqrt,
  invA2pX2Squared,
  invXSqrtX2pA2,
]

export function generateTrigSub(rng: RNG): Problem {
  return rng.pick(variants)(rng)
}
