// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from '../App'

/**
 * End-to-end UI flow in a real DOM: render → problem shows as KaTeX →
 * type an answer (live preview) → check → feedback → progress persisted.
 */

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // Node's experimental webstorage can shadow jsdom's localStorage with a
  // broken instance — install a plain in-memory Storage for the test.
  const store = new Map<string, string>()
  const memoryStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true })
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true })
})

function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function buttonByText(text: string): HTMLButtonElement {
  const btn = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.includes(text),
  )
  if (!btn) throw new Error(`No button containing “${text}”`)
  return btn
}

describe('full practice flow', () => {
  it('renders a problem, checks an answer, reveals a solution, records progress', () => {
    window.localStorage.clear()
    const host = document.createElement('div')
    document.body.appendChild(host)
    let root: Root
    act(() => {
      root = createRoot(host)
      root.render(<App />)
    })

    // Problem rendered as KaTeX
    expect(document.querySelector('.problem-tex .katex')).toBeTruthy()
    expect(document.querySelector('.badge')?.textContent).toBeTruthy()

    // Live preview parses calculator syntax
    const input = document.querySelector<HTMLInputElement>('#answer-input')!
    typeInto(input, '2x + sin(x)')
    expect(document.querySelector('.preview .katex')).toBeTruthy()

    // A wrong answer produces negative feedback and scores one attempt
    typeInto(input, 'x^123')
    click(buttonByText('Check'))
    expect(document.querySelector('.feedback-bad')).toBeTruthy()

    // Reveal shows an exemplar solution in KaTeX (no double-scoring)
    click(buttonByText('Show solution'))
    expect(document.querySelector('.solution .katex')).toBeTruthy()

    // Progress persisted to localStorage
    const stored = JSON.parse(window.localStorage.getItem('integral-trainer-progress-v1')!)
    expect(stored.totalAttempts).toBe(1)
    expect(stored.totalCorrect).toBe(0)

    // Progress tab reflects it
    click(buttonByText('Progress'))
    expect(document.querySelectorAll('.stat-tile').length).toBe(4)
    expect(document.querySelector('.technique-table')).toBeTruthy()

    // Skip to a fresh problem back on Practice, switch to a specific technique
    click(buttonByText('Practice'))
    click(buttonByText('u-substitution'))
    expect(document.querySelector('.problem-tex .katex')).toBeTruthy()
    expect(document.querySelector('.badge')?.textContent).toBe('u-substitution')

    act(() => root.unmount())
    host.remove()
  })
})
