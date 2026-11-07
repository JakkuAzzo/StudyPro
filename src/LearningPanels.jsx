import { useRef, useState } from 'react'
import { topicSummary } from './learning.js'

export function TodayReview({ dueCount, newCount, onStart }) {
  const count = Math.min(10, dueCount + newCount)
  return <section className="revision-panel" aria-labelledby="today-heading"><span className="eyebrow">YOUR NEXT STEP</span><h2 id="today-heading">Today’s revision</h2><p>{dueCount ? `${dueCount} saved or due question${dueCount === 1 ? '' : 's'} to revisit.` : 'No questions are due right now.'} {newCount > 0 && `${newCount} not yet practised in this course.`}</p><button className="button button-primary" disabled={!count} onClick={onStart}>Start a {count}-question review</button><small>Review timing is a guide, not a prediction of exam readiness.</small></section>
}

export function LearningProgress({ deck, history, stats, mocks, onExport, onRestore }) {
  const [message, setMessage] = useState('')
  const file = useRef(null), topics = topicSummary(history, deck.id)
  const total = topics.reduce((n, t) => n + t.total, 0), correct = topics.reduce((n, t) => n + t.correct, 0)
  async function restore(event) {
    const selected = event.target.files?.[0]; event.target.value = ''
    if (!selected) return
    try {
      if (selected.size > 5 * 1024 * 1024) throw new Error('Backup is too large (maximum 5 MB).')
      const parsed = JSON.parse(await selected.text())
      await onRestore(parsed)
      setMessage('Backup restored on this device.')
    } catch (error) { setMessage(error.message || 'The backup could not be restored.') }
  }
  return <main className="page-content"><section className="simple-heading"><div><span className="eyebrow">LEARNING SIGNALS</span><h1>Your progress</h1><p>Practice accuracy for {deck.title}. This is not a prediction of exam readiness.</p></div></section>
    <section className="revision-panel"><h2>Practice accuracy</h2><p>{total ? <><strong>{Math.round(correct / total * 100)}%</strong> · {correct} correct from {total} recorded question {total === 1 ? 'attempt' : 'attempts'}.</> : 'No individual question attempts recorded for this course yet.'}</p><p>{stats.sessions || 0} total sessions on this device, including earlier sessions and other modes.</p></section>
    <section className="revision-panel"><h2>Topics to revisit</h2>{topics.length ? <ul className="topic-list">{topics.map(t => <li key={t.topic}><strong>{t.topic}</strong><span>{t.correct}/{t.total} correct · {Math.round(t.correct / t.total * 100)}%</span></li>)}</ul> : <p>Complete a quiz, review or theory test to see a topic breakdown.</p>}</section>
    {deck.features.includes('theory') && <section className="revision-panel"><h2>Recent theory mock tests</h2>{mocks.length ? <ul>{mocks.map((mock, i) => <li key={`${mock.at}-${i}`}>{new Date(mock.at).toLocaleDateString()} · {mock.score}/{mock.total} · {mock.score >= 43 ? 'Reached the practice pass mark' : 'Below the practice pass mark'}</li>)}</ul> : <p>No mock theory tests completed yet.</p>}<p>Results show past practice only; they do not guarantee an exam result.</p></section>}
    <section className="revision-panel"><h2>Back up your progress</h2><p>Export imported sets, progress and saved questions to a file. Restoring replaces the StudyPro data on this browser; export it first if you want to keep both copies.</p><div className="backup-actions"><button className="button button-secondary" onClick={onExport}>Export backup</button><button className="button button-secondary" onClick={() => file.current?.click()}>Restore backup</button><input ref={file} className="sr-only" tabIndex={-1} aria-hidden="true" type="file" accept="application/json,.json" onChange={restore} aria-label="Choose a StudyPro backup" /></div>{message && <p role="status">{message}</p>}</section>
  </main>
}
