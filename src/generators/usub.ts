import { fracCoef, intTex, linTex } from '../lib/tex'
import type { Problem, Variant } from './types'
import type { RNG } from '../lib/rng'

// u = ax + b inside an elementary function
const linearInside: Variant = (rng) => {
  const a = rng.nonzeroInt(-4, 4)
  const b = rng.nonzeroInt(-5, 5)
  const inner = linTex(a, b)
  const kind = rng.pick(['sin', 'cos', 'exp', 'pow', 'recip'] as const)
  if (kind === 'sin')
    return {
      technique: 'usub',
      latex: intTex(`\\sin(${inner})`),
      integrand: (x) => Math.sin(a * x + b),
      domain: [-3, 3],
      solutionLatex: `${fracCoef(-1, a)}\\cos(${inner})`,
      solution: (x) => (-1 / a) * Math.cos(a * x + b),
      hint: 'Substitute u = ax + b, du = a dx.',
    }
  if (kind === 'cos')
    return {
      technique: 'usub',
      latex: intTex(`\\cos(${inner})`),
      integrand: (x) => Math.cos(a * x + b),
      domain: [-3, 3],
      solutionLatex: `${fracCoef(1, a)}\\sin(${inner})`,
      solution: (x) => (1 / a) * Math.sin(a * x + b),
      hint: 'Substitute u = ax + b, du = a dx.',
    }
  if (kind === 'exp')
    return {
      technique: 'usub',
      latex: intTex(`e^{${inner}}`),
      integrand: (x) => Math.exp(a * x + b),
      domain: [-1.5, 1.5],
      solutionLatex: `${fracCoef(1, a)}e^{${inner}}`,
      solution: (x) => (1 / a) * Math.exp(a * x + b),
      hint: 'Substitute u = ax + b, du = a dx.',
    }
  if (kind === 'pow') {
    const n = rng.int(3, 7)
    return {
      technique: 'usub',
      latex: intTex(`(${inner})^{${n}}`),
      integrand: (x) => (a * x + b) ** n,
      domain: [-2, 2],
      solutionLatex: `${fracCoef(1, a * (n + 1))}(${inner})^{${n + 1}}`,
      solution: (x) => (1 / (a * (n + 1))) * (a * x + b) ** (n + 1),
      hint: 'Substitute u = ax + b rather than expanding.',
    }
  }
  // 1/(ax+b), sampled where ax+b > 0
  const lo = (0.4 - b) / a
  const domain: [number, number] = a > 0 ? [lo, lo + 3] : [lo - 3, lo]
  return {
    technique: 'usub',
    latex: intTex(`\\frac{1}{${inner}}`),
    integrand: (x) => 1 / (a * x + b),
    domain,
    solutionLatex: `${fracCoef(1, a)}\\ln|${inner}|`,
    solution: (x) => (1 / a) * Math.log(Math.abs(a * x + b)),
    hint: 'Substitute u = ax + b; ∫ du/u = ln|u|.',
  }
}

