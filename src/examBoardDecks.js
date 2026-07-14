const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const topicItem = (subject, board, title, sourceUrl) => ({
  key: title,
  question: `What does ${board} expect you to revise within ${title.toLowerCase()}?`,
  definition: `The specification content grouped under ${title}.`,
  explanation: `Use this as a coverage checkpoint, then open the linked official specification for the assessable statements, mathematical requirements, practical work and optional routes.`,
  source: `${board} official ${subject} specification: ${sourceUrl}`,
})

const pack = ({ subject, board, code, sourceUrl, topics, note = '' }) => ({
  id: `a-level-${slug(subject)}-${slug(board)}-${slug(code)}`,
  title: `A-level ${subject} — ${board}`,
  subject: `A level · ${subject} · ${board}`,
  category: 'A levels',
  status: `${board} ${code}`,
  description: `${topics.length}-section specification map for ${board} ${code}.${note ? ` ${note}` : ''}`,
  attribution: `Specification structure: ${board}. Official source: ${sourceUrl}`,
  referenceUrl: sourceUrl,
  features: ['generic'],
  topics: topics.map((title) => ({ title, items: [topicItem(subject, board, title, sourceUrl)] })),
})

const commonMaths = ['Mathematical argument, language and proof', 'Mathematical problem solving', 'Mathematical modelling', 'Proof', 'Algebra and functions', 'Coordinate geometry', 'Sequences and series', 'Trigonometry', 'Exponentials and logarithms', 'Differentiation', 'Integration', 'Numerical methods', 'Vectors', 'Statistical sampling', 'Data presentation and interpretation', 'Probability', 'Statistical distributions', 'Hypothesis testing', 'Quantities and units in mechanics', 'Kinematics', 'Forces and Newton’s laws', 'Moments']

