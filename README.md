# StudyPro

StudyPro is an account-free, open-source revision web app. Import structured JSON and it immediately creates recall, typed, reasoning, multiple-choice, and matching activities. It is a static React/Vite app that runs entirely in the browser and deploys to GitHub Pages.

**Live app:** https://jakkuazzo.github.io/StudyPro/

## UK driving theory practice

The default library contains 120 original Great Britain car-theory questions across all 14 topic areas, including eight image questions using official traffic-sign artwork. Every multiple-choice attempt draws a fresh, topic-balanced set of 50 questions from that bank and provides:

- the 57-minute limit and 43/50 pass mark;
- previous/next navigation, answer changing, and flagging;
- a 50-question overview and final submission check;
- pass/fail results, topic breakdowns, explanations, sources, and full review.

The second part is a functioning hazard-perception practice test:

- 14 silent road clips containing 15 developing hazards;
- one randomly positioned double-hazard clip;
- 5-to-1 timing scores, a 75-point maximum, and 44/75 pass mark;
- pattern-click detection, one viewing, hidden scores until the end, and clip-by-clip review;
- an extensible media manifest with per-clip source and licence details.

The live DVSA question bank and hazard clips are not published. This repository does not copy or claim to contain that licensed material. Questions are original and based on the Highway Code and GOV.UK guidance. Traffic-sign artwork is Crown copyright and reproduced under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Hazard footage is openly licensed and attributed to its creator through Wikimedia Commons. StudyPro is not affiliated with or endorsed by DVSA.

## Built-in course catalogue

The course library also includes:

- a current-format UCAT starter course covering Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement, checked against the [UCAT Consortium format](https://www.ucat.ac.uk/about-ucat/test-format-and-scoring/);
- a clearly labelled archived BMAT course for legacy skills practice—the [University of Cambridge moved its medical admissions to UCAT from 2024](https://www.cam.ac.uk/news/new-admissions-tests-for-2024);
- 57 separate A-level subject and language courses containing 390 common-core topic-map cards for England, based on the [Department for Education subject-content collection](https://www.gov.uk/government/collections/gce-as-and-a-level-subject-content).

Use the library search and course-type filter to move between Driving, Admissions tests and A levels. The A-level maps follow Department for Education common subject content, but exam boards add specification-specific detail and optional routes. They are coverage checklists rather than a substitute for the specification issued by a learner’s exam board.

## Privacy and accessibility

There are no accounts, logins, profiles, analytics, adverts, API keys, or backend services. Imported sets and progress stay in `localStorage` on the current device. Clearing the site's browser data removes them.

The interface uses semantic form controls, visible keyboard focus, text labels for icon controls, responsive layouts, and reduced-motion support. Accessibility reports are welcome.

## Study modes

- Multiple-choice theory test
- Hazard perception test
- Rapid recall with self-rating
- Learn and reveal cards
- Typed fill-in-the-blank recall
- Open reasoning with answer comparison
- Fast multiple-choice quiz rounds
- Term-and-definition matching sprints

## Import your own content

```json
{
  "title": "Biology essentials",
  "subject": "Biology",
  "topics": [{
    "title": "Cell biology",
    "items": [{
      "key": "Mitochondrion",
      "definition": "The organelle where aerobic respiration occurs.",
      "explanation": "It releases usable energy as ATP."
    }]
  }]
}
```

Simple arrays also work. `term`/`answer`, `question`/`answer`, and `key`/`definition` are recognised automatically. See [the content and media guide](docs/CONTENT-GUIDE.md).

## Development

Use a current Node.js LTS release.

```bash
npm install
npm run dev
```

Run the quality checks with:

```bash
npm test
npm run build
```

JSX is compiled by Vite during the build; GitHub Pages receives ordinary HTML, CSS, and JavaScript in `dist/`.

## GitHub Pages

`.github/workflows/deploy.yml` builds and publishes after a push to `main` or `master`. On a fork, set **Settings → Pages → Source** to **GitHub Actions** once.

## Structure

- `src/App.jsx` — library, imports, study modes, and local progress
- `src/ExamSession.jsx` / `src/examData.js` — generated multiple-choice tests
- `src/HazardSession.jsx` / `src/hazardClips.js` — hazard playback, scoring, and media manifest
- `src/drivingTheory.js` — original built-in driving questions
- `src/courseCatalog.js` — UCAT, archived BMAT and A-level course catalogue
- `src/data.js` — JSON validation and normalisation
- `src/data.test.js` — content and test integrity checks

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting code or content. Security reports are covered by [SECURITY.md](SECURITY.md). Code is released under the [MIT License](LICENSE); content retains its stated licence.

See the [course roadmap](docs/ROADMAP.md) for the next content-depth milestones.
