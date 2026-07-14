# StudyPro

StudyPro is a static, privacy-friendly study app that turns structured JSON notes into active practice instantly. It runs entirely in the browser and is ready to deploy with GitHub Pages.

By default it includes **112 original Great Britain car-theory practice questions across all 14 topic areas**, with explanations and source references. It also includes a 50-question, 57-minute mock-test mode matching the current multiple-choice test format.

The live DVSA test questions are not published. DVSA revision-bank questions require a separate Crown copyright licence, so this repository does not copy or claim to contain those licensed questions. The built-in questions are original practice material based on the Highway Code and GOV.UK guidance. Highway Code-derived information is used under the Open Government Licence v3.0; StudyPro is not affiliated with or endorsed by DVSA.

## Study modes

- Rapid recall with a session timer and self-rating
- Learn and reveal cards for deliberate rote learning
- Typed fill-in-the-blank prompts
- Open reasoning prompts with source-answer comparison
- Multiple-choice “quiz arena” rounds
- Term-and-definition matching sprints
- A timed 50-question mock theory test

Imported sets and progress are stored in the browser's `localStorage`; no server or API key is required.

## JSON format

```json
{
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
}
```

Simple arrays are also accepted. `term`/`answer`, `question`/`answer`, and `key`/`definition` are recognised automatically.

## Local development

```bash
npm install
npm run dev
```

Run checks with:

```bash
npm test
npm run build
```

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the app after a push to `main` or `master`. In the repository settings, set **Pages → Source** to **GitHub Actions** once, then push the branch.
