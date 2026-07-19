# Integral Trainer

Browser-based drill trainer for integration techniques: basic rules, u-substitution,
integration by parts, trig substitution, partial fractions, trig powers, and completing
the square. Problems render in LaTeX, answers are checked instantly, and per-technique
progress is tracked locally. Fully static — no server, no accounts.

## Answer checking

There is no computer algebra system. A submitted antiderivative is parsed with mathjs,
differentiated numerically (five-point stencil), and compared against the integrand at
40 points on the problem's domain. Any correct form passes: different algebraic
simplifications, any constant of integration, `ln|x|` vs `ln(x)`. Input is
calculator-style with implicit multiplication — `x^3/3 + C`, `2x`, `3sin(x)`,
`e^(x^2)/2`, `arctan(x/2)/2` — with a live preview of how the expression is read.

## Problem corpus

Problems come from ~50 parameterized templates across seven technique modules in
`src/generators/`. Templates randomize coefficients, exponents, and roots; each carries
its display LaTeX, an evaluable integrand, a safe sampling domain, a hint, and an
exemplar solution. The test suite validates the corpus the same way user answers are
checked: it differentiates every exemplar solution back to its integrand over 300
seeded problems per technique.

## Progress tracking

Attempts, accuracy, streaks, and a per-technique mastery score (an exponential moving
average of recent results) are stored in `localStorage`. Adaptive mode oversamples the
weakest techniques.

## Development

```bash
npm install
npm run dev        # dev server
npm test           # corpus + checker + UI tests
npm run build      # static build -> dist/
```

`dist/` deploys to any static host. For GitHub Pages under a subpath, set `base` in
`vite.config.ts`.

## Adding a technique

Add a module in `src/generators/` exporting `generate(rng): Problem` and register it in
`src/generators/index.ts`:

```ts
{
  technique: 'mytech',
  latex: '\\int … \\, dx',   // shown to the student
  integrand: (x) => …,       // what the checker differentiates against
  domain: [lo, hi],          // where both sides are well-behaved
  solutionLatex: '…',        // shown on reveal
  solution: (x) => …,        // validated by the test suite
  hint: '…',
}
```

Practice modes, progress tracking, and the reference page pick up new techniques from
the registry; `npm test` validates the new templates automatically.

## License

MIT © Alexander Nichols, Old Dominion University
