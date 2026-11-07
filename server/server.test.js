import { describe, it, expect } from 'vitest'
import WebSocket from 'ws'
import { startServer } from './server.js'

function connect(url) { return new Promise((resolve, reject) => { const ws = new WebSocket(url); ws.once('open', () => resolve(ws)); ws.once('error', reject) }) }
function receive(ws) { return new Promise((resolve, reject) => { ws.once('message', x => resolve(JSON.parse(x))); ws.once('error', reject) }) }

describe('room service', () => {
  it('lets two connected players create, join, play and reveal a round', async () => {
    const server = await startServer({ port: 0, allowedOrigins: [] })
    const url = `ws://127.0.0.1:${server.address().port}`
    const host = await connect(url), guest = await connect(url)
    try {
      let message = receive(host); host.send(JSON.stringify({ action: 'create', name: 'Alex', deckId: 'uk-car-theory-gb-2026', mode: 'quiz' }))
      const created = await message
      expect(created.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/)
      const guestUpdate = receive(guest), hostUpdate = receive(host)
      guest.send(JSON.stringify({ action: 'join', code: created.code, name: 'Sam' }))
      expect((await guestUpdate).room.players).toHaveLength(2); await hostUpdate
      const firstHost = receive(host), firstGuest = receive(guest)
      host.send(JSON.stringify({ action: 'next' }))
      expect((await firstHost).room.phase).toBe('playing'); await firstGuest
      const responseHost = receive(host), responseGuest = receive(guest)
      guest.send(JSON.stringify({ action: 'answer', response: 0 }))
      await responseHost; await responseGuest
      const revealHost = receive(host), revealGuest = receive(guest)
      host.send(JSON.stringify({ action: 'reveal' }))
      expect((await revealHost).room.round.answer).toEqual(expect.any(Number)); await revealGuest
    } finally { host.close(); guest.close(); await new Promise(resolve => server.close(resolve)) }
  })
})

function waitFor(ws, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { ws.off('message', onMessage); reject(new Error('Timed out waiting for room update')) }, 3000)
    function onMessage(raw) { const message = JSON.parse(raw); if (predicate(message)) { clearTimeout(timer); ws.off('message', onMessage); resolve(message) } }
    ws.on('message', onMessage)
  })
}

describe('hazard rooms', () => {
  it('restores a player after reconnect and reveals clip timing only after the host ends the round', async () => {
    const server = await startServer({ port: 0, allowedOrigins: [] })
    const url = `ws://127.0.0.1:${server.address().port}`
    const host = await connect(url), guest = await connect(url)
    let resumed
    try {
      let event = waitFor(host, m => m.type === 'joined')
      host.send(JSON.stringify({ action: 'create', name: 'Alex', deckId: 'uk-car-theory-gb-2026', mode: 'hazard' }))
      const created = await event
      event = waitFor(guest, m => m.type === 'joined')
      guest.send(JSON.stringify({ action: 'join', name: 'Sam', code: created.code }))
      const joined = await event
      guest.close()
      resumed = await connect(url)
      event = waitFor(resumed, m => m.type === 'joined')
      resumed.send(JSON.stringify({ action: 'resume', code: joined.code, token: joined.token }))
      expect((await event).playerId).toBe(joined.playerId)
      event = waitFor(resumed, m => m.room?.phase === 'playing')
      host.send(JSON.stringify({ action: 'next' }))
      const playing = await event
      expect(playing.room.round.clip.hazards).toBeUndefined()
      const time = Math.min(1, playing.room.round.clip.duration)
      event = waitFor(resumed, m => m.room?.players.find(p => p.id === joined.playerId)?.answered)
      resumed.send(JSON.stringify({ action: 'answer', response: [time] }))
      expect((await event).room.players.find(p => p.id === joined.playerId).clicks).toBeUndefined()
      event = waitFor(resumed, m => m.room?.phase === 'reveal')
      host.send(JSON.stringify({ action: 'reveal' }))
      const review = await event
      expect(review.room.round.clip.hazards.length).toBeGreaterThan(0)
      expect(review.room.players.find(p => p.id === joined.playerId).clicks).toEqual([time])
    } finally { host.terminate(); guest.terminate(); resumed?.terminate(); await new Promise(resolve => server.close(resolve)) }
  })
})


describe('browser access restrictions', () => {
  it('rejects missing and unapproved origins when required', async () => {
    const server = await startServer({ port: 0, allowedOrigins: ['https://example.test'], requireOrigin: true })
    const url = `ws://127.0.0.1:${server.address().port}`
    try {
      await expect(connect(url)).rejects.toThrow()
      await expect(new Promise((resolve, reject) => { const ws = new WebSocket(url, { origin: 'https://untrusted.test' }); ws.once('open', () => resolve(ws)); ws.once('error', reject) })).rejects.toThrow()
      const accepted = await new Promise((resolve, reject) => { const ws = new WebSocket(url, { origin: 'https://example.test' }); ws.once('open', () => resolve(ws)); ws.once('error', reject) })
      accepted.terminate()
    } finally { await new Promise(resolve => server.close(resolve)) }
  })
})
