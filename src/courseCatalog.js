import { examBoardDecks } from './examBoardDecks.js'

const source = 'Department for Education GCE AS and A level subject content (England)'

const topicCard = (subject, title) => ({
  key: title,
  question: `What should you be able to do with ${title.toLowerCase()} in A-level ${subject}?`,
  definition: `Explain the central ideas in ${title.toLowerCase()}, apply them in unfamiliar contexts, and evaluate evidence or methods where appropriate.`,
  explanation: `Use this topic map as a checklist, then add specification-specific facts, examples and exam questions for your exam board.`,
  source,
})

const outline = (id, title, topics, options = {}) => ({
  id: `a-level-${id}`,
  title: `A-level ${title}`,
  subject: `A level · ${title}`,
  category: 'A levels',
  status: 'Topic map',
  description: `${topics.length}-topic common-core map for England. Add your exam-board detail through JSON imports.`,
  attribution: 'Topic structure derived from Department for Education subject content under the Open Government Licence v3.0.',
  features: ['generic'],
  topics: topics.map((name) => ({ title: name, items: [topicCard(title, name)] })),
  ...options,
})

const q = (question, answer, explanation, distractors) => ({
  key: answer,
  question,
  definition: `${answer}. ${explanation}`,
  explanation,
  distractors,
  source: 'Original StudyPro practice item',
})

export const ucatDeck = {
  id: 'ucat-current',
  title: 'UCAT — Current Format Practice',
  subject: 'Medical admissions · UCAT',
  category: 'Admissions tests',
  status: 'Current',
  description: 'Original starter questions across all four current UCAT subtests, with the official timing structure documented.',
  attribution: 'Original practice content. Format checked against the UCAT Consortium in July 2026; not affiliated with the UCAT Consortium.',
  features: ['generic'],
  topics: [
    { title: 'Verbal Reasoning · 44 questions · 22 minutes', items: [
      q('A report states that every trial in one hospital used the same protocol, but makes no claim about other hospitals. Which conclusion follows?', 'All trials in that hospital used the protocol', 'The statement supports a conclusion about that hospital only.', ['Every hospital used the protocol', 'Most hospitals used the protocol', 'The protocol improved every outcome']),
      q('A passage says a policy may reduce delays but evidence is preliminary. Which summary is safest?', 'The policy could help, but the evidence is not yet conclusive', 'The wording preserves both the possible benefit and the uncertainty.', ['The policy definitely removes delays', 'The policy has no effect', 'The evidence proves the policy is harmful']),
      q('If an author presents two explanations and says neither has been ruled out, what can be inferred?', 'Both explanations remain possible', 'A lack of exclusion does not establish either explanation as correct.', ['Both explanations are proven', 'The first explanation is false', 'No explanation is possible']),
    ] },
    { title: 'Decision Making · 35 questions · 37 minutes', items: [
      q('All members of Team A are trained. Some trained people are volunteers. Must some members of Team A be volunteers?', 'No', 'The trained volunteers could all be outside Team A.', ['Yes', 'Only if Team A has more than one member', 'Only if every volunteer is trained']),
      q('A clinic can choose exactly two of P, Q and R. If P is chosen, Q cannot be chosen. Which pair is always allowed by that rule?', 'P and R', 'The rule excludes P with Q but does not exclude P with R.', ['P and Q', 'P, Q and R', 'Q only']),
      q('A test has 80% sensitivity. In a group of 50 people who truly have the condition, how many are expected to test positive?', '40', 'Sensitivity is the proportion of true cases correctly detected: 0.8 × 50.', ['10', '30', '45']),
    ] },
    { title: 'Quantitative Reasoning · 36 questions · 26 minutes', items: [
      q('A medicine costs £24 after a 20% discount. What was its original price?', '£30', '£24 represents 80% of the original price, so 24 ÷ 0.8 = 30.', ['£28.80', '£32', '£120']),
      q('A ward uses 18 packs in 6 days at a constant rate. How many packs will it use in 15 days?', '45 packs', 'The rate is 3 packs per day, multiplied by 15 days.', ['30 packs', '36 packs', '54 packs']),
      q('A value rises from 160 to 184. What is the percentage increase?', '15%', 'The increase is 24; 24 ÷ 160 × 100 = 15%.', ['13%', '18.4%', '24%']),
    ] },
    { title: 'Situational Judgement · 69 questions · 26 minutes', items: [
      q('A student notices that confidential patient details are visible in a public area. What is the most appropriate immediate action?', 'Secure the information and alert the responsible supervisor', 'Protecting confidentiality and escalating through the appropriate channel addresses the immediate risk.', ['Ignore it because the student is not responsible', 'Photograph it as evidence on a personal phone', 'Discuss the details with friends for advice']),
      q('A colleague makes a minor error and reports it promptly. What response is most appropriate?', 'Support correction and follow the relevant reporting process', 'Patient safety and learning are better served by proportionate, open action.', ['Hide the error to protect the colleague', 'Publicly blame the colleague', 'Assume no action is needed because it was minor']),
      q('You are asked to perform a task beyond your competence without supervision. What should you do?', 'Explain your limits and seek appropriate supervision', 'Recognising limits protects safety while still helping the team find a solution.', ['Attempt it without telling anyone', 'Refuse all future tasks', 'Ask another untrained student to do it']),
    ] },
  ],
}

