import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Copy, Play, Users } from 'lucide-react'

const serviceUrl = import.meta.env.VITE_PARTY_SERVER_URL || (import.meta.env.DEV ? 'ws://localhost:8787' : '')
const savedKey = 'studypro:party-session'

export default function StudyParty({ decks, onExit }) {
  const [name, setName] = useState(''), [code, setCode] = useState(''), [deckId, setDeckId] = useState(decks[0].id), [mode, setMode] = useState('quiz')
  const [state, setState] = useState(null), [playerId, setPlayerId] = useState(''), [error, setError] = useState(''), [connected, setConnected] = useState(false), [starting, setStarting] = useState(false)
  const [playing, setPlaying] = useState(false), [clicks, setClicks] = useState(0)
  const socket = useRef(null), video = useRef(null), clipClicks = useRef([]), session = useRef(null)
  const roundKey = `${state?.code || ''}:${state?.room?.index ?? -1}`
  useEffect(() => { setPlaying(false); setClicks(0); clipClicks.current = [] }, [roundKey])
  useEffect(() => () => { socket.current?.close() }, [])
  function send(action, fields = {}) { if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ action, ...fields })); else setError('Connection lost. Reconnect to continue.') }
  function connect(action, fields) {
    if (!serviceUrl) { setError('Study Party is not connected to a room service yet.'); return }
    setError(''); setStarting(true)
    let ws
    try { ws = new WebSocket(serviceUrl) } catch { setStarting(false); setError('The room service address is invalid.'); return }
    socket.current = ws
    let joined = false
    ws.onopen = () => { setConnected(true); ws.send(JSON.stringify({ action, ...fields })) }
    ws.onmessage = event => {
      const message = JSON.parse(event.data)
      if (message.type === 'error') { setError(message.message); setStarting(false); if (!joined) ws.close(); return }
      if (message.type === 'joined') {
        joined = true
        const data = { code: message.code, token: message.token }
        session.current = data; sessionStorage.setItem(savedKey, JSON.stringify(data)); setPlayerId(message.playerId); setStarting(false)
      }
      if (message.room) setState({ code: message.code, room: message.room })
    }
    ws.onerror = () => setError('Could not connect to the room service. Check your connection and try again.')
    ws.onclose = () => { setConnected(false); setStarting(false) }
  }
  function reconnect() {
    try { const data = session.current || JSON.parse(sessionStorage.getItem(savedKey)); if (data?.code && data?.token) connect('resume', data); else setError('No previous room session was found.') } catch { setError('No previous room session was found.') }
  }
  function leave() { sessionStorage.removeItem(savedKey); socket.current?.close(); onExit() }
  const room = state?.room, me = room?.players.find(p => p.id === playerId), host = room?.host === playerId, round = room?.round
  function spot() { if (!playing || !video.current || clipClicks.current.length >= 30) return; clipClicks.current.push(Math.min(video.current.currentTime, round.clip.duration)); setClicks(clipClicks.current.length) }
  async function startVideo() { try { clipClicks.current = []; setClicks(0); video.current.currentTime = 0; await video.current.play(); setPlaying(true); setError('') } catch { setError('The video could not start. Please try again.') } }
  function finishVideo() { if (!playing) return; setPlaying(false); send('answer', { response: clipClicks.current }) }
  return <main className="party-page">
    <header className="party-header"><button className="button button-ghost" onClick={leave}><ArrowLeft size={17} /> Exit</button><div><span className="eyebrow">REVISE TOGETHER</span><h1>Study Party</h1></div><Users size={26} /></header>
    {error && <p className="party-error" role="alert">{error}</p>}
    {!state ? <section className="party-panel"><h2>Study with friends, wherever you are.</h2><p>Create a room or join with a code. No account needed. The room service may take a minute to wake up.</p>
      {!serviceUrl && <p className="party-error">Study Party needs its room service configured before friends can connect.</p>}
      <label>Your display name<input maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label>
      <div className="party-grid"><div><h3>Host a room</h3><label>Course<select value={deckId} onChange={e => { setDeckId(e.target.value); setMode('quiz') }}>{decks.map(deck => <option value={deck.id} key={deck.id}>{deck.title}</option>)}</select></label><label>Activity<select value={mode} onChange={e => setMode(e.target.value)}><option value="quiz">Quiz · up to 10 questions</option>{decks.find(d => d.id === deckId)?.features?.includes('hazard') && <option value="hazard">Hazard perception · 3 clips</option>}</select></label><button className="button button-primary" disabled={!name.trim() || starting || !serviceUrl} onClick={() => connect('create', { name, deckId, mode })}>Create room</button></div>
      <div><h3>Join a room</h3><label>Room code<input maxLength={8} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="8-character code" /></label><button className="button button-secondary" disabled={!name.trim() || code.trim().length !== 8 || starting || !serviceUrl} onClick={() => connect('join', { name, code })}>Join friends</button></div></div>
      {sessionStorage.getItem(savedKey) && <button className="button button-ghost" disabled={starting} onClick={reconnect}>Reconnect to your last room</button>}
      <p className="party-note">Built-in courses only for now. Room names, answers and scores are shared with the room service and other players until the room expires. Rooms end if the service restarts or stays idle.</p></section> : <>
      <section className="party-panel party-room"><div><span className="eyebrow">ROOM CODE</span><h2 className="party-code">{state.code}</h2><button className="button button-ghost" onClick={() => navigator.clipboard?.writeText(state.code).catch(() => setError('Could not copy the code.'))}><Copy size={15} /> Copy code</button></div><div><span className="eyebrow">PLAYERS</span><p>{room.players.map(p => p.name).join(' · ')}</p><p className="party-note">Team score: {room.players.reduce((sum, p) => sum + p.score, 0)}</p></div></section>
      {!connected && <section className="party-panel"><p>Connection lost. Your room may still be active.</p><button className="button button-primary" onClick={reconnect} disabled={starting}>Reconnect</button></section>}
      {room.phase === 'lobby' && <section className="party-panel"><h2>Waiting for friends</h2><p>Share the room code and start when everyone has joined. Players can join before the first round starts.</p>{host && <button className="button button-primary" onClick={() => send('next')} disabled={!connected}><Play size={17} /> Start activity</button>}</section>}
      {room.phase === 'playing' && round?.type === 'quiz' && <section className="party-panel"><span className="eyebrow">QUESTION {room.index + 1} OF {room.total}</span><h2>{round.prompt}</h2>{round.image && <img className="party-question-image" src={round.image} alt={round.imageAlt || ''} />}<div className="party-options">{round.options.map((option, i) => <button key={i} className="party-option" disabled={me?.answered || !connected} onClick={() => send('answer', { response: i })}>{option}</button>)}</div><p>{me?.answered ? 'Answer submitted. Waiting for the reveal.' : 'Choose one answer.'}</p><p className="party-note">{room.players.filter(p => p.answered).length} of {room.players.length} answered</p>{host && <button className="button button-primary" disabled={!connected} onClick={() => send('reveal')}>Reveal answers</button>}</section>}
      {room.phase === 'playing' && round?.type === 'hazard' && <section className="party-panel"><span className="eyebrow">CLIP {room.index + 1} OF {room.total}</span><h2>Spot the developing hazard</h2><p>Play the clip on your own device. Tap when you see a hazard developing; your response is sent when the clip ends.</p><video key={round.clip.id} ref={video} src={round.clip.src} playsInline muted preload="metadata" onClick={spot} onTimeUpdate={e => { if (playing && e.currentTarget.currentTime >= round.clip.duration) { e.currentTarget.pause(); finishVideo() } }} onEnded={finishVideo} onError={() => setError('The clip could not load. Check your connection.')} className="party-video" />{!playing && !me?.answered && <button className="button button-primary" onClick={startVideo} disabled={!connected}><Play size={17} /> Start clip</button>}{playing && <button className="button button-primary" onClick={spot}>Spot hazard · {clicks} taps</button>}{me?.answered && <p>Your response is submitted. Waiting for the reveal.</p>}<p className="party-note">{room.players.filter(p => p.answered).length} of {room.players.length} finished. Practice footage and annotations are not official DVSA material.</p>{host && <button className="button button-secondary" disabled={!connected} onClick={() => send('reveal')}>Reveal results</button>}</section>}
      {room.phase === 'reveal' && <section className="party-panel"><span className="eyebrow">ROUND REVIEW</span><h2>{round.type === 'quiz' ? round.options[round.answer] : 'What to look for'}</h2>{round.type === 'quiz' ? <p>{round.explanation}</p> : <><ul>{round.clip.hazards.map((h, i) => <li key={i}>{h.label}</li>)}</ul><p className="party-note"><a href={round.clip.sourceUrl} target="_blank" rel="noreferrer">{round.clip.author} · {round.clip.license}</a></p></>}<h3>Scores</h3><ul>{room.players.map(p => <li key={p.id}>{p.name}: {p.score} points{!p.answered ? ' · no response' : ''}{round.type === 'hazard' && p.answered && <> · this clip {p.roundScore} points · taps {p.clicks.length ? p.clicks.map(t => `${t.toFixed(1)}s`).join(', ') : 'none'}</>}</li>)}</ul>{host ? <button className="button button-primary" disabled={!connected} onClick={() => send('next')}>{room.index + 1 === room.total ? 'Finish activity' : 'Next round'}</button> : <p>Waiting for the host to continue.</p>}</section>}
      {room.phase === 'finished' && <section className="party-panel"><h2>Activity complete</h2><p>Team score: {room.players.reduce((sum, p) => sum + p.score, 0)} points</p><ul>{room.players.map(p => <li key={p.id}>{p.name}: {p.score} points</li>)}</ul><button className="button button-primary" onClick={leave}>Back to StudyPro</button></section>}
    </>}
  </main>
}
