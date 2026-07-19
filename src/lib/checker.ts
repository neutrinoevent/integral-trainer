import { parse, type MathNode } from 'mathjs'

/**
 * A submitted antiderivative F is accepted iff F'(x) matches the integrand
 * numerically across the problem's sample domain. No CAS needed, and every
 * algebraically equivalent form (and any constant of integration) passes.
 */

export interface ParsedAnswer {
  node: MathNode
  tex: string
  evaluate: (x: number) => number
}

export type CheckVerdict =
  | { ok: true; validPoints: number }
  | {
      ok: false
      code: 'empty' | 'parse' | 'domain' | 'integrand' | 'wrong'
      message: string
      validPoints?: number
    }

/**
 * Normalize human calculator syntax into something mathjs can parse:
 * ln -> log, arc* -> a*, |u| -> abs(u), implicit multiplication like
 * 2x, 3sin(x), x(x+1), (x+1)(x-1).
 */
export function preprocess(raw: string): string {
  let s = raw.trim()
  // Strip a trailing "+ C" (any casing) — the constant of integration.
  s = s.replace(/[+-]\s*C\s*$/i, '')
  // |u| -> (abs(u)) (non-nested); parens keep 'ln|x|' parseable as ln(abs(x))
  s = s.replace(/\|([^|]+)\|/g, '(abs($1))')
  // Function-name aliases
  s = s.replace(/\barcsin\b/g, 'asin')
  s = s.replace(/\barccos\b/g, 'acos')
  s = s.replace(/\barctan\b/g, 'atan')
  s = s.replace(/\barcsinh\b/g, 'asinh')
  s = s.replace(/\barccosh\b/g, 'acosh')
  s = s.replace(/\bln\b/g, 'log')
  // Implicit multiplication
  s = s.replace(/(\d)\s*([a-zA-Z(])/g, '$1*$2') // 2x, 3sin(, 4(
  s = s.replace(/\)\s*([a-zA-Z0-9(])/g, ')*$1') // )(, )x, )3
  s = s.replace(/\b([xC])\s*\(/g, '$1*(') // x(x+1) — but not sin(
  return s
}

export function parseAnswer(raw: string): ParsedAnswer | { error: string } {
  const cleaned = preprocess(raw)
  if (!cleaned) return { error: 'Enter an expression.' }
  let node: MathNode
  try {
    node = parse(cleaned)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not parse expression.' }
  }
  // Reject symbols other than x, C/c and known constants — catches typos like "si n(x)".
  const allowed = new Set(['x', 'C', 'c', 'e', 'pi'])
  let badSymbol: string | null = null
  node.traverse((n) => {
    if (n.type === 'SymbolNode') {
      const name = (n as MathNode & { name: string }).name
      if (!allowed.has(name) && !isKnownFunction(name)) badSymbol = name
    }
  })
  if (badSymbol) return { error: `Unknown symbol “${badSymbol}”. Use x as the variable.` }

  let compiled: { evaluate: (scope: Record<string, number>) => unknown }
  try {
    compiled = node.compile()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not compile expression.' }
  }
  const evaluate = (x: number): number => {
    try {
      const v = compiled.evaluate({ x, C: 0, c: 0 })
      return typeof v === 'number' ? v : NaN
    } catch {
      return NaN
    }
  }
  let tex: string
  try {
    tex = node.toTex({ parenthesis: 'auto' })
  } catch {
    tex = cleaned
  }
  return { node, tex, evaluate }
}

const KNOWN_FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot',
  'asin', 'acos', 'atan', 'asec', 'acsc', 'acot',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'log', 'log10', 'log2', 'exp', 'sqrt', 'cbrt', 'abs', 'nthRoot', 'pow',
])
function isKnownFunction(name: string): boolean {
  return KNOWN_FUNCTIONS.has(name)
}

/** Five-point-stencil numerical derivative. */
function derivative(f: (x: number) => number, x: number): number {
  const h = 1e-4 * (1 + Math.abs(x))
  const a = f(x - 2 * h)
  const b = f(x - h)
  const c = f(x + h)
  const d = f(x + 2 * h)
  if (!isFinite(a) || !isFinite(b) || !isFinite(c) || !isFinite(d)) return NaN
  return (a - 8 * b + 8 * c - d) / (12 * h)
}

const SAMPLES = 40
const MIN_VALID = 8

/**
 * Core check: does F' match the integrand on the sample domain?
 * Points where either function fails to evaluate (poles, edge of domain)
 * are skipped; one stray outlier among the valid points is tolerated.
 */
export function checkAntiderivative(
  F: (x: number) => number,
  integrand: (x: number) => number,
  domain: [number, number],
): { ok: boolean; validPoints: number; matchedIntegrand: boolean } {
  const [lo, hi] = domain
  let valid = 0
  let passed = 0
  let integrandMatches = 0
  let integrandComparable = 0
  for (let i = 0; i < SAMPLES; i++) {
    const x = lo + ((i + 0.5) / SAMPLES) * (hi - lo)
    const g = integrand(x)
    if (!isFinite(g)) continue
    const fx = F(x)
    if (isFinite(fx)) {
      integrandComparable++
      if (Math.abs(fx - g) <= 1e-6 * (1 + Math.abs(g))) integrandMatches++
    }
    const d = derivative(F, x)
    if (!isFinite(d)) continue
    valid++
    const tol = 1e-4 * (1 + Math.max(Math.abs(g), Math.abs(d)))
    if (Math.abs(d - g) <= tol) passed++
  }
  const ok = valid >= MIN_VALID && valid - passed <= 1
  const matchedIntegrand =
    !ok && integrandComparable >= MIN_VALID && integrandMatches === integrandComparable
  return { ok, validPoints: valid, matchedIntegrand }
}

/** Full pipeline: raw text -> verdict. */
export function checkAnswer(
  raw: string,
  integrand: (x: number) => number,
  domain: [number, number],
): CheckVerdict {
  if (!raw.trim()) return { ok: false, code: 'empty', message: 'Enter an answer first.' }
  const parsed = parseAnswer(raw)
  if ('error' in parsed) return { ok: false, code: 'parse', message: parsed.error }
  const res = checkAntiderivative(parsed.evaluate, integrand, domain)
  if (res.ok) return { ok: true, validPoints: res.validPoints }
  if (res.matchedIntegrand)
    return {
      ok: false,
      code: 'integrand',
      message: 'That is the integrand itself — enter its antiderivative.',
      validPoints: res.validPoints,
    }
  if (res.validPoints < MIN_VALID)
    return {
      ok: false,
      code: 'domain',
      message:
        'Your expression could not be evaluated on this problem’s domain — check the syntax reference.',
      validPoints: res.validPoints,
    }
  return {
    ok: false,
    code: 'wrong',
    message: 'Not quite — the derivative of your answer doesn’t match the integrand.',
    validPoints: res.validPoints,
  }
}
