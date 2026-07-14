const ALL_COURSES = 'All courses'
const ALL_SUBJECTS = 'All subjects'
const ALL_BOARDS = 'All boards'

export function courseSearchText(deck) {
  return [
    deck.title, deck.subject, deck.courseSubject, deck.description,
    deck.status, deck.category, deck.board,
    ...deck.topics.map((topic) => topic.title),
  ].filter(Boolean).join(' ').toLowerCase()
}

export function filterAndSortCourses(decks, filters = {}) {
  const {
    query = '', category = ALL_COURSES, subject = ALL_SUBJECTS,
    board = ALL_BOARDS, sort = 'Recommended',
  } = filters
  const needle = query.trim().toLowerCase()
  const filtered = decks.filter((deck) => (
    (category === ALL_COURSES || deck.category === category)
    && (subject === ALL_SUBJECTS || deck.courseSubject === subject)
    && (board === ALL_BOARDS || deck.board === board)
    && (!needle || courseSearchText(deck).includes(needle))
  ))

  if (sort === 'A–Z') return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'Z–A') return [...filtered].sort((a, b) => b.title.localeCompare(a.title))
  if (sort === 'Most topics') return [...filtered].sort((a, b) => b.topics.length - a.topics.length || a.title.localeCompare(b.title))
  return filtered
}
