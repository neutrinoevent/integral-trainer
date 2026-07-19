import { coef, fracCoef, intTex, joinTerms } from '../lib/tex'
import type { Problem, Variant } from './types'

const HINT = 'Apply the basic antiderivative rules term by term.'

const power: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 9)
  const n = rng.int(2, 7)
  return {
    technique: 'basic',
    latex: intTex(`${coef(a)}x^{${n}}`),
    integrand: (x) => a * x ** n,
    domain: [-3, 3],
    solutionLatex: `${fracCoef(a, n + 1)}x^{${n + 1}}`,
    solution: (x) => (a / (n + 1)) * x ** (n + 1),
    hint: 'Power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1).',
  }
}

const poly: Variant = (rng) => {
  const a = rng.nonzeroInt(-6, 6)
  const b = rng.nonzeroInt(-6, 6)
  const c = rng.nonzeroInt(-9, 9)
  const body = joinTerms([`${coef(a)}x^2`, `${coef(b)}x`, String(c)])
  return {
    technique: 'basic',
    latex: intTex(`\\left(${body}\\right)`),
    integrand: (x) => a * x * x + b * x + c,
    domain: [-3, 3],
    solutionLatex: joinTerms([
      `${fracCoef(a, 3)}x^3`,
      `${fracCoef(b, 2)}x^2`,
      `${coef(c)}x`,
    ]),
    solution: (x) => (a / 3) * x ** 3 + (b / 2) * x * x + c * x,
    hint: HINT,
  }
}

const reciprocal: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 9)
  return {
    technique: 'basic',
    latex: intTex(`${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{x}`),
    integrand: (x) => a / x,
    domain: [0.3, 4],
    solutionLatex: `${coef(a)}\\ln|x|`,
    solution: (x) => a * Math.log(Math.abs(x)),
    hint: '∫ dx/x = ln|x|.',
  }
}

const expBasic: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 9)
  return {
    technique: 'basic',
    latex: intTex(`${coef(a)}e^{x}`),
    integrand: (x) => a * Math.exp(x),
    domain: [-2, 2],
    solutionLatex: `${coef(a)}e^{x}`,
    solution: (x) => a * Math.exp(x),
    hint: 'The exponential is its own antiderivative.',
  }
}

const trig: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 9)
  const kind = rng.pick(['sin', 'cos', 'sec2'] as const)
  if (kind === 'sin')
    return {
      technique: 'basic',
      latex: intTex(`${coef(a)}\\sin x`),
      integrand: (x) => a * Math.sin(x),
      domain: [-3, 3],
      solutionLatex: `${coef(-a)}\\cos x`,
      solution: (x) => -a * Math.cos(x),
      hint: '∫ sin x dx = −cos x.',
    }
  if (kind === 'cos')
    return {
      technique: 'basic',
      latex: intTex(`${coef(a)}\\cos x`),
      integrand: (x) => a * Math.cos(x),
      domain: [-3, 3],
      solutionLatex: `${coef(a)}\\sin x`,
      solution: (x) => a * Math.sin(x),
      hint: '∫ cos x dx = sin x.',
    }
  return {
    technique: 'basic',
    latex: intTex(`${coef(a)}\\sec^2 x`),
    integrand: (x) => a / Math.cos(x) ** 2,
    domain: [-1.2, 1.2],
    solutionLatex: `${coef(a)}\\tan x`,
    solution: (x) => a * Math.tan(x),
    hint: '∫ sec²x dx = tan x.',
  }
}

const roots: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 9)
  const kind = rng.pick(['sqrt', 'invsqrt', 'invsq'] as const)
  if (kind === 'sqrt')
    return {
      technique: 'basic',
      latex: intTex(`${coef(a)}\\sqrt{x}`),
      integrand: (x) => a * Math.sqrt(x),
      domain: [0.2, 4],
      solutionLatex: `${fracCoef(2 * a, 3)}x^{3/2}`,
      solution: (x) => ((2 * a) / 3) * x ** 1.5,
      hint: 'Write √x = x^{1/2} and use the power rule.',
    }
  if (kind === 'invsqrt')
    return {
      technique: 'basic',
      latex: intTex(`${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{\\sqrt{x}}`),
      integrand: (x) => a / Math.sqrt(x),
      domain: [0.2, 4],
      solutionLatex: `${coef(2 * a)}\\sqrt{x}`,
      solution: (x) => 2 * a * Math.sqrt(x),
      hint: 'Write 1/√x = x^{-1/2} and use the power rule.',
    }
  return {
    technique: 'basic',
    latex: intTex(`${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{x^2}`),
    integrand: (x) => a / (x * x),
    domain: [0.3, 4],
    solutionLatex: `${a > 0 ? '-' : ''}\\frac{${Math.abs(a)}}{x}`,
    solution: (x) => -a / x,
    hint: 'Write 1/x² = x^{-2} and use the power rule.',
  }
}

const inverseTrig: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 6)
  const kind = rng.pick(['atan', 'asin'] as const)
  const num = `${a < 0 ? '-' : ''}${Math.abs(a)}`
  if (kind === 'atan')
    return {
      technique: 'basic',
      latex: intTex(`\\frac{${num}}{1 + x^2}`),
      integrand: (x) => a / (1 + x * x),
      domain: [-2, 2],
      solutionLatex: `${coef(a)}\\arctan x`,
      solution: (x) => a * Math.atan(x),
      hint: '∫ dx/(1+x²) = arctan x.',
    }
  return {
    technique: 'basic',
    latex: intTex(`\\frac{${num}}{\\sqrt{1 - x^2}}`),
    integrand: (x) => a / Math.sqrt(1 - x * x),
    domain: [-0.9, 0.9],
    solutionLatex: `${coef(a)}\\arcsin x`,
    solution: (x) => a * Math.asin(x),
    hint: '∫ dx/√(1−x²) = arcsin x.',
  }
}

const mixedSum: Variant = (rng) => {
  const a = rng.nonzeroInt(-5, 5)
  const b = rng.nonzeroInt(-5, 5)
  return {
    technique: 'basic',
    latex: intTex(`\\left(${joinTerms([`${coef(a)}e^{x}`, `${coef(b)}\\sin x`])}\\right)`),
    integrand: (x) => a * Math.exp(x) + b * Math.sin(x),
    domain: [-2, 2],
    solutionLatex: joinTerms([`${coef(a)}e^{x}`, `${coef(-b)}\\cos x`]),
    solution: (x) => a * Math.exp(x) - b * Math.cos(x),
    hint: 'Integrate each term separately.',
  }
}

const fracPower: Variant = (rng) => {
  const a = rng.sign() * rng.int(1, 6)
  const q = rng.pick([3, 4, 5])
  const p = rng.pick([1, 2])
  // ∫ a x^{p/q} dx = a q/(p+q) x^{(p+q)/q}
  return {
    technique: 'basic',
    latex: intTex(`${coef(a)}x^{${p}/${q}}`),
    integrand: (x) => a * x ** (p / q),
    domain: [0.2, 4],
    solutionLatex: `${fracCoef(a * q, p + q)}x^{${p + q}/${q}}`,
    solution: (x) => ((a * q) / (p + q)) * x ** ((p + q) / q),
    hint: 'Power rule works for any rational exponent ≠ −1.',
  }
}

const variants: Variant[] = [
  power,
  poly,
  reciprocal,
  expBasic,
  trig,
  trig,
  roots,
  inverseTrig,
  mixedSum,
  fracPower,
]

export function generateBasic(rng: import('../lib/rng').RNG): Problem {
  return rng.pick(variants)(rng)
}
