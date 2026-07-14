export const THEORY_QUESTION_COUNT = 50
export const THEORY_SECONDS = 57 * 60
export const THEORY_PASS_MARK = 43

function hash(value) {
  let result = 2166136261
  for (const character of String(value)) {
    result ^= character.charCodeAt(0)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

const ordered = (values, seed) => [...values].sort((a, b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id))

function questionFamily(item) {
  const question = item.question.toLowerCase()
  const answer = item.key.toLowerCase()
  if (/^(yes|no)$/.test(answer)) return 'yes-no'
  if (/\b(sorn|mot|licen[cs]e|insurance|vehicle tax|dvla)\b/.test(question)) return 'documents'
  if (/\b(sign|road marking|traffic light)\b/.test(question)) return 'sign'
  if (/\b(what speed|how fast|speed limit)\b/.test(question)) return 'speed'
  if (/\b(what distance|how far|following distance|stopping distance)\b/.test(question)) return 'distance'
  if (/^who\b/.test(question)) return 'person'
  if (/\b(what should you expect|what might happen|what could happen)\b/.test(question)) return 'expectation'
  if (/^when\b/.test(question)) return 'time'
  if (/\b(why|reason|benefit|affect)\b/.test(question)) return 'effect'
  if (/\b(should|must|do if|do when|do before|do after)\b/.test(question)) return 'action'
  if (/\b(mean|indicate|show)\b/.test(question)) return 'meaning'
  return 'fact'
}

export function generateTheoryTest(deck, seed = Date.now()) {
  const groups = deck.topics.map((group) => ({ title: group.title, items: group.items.map((item) => ({ ...item, topic: group.title })) }))
  const perTopic = Math.floor(THEORY_QUESTION_COUNT / groups.length)
  const selected = groups.flatMap((group) => ordered(group.items, `${seed}:${group.title}`).slice(0, perTopic))
  const used = new Set(selected.map((item) => item.id))
  const remainder = groups.flatMap((group) => group.items).filter((item) => !used.has(item.id))
  return ordered([...selected, ...ordered(remainder, `${seed}:remainder`).slice(0, THEORY_QUESTION_COUNT - selected.length)], `${seed}:paper`)
}

export function getExamOptions(question, allQuestions, seed) {
  const curated = (question.distractors || []).map((key, index) => ({ id: `${question.id}:distractor:${index}`, key }))
  const candidates = allQuestions.filter((item) => item.id !== question.id).map((item) => ({
    ...item,
    rank: (item.topic === question.topic ? 4 : 0) + (questionFamily(item) === questionFamily(question) ? 7 : 0),
  }))
  const ranked = ordered(candidates, `${seed}:${question.id}:options`).sort((a, b) => b.rank - a.rank)
  const distractors = [...curated, ...ranked]
    .filter((item, index, array) => item.key !== question.key && array.findIndex((candidate) => candidate.key === item.key) === index)
    .slice(0, 3)
  return ordered([question, ...distractors], `${seed}:${question.id}:options`)
}
