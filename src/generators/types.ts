import type { RNG } from '../lib/rng'

export type TechniqueId =
  | 'basic'
  | 'usub'
  | 'parts'
  | 'trigsub'
  | 'partfrac'
  | 'trigpow'
  | 'compsq'

export interface Problem {
  technique: TechniqueId
  /** Full display LaTeX, e.g. \int x e^{x^2} \, dx */
  latex: string
  /** Evaluable integrand — used by the numerical answer checker. */
  integrand: (x: number) => number
  /** Open interval on which both integrand and exemplar solution are well-behaved. */
  domain: [number, number]
  /** One correct antiderivative, shown on reveal ("+ C" is appended by the UI). */
  solutionLatex: string
  /** Evaluable form of solutionLatex — powers the corpus self-test. */
  solution: (x: number) => number
  hint: string
}

export interface TechniqueDef {
  id: TechniqueId
  name: string
  blurb: string
  generate: (rng: RNG) => Problem
}

/** A variant is one parameterized template within a technique. */
export type Variant = (rng: RNG) => Problem
