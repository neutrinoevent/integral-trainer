import { useEffect, useState } from 'react'
import { Practice } from './components/Practice'
import { ProgressView } from './components/ProgressView'
import { Reference } from './components/Reference'
import type { TechniqueId } from './generators'
import { loadProgress, recordResult, resetProgress, type ProgressState } from './store/progress'

type View = 'practice' | 'progress' | 'reference'
type Theme = 'light' | 'dark' | null

const THEME_KEY = 'integral-trainer-theme'

function initTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

const VIEWS: { id: View; label: string }[] = [
  { id: 'practice', label: 'Practice' },
  { id: 'progress', label: 'Progress' },
  { id: 'reference', label: 'Reference' },
]

export default function App() {
  const [view, setView] = useState<View>('practice')
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [theme, setTheme] = useState<Theme>(() => initTheme())

  useEffect(() => {
    const root = document.documentElement
    if (theme) {
      root.setAttribute('data-theme', theme)
      try {
        localStorage.setItem(THEME_KEY, theme)
      } catch {
        // storage unavailable — theme just won't persist
      }
    } else {
      root.removeAttribute('data-theme')
    }
  }, [theme])

  const record = (technique: TechniqueId, correct: boolean) =>
    setProgress((p) => recordResult(p, technique, correct))

  const toggleTheme = () => {
    const dark =
      theme === 'dark' ||
      (theme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(dark ? 'light' : 'dark')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∫
          </span>
          <span className="brand-name">Integral Trainer</span>
        </div>
        <nav className="tabs" aria-label="Main">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={view === v.id ? 'tab tab-active' : 'tab'}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </nav>
        <button className="btn theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
          ◐
        </button>
      </header>

      <main className="main">
        {view === 'practice' ? <Practice progress={progress} onRecord={record} /> : null}
        {view === 'progress' ? (
          <ProgressView progress={progress} onReset={() => setProgress(resetProgress())} />
        ) : null}
        {view === 'reference' ? <Reference /> : null}
      </main>

      <footer className="footer muted">
        Local-first drilling — no server, no accounts. Progress lives in this browser.
      </footer>
    </div>
  )
}
