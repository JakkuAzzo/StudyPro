import { normalizeDeck } from './data.js'
const DAY = 86400000
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype
const safeKeys = obj => Object.keys(obj).every(key => !['__proto__', 'constructor', 'prototype'].includes(key))

export function recordAttempt(history, deckId, item, correct, now = Date.now()) {
  const course = history[deckId] || {}, previous = course[item.id] || {}
  const streak = correct ? (previous.streak || 0) + 1 : 0
  return { ...history, [deckId]: { ...course, [item.id]: { topic: item.topic, total: (previous.total || 0) + 1, correct: (previous.correct || 0) + Number(correct), streak, lastAt: now, dueAt: correct ? now + Math.min(14, 2 ** (streak - 1)) * DAY : now } } }
}
export function reviewQueue(items, history, deckId, saved, now = Date.now()) {
  const records = history[deckId] || {}, marked = saved[deckId] || {}
  return items.filter(item => marked[item.id] || (records[item.id] && records[item.id].dueAt <= now))
    .sort((a, b) => (records[a.id]?.dueAt ?? Number.MAX_SAFE_INTEGER) - (records[b.id]?.dueAt ?? Number.MAX_SAFE_INTEGER))
}
export function topicSummary(history, deckId) {
  const totals = {}
  for (const record of Object.values(history[deckId] || {})) {
    const topic = record.topic || 'Other'
    const value = totals[topic] || { topic, correct: 0, total: 0 }
    value.correct += record.correct; value.total += record.total; totals[topic] = value
  }
  return Object.values(totals).sort((a, b) => a.correct / a.total - b.correct / b.total || a.topic.localeCompare(b.topic))
}
export function addMockResult(previous, result, now = Date.now()) { return [{ score: result.score, total: result.total, elapsed: result.elapsed, at: now }, ...previous].slice(0, 5) }
export function validateBackup(value) {
  if (!plain(value) || value.version !== 1 || !Array.isArray(value.decks) || value.decks.length > 200 || !plain(value.stats) || !plain(value.history) || !plain(value.saved)) throw new Error('This is not a supported StudyPro backup.')
  if (![value.stats, value.history, value.saved].every(safeKeys)) throw new Error('This backup contains invalid keys.')
  if (value.mocks !== undefined && (!Array.isArray(value.mocks) || value.mocks.length > 5 || value.mocks.some(m => !plain(m) || !Number.isFinite(m.score) || !Number.isFinite(m.total) || !Number.isFinite(m.elapsed) || !Number.isFinite(m.at) || m.total !== 50 || m.score < 0 || m.score > m.total || m.elapsed < 0 || m.at < 0))) throw new Error('The backup has invalid mock results.')
  const statsFields = ['sessions', 'answers', 'correct', 'seconds', 'streak']
  if (statsFields.some(k => value.stats[k] !== undefined && (!Number.isFinite(value.stats[k]) || value.stats[k] < 0))) throw new Error('The backup has invalid progress totals.')
  for (const [courseId, course] of Object.entries(value.history)) {
    if (!courseId || !plain(course) || !safeKeys(course) || Object.keys(course).length > 10000) throw new Error('The backup has invalid revision history.')
    for (const record of Object.values(course)) if (!plain(record) || typeof record.topic !== 'string' || ['total', 'correct', 'streak', 'lastAt', 'dueAt'].some(k => !Number.isFinite(record[k]) || record[k] < 0) || record.correct > record.total) throw new Error('The backup has invalid revision history.')
  }
  for (const course of Object.values(value.saved)) if (!plain(course) || !safeKeys(course) || Object.values(course).some(flag => typeof flag !== 'boolean')) throw new Error('The backup has invalid saved questions.')
  return { ...value, decks: value.decks.map(normalizeDeck) }
}