export const examBoardDecks = [
  pack({
    subject: 'Biology', board: 'AQA', code: '7402',
    sourceUrl: 'https://www.aqa.org.uk/subjects/biology/a-level/biology-7402/specification/specification-at-a-glance',
    topics: ['Biological molecules', 'Cells', 'Organisms exchange substances with their environment', 'Genetic information, variation and relationships', 'Energy transfers in and between organisms', 'Responses to internal and external environments', 'Genetics, populations, evolution and ecosystems', 'Control of gene expression'],
  }),
  pack({
    subject: 'Biology', board: 'OCR A', code: 'H420',
    sourceUrl: 'https://www.ocr.org.uk/qualifications/as-a-level-gce/biology-a-h020-h420-from-2015/specification-at-a-glance/',
    topics: ['Development of practical skills in biology', 'Foundations in biology', 'Exchange and transport', 'Biodiversity, evolution and disease', 'Communication, homeostasis and energy', 'Genetics, evolution and ecosystems'],
  }),
  pack({
    subject: 'Biology', board: 'Pearson Edexcel A', code: '9BN0',
    sourceUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/biology-a-2015.html',
    topics: ['Lifestyle, health and risk', 'Genes and health', 'Voice of the genome', 'Biodiversity and natural resources', 'On the wild side', 'Immunity, infection and forensics', 'Run for your life', 'Grey matter'],
  }),
  pack({
    subject: 'Chemistry', board: 'AQA', code: '7405',
    sourceUrl: 'https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification/specification-at-a-glance',
    topics: ['Atomic structure', 'Amount of substance', 'Bonding', 'Energetics and thermodynamics', 'Kinetics and rate equations', 'Equilibria, Kc and Kp', 'Redox and electrochemistry', 'Acids and bases', 'Periodicity, Group 2 and halogens', 'Period 3 and transition metals', 'Core organic chemistry', 'Advanced organic chemistry', 'Organic synthesis and analysis'],
  }),
  pack({
    subject: 'Chemistry', board: 'OCR A', code: 'H432',
    sourceUrl: 'https://www.ocr.org.uk/qualifications/as-and-a-level/chemistry-a-h032-h432-from-2015/specification-at-a-glance/',
    topics: ['Development of practical skills in chemistry', 'Foundations in chemistry', 'Periodic table and energy', 'Core organic chemistry', 'Physical chemistry and transition elements', 'Organic chemistry and analysis'],
  }),
  pack({
    subject: 'Chemistry', board: 'Pearson Edexcel', code: '9CH0',
    sourceUrl: 'https://qualifications.pearson.com/content/dam/pdf/A%20Level/Chemistry/2015/Specification%20and%20sample%20assessments/a-level-chemistry-2015-specification.pdf',
    topics: ['Atomic structure and the periodic table', 'Bonding and structure', 'Redox I', 'Inorganic chemistry and the periodic table', 'Formulae, equations and amounts', 'Organic chemistry I', 'Modern analytical techniques I', 'Energetics I', 'Kinetics I', 'Equilibrium I', 'Equilibrium II', 'Acid-base equilibria', 'Energetics II', 'Redox II', 'Transition metals', 'Kinetics II', 'Organic chemistry II', 'Organic chemistry III', 'Modern analytical techniques II'],
  }),
  pack({
    subject: 'Physics', board: 'AQA', code: '7408',
    sourceUrl: 'https://www.aqa.org.uk/subjects/physics/a-level/physics-7408/specification/specification-at-a-glance',
    topics: ['Measurements and their errors', 'Particles and radiation', 'Waves', 'Mechanics and materials', 'Electricity', 'Further mechanics and thermal physics', 'Fields and their consequences', 'Nuclear physics', 'Option: Astrophysics', 'Option: Medical physics', 'Option: Engineering physics', 'Option: Turning points in physics', 'Option: Electronics'],
  }),
  pack({
    subject: 'Physics', board: 'OCR A', code: 'H556',
    sourceUrl: 'https://www.ocr.org.uk/images/171726-specification-accredited-a-level-gce-physics-a-h556.pdf',
    topics: ['Development of practical skills in physics', 'Foundations of physics', 'Forces and motion', 'Electrons, waves and photons', 'Newtonian world and astrophysics', 'Particles and medical physics'],
  }),
  pack({
    subject: 'Physics', board: 'Pearson Edexcel', code: '9PH0',
    sourceUrl: 'https://qualifications.pearson.com/content/dam/pdf/A%20Level/Physics/2015/Specification%20and%20sample%20assessments/pearsonedexcel-alevel-physics-spec.pdf',
    topics: ['Working as a physicist', 'Mechanics', 'Electric circuits', 'Materials', 'Waves and particle nature of light', 'Further mechanics', 'Electric and magnetic fields', 'Nuclear and particle physics', 'Thermodynamics', 'Space', 'Nuclear radiation', 'Gravitational fields', 'Oscillations'],
  }),
  pack({
    subject: 'Mathematics', board: 'AQA', code: '7357',
    sourceUrl: 'https://www.aqa.org.uk/subjects/mathematics/a-level/mathematics-7357/specification/specification-at-a-glance',
    topics: commonMaths,
    note: 'The national subject content is common across exam boards; this pack identifies the AQA assessment route.',
  }),
  pack({
    subject: 'Mathematics', board: 'OCR A', code: 'H240',
    sourceUrl: 'https://www.ocr.org.uk/qualifications/as-a-level-gce/mathematics-a-h230-h240-from-2017/specification-at-a-glance/',
    topics: commonMaths,
    note: 'The national subject content is common across exam boards; this pack identifies the OCR A assessment route.',
  }),
  pack({
    subject: 'Mathematics', board: 'Pearson Edexcel', code: '9MA0',
    sourceUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html',
    topics: commonMaths,
    note: 'The national subject content is common across exam boards; this pack identifies the Pearson Edexcel assessment route.',
  }),
  pack({
    subject: 'Psychology', board: 'AQA', code: '7182 · first exams 2027',
    sourceUrl: 'https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification/specification-at-a-glance',
    topics: ['Social influence', 'Memory', 'Attachment', 'Clinical psychology and mental health', 'Approaches in psychology', 'Biopsychology', 'Research methods', 'Issues and debates', 'Option group 1: Relationships, gender, or cognition and development', 'Option group 2: Schizophrenia, eating behaviour, or stress', 'Option group 3: Aggression, forensic psychology, or addiction'],
    note: 'Updated specification for first A-level exams in 2027.',
  }),
  pack({
    subject: 'Psychology', board: 'OCR', code: 'H567',
    sourceUrl: 'https://www.ocr.org.uk/qualifications/as-and-a-level/psychology-h167-h567-from-2015/',
    topics: ['Research methods', 'Core studies', 'Areas and perspectives in psychology', 'Issues and debates', 'Mental health', 'Applied psychology options'],
    note: 'Current H567 route; OCR has separately published a future H569 qualification for teaching from 2027.',
  }),
  pack({
    subject: 'Psychology', board: 'Pearson Edexcel', code: '9PS0',
    sourceUrl: 'https://qualifications.pearson.com/content/dam/pdf/A%20Level/Psychology/2015/specification-and-sample-assessments/al-specification-psychology.pdf',
    topics: ['Social psychology', 'Cognitive psychology', 'Biological psychology', 'Learning theories', 'Clinical psychology', 'Option: Criminological psychology', 'Option: Child psychology', 'Option: Health psychology', 'Psychological skills and research methods'],
  }),
]
