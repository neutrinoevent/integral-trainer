import { TECHNIQUES } from '../generators'
import { Tex } from './Tex'

const SYNTAX_ROWS: { input: string; meaning: string }[] = [
  { input: 'x^3/3 + C', meaning: 'powers and fractions; “+ C” is optional' },
  { input: '2x, 3sin(x), x(x+1)', meaning: 'implicit multiplication works' },
  { input: 'sqrt(x)', meaning: 'square root' },
  { input: 'ln(x), ln|x|, log(x)', meaning: 'natural logarithm (all three)' },
  { input: 'e^x, exp(x)', meaning: 'exponential' },
  { input: 'sin, cos, tan, sec', meaning: 'trig functions' },
  { input: 'arcsin(x) / asin(x)', meaning: 'inverse trig (either spelling)' },
  { input: 'arctan(x/2)/2', meaning: 'compose freely' },
  { input: 'abs(x) or |x|', meaning: 'absolute value' },
  { input: 'pi, e', meaning: 'constants' },
]

const FORMULAS: { tex: string }[] = [
  { tex: '\\int x^n\\,dx = \\tfrac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)' },
  { tex: '\\int \\tfrac{dx}{x} = \\ln|x| + C' },
  { tex: "\\int f(g(x))\\,g'(x)\\,dx = F(g(x)) + C" },
  { tex: '\\int u\\,dv = uv - \\int v\\,du' },
  { tex: '\\sqrt{a^2 - x^2} \\;\\Rightarrow\\; x = a\\sin\\theta' },
  { tex: '\\sqrt{a^2 + x^2} \\;\\Rightarrow\\; x = a\\tan\\theta' },
  { tex: '\\sqrt{x^2 - a^2} \\;\\Rightarrow\\; x = a\\sec\\theta' },
  { tex: '\\frac{1}{(x+a)(x+b)} = \\frac{A}{x+a} + \\frac{B}{x+b}' },
  { tex: '\\sin^2 x = \\tfrac{1 - \\cos 2x}{2}, \\quad \\cos^2 x = \\tfrac{1 + \\cos 2x}{2}' },
  { tex: 'x^2 + 2bx + c = (x+b)^2 + (c - b^2)' },
]

export function Reference() {
  return (
    <section className="reference">
      <div className="card">
        <h2 className="section-title">How answers are checked</h2>
        <p>
          Type any antiderivative — the trainer differentiates your expression numerically and
          compares it to the integrand across the problem&rsquo;s domain. Every algebraically
          equivalent form passes, with or without <code>+ C</code>. Everything runs locally in
          your browser; nothing is sent anywhere.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Input syntax</h2>
        <table className="syntax-table">
          <thead>
            <tr>
              <th scope="col">You type</th>
              <th scope="col">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {SYNTAX_ROWS.map((r) => (
              <tr key={r.input}>
                <td>
                  <code>{r.input}</code>
                </td>
                <td>{r.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="section-title">Techniques covered</h2>
        <ul className="tech-list">
          {TECHNIQUES.map((t) => (
            <li key={t.id}>
              <strong>{t.name}</strong> — {t.blurb}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title">Key identities</h2>
        <ul className="formula-list">
          {FORMULAS.map((f) => (
            <li key={f.tex}>
              <Tex tex={f.tex} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
