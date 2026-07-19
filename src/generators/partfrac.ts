import { fracCoef, fracTex, intTex, linTex } from '../lib/tex'
import type { Problem, Variant } from './types'
import type { RNG } from '../lib/rng'

/** Two distinct integer roots for (x + a)(x + b). */
function distinctPair(rng: RNG): [number, number] {
  const a = rng.int(-5, 5)
  let b = a
  while (b === a) b = rng.int(-5, 5)
  return [a, b]
}

/** Domain safely right of both poles, so x+a and x+b stay positive. */
function rightOfPoles(a: number, b: number): [number, number] {
  const m = Math.max(-a, -b)
  return [m + 0.4, m + 4]
}

const lnAbs = (a: number) => `\\ln|${linTex(1, a)}|`

// ∫ dx/((x+a)(x+b)) = (1/(b−a))(ln|x+a| − ln|x+b|)
const simpleTwoRoots: Variant = (rng) => {
  const [a, b] = distinctPair(rng)
  return {
    technique: 'partfrac',
    latex: intTex(`\\frac{1}{(${linTex(1, a)})(${linTex(1, b)})}`),
    integrand: (x) => 1 / ((x + a) * (x + b)),
    domain: rightOfPoles(a, b),
    solutionLatex: `${fracCoef(1, b - a)}\\left(${lnAbs(a)} - ${lnAbs(b)}\\right)`,
    solution: (x) =>
      (Math.log(Math.abs(x + a)) - Math.log(Math.abs(x + b))) / (b - a),
    hint: 'Decompose as A/(x+a) + B/(x+b); cover-up gives A and B.',
  }
}

// ∫ (px+q)/((x+a)(x+b)) dx = A ln|x+a| + B ln|x+b|, A=(q−pa)/(b−a), B=(q−pb)/(a−b)
const linearNumerator: Variant = (rng) => {
  const [a, b] = distinctPair(rng)
  const p = rng.nonzeroInt(-3, 3)
  const q = rng.int(-5, 5)
  const An = q - p * a
  const Bn = q - p * b
  const A = An / (b - a)
  const B = Bn / (a - b)
  return {
    technique: 'partfrac',
    latex: intTex(`\\frac{${linTex(p, q)}}{(${linTex(1, a)})(${linTex(1, b)})}`),
    integrand: (x) => (p * x + q) / ((x + a) * (x + b)),
    domain: rightOfPoles(a, b),
    solutionLatex: [
      An === 0 ? '' : `${fracCoef(An, b - a)}${lnAbs(a)}`,
      Bn === 0 ? '' : `${fracCoef(Bn, a - b)}${lnAbs(b)}`,
    ]
      .filter(Boolean)
      .map((t, i) => (i > 0 && !t.startsWith('-') ? ` + ${t}` : i > 0 ? ` - ${t.slice(1)}` : t))
      .join(''),
    solution: (x) => A * Math.log(Math.abs(x + a)) + B * Math.log(Math.abs(x + b)),
    hint: 'Decompose as A/(x+a) + B/(x+b).',
  }
}

// ∫ dx/((x+a)²(x+b)): A ln|x+a| − B/(x+a) + C ln|x+b|
// with B = 1/(b−a), C = 1/(a−b)², A = −C
const repeatedRoot: Variant = (rng) => {
  const [a, b] = distinctPair(rng)
  const B = 1 / (b - a)
  const C = 1 / (a - b) ** 2
  const A = -C
  const d2 = (a - b) ** 2
  return {
    technique: 'partfrac',
    latex: intTex(`\\frac{1}{(${linTex(1, a)})^2(${linTex(1, b)})}`),
    integrand: (x) => 1 / ((x + a) ** 2 * (x + b)),
    domain: rightOfPoles(a, b),
    solutionLatex: `${fracCoef(-1, d2)}${lnAbs(a)} ${b - a > 0 ? '-' : '+'} \\frac{1}{${Math.abs(b - a) === 1 ? '' : Math.abs(b - a)}(${linTex(1, a)})} + ${fracCoef(1, d2)}${lnAbs(b)}`,
    solution: (x) =>
      A * Math.log(Math.abs(x + a)) - B / (x + a) + C * Math.log(Math.abs(x + b)),
    hint: 'Use A/(x+a) + B/(x+a)² + C/(x+b).',
  }
}

// ∫ x²/((x+a)(x+b)) dx = x + (a²/(b−a))ln|x+a| − (b²/(b−a))ln|x+b|
const improper: Variant = (rng) => {
  const [a, b] = distinctPair(rng)
  return {
    technique: 'partfrac',
    latex: intTex(`\\frac{x^2}{(${linTex(1, a)})(${linTex(1, b)})}`),
    integrand: (x) => (x * x) / ((x + a) * (x + b)),
    domain: rightOfPoles(a, b),
    solutionLatex: [
      'x',
      a === 0 ? '' : `${fracCoef(a * a, b - a)}${lnAbs(a)}`,
      b === 0 ? '' : `${fracCoef(-b * b, b - a)}${lnAbs(b)}`,
    ]
      .filter(Boolean)
      .map((t, i) => (i > 0 && !t.startsWith('-') ? ` + ${t}` : i > 0 ? ` - ${t.slice(1)}` : t))
      .join(''),
    solution: (x) =>
      x +
      ((a * a) / (b - a)) * Math.log(Math.abs(x + a)) -
      ((b * b) / (b - a)) * Math.log(Math.abs(x + b)),
    hint: 'Improper fraction: divide first, then decompose the remainder.',
  }
}

// ∫ dx/(x(x²+a²)) = (1/a²)ln|x| − (1/(2a²))ln(x²+a²)
const irreducibleQuad: Variant = (rng) => {
  const a = rng.int(1, 4)
  const a2 = a * a
  return {
    technique: 'partfrac',
    latex: intTex(`\\frac{1}{x\\left(x^2 + ${a2}\\right)}`),
    integrand: (x) => 1 / (x * (x * x + a2)),
    domain: [0.4, 4],
    solutionLatex: `${fracCoef(1, a2)}\\ln|x| - ${fracTex(1, 2 * a2)}\\ln\\left(x^2 + ${a2}\\right)`,
    solution: (x) =>
      Math.log(Math.abs(x)) / a2 - Math.log(x * x + a2) / (2 * a2),
    hint: 'Decompose as A/x + (Bx+C)/(x²+a²).',
  }
}

const variants: Variant[] = [
  simpleTwoRoots,
  simpleTwoRoots,
  linearNumerator,
  linearNumerator,
  repeatedRoot,
  improper,
  irreducibleQuad,
]

export function generatePartFrac(rng: RNG): Problem {
  return rng.pick(variants)(rng)
}