export const bmatDeck = {
  id: 'bmat-archive',
  title: 'BMAT Archive — Legacy Skills Practice',
  subject: 'Medical admissions · Archived BMAT',
  category: 'Admissions tests',
  status: 'Archived · ended 2023',
  description: 'Legacy practice for the discontinued BMAT structure. This is not preparation for a current admissions test.',
  attribution: 'Original retrospective practice content. BMAT was last administered in 2023.',
  features: ['generic'],
  topics: [
    { title: 'Section 1 · Thinking Skills', items: [
      q('A claim is supported only by examples selected by the author. What is the main weakness?', 'Selection bias may make the evidence unrepresentative', 'Selected examples can omit cases that contradict the claim.', ['The examples must be numerically incorrect', 'Examples can never support claims', 'The conclusion must be true']),
      q('If a journey takes 25% longer than 80 minutes, how long does it take?', '100 minutes', 'A quarter of 80 is 20, giving 100 minutes.', ['85 minutes', '95 minutes', '105 minutes']),
    ] },
    { title: 'Section 2 · Scientific Knowledge and Applications', items: [
      q('Which organelle is the main site of aerobic respiration?', 'Mitochondrion', 'Most ATP from aerobic respiration is produced in mitochondria.', ['Nucleus', 'Ribosome', 'Golgi apparatus']),
      q('What is the acceleration of a 2 kg object acted on by a resultant force of 10 N?', '5 m/s²', 'Using F = ma gives a = 10 ÷ 2.', ['0.2 m/s²', '8 m/s²', '20 m/s²']),
      q('What is the pH of a neutral solution at room temperature?', '7', 'Neutral water has equal hydrogen and hydroxide ion concentrations.', ['0', '5', '14']),
    ] },
    { title: 'Section 3 · Writing Task', items: [
      q('What should a strong response do before arguing for or against a quotation?', 'Define the claim and identify its assumptions', 'Clear interpretation prevents the essay from attacking a different claim.', ['List facts without a position', 'Assume every word is literal', 'Avoid considering counterarguments']),
      q('What makes a counterargument useful?', 'It challenges the thesis and is answered with reasons', 'A genuine objection followed by a reasoned response strengthens evaluation.', ['It repeats the thesis', 'It introduces an unrelated topic', 'It replaces the conclusion']),
    ] },
  ],
}

