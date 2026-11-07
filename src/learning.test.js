import { describe, it, expect } from 'vitest'
import { recordAttempt, reviewQueue, topicSummary, validateBackup } from './learning.js'
const items = [{ id: 'a', topic: 'Signs' }, { id: 'b', topic: 'Signs' }, { id: 'c', topic: 'Roads' }]

describe('revision history', () => {
  it('prioritises missed and saved questions without mixing courses', () => {
    let history = recordAttempt({}, 'driving', items[0], false, 1000)
    history = recordAttempt(history, 'biology', items[1], false, 1000)
    const queue = reviewQueue(items, history, 'driving', {}, 1001)
    expect(queue.map(x => x.id)).toEqual(['a'])
    expect(reviewQueue(items, history, 'driving', { driving: { c: true } }, 1001).map(x => x.id)).toEqual(['a', 'c'])
  })
  it('summarises actual attempts by topic and schedules correct answers later', () => {
    let history = recordAttempt({}, 'driving', items[0], false, 1000)
    history = recordAttempt(history, 'driving', items[0], true, 2000)
    expect(topicSummary(history, 'driving')).toEqual([{ topic: 'Signs', correct: 1, total: 2 }])
    expect(reviewQueue(items, history, 'driving', {}, 2001)).toHaveLength(0)
    expect(reviewQueue(items, history, 'driving', {}, 2000 + 86400000)).toHaveLength(1)
  })
  it('rejects backups that cannot safely be restored', () => {
    expect(() => validateBackup({ version: 99 })).toThrow()
    expect(() => validateBackup({ version: 1, decks: 'bad', stats: {}, history: {}, saved: {} })).toThrow()
    expect(validateBackup({ version: 1, decks: [], stats: {}, history: {}, saved: {} }).version).toBe(1)
  })
})

it('keeps recent mock results bounded and rejects invalid backup results', async () => {
  const { addMockResult } = await import('./learning.js')
  let mocks = []
  for (let i = 0; i < 7; i++) mocks = addMockResult(mocks, { score: i, total: 50, elapsed: 10 }, i + 1)
  expect(mocks).toHaveLength(5)
  expect(mocks[0].score).toBe(6)
  expect(() => validateBackup({ version: 1, decks: [], stats: {}, history: {}, saved: {}, mocks: [{ score: 100, total: 50 }] })).toThrow()
})
