/** Helpers for assembling clean LaTeX from integer/rational parameters. */

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/** Coefficient in front of a symbol: 1 -> '', -1 -> '-', else the number. */
export function coef(a: number): string {
  if (a === 1) return ''
  if (a === -1) return '-'
  return String(a)
}

/** Reduced rational n/d as a bare LaTeX number (no trailing symbol). */
export function fracTex(n: number, d: number): string {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  if (d === 1) return String(n)
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
}

/** Reduced rational n/d as a coefficient (1 -> '', -1 -> '-'). */
export function fracCoef(n: number, d: number): string {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  if (d === 1) return coef(n)
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
}

/** Join already-signed LaTeX terms with ' + ' / ' - '. */
export function joinTerms(terms: string[]): string {
  return terms
    .filter((t) => t !== '' && t !== '0')
    .reduce(
      (acc, t) =>
        acc === '' ? t : t.startsWith('-') ? `${acc} - ${t.slice(1)}` : `${acc} + ${t}`,
      '',
    )
}

/** LaTeX for a*x + b with clean signs; omits zero terms. */
export function linTex(a: number, b: number, v = 'x'): string {
  const terms: string[] = []
  if (a !== 0) terms.push(`${coef(a)}${v}`)
  if (b !== 0) terms.push(String(b))
  return terms.length ? joinTerms(terms) : '0'
}

/** LaTeX for x^2 + b*x + c with clean signs. */
export function quadTex(b: number, c: number, v = 'x'): string {
  const terms: string[] = [`${v}^2`]
  if (b !== 0) terms.push(`${coef(b)}${v}`)
  if (c !== 0) terms.push(String(c))
  return joinTerms(terms)
}

export function intTex(body: string): string {
  return `\\int ${body} \\, dx`
}
