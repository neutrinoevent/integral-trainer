import { TECHNIQUES } from '../generators'
import type { ProgressState } from '../store/progress'

interface ProgressViewProps {
  progress: ProgressState
  onReset: () => void
}

function pct(n: number, d: number): string {
  return d === 0 ? '—' : `${Math.round((n / d) * 100)}%`
}

export function ProgressView({ progress, onReset }: ProgressViewProps) {
  const anyData = progress.totalAttempts > 0
  return (
    <section className="progress-view">
      <div className="stat-row">
        <div className="card stat-tile">
          <div className="stat-value">{progress.totalCorrect}</div>
          <div className="stat-label">solved</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{pct(progress.totalCorrect, progress.totalAttempts)}</div>
          <div className="stat-label">accuracy</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{progress.currentStreak}</div>
          <div className="stat-label">current streak</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-value">{progress.bestStreak}</div>
          <div className="stat-label">best streak</div>
        </div>
      </div>

      <div className="card technique-table-card">
        <h2 className="section-title">Strength by technique</h2>
        <p className="muted table-caption">
          Mastery is a moving average of your recent results — it rises with correct answers and
          decays when you miss, so it tracks current strength, not lifetime totals.
        </p>
        <table className="technique-table">
          <thead>
            <tr>
              <th scope="col">Technique</th>
              <th scope="col" className="meter-col">
                Mastery
              </th>
              <th scope="col" className="num">
                Attempts
              </th>
              <th scope="col" className="num">
                Accuracy
              </th>
              <th scope="col" className="num">
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {TECHNIQUES.map((t) => {
              const s = progress.techniques[t.id]
              const mastery = s ? Math.round(s.ema * 100) : 0
              return (
                <tr key={t.id}>
                  <td>
                    <div className="tech-name">{t.name}</div>
                    <div className="muted tech-blurb">{t.blurb}</div>
                  </td>
                  <td className="meter-col">
                    <div
                      className="meter"
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={mastery}
                      aria-label={`${t.name} mastery`}
                    >
                      <div className="meter-fill" style={{ width: `${mastery}%` }} />
                    </div>
                    <span className="meter-num">{s ? `${mastery}%` : '—'}</span>
                  </td>
                  <td className="num">{s ? s.attempts : 0}</td>
                  <td className="num">{s ? pct(s.correct, s.attempts) : '—'}</td>
                  <td className="num">{s ? s.streak : 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="reset-row">
        <button
          className="btn btn-danger"
          disabled={!anyData}
          onClick={() => {
            if (window.confirm('Reset all progress? This cannot be undone.')) onReset()
          }}
        >
          Reset progress
        </button>
      </div>
    </section>
  )
}
