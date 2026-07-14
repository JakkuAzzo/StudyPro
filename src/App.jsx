import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronDown, Clock3,
  Code2, Download, FileJson, Flame, Gauge, Grid2X2, HelpCircle, Home, Import,
  Layers3, Lightbulb, Link2, Menu, MoreHorizontal, Play, Plus, RotateCcw, Search,
  Settings, Sparkles, Target, TimerReset, Trophy, Upload, X, Zap,
} from 'lucide-react'
import { deckTemplate, flattenDeck, normalizeDeck, shuffle } from './data.js'
import { drivingTheoryDeck } from './drivingTheory.js'

const modes = [
  { id: 'mock', name: 'Mock theory test', description: '50 questions with the official 57-minute limit.', icon: TimerReset, color: 'red', meta: 'Exam simulation' },
  { id: 'recall', name: 'Rapid recall', description: 'Race the clock. Retrieve before you reveal.', icon: Zap, color: 'amber', meta: 'Speed + memory' },
  { id: 'learn', name: 'Learn & reveal', description: 'Build familiarity, then rate your confidence.', icon: Layers3, color: 'blue', meta: 'Rote learning' },
  { id: 'cloze', name: 'Fill the blank', description: 'Type the missing term from its definition.', icon: Code2, color: 'violet', meta: 'Written recall' },
  { id: 'reason', name: 'Explain why', description: 'Reason in your own words, then compare.', icon: Lightbulb, color: 'green', meta: 'Deep understanding' },
  { id: 'quiz', name: 'Quiz arena', description: 'Choose quickly from plausible alternatives.', icon: Trophy, color: 'coral', meta: 'Multiple choice' },
  { id: 'match', name: 'Match sprint', description: 'Pair every term with its definition.', icon: Grid2X2, color: 'cyan', meta: 'Pattern recognition' },
]

const starterDeck = normalizeDeck(drivingTheoryDeck)

function loadDecks() {
  try {
    const saved = JSON.parse(localStorage.getItem('studypro:decks'))
    if (!Array.isArray(saved) || !saved.length) return [starterDeck]
    return [starterDeck, ...saved.filter((deck) => deck.id !== starterDeck.id)]
  } catch {
    return [starterDeck]
  }
}

function Logo() {
  return <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
}

function Header({ onImport, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
      <div className="brand"><Logo /><span>StudyPro</span></div>
      <div className="top-actions">
        <button className="button button-ghost hide-mobile" onClick={onImport}><Upload size={17} /> Import JSON</button>
        <button className="avatar" aria-label="Profile">NB</button>
      </div>
    </header>
  )
}

function Sidebar({ open, onClose, active, setActive, onImport }) {
  const nav = [
    { id: 'home', label: 'Study home', icon: Home },
    { id: 'library', label: 'My library', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: Gauge },
  ]
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => { setActive(id); onClose() }}>
              <Icon size={18} /> {label}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">Create</p>
          <button className="nav-item" onClick={onImport}><FileJson size={18} /> Import a set</button>
        </nav>
        <div className="sidebar-tip">
          <div className="tip-icon"><Sparkles size={17} /></div>
          <div><strong>Study smarter</strong><p>Short, varied sessions make memories easier to retrieve.</p></div>
        </div>
        <button className="nav-item subtle"><Settings size={18} /> Settings</button>
      </aside>
    </>
  )
}

