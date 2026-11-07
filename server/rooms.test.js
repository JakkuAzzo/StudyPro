import { describe, it, expect } from 'vitest'
import { createRoom, joinRoom, startRound, submitAnswer, revealRound, publicRoom } from './rooms.js'

const questions = [{ prompt: 'What is safe?', options: ['Stop', 'Rush'], answer: 0, explanation: 'Stop safely.' }]

describe('study rooms', () => {
  it('keeps answers secret until the host reveals and scores each player once', () => {
    const room = createRoom('host', 'Alex', questions)
    joinRoom(room, 'guest', 'Sam')
    expect(() => startRound(room, 'guest')).toThrow()
    startRound(room, 'host')
    expect(JSON.stringify(publicRoom(room))).not.toContain('Stop safely.')
    submitAnswer(room, 'guest', 0)
    expect(() => submitAnswer(room, 'guest', 0)).toThrow()
    expect(() => revealRound(room, 'guest')).toThrow()
    revealRound(room, 'host')
    const view = publicRoom(room)
    expect(view.round.answer).toBe(0)
    expect(view.players.find(p => p.id === 'guest').score).toBe(1)
  })
  it('scores a hazard using the clip playback position and accepts no out of range values', () => {
    const room = createRoom('host', 'Alex', [{ type: 'hazard', clip: { id: 'x', duration: 10, hazards: [{ start: 2, end: 7, label: 'A hazard' }] } }])
    joinRoom(room, 'guest', 'Sam')
    startRound(room, 'host')
    expect(() => submitAnswer(room, 'guest', [100])).toThrow()
    submitAnswer(room, 'guest', [2.1])
    revealRound(room, 'host')
    expect(publicRoom(room).players.find(p => p.id === 'guest').score).toBe(5)
  })
})
