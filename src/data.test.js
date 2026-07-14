import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import App from './App.jsx'
import { flattenDeck, normalizeDeck } from './data.js'
import { drivingTheoryDeck } from './drivingTheory.js'
import { aLevelDecks, bmatDeck, builtInCourseDecks, ucatDeck } from './courseCatalog.js'
import { examBoardDecks } from './examBoardDecks.js'
import { filterAndSortCourses } from './courseFilters.js'
import { generateTheoryTest, getExamOptions, THEORY_PASS_MARK, THEORY_QUESTION_COUNT, THEORY_SECONDS } from './examData.js'
import { generateHazardTest, HAZARD_MAX_SCORE, HAZARD_PASS_MARK, looksLikePatternClicking, scoreClip } from './hazardClips.js'

describe('application', () => {
  it('compiles the complete React entry point', () => expect(App).toBeTypeOf('function'))
  it('accepts simple term arrays', () => expect(normalizeDeck([{ term: 'Atom', answer: 'Smallest unit.' }]).topics[0].items[0].key).toBe('Atom'))
  it('preserves optional curated distractors', () => expect(normalizeDeck([{ question: 'Capital of France?', answer: 'Paris', distractors: ['Rome', 'Madrid', 'Berlin'] }]).topics[0].items[0].distractors).toEqual(['Rome', 'Madrid', 'Berlin']))
  it('rejects incomplete cards', () => expect(() => normalizeDeck([{ key: 'Missing' }])).toThrow(/definition/))
  it('ships 120 questions across 14 topics with eight sign images', () => {
    const deck = normalizeDeck(drivingTheoryDeck), items = flattenDeck(deck)
    expect(deck.topics).toHaveLength(14); expect(items).toHaveLength(120); expect(items.filter((item) => item.image)).toHaveLength(8)
    expect(items.every((item) => item.question && item.source)).toBe(true)
  })
})

describe('course catalogue', () => {
  it('ships UCAT, an archived BMAT course, and separate A-level courses', () => {
    expect(ucatDeck.topics).toHaveLength(4)
    expect(bmatDeck.status).toMatch(/Archived/)
    expect(aLevelDecks.length).toBeGreaterThanOrEqual(50)
    expect(aLevelDecks.map((deck) => deck.title)).toEqual(expect.arrayContaining(['A-level Biology', 'A-level Mathematics', 'A-level French', 'A-level Psychology']))
  })
  it('gives every built-in course a unique id and usable content', () => {
    const normalised = [drivingTheoryDeck, ...builtInCourseDecks].map(normalizeDeck)
    expect(new Set(normalised.map((deck) => deck.id)).size).toBe(normalised.length)
    expect(normalised.every((deck) => deck.topics.length && flattenDeck(deck).length)).toBe(true)
    expect(normalised.every((deck) => deck.courseSubject && deck.cover && deck.coverAlt)).toBe(true)
    expect([...new Set(normalised.map((deck) => deck.cover))].every((cover) => existsSync(resolve('public', cover.replace(/^\.\//, ''))))).toBe(true)
  })
  it('adds sourced AQA, OCR and Pearson Edexcel specification packs', () => {
    expect(examBoardDecks).toHaveLength(15)
    expect(new Set(examBoardDecks.map((deck) => deck.status.split(' ')[0]))).toEqual(new Set(['AQA', 'OCR', 'Pearson']))
    expect(examBoardDecks.every((deck) => deck.referenceUrl.startsWith('https://') && deck.topics.length)).toBe(true)
    expect(examBoardDecks.map((deck) => deck.id)).toEqual(expect.arrayContaining(['a-level-biology-aqa-7402', 'a-level-mathematics-pearson-edexcel-9ma0']))
  })
  it('filters by subject and board, searches topic names, and sorts results', () => {
    const normalised = builtInCourseDecks.map(normalizeDeck)
    const boardResults = filterAndSortCourses(normalised, { subject: 'Biology', board: 'AQA' })
    expect(boardResults.map((deck) => deck.id)).toEqual(['a-level-biology-aqa-7402'])
    expect(filterAndSortCourses(normalised, { query: 'biological molecules' }).some((deck) => deck.title.includes('Biology'))).toBe(true)
    const alphabetical = filterAndSortCourses(normalised, { category: 'Admissions tests', sort: 'A–Z' })
    expect(alphabetical.map((deck) => deck.title)).toEqual([...alphabetical.map((deck) => deck.title)].sort((a, b) => a.localeCompare(b)))
  })
})

describe('multiple-choice test', () => {
  const deck = normalizeDeck(drivingTheoryDeck), all = flattenDeck(deck)
  it('generates a balanced fresh 50-question test', () => {
    const paper = generateTheoryTest(deck, 'a')
    expect(paper).toHaveLength(THEORY_QUESTION_COUNT); expect(new Set(paper.map((item) => item.id)).size).toBe(50); expect(new Set(paper.map((item) => item.topic))).toHaveLength(14)
    expect(paper.map((item) => item.id)).not.toEqual(generateTheoryTest(deck, 'b').map((item) => item.id))
  })
  it('uses the official duration, pass mark, and four stable options', () => {
    const question = generateTheoryTest(deck, 'a')[0], options = getExamOptions(question, all, 'a')
    expect(THEORY_SECONDS).toBe(3420); expect(THEORY_PASS_MARK).toBe(43); expect(options).toHaveLength(4); expect(new Set(options.map((item) => item.key)).size).toBe(4); expect(options).toContainEqual(question)
  })
  it('prefers curated distractors when supplied', () => {
    const question = { ...all[0], distractors: ['Wrong one', 'Wrong two', 'Wrong three'] }
    expect(getExamOptions(question, all, 'curated').map((item) => item.key)).toEqual(expect.arrayContaining([question.key, 'Wrong one', 'Wrong two', 'Wrong three']))
  })
})

describe('hazard perception', () => {
  it('generates 14 clips with 15 hazards and the 44/75 pass mark', () => {
    const clips = generateHazardTest('a')
    expect(clips).toHaveLength(14); expect(clips.reduce((sum, item) => sum + item.hazards.length, 0)).toBe(15); expect(HAZARD_PASS_MARK).toBe(44); expect(HAZARD_MAX_SCORE).toBe(75)
  })
  it('scores from 5 to 1 and rejects pattern clicking', () => {
    const item = { hazards: [{ start: 10, end: 15 }] }
    expect(scoreClip(item, [10]).score).toBe(5); expect(scoreClip(item, [14.9]).score).toBe(1); expect(scoreClip(item, [5]).score).toBe(0)
    expect(looksLikePatternClicking([1,2,3,4,5,6])).toBe(true)
  })
})