function ImportModal({ onClose, onImport }) {
  const [value, setValue] = useState(deckTemplate)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function process(text) {
    try {
      const deck = normalizeDeck(JSON.parse(text))
      onImport(deck)
      onClose()
    } catch (err) {
      setError(err instanceof SyntaxError ? `Invalid JSON: ${err.message}` : err.message)
    }
  }

  function readFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setValue(String(reader.result)); setError('') }
    reader.readAsText(file)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <div className="modal-heading">
          <div><span className="eyebrow">NEW STUDY SET</span><h2 id="import-title">Turn notes into practice</h2><p>Paste structured JSON or choose a file. Your content never leaves this browser.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="import-tools">
          <button className="button button-secondary" onClick={() => inputRef.current?.click()}><Upload size={17} /> Choose .json file</button>
          <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={readFile} />
          <span>or edit the starter template</span>
        </div>
        <label className="json-label" htmlFor="json-input">JSON content</label>
        <textarea id="json-input" className={`json-editor ${error ? 'has-error' : ''}`} value={value} onChange={(e) => { setValue(e.target.value); setError('') }} spellCheck="false" />
        {error && <div className="error-message"><HelpCircle size={16} /> {error}</div>}
        <div className="schema-note"><Code2 size={16} /><span>Accepted aliases: <code>term</code>/<code>answer</code>, <code>question</code>/<code>answer</code>, or <code>key</code>/<code>definition</code>.</span></div>
        <div className="modal-actions">
          <button className="button button-ghost" onClick={onClose}>Cancel</button>
          <button className="button button-primary" onClick={() => process(value)}><Sparkles size={17} /> Generate resources</button>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, detail, color }) {
  return <article className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19} /></div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></article>
}

function ModeCard({ mode, onStart, disabled }) {
  const Icon = mode.icon
  return (
    <article className="mode-card">
      <div className="mode-top"><div className={`mode-icon ${mode.color}`}><Icon size={22} /></div><span className="mode-meta">{mode.meta}</span></div>
      <h3>{mode.name}</h3><p>{mode.description}</p>
      <button className="mode-start" onClick={() => onStart(mode.id)} disabled={disabled}>Start session <ArrowRight size={17} /></button>
    </article>
  )
}

function HomePage({ deck, topic, setTopic, onStart, stats, onImport }) {
  const items = flattenDeck(deck, topic)
  return (
    <main className="page-content">
      <section className="hero-row">
        <div><span className="eyebrow">YOUR STUDY SPACE</span><h1>Make it <em>stick.</em></h1><p>Turn your notes into active practice, then learn exactly where to focus next.</p></div>
        <button className="button button-primary mobile-import" onClick={onImport}><Plus size={18} /> New study set</button>
      </section>
      <section className="deck-banner">
        <div className="deck-visual"><Brain size={34} /><span className="orbit one" /><span className="orbit two" /></div>
        <div className="deck-copy"><span className="deck-subject">CURRENT SET · {deck.subject.toUpperCase()}</span><h2>{deck.title}</h2><p>{deck.description}</p></div>
        <div className="deck-metric"><strong>{items.length}</strong><span>{items.length === 1 ? 'card' : 'cards'} in view</span></div>
        <label className="topic-select"><span>Topic</span><div><select value={topic} onChange={(e) => setTopic(e.target.value)}><option>All topics</option>{deck.topics.map((group) => <option key={group.title}>{group.title}</option>)}</select><ChevronDown size={16} /></div></label>
      </section>
      <section className="stats-grid" aria-label="Study summary">
        <StatCard icon={Flame} label="Study streak" value={`${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`} detail="Keep the rhythm" color="orange" />
        <StatCard icon={Target} label="Mastery" value={`${stats.mastery}%`} detail={`${stats.answers} ${stats.answers === 1 ? 'answer' : 'answers'} logged`} color="green" />
        <StatCard icon={Clock3} label="Time studied" value={`${stats.minutes} min`} detail="Across all sessions" color="blue" />
      </section>
      <section className="section-heading"><div><span className="eyebrow">PRACTICE YOUR WAY</span><h2>Choose a study mode</h2></div><span className="resource-count">{items.length} {items.length === 1 ? 'prompt' : 'prompts'} ready</span></section>
      <section className="mode-grid">{modes.map((mode) => <ModeCard key={mode.id} mode={mode} onStart={onStart} disabled={!items.length || (mode.id === 'mock' && items.length < 50)} />)}</section>
      {deck.attribution && <footer className="content-attribution"><strong>Independent practice resource.</strong> {deck.attribution} The live test questions are not published.</footer>}
    </main>
  )
}

