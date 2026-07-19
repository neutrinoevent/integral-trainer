import type { TechniqueId } from '../generators/types'

export interface TechStats {
  attempts: number
  correct: number
  streak: number
  bestStreak: number
  /** Exponential moving average of recent results, 0..1 — the "mastery" score. */
  ema: number
  lastPracticed: number | null
}

export interface ProgressState {
  techniques: Partial<Record<TechniqueId, TechStats>>
  totalAttempts: number
  totalCorrect: number
  currentStreak: number
  bestStreak: number
}

const KEY = 'integral-trainer-progress-v1'
const EMA_ALPHA = 0.18

export function emptyStats(): TechStats {
  return { attempts: 0, correct: 0, streak: 0, bestStreak: 0, ema: 0, lastPracticed: null }
}

export function emptyProgress(): ProgressState {
  return { techniques: {}, totalAttempts: 0, totalCorrect: 0, currentStreak: 0, bestStreak: 0 }
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as ProgressState
    if (typeof parsed.totalAttempts !== 'number') return emptyProgress()
    return parsed
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode etc.) — training still works, just untracked
  }
}

export function recordResult(
  state: ProgressState,
  technique: TechniqueId,
  correct: boolean,
): ProgressState {
  const prev = state.techniques[technique] ?? emptyStats()
  const streak = correct ? prev.streak + 1 : 0
  const stats: TechStats = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    ema: prev.ema + EMA_ALPHA * ((correct ? 1 : 0) - prev.ema),
    lastPracticed: Date.now(),
  }
  const currentStreak = correct ? state.currentStreak + 1 : 0
  const next: ProgressState = {
    techniques: { ...state.techniques, [technique]: stats },
    totalAttempts: state.totalAttempts + 1,
    totalCorrect: state.totalCorrect + (correct ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
  }
  saveProgress(next)
  return next
}

export function resetProgress(): ProgressState {
  const next = emptyProgress()
  saveProgress(next)
  return next
}

/** Mastery per technique (0..1) for adaptive problem selection. */
export function masteryMap(state: ProgressState): Partial<Record<TechniqueId, number>> {
  const out: Partial<Record<TechniqueId, number>> = {}
  for (const [id, s] of Object.entries(state.techniques)) {
    if (s) out[id as TechniqueId] = s.ema
  }
  return out
}