const xExpX2: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 3)
  const inner = a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${a}x^2`
  return {
    technique: 'usub',
    latex: intTex(`x e^{${inner}}`),
    integrand: (x) => x * Math.exp(a * x * x),
    domain: [-1.4, 1.4],
    solutionLatex: `${fracCoef(1, 2 * a)}e^{${inner}}`,
    solution: (x) => (1 / (2 * a)) * Math.exp(a * x * x),
    hint: 'Substitute u = x², du = 2x dx.',
  }
}

const xPowChain: Variant = (rng) => {
  // ∫ x^{k-1} (a x^k + b)^n dx, k = 2 or 3
  const k = rng.pick([2, 3])
  const a = rng.int(1, 3)
  const b = rng.nonzeroInt(-5, 5)
  const n = rng.int(2, 4)
  const innerA = a === 1 ? `x^${k}` : `${a}x^${k}`
  const inner = b > 0 ? `${innerA} + ${b}` : `${innerA} - ${-b}`
  const front = k === 2 ? 'x' : 'x^2'
  return {
    technique: 'usub',
    latex: intTex(`${front}\\left(${inner}\\right)^{${n}}`),
    integrand: (x) => x ** (k - 1) * (a * x ** k + b) ** n,
    domain: [-1.8, 1.8],
    solutionLatex: `${fracCoef(1, k * a * (n + 1))}\\left(${inner}\\right)^{${n + 1}}`,
    solution: (x) => (1 / (k * a * (n + 1))) * (a * x ** k + b) ** (n + 1),
    hint: `Substitute u = ${a === 1 ? '' : a}x^${k}${b > 0 ? ' + ' + b : ' − ' + -b}.`,
  }
}

const trigChain: Variant = (rng) => {
  const n = rng.int(2, 5)
  if (rng.sign() > 0)
    return {
      technique: 'usub',
      latex: intTex(`\\sin^{${n}} x \\cos x`),
      integrand: (x) => Math.sin(x) ** n * Math.cos(x),
      domain: [-1.3, 1.3],
      solutionLatex: `\\frac{\\sin^{${n + 1}} x}{${n + 1}}`,
      solution: (x) => Math.sin(x) ** (n + 1) / (n + 1),
      hint: 'Substitute u = sin x, du = cos x dx.',
    }
  return {
    technique: 'usub',
    latex: intTex(`\\cos^{${n}} x \\sin x`),
    integrand: (x) => Math.cos(x) ** n * Math.sin(x),
    domain: [-1.3, 1.3],
    solutionLatex: `-\\frac{\\cos^{${n + 1}} x}{${n + 1}}`,
    solution: (x) => -(Math.cos(x) ** (n + 1)) / (n + 1),
    hint: 'Substitute u = cos x, du = −sin x dx.',
  }
}

const logOverX: Variant = (rng) => {
  const n = rng.int(1, 4)
  const top = n === 1 ? '\\ln x' : `\\ln^{${n}} x`
  return {
    technique: 'usub',
    latex: intTex(`\\frac{${top}}{x}`),
    integrand: (x) => Math.log(x) ** n / x,
    domain: [1.2, 5],
    solutionLatex: `\\frac{\\ln^{${n + 1}} x}{${n + 1}}`,
    solution: (x) => Math.log(x) ** (n + 1) / (n + 1),
    hint: 'Substitute u = ln x, du = dx/x.',
  }
}

const xOverQuad: Variant = (rng) => {
  const a = rng.int(1, 4)
  const b = rng.int(1, 6)
  const innerA = a === 1 ? 'x^2' : `${a}x^2`
  return {
    technique: 'usub',
    latex: intTex(`\\frac{x}{${innerA} + ${b}}`),
    integrand: (x) => x / (a * x * x + b),
    domain: [-2, 2],
    solutionLatex: `${fracCoef(1, 2 * a)}\\ln\\left(${innerA} + ${b}\\right)`,
    solution: (x) => (1 / (2 * a)) * Math.log(a * x * x + b),
    hint: 'Substitute u = ax² + b; the numerator is du up to a constant.',
  }
}

const expOverExp: Variant = (rng) => {
  const a = rng.int(1, 6)
  return {
    technique: 'usub',
    latex: intTex(`\\frac{e^x}{e^x + ${a}}`),
    integrand: (x) => Math.exp(x) / (Math.exp(x) + a),
    domain: [-2, 2],
    solutionLatex: `\\ln\\left(e^x + ${a}\\right)`,
    solution: (x) => Math.log(Math.exp(x) + a),
    hint: 'Substitute u = eˣ + a, du = eˣ dx.',
  }
}

const tangent: Variant = (rng) => {
  const a = rng.int(1, 3)
  const ax = a === 1 ? 'x' : `${a}x`
  return {
    technique: 'usub',
    latex: intTex(`\\tan(${ax})`),
    integrand: (x) => Math.tan(a * x),
    domain: [-1.2 / a, 1.2 / a],
    solutionLatex: `${fracCoef(-1, a)}\\ln|\\cos(${ax})|`,
    solution: (x) => (-1 / a) * Math.log(Math.abs(Math.cos(a * x))),
    hint: 'Write tan = sin/cos and substitute u = cos.',
  }
}

const xOverSqrt: Variant = (rng) => {
  const b = rng.int(1, 6)
  if (rng.sign() > 0)
    return {
      technique: 'usub',
      latex: intTex(`\\frac{x}{\\sqrt{x^2 + ${b}}}`),
      integrand: (x) => x / Math.sqrt(x * x + b),
      domain: [-2, 2],
      solutionLatex: `\\sqrt{x^2 + ${b}}`,
      solution: (x) => Math.sqrt(x * x + b),
      hint: 'Substitute u = x² + b.',
    }
  return {
    technique: 'usub',
    latex: intTex(`x\\sqrt{x^2 + ${b}}`),
    integrand: (x) => x * Math.sqrt(x * x + b),
    domain: [-2, 2],
    solutionLatex: `\\frac{1}{3}\\left(x^2 + ${b}\\right)^{3/2}`,
    solution: (x) => (x * x + b) ** 1.5 / 3,
    hint: 'Substitute u = x² + b.',
  }
}

const variants: Variant[] = [
  linearInside,
  linearInside,
  xExpX2,
  xPowChain,
  trigChain,
  logOverX,
  xOverQuad,
  expOverExp,
  tangent,
  xOverSqrt,
]

export function generateUSub(rng: RNG): Problem {
  return rng.pick(variants)(rng)
}
