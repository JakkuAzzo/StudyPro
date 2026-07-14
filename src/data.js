export const sampleDeck = {
  id: 'cognitive-psychology',
  title: 'Cognitive Psychology',
  subject: 'Psychology',
  description: 'Core ideas about memory, attention and learning.',
  topics: [
    {
      title: 'Memory & Learning',
      items: [
        {
          key: 'Working memory',
          definition: 'A limited-capacity system that temporarily holds and manipulates information.',
          explanation: 'It lets us keep information active while reasoning, reading or solving a problem.',
          example: 'Holding a phone number in mind while typing it.',
        },
        {
          key: 'Spacing effect',
          definition: 'Learning improves when study is spread across time rather than completed in one block.',
          explanation: 'Some forgetting between sessions makes retrieval more effortful, strengthening later recall.',
          example: 'Reviewing vocabulary for 15 minutes over four days instead of one hour at once.',
        },
        {
          key: 'Retrieval practice',
          definition: 'Actively recalling information from memory to strengthen future access to it.',
          explanation: 'The act of retrieval changes memory and reveals gaps that rereading can hide.',
          example: 'Closing a book and writing everything remembered from a chapter.',
        },
        {
          key: 'Chunking',
          definition: 'Grouping separate pieces of information into meaningful units.',
          explanation: 'Meaningful groups reduce the number of units working memory must handle.',
          example: 'Remembering 1-9-4-5 as the year 1945.',
        },
      ],
    },
    {
      title: 'Attention & Thinking',
      items: [
        {
          key: 'Selective attention',
          definition: 'Focusing on relevant information while filtering competing stimuli.',
          explanation: 'Processing capacity is limited, so goals guide what receives deeper processing.',
          example: 'Following one conversation in a busy café.',
        },
        {
          key: 'Cognitive load',
          definition: 'The amount of mental effort currently being used by working memory.',
          explanation: 'When a task exceeds working-memory capacity, comprehension and learning decline.',
          example: 'A dense slide full of text competing with a lecturer’s explanation.',
        },
        {
          key: 'Confirmation bias',
          definition: 'The tendency to seek or interpret evidence in ways that support existing beliefs.',
          explanation: 'Prior beliefs influence which evidence feels salient and credible.',
          example: 'Only reading reviews that agree with a purchase you already want to make.',
        },
        {
          key: 'Metacognition',
          definition: 'Awareness and regulation of one’s own thinking and learning.',
          explanation: 'Accurate monitoring helps a learner choose what to study and which strategy to use.',
          example: 'Noticing that recognition feels familiar but you still cannot explain the idea unaided.',
        },
      ],
    },
  ],
}

const text = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback

export function normalizeDeck(input) {
  const source = Array.isArray(input) ? { title: 'Imported study set', items: input } : input
  if (!source || typeof source !== 'object') throw new Error('The JSON must be an object or an array of terms.')

  const rawTopics = Array.isArray(source.topics)
    ? source.topics
    : [{ title: text(source.topic, text(source.title, 'Imported topic')), items: source.items || source.terms || source.cards }]

  const topics = rawTopics.map((topic, topicIndex) => {
    const rawItems = Array.isArray(topic) ? topic : (topic.items || topic.terms || topic.cards || topic.content)
    if (!Array.isArray(rawItems)) throw new Error(`Topic ${topicIndex + 1} needs an items array.`)
    const items = rawItems.map((item, itemIndex) => {
      if (!item || typeof item !== 'object') throw new Error(`Item ${itemIndex + 1} in topic ${topicIndex + 1} is not an object.`)
      const key = text(item.key, text(item.term, text(item.title, text(item.question))))
      const definition = text(item.definition, text(item.answer, text(item.description, text(item.value))))
      if (!key || !definition) throw new Error(`Item ${itemIndex + 1} needs a key (or term) and definition (or answer).`)
      return {
        id: `${topicIndex}-${itemIndex}-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
        key,
        question: text(item.question),
        definition,
        explanation: text(item.explanation, text(item.reasoning, definition)),
        example: text(item.example),
        source: text(item.source),
        image: text(item.image),
        imageAlt: text(item.imageAlt, text(item.image_alt)),
        imageAttribution: text(item.imageAttribution, text(item.image_attribution)),
        distractors: Array.isArray(item.distractors) ? item.distractors.map((value) => text(value)).filter(Boolean) : [],
      }
    })
    if (!items.length) throw new Error(`Topic ${topicIndex + 1} has no study items.`)
    return { title: text(topic.title, text(topic.topic, `Topic ${topicIndex + 1}`)), items }
  })

  if (!topics.length) throw new Error('Add at least one topic.')
  return {
    id: text(source.id, `deck-${Date.now()}`),
    title: text(source.title, 'Imported study set'),
    subject: text(source.subject, text(source.category, 'Study set')),
    description: text(source.description, 'Imported study material'),
    attribution: text(source.attribution),
    referenceUrl: text(source.referenceUrl),
    category: text(source.category, 'Imported'),
    status: text(source.status),
    courseSubject: text(source.courseSubject, text(source.subject, text(source.title, 'Imported course'))),
    board: text(source.board),
    cover: text(source.cover, text(source.image, './assets/covers/humanities-social.webp')),
    coverAlt: text(source.coverAlt, `${text(source.title, 'Course')} course cover`),
    features: Array.isArray(source.features) ? source.features.map((value) => text(value)).filter(Boolean) : ['generic'],
    topics,
  }
}

export const flattenDeck = (deck, topic = 'All topics') => deck.topics
  .filter((group) => topic === 'All topics' || group.title === topic)
  .flatMap((group) => group.items.map((item) => ({ ...item, topic: group.title })))

export const deckTemplate = `{
  "title": "Biology essentials",
  "subject": "Biology",
  "description": "Key terms for the exam",
  "topics": [
    {
      "title": "Cell biology",
      "items": [
        {
          "key": "Mitochondrion",
          "definition": "The organelle where aerobic respiration occurs.",
          "explanation": "It releases usable energy as ATP.",
          "example": "Muscle cells contain many mitochondria."
        }
      ]
    }
  ]
}`

export function shuffle(values) {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