function LibraryPage({ decks, activeId, onSelect, onImport }) {
  return (
    <main className="page-content">
      <section className="simple-heading"><div><span className="eyebrow">YOUR CONTENT</span><h1>Study library</h1><p>Every set is ready to become a focused practice session.</p></div><button className="button button-primary" onClick={onImport}><Plus size={18} /> Import set</button></section>
      <div className="search-box"><Search size={18} /><input aria-label="Search library" placeholder="Search your sets" /></div>
      <section className="library-grid">
        {decks.map((deck, index) => {
          const count = flattenDeck(deck).length
          return <button key={deck.id} className={`library-card ${activeId === deck.id ? 'selected' : ''}`} onClick={() => onSelect(deck.id)}><div className={`library-cover cover-${index % 4}`}><BookOpen size={28} /></div><span className="deck-subject">{deck.subject}</span><h3>{deck.title}</h3><p>{deck.description}</p><div><span>{deck.topics.length} topics</span><span>{count} cards</span></div></button>
        })}
      </section>
    </main>
  )
}

function ProgressPage({ stats }) {
  const mastery = Math.min(100, stats.mastery)
  return (
    <main className="page-content">
      <section className="simple-heading"><div><span className="eyebrow">LEARNING SIGNALS</span><h1>Your progress</h1><p>A lightweight view of the work you’ve done in this browser.</p></div></section>
      <section className="progress-panel">
        <div className="mastery-ring" style={{ '--progress': `${mastery * 3.6}deg` }}><div><strong>{mastery}%</strong><span>mastery</span></div></div>
        <div className="progress-copy"><span className="eyebrow">OVERALL MASTERY</span><h2>Consistency beats intensity.</h2><p>You’ve completed <strong>{stats.sessions}</strong> sessions and logged <strong>{stats.answers}</strong> answers. Keep using the harder written and reasoning modes to make recall more durable.</p><div className="progress-bars"><span><i style={{ width: `${Math.max(6, mastery)}%` }} />Knowledge strength</span><span><i style={{ width: `${Math.max(8, Math.min(100, stats.sessions * 12))}%` }} />Practice consistency</span></div></div>
      </section>
    </main>
  )
}

function SessionHeader({ mode, current, total, elapsed, onExit }) {
  const currentMode = modes.find((item) => item.id === mode)
  const shownSeconds = mode === 'mock' ? Math.max(0, 3420 - elapsed) : elapsed
  return <header className="session-header"><button className="button button-ghost" onClick={onExit}><ArrowLeft size={18} /> Exit</button><div className="session-title"><span>{currentMode.name}</span><div className="session-progress"><i style={{ width: `${(current / total) * 100}%` }} /></div><small>{current} of {total}</small></div><div className="session-time"><Clock3 size={17} /> {Math.floor(shownSeconds / 60)}:{String(shownSeconds % 60).padStart(2, '0')}</div></header>
}

function Finished({ score, total, elapsed, onRestart, onExit }) {
  const percent = Math.round((score / Math.max(1, total)) * 100)
  return <div className="finished"><div className="celebration"><Trophy size={38} /></div><span className="eyebrow">SESSION COMPLETE</span><h1>{percent >= 80 ? 'That knowledge is taking root.' : 'Good work. Now you know where to focus.'}</h1><p>Retrieval is meant to feel effortful—that effort is the useful part.</p><div className="result-grid"><div><strong>{score}/{total}</strong><span>secure</span></div><div><strong>{percent}%</strong><span>accuracy</span></div><div><strong>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</strong><span>time</span></div></div><div className="finished-actions"><button className="button button-secondary" onClick={onExit}>Back home</button><button className="button button-primary" onClick={onRestart}><RotateCcw size={17} /> Practice again</button></div></div>
}

