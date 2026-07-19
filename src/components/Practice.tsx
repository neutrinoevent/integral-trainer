import { useMemo, useState } from 'react'
import { TECHNIQUES, nextProblem, type Mode, type Problem, type TechniqueId } from '../generators'
import { checkAnswer, parseAnswer, type CheckVerdict } from '../lib/checker'
import type { ProgressState } from '../store/progress'
import { masteryMap } from '../store/progress'
import { Tex } from './Tex'

interface PracticeProps {
  progress: ProgressState
  onRecord: (technique: TechniqueId, correct: boolean) => void
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'adaptive', label: 'Adaptive' },
  { id: 'mix', label: 'Mixed' },
  ...TECHNIQUES.map((t) => ({ id: t.id as Mode, label: t.name })),
]

export function Practice({ progress, onRecord }: PracticeProps) {
  const [mode, setMode] = useState<Mode>('adaptive')
  const [problem, setProblem] = useState<Problem>(() => nextProblem('mix'))
  const [answer, setAnswer] = useState('')
  const [verdict, setVerdict] = useState<CheckVerdict | null>(null)
  const [hintShown, setHintShown] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [scored, setScored] = useState(false)

  const solved = verdict?.ok === true

  const preview = useMemo(() => {
    if (!answer.trim()) return null
    const parsed = parseAnswer(answer)
    return 'error' in parsed ? { error: parsed.error } : { tex: parsed.tex }
  }, [answer])

  const advance = (nextMode: Mode = mode) => {
    setProblem(nextProblem(nextMode, masteryMap(progress)))
    setAnswer('')
    setVerdict(null)
    setHintShown(false)
    setRevealed(false)
    setScored(false)
  }

  const changeMode = (m: Mode) => {
    setMode(m)
    advance(m)
  }

  const check = () => {
    if (solved) {
      advance()
      return
    }
    const v = checkAnswer(answer, problem.integrand, problem.domain)
    setVerdict(v)
    // Only score real attempts: syntax/domain slips don't count against you.
    const scorable = v.ok || (!v.ok && (v.code === 'wrong' || v.code === 'integrand'))
    if (!scored && !revealed && scorable) {
      onRecord(problem.technique, v.ok)
      setScored(true)
    }
  }

  const reveal = () => {
    if (!scored && !solved) {
      onRecord(problem.technique, false)
      setScored(true)
    }
    setRevealed(true)
  }

  const techName = TECHNIQUES.find((t) => t.id === problem.technique)?.name ?? problem.technique

  return (
    <section className="practice">
      <div className="mode-bar" role="tablist" aria-label="Practice mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? 'chip chip-active' : 'chip'}
            onClick={() => changeMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="card problem-card">
        <div className="problem-meta">
          <span className="badge">{techName}</span>
          {mode === 'adaptive' || mode === 'mix' ? (
            <span className="meta-note">technique revealed — try to spot it yourself first</span>
          ) : null}
        </div>
        <div className="problem-tex">
          <Tex tex={problem.latex} block />
        </div>

        <label className="answer-label" htmlFor="answer-input">
          Antiderivative <span className="muted">(+ C optional)</span>
        </label>
        <div className="answer-row">
          <input
            id="answer-input"
            className="answer-input"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g.  e^(x^2)/2 + C"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value)
              if (verdict && !verdict.ok) setVerdict(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') check()
            }}
          />
          <button className="btn btn-primary" onClick={check}>
            {solved ? 'Next →' : 'Check'}
          </button>
        </div>

        {preview !== null ? (
          <div className="preview">
            {'tex' in preview ? (
              <>
                <span className="muted preview-label">reads as</span> <Tex tex={preview.tex ?? ''} />
              </>
            ) : (
              <span className="muted preview-label">…keep typing (can’t parse yet)</span>
            )}
          </div>
        ) : (
          <div className="preview preview-empty" />
        )}

        {verdict !== null ? (
          <div
            className={verdict.ok ? 'feedback feedback-good' : 'feedback feedback-bad'}
            role="status"
          >
            {verdict.ok ? (
              <>
                <span aria-hidden="true">✓</span> Correct — verified at {verdict.validPoints} sample
                points.
              </>
            ) : (
              <>
                <span aria-hidden="true">✕</span> {verdict.message}
              </>
            )}
          </div>
        ) : null}

        <div className="actions">
          <button className="btn" onClick={() => setHintShown(true)} disabled={hintShown}>
            Hint
          </button>
          <button className="btn" onClick={reveal} disabled={revealed}>
            Show solution
          </button>
          <button className="btn" onClick={() => advance()}>
            {solved ? 'Next problem' : 'Skip'}
          </button>
        </div>

        {hintShown ? <div className="hint">{problem.hint}</div> : null}
        {revealed ? (
          <div className="solution">
            <span className="muted">One valid answer:</span>{' '}
            <Tex tex={`${problem.solutionLatex} + C`} />
            <div className="muted solution-note">
              Any expression whose derivative is the integrand is accepted.
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
