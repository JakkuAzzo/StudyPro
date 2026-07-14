# Content and media guide

StudyPro turns JSON into several revision modes. `key` and `definition` are required; questions, explanations, examples, sources, and images improve the generated activities.

```json
{
  "title": "Biology essentials",
  "subject": "Biology",
  "attribution": "Original content by Example Author, CC BY 4.0",
  "topics": [{
    "title": "Cell biology",
    "items": [{
      "key": "Mitochondrion",
      "question": "Where does aerobic respiration occur?",
      "definition": "The organelle where aerobic respiration occurs.",
      "explanation": "It releases usable energy as ATP.",
      "example": "Muscle cells contain many mitochondria.",
      "source": "Example textbook, chapter 2",
      "distractors": ["Nucleus", "Ribosome", "Golgi apparatus"],
      "image": "./assets/example.jpg",
      "imageAlt": "A labelled cell diagram"
    }]
  }]
}
```

The aliases `term`/`answer`, `question`/`answer`, and `key`/`definition` are accepted. A top-level array also works. Optional `distractors` provide three curated wrong answers for multiple-choice tests; otherwise StudyPro selects the closest alternatives by topic and question type.

Hazard clips live in `src/hazardClips.js`. Each manifest entry declares its source URL, author, licence, playback segment, and one or two training scoring windows. Add only original, public-domain, or openly licensed video; annotate the moment a situation becomes a developing hazard, not when it is merely visible.

“Free to access” is not a redistribution licence. The built-in driving questions are original and based on the Highway Code and GOV.UK guidance. Traffic-sign images are Crown copyright and reproduced under the Open Government Licence v3.0. Hazard footage is attributed per clip and is not from the DVSA test.
