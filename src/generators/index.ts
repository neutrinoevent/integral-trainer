import { RNG } from '../lib/rng'
import type { Problem, TechniqueDef, TechniqueId } from './types'
import { generateBasic } from './basic'
import { generateUSub } from './usub'
import { generateParts } from './parts'
import { generateTrigSub } from './trigsub'
import { generatePartFrac } from './partfrac'
import { generateTrigPow } from './trigpow'
import { generateCompSq } from './compsq'

/**
 * Technique registry. To extend the trainer, add a generator module and
 * register it here — everything else (practice modes, progress tracking,
 * the reference page) picks it up automatically.
 */
export const TECHNIQUES: TechniqueDef[] = [
  {
    id: 'basic',
    name: 'Basic rules',
    blurb: 'Power rule, exponentials, trig, and other table antiderivatives.',
    generate: generateBasic,
  },
  {
    id: 'usub',
    name: 'u-substitution',
    blurb: 'Reverse chain rule: spot the inner function and its derivative.',
    generate: generateUSub,
  },
  {
    id: 'parts',
    name: 'Integration by parts',
    blurb: '∫u dv = uv − ∫v du, including repeated and cyclic applications.',
    generate: generateParts,
  },
  {
    id: 'trigsub',
    name: 'Trig substitution',
    blurb: 'Radicals of a²−x², a²+x², x²−a² via sin, tan, and sec substitutions.',
    generate: generateTrigSub,
  },
  {
    id: 'partfrac',
    name: 'Partial fractions',
    blurb: 'Rational functions: distinct, repeated, and irreducible factors.',
    generate: generatePartFrac,
  },
  {
    id: 'trigpow',
    name: 'Trig powers & products',
    blurb: 'Powers of sin/cos/tan/sec and product-to-sum identities.',
    generate: generateTrigPow,
  },
  {
    id: 'compsq',
    name: 'Completing the square',
    blurb: 'Quadratics with negative discriminant → arctan, arcsin, ln forms.',
    generate: generateCompSq,
  },
]

export const TECHNIQUE_BY_ID: Record<TechniqueId, TechniqueDef> = Object.fromEntries(
  TECHNIQUES.map((t) => [t.id, t]),
) as Record<TechniqueId, TechniqueDef>

export type Mode = TechniqueId | 'mix' | 'adaptive'

let counter = 0

/**
 * Generate the next problem. `mastery` (0..1 per technique) is only used by
 * adaptive mode, which oversamples the weakest techniques.
 */
export function nextProblem(mode: Mode, mastery?: Partial<Record<TechniqueId, number>>): Problem {
  const rng = new RNG((Date.now() ^ (counter++ * 0x9e3779b9)) >>> 0)
  if (mode !== 'mix' && mode !== 'adaptive') {
    return TECHNIQUE_BY_ID[mode].generate(rng)
  }
  if (mode === 'adaptive' && mastery) {
    const weights = TECHNIQUES.map((t) => 1.15 - Math.min(mastery[t.id] ?? 0, 1))
    const total = weights.reduce((s, w) => s + w, 0)
    let r = rng.next() * total
    for (let i = 0; i < TECHNIQUES.length; i++) {
      r -= weights[i]
      if (r <= 0) return TECHNIQUES[i].generate(rng)
    }
  }
  return rng.pick(TECHNIQUES).generate(rng)
}

export type { Problem, TechniqueDef, TechniqueId } from './types'