const subjectMaps = [
  ['accounting', 'Accounting', ['Financial accounting principles', 'Double-entry bookkeeping', 'Financial statements', 'Cost and management accounting', 'Budgeting and variance analysis', 'Ethics and decision making']],
  ['ancient-history', 'Ancient History', ['Greek period study', 'Roman period study', 'Ancient sources', 'Historical debate', 'Modern interpretations']],
  ['archaeology', 'Archaeology', ['Archaeological methods', 'Dating and chronology', 'Material culture', 'Landscape and settlement', 'Interpretation and ethics']],
  ['art-design', 'Art and Design', ['Developing ideas', 'Contextual research', 'Experimenting with media', 'Recording observations', 'Personal response and portfolio']],
  ['biology', 'Biology', ['Biological molecules', 'Cells and microscopy', 'Exchange and transport', 'Genetics and evolution', 'Energy transfers', 'Responses and homeostasis', 'Populations and ecosystems', 'Gene expression and biotechnology']],
  ['business', 'Business', ['Business objectives and strategy', 'Marketing', 'Finance and accounting', 'People and operations', 'External environment', 'Decision making and change']],
  ['chemistry', 'Chemistry', ['Atomic structure', 'Amount of substance', 'Bonding and structure', 'Energetics and kinetics', 'Equilibria and acids', 'Redox and electrochemistry', 'Inorganic chemistry', 'Organic chemistry', 'Analysis and practical skills']],
  ['classical-civilisation', 'Classical Civilisation', ['Greek world', 'Roman world', 'Literature and epic', 'Religion and beliefs', 'Art and material culture', 'Classical reception']],
  ['computer-science', 'Computer Science', ['Programming and data structures', 'Algorithms and complexity', 'Data representation', 'Computer systems', 'Networks and cybersecurity', 'Databases', 'Legal and ethical issues', 'Computational thinking project']],
  ['dance', 'Dance', ['Performance', 'Choreography', 'Critical engagement', 'Professional works', 'Context and interpretation']],
  ['design-technology', 'Design and Technology', ['Materials and processes', 'Design theory', 'User-centred design', 'Manufacture and prototyping', 'Sustainability', 'Independent design project']],
  ['drama-theatre', 'Drama and Theatre', ['Performance skills', 'Design for theatre', 'Text in performance', 'Practitioners and styles', 'Live theatre evaluation', 'Devised performance']],
  ['economics', 'Economics', ['Economic methodology', 'Markets and market failure', 'Firms and labour markets', 'Macroeconomic performance', 'Policy objectives and instruments', 'International economics', 'Development and inequality']],
  ['electronics', 'Electronics', ['Circuit theory', 'Semiconductors', 'Digital logic', 'Microcontrollers', 'Communication systems', 'Control systems', 'Electronic project']],
  ['english-language', 'English Language', ['Language levels and frameworks', 'Language variation', 'Language change', 'Child language development', 'Language diversity', 'Independent language investigation']],
  ['english-language-literature', 'English Language and Literature', ['Poetry', 'Prose', 'Drama', 'Non-literary texts', 'Language analysis', 'Adaptation and transformation', 'Independent study']],
  ['english-literature', 'English Literature', ['Poetry', 'Prose', 'Drama', 'Shakespeare', 'Literary movements and contexts', 'Critical interpretations', 'Independent comparative study']],
  ['environmental-science', 'Environmental Science', ['Living environment', 'Physical environment', 'Energy resources', 'Pollution', 'Biological resources', 'Sustainability', 'Research methods']],
  ['film-studies', 'Film Studies', ['Film form', 'Meaning and response', 'Contexts of film', 'Global cinema', 'Documentary', 'Silent and experimental film', 'Production']],
  ['further-mathematics', 'Further Mathematics', ['Proof and complex numbers', 'Matrices', 'Further algebra and functions', 'Further calculus', 'Polar coordinates', 'Differential equations', 'Further statistics', 'Further mechanics', 'Decision mathematics']],
  ['geography', 'Geography', ['Water and carbon cycles', 'Landscape systems', 'Global systems and governance', 'Changing places', 'Hazards', 'Population and environment', 'Geographical skills', 'Fieldwork investigation']],
  ['geology', 'Geology', ['Minerals and rocks', 'Fossils and time', 'Plate tectonics', 'Structural geology', 'Earth resources', 'Geohazards', 'Fieldwork and practical skills']],
  ['history', 'History', ['Breadth study', 'Depth study', 'Historical themes', 'Primary sources', 'Historical interpretations', 'Independent investigation']],
  ['history-art', 'History of Art', ['Visual analysis', 'Classical art and architecture', 'European art traditions', 'Global art traditions', 'Themes and contexts', 'Critical interpretation']],
  ['law', 'Law', ['English legal system', 'Law making', 'Criminal law', 'Tort law', 'Contract law', 'Human rights', 'Legal concepts and justice']],
  ['mathematics', 'Mathematics', ['Proof', 'Algebra and functions', 'Coordinate geometry', 'Sequences and series', 'Trigonometry', 'Exponentials and logarithms', 'Differentiation', 'Integration', 'Vectors', 'Statistics', 'Mechanics']],
  ['media-studies', 'Media Studies', ['Media language', 'Representation', 'Media industries', 'Audiences', 'Contexts and debates', 'Cross-media products', 'Production']],
  ['music', 'Music', ['Performing', 'Composing', 'Appraising', 'Harmony and tonality', 'Musical forms', 'Set works and contexts']],
  ['music-technology', 'Music Technology', ['Recording techniques', 'Mixing and production', 'Synthesis and sampling', 'Audio technology history', 'Listening and analysis', 'Technology-based composition']],
  ['philosophy', 'Philosophy', ['Epistemology', 'Moral philosophy', 'Metaphysics of God', 'Metaphysics of mind', 'Argument analysis']],
  ['physical-education', 'Physical Education', ['Applied anatomy and physiology', 'Exercise physiology', 'Biomechanics', 'Skill acquisition', 'Sport psychology', 'Sport and society', 'Performance analysis']],
  ['physics', 'Physics', ['Measurements and uncertainties', 'Particles and radiation', 'Waves and optics', 'Mechanics and materials', 'Electricity', 'Thermal physics', 'Fields', 'Nuclear physics', 'Practical skills']],
  ['politics', 'Politics', ['UK politics and elections', 'UK government', 'Political ideas', 'Comparative politics', 'Global politics', 'Devolution and constitutional change']],
  ['psychology', 'Psychology', ['Research methods', 'Social influence', 'Memory', 'Attachment', 'Approaches in psychology', 'Biopsychology', 'Psychopathology', 'Issues and debates', 'Applied psychology']],
  ['religious-studies', 'Religious Studies', ['Philosophy of religion', 'Religion and ethics', 'Study of religion', 'Religious language', 'Developments in belief', 'Dialogue between religion and society']],
  ['sociology', 'Sociology', ['Education', 'Research methods', 'Families and households', 'Culture and identity', 'Crime and deviance', 'Media', 'Beliefs in society', 'Theory and methods']],
  ['statistics', 'Statistics', ['Data collection', 'Probability', 'Discrete distributions', 'Continuous distributions', 'Hypothesis testing', 'Correlation and regression', 'Analysis of variance', 'Statistical modelling']],
]

const languageTopics = ['Social issues and trends', 'Political and artistic culture', 'Grammar and vocabulary', 'Listening and reading', 'Translation', 'Literary text or film', 'Independent research project']
const languages = ['Arabic', 'Bengali', 'Chinese', 'French', 'German', 'Modern Greek', 'Gujarati', 'Italian', 'Japanese', 'Modern Hebrew', 'Panjabi', 'Persian', 'Polish', 'Portuguese', 'Russian', 'Spanish', 'Turkish', 'Urdu']
const ancientLanguages = ['Classical Greek', 'Latin'].map((language) => outline(language.toLowerCase().replaceAll(' ', '-'), language, ['Language and translation', 'Prose literature', 'Verse literature', 'Grammar and syntax', 'Literary analysis']))

export const aLevelDecks = [
  ...subjectMaps.map(([id, title, topics]) => outline(id, title, topics)),
  ...languages.map((language) => outline(language.toLowerCase().replaceAll(' ', '-'), language, languageTopics)),
  ...ancientLanguages,
]

export const builtInCourseDecks = [ucatDeck, bmatDeck, ...aLevelDecks, ...examBoardDecks]
