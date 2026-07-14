import { describe, expect, it } from 'vitest'
import { flattenDeck, normalizeDeck } from './data.js'
import { drivingTheoryDeck } from './drivingTheory.js'

describe('normalizeDeck', () => {
  it('accepts simple term arrays', () => {
    const deck = normalizeDeck([{ term: 'Atom', answer: 'The smallest unit of an element.' }])
    expect(deck.topics[0].items[0].key).toBe('Atom')
  })

  it('accepts topic-based decks', () => {
    const deck = normalizeDeck({ title: 'Test', topics: [{ title: 'One', items: [{ key: 'A', definition: 'B' }] }] })
    expect(flattenDeck(deck)).toHaveLength(1)
  })

  it('rejects incomplete cards', () => {
    expect(() => normalizeDeck([{ key: 'Missing definition' }])).toThrow(/definition/)
  })

  it('ships complete driving-theory topic coverage', () => {
    const deck = normalizeDeck(drivingTheoryDeck)
    expect(deck.topics).toHaveLength(14)
    expect(flattenDeck(deck)).toHaveLength(112)
    expect(flattenDeck(deck).every((item) => item.question && item.source)).toBe(true)
  })
})
