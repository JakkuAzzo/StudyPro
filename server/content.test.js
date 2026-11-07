import { describe, it, expect } from 'vitest'
import { buildQuizRound } from './server.js'

describe('quiz content', () => {
  it('uses the course authors curated alternatives before unrelated answers', () => {
    const question = { id: 'q1', topic: 'safety', question: 'What now?', key: 'Slow down', explanation: 'Stay safe', distractors: ['Accelerate', 'Close eyes', 'Ignore it'] }
    const unrelated = { id: 'q2', topic: 'animals', question: 'What animal?', key: 'Horse' }
    const round = buildQuizRound(question, [question, unrelated], 'test')
    expect(round.options).toHaveLength(4)
    expect(round.options).toEqual(expect.arrayContaining(['Slow down', 'Accelerate', 'Close eyes', 'Ignore it']))
    expect(round.options[round.answer]).toBe('Slow down')
  })
})