function MatchBoard({ items, onFinish }) {
  const roundItems = useMemo(() => shuffle(items).slice(0, 6), [items])
  const [terms, setTerms] = useState(() => shuffle(roundItems))
  const [definitions, setDefinitions] = useState(() => shuffle(roundItems))
  const [term, setTerm] = useState(null)
  const [definition, setDefinition] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState(false)
  const attempts = useRef(0)

  useEffect(() => {
    if (!term || !definition) return
    attempts.current += 1
    if (term.id === definition.id) {
      const next = [...matched, term.id]
      setMatched(next); setTerm(null); setDefinition(null)
      if (next.length === roundItems.length) setTimeout(() => onFinish(roundItems.length, attempts.current), 450)
    } else {
      setWrong(true)
      const timer = setTimeout(() => { setWrong(false); setTerm(null); setDefinition(null) }, 550)
      return () => clearTimeout(timer)
    }
  }, [term, definition]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="match-wrap"><div className="study-prompt"><span className="prompt-kicker">MATCH EVERY PAIR</span><h2>Connect each term to its meaning.</h2><p>{matched.length} of {roundItems.length} matched</p></div><div className={`match-grid ${wrong ? 'shake' : ''}`}><div className="match-column">{terms.map((item) => <button key={item.id} className={`${term?.id === item.id ? 'selected' : ''} ${matched.includes(item.id) ? 'matched' : ''}`} onClick={() => setTerm(item)} disabled={matched.includes(item.id)}>{matched.includes(item.id) && <Check size={16} />}{item.key}</button>)}</div><div className="match-column definitions">{definitions.map((item) => <button key={item.id} className={`${definition?.id === item.id ? 'selected' : ''} ${matched.includes(item.id) ? 'matched' : ''}`} onClick={() => setDefinition(item)} disabled={matched.includes(item.id)}>{item.definition}</button>)}</div></div></div>
}

function StudySession({ mode, items, onExit, onComplete }) {
  const [round, setRound] = useState(0)
  const sessionItems = useMemo(() => mode === 'mock' ? shuffle(items).slice(0, 50) : shuffle(items), [items, mode, round])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [reveal, setReveal] = useState(false)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const item = sessionItems[index]
  const total = mode === 'match' ? Math.min(6, items.length) : sessionItems.length

  useEffect(() => {
    if (finished) return undefined
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [finished])

  useEffect(() => {
    if (mode === 'mock' && elapsed >= 3420 && !finished) complete(score)
  }, [elapsed, mode, finished]) // eslint-disable-line react-hooks/exhaustive-deps

  function complete(finalScore, attempts = total) {
    setScore(finalScore); setFinished(true); onComplete({ score: finalScore, total: attempts, elapsed })
  }

  function next(wasCorrect) {
    const nextScore = score + (wasCorrect ? 1 : 0)
    if (index + 1 >= sessionItems.length) complete(nextScore)
    else { setScore(nextScore); setIndex(index + 1); setReveal(false); setAnswer(''); setFeedback(null) }
  }

  function restart() {
    setRound((value) => value + 1); setIndex(0); setScore(0); setReveal(false); setAnswer(''); setFeedback(null); setElapsed(0); setFinished(false)
  }

  function checkTyped() {
    const clean = (value) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '')
    const correct = clean(answer) === clean(item.key)
    setFeedback(correct ? 'correct' : 'incorrect')
    if (correct) setScore((value) => value + 1)
  }

  const quizOptions = useMemo(() => {
    if (!['quiz', 'mock'].includes(mode) || !item) return []
    const sameTopic = sessionItems.filter((candidate) => candidate.id !== item.id && candidate.topic === item.topic)
    const pool = sameTopic.length >= 3 ? sameTopic : sessionItems.filter((candidate) => candidate.id !== item.id)
    const others = shuffle(pool).slice(0, 3)
    return shuffle([item, ...others])
  }, [mode, item, sessionItems])

  if (finished) return <div className="session-shell"><SessionHeader mode={mode} current={total} total={total} elapsed={elapsed} onExit={onExit} /><Finished score={score} total={mode === 'match' ? Math.max(score, total) : total} elapsed={elapsed} onRestart={restart} onExit={onExit} /></div>

  return (
    <div className="session-shell">
      <SessionHeader mode={mode} current={mode === 'match' ? 1 : index + 1} total={mode === 'match' ? 1 : total} elapsed={elapsed} onExit={onExit} />
      <main className="session-main">
        {mode === 'match' && <MatchBoard key={round} items={items} onFinish={(matched, attempts) => complete(matched, attempts)} />}
        {mode === 'recall' && <div className="study-card-wrap"><div className={`study-card flip-card ${reveal ? 'revealed' : ''}`}><span className="prompt-kicker">{item.question ? 'QUICK RECALL' : 'DEFINE THE TERM'}</span><span className="topic-pill">{item.topic}</span><h1>{item.question || item.key}</h1>{reveal ? <div className="revealed-answer"><span>ANSWER</span><p>{item.definition}</p>{item.source && <small>Source: {item.source}</small>}{item.example && <small>Example: {item.example}</small>}</div> : <button className="reveal-button" onClick={() => setReveal(true)}><Play size={17} /> Reveal answer</button>}</div>{reveal && <div className="rating-row"><span>How did recall feel?</span><div><button className="button button-secondary" onClick={() => next(false)}>Again</button><button className="button button-primary" onClick={() => next(true)}><Check size={17} /> Got it</button></div></div>}</div>}
        {mode === 'learn' && <div className="study-card-wrap"><div className="study-card learn-card"><span className="prompt-kicker">LEARN THE CONNECTION</span><span className="topic-pill">{item.topic}</span><h1>{item.key}</h1><p className="large-definition">{item.definition}</p>{reveal && <div className="insight-box"><Lightbulb size={19} /><div><strong>Why it matters</strong><p>{item.explanation}</p>{item.example && <small>Example: {item.example}</small>}</div></div>}<button className="text-action" onClick={() => setReveal(!reveal)}>{reveal ? 'Hide context' : 'Show context'} <ChevronDown size={16} /></button></div><div className="rating-row"><span>Did this feel familiar?</span><div><button className="button button-secondary" onClick={() => next(false)}>Still learning</button><button className="button button-primary" onClick={() => next(true)}>Familiar <ArrowRight size={17} /></button></div></div></div>}
        {mode === 'cloze' && <div className="study-card-wrap"><div className="study-card written-card"><span className="prompt-kicker">{item.question ? 'WRITE THE ANSWER' : 'TYPE THE MISSING TERM'}</span><span className="topic-pill">{item.topic}</span><p className="cloze-definition">{item.question || <><span className="blank-word">?</span> {item.definition}</>}</p><label htmlFor="cloze-answer">Your answer</label><input id="cloze-answer" autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !feedback && answer && checkTyped()} placeholder="Type your answer…" disabled={Boolean(feedback)} />{feedback && <div className={`answer-feedback ${feedback}`}><div>{feedback === 'correct' ? <CheckCircle2 size={19} /> : <HelpCircle size={19} />}<strong>{feedback === 'correct' ? 'Exactly right' : `Answer: ${item.key}`}</strong></div>{feedback === 'incorrect' && <p>Your answer: {answer || '—'}</p>}</div>}</div><div className="rating-row end"><span>{feedback ? 'Review it, then continue.' : 'Press Enter to check.'}</span>{feedback ? <button className="button button-primary" onClick={() => { if (feedback === 'correct') { if (index + 1 >= sessionItems.length) complete(score) ; else { setIndex(index + 1); setAnswer(''); setFeedback(null) } } else next(false) }}>Continue <ArrowRight size={17} /></button> : <button className="button button-primary" onClick={checkTyped} disabled={!answer.trim()}>Check answer</button>}</div></div>}
        {mode === 'reason' && <div className="study-card-wrap"><div className="study-card written-card"><span className="prompt-kicker">EXPLAIN IT IN YOUR OWN WORDS</span><span className="topic-pill">{item.topic}</span><h2>Why does <em>{item.key}</em> matter, and how does it work?</h2><textarea autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Build your explanation here…" disabled={reveal} />{reveal && <div className="model-answer"><span>COMPARE WITH THE SOURCE</span><p>{item.explanation}</p>{item.example && <small>Example: {item.example}</small>}</div>}</div><div className="rating-row end">{!reveal ? <><span>A few clear sentences is enough.</span><button className="button button-primary" onClick={() => setReveal(true)} disabled={answer.trim().length < 10}>Compare answer</button></> : <><span>Did your answer capture the core idea?</span><div><button className="button button-secondary" onClick={() => next(false)}>Not yet</button><button className="button button-primary" onClick={() => next(true)}>Yes, it did <Check size={17} /></button></div></>}</div></div>}
        {['quiz', 'mock'].includes(mode) && <div className="quiz-wrap"><div className="study-prompt"><span className="prompt-kicker">{mode === 'mock' ? 'TIMED MOCK TEST' : 'CHOOSE THE BEST ANSWER'}</span><span className="topic-pill">{item.topic}</span><h2>{item.question || 'Which term matches this definition?'}</h2>{!item.question && <p>{item.definition}</p>}</div><div className="quiz-options">{quizOptions.map((option, optionIndex) => { const chosen = feedback?.id === option.id; const showCorrect = feedback && option.id === item.id; return <button key={option.id} className={`${chosen ? 'chosen' : ''} ${showCorrect ? 'correct' : ''} ${chosen && option.id !== item.id ? 'incorrect' : ''}`} onClick={() => !feedback && setFeedback(option)} disabled={Boolean(feedback)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option.key}{showCorrect && <Check size={17} />}</button> })}</div>{feedback && <div className="quiz-next"><p>{feedback.id === item.id ? 'Correct.' : `The best answer is ${item.key}.`}</p><button className="button button-primary" onClick={() => next(feedback.id === item.id)}>Next question <ArrowRight size={17} /></button></div>}</div>}
      </main>
    </div>
  )
}

export default function App() {
  const [decks, setDecks] = useState(loadDecks)
  const [activeId, setActiveId] = useState(() => {
    const currentVersion = localStorage.getItem('studypro:contentVersion')
    if (currentVersion !== 'driving-v1') {
      localStorage.setItem('studypro:contentVersion', 'driving-v1')
      return starterDeck.id
    }
    return localStorage.getItem('studypro:active') || starterDeck.id
  })
  const [page, setPage] = useState('home')
  const [topic, setTopic] = useState('All topics')
  const [importOpen, setImportOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studypro:stats')) || { sessions: 0, answers: 0, correct: 0, seconds: 0, streak: 0, lastStudy: null } }
    catch { return { sessions: 0, answers: 0, correct: 0, seconds: 0, streak: 0, lastStudy: null } }
  })
  const deck = decks.find((item) => item.id === activeId) || decks[0]
  const deckItems = flattenDeck(deck, topic)
  const computedStats = { ...stats, mastery: stats.answers ? Math.round((stats.correct / stats.answers) * 100) : 0, minutes: Math.round(stats.seconds / 60) }

  useEffect(() => { localStorage.setItem('studypro:decks', JSON.stringify(decks)) }, [decks])
  useEffect(() => { localStorage.setItem('studypro:active', deck.id) }, [deck.id])
  useEffect(() => { localStorage.setItem('studypro:stats', JSON.stringify(stats)) }, [stats])

  function addDeck(newDeck) {
    const unique = { ...newDeck, id: `${newDeck.id}-${Date.now()}` }
    setDecks((current) => [unique, ...current]); setActiveId(unique.id); setTopic('All topics'); setPage('home')
  }

  function completeSession(result) {
    const today = new Date().toISOString().slice(0, 10)
    setStats((current) => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const streak = current.lastStudy === today ? current.streak : current.lastStudy === yesterday ? current.streak + 1 : 1
      return { sessions: current.sessions + 1, answers: current.answers + result.total, correct: current.correct + result.score, seconds: current.seconds + result.elapsed, streak, lastStudy: today }
    })
  }

  if (session) return <StudySession mode={session} items={deckItems} onExit={() => setSession(null)} onComplete={completeSession} />

  return (
    <div className="app-shell">
      <Header onImport={() => setImportOpen(true)} onMenu={() => setMenuOpen(true)} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} active={page} setActive={setPage} onImport={() => { setImportOpen(true); setMenuOpen(false) }} />
      <div className="content-shell">
        {page === 'home' && <HomePage deck={deck} topic={topic} setTopic={setTopic} onStart={setSession} stats={computedStats} onImport={() => setImportOpen(true)} />}
        {page === 'library' && <LibraryPage decks={decks} activeId={deck.id} onSelect={(id) => { setActiveId(id); setTopic('All topics'); setPage('home') }} onImport={() => setImportOpen(true)} />}
        {page === 'progress' && <ProgressPage stats={computedStats} />}
      </div>
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={addDeck} />}
    </div>
  )
}
