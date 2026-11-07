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
- 57 separate A-level subject and language courses containing 390 common-core topic-map cards for England, based on the [Department for Education subject-content collection](https://www.gov.uk/government/collections/gce-as-and-a-level-subject-content);
- 15 sourced specification packs for AQA, OCR and Pearson Edexcel Biology, Chemistry, Physics, Mathematics and Psychology, adding 184 board-organised sections.

Use **Browse courses** to search course names and topic titles, filter by course type, subject or exam board, and sort alphabetically or by topic count. Every course has a responsive editorial cover image, and every sourced pack links back to the official awarding-body specification. These are coverage checklists rather than copies of proprietary exam questions.

## Privacy and accessibility

Solo study requires no accounts, logins, profiles, analytics, adverts, API keys, or backend services. Imported sets and solo progress stay in `localStorage` on the current device. Clearing the site's browser data removes them.

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
  "courseSubject": "Biology",
  "board": "AQA",
  "cover": "https://example.org/biology-cover.webp",
  "coverAlt": "Microscope and biology notes on a desk",
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

The optional `courseSubject`, `board`, `cover`, and `coverAlt` fields improve catalogue filtering and presentation. Imported courses without a cover use the built-in generic study artwork.

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
- `src/examBoardDecks.js` — sourced AQA, OCR and Pearson Edexcel specification maps
- `src/courseFilters.js` — catalogue search, filters and sorting
- `src/data.js` — JSON validation and normalisation
- `public/assets/covers/` — compressed built-in course artwork
- `src/data.test.js` — content and test integrity checks

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting code or content. Security reports are covered by [SECURITY.md](SECURITY.md). Code is released under the [MIT License](LICENSE); content retains its stated licence.

See the [course roadmap](docs/ROADMAP.md) for the next content-depth milestones.

## Study Party (self-hosted room service)

Study Party lets friends use a room code for a shared built-in-course quiz or a set of three driving hazard clips. The host starts rounds and reveals results. Everyone plays each video on their own device; hazard taps are scored against that player's media playback position, not the network arrival time. The clip review shows taps and points. These are practice annotations, not official DVSA scoring. Friends can reconnect to an active room on the same browser tab after a temporary connection loss.

The static website cannot host multiplayer by itself. For local development, in separate terminals run:

```sh
npm install
npm run party:server
npm run dev
```

The development app connects to `ws://localhost:8787`. The room service must be separately hosted at a publicly reachable secure WebSocket address for remote friends. The GitHub Pages workflow configures `VITE_PARTY_SERVER_URL=wss://studypro-party.onrender.com` when building the public website; for another deployment, set `VITE_PARTY_SERVER_URL` to the intended secure WebSocket URL **when building** and configure `ALLOWED_ORIGINS` on the room service to a comma-separated list of the exact permitted website origins (for example `https://jakkuazzo.github.io`). The server listens on `PORT` or 8787 and responds to `/health`. An unconfigured production build shows that the service is unavailable instead of pretending rooms work.

Rooms are held in server memory and expire after two hours of inactivity or when the service restarts. Room codes are access credentials: share them only with the people you want to join. Display names, answers, and scores pass through the room service and are shared with players in that room. The solo modes continue to store their data locally. Imported courses are not sent to the room service; the first version uses built-in courses only. Scores are for friendly practice and are not tamper-proof. The free service can take about a minute to wake after inactivity and may restart at any time, losing active rooms. It is intended for small, friendly groups, has basic connection limits, and does not provide guaranteed availability or tamper-proof scoring. The Render service deploys manually from `codex/study-party-rooms`; update that branch and trigger a deploy when changing the room service.


## Personal revision and backups

Today’s revision starts with saved or due questions, then fills a short session with questions that have not yet been practised in the selected course. Correct quiz and typed-answer attempts are scheduled for review at increasing intervals; missed questions are due immediately. This is a simple reminder, not an estimate of exam readiness. Practice accuracy and topic summaries use recorded quiz, typed-answer and theory-test attempts; self-rated activities and hazard scores are not mixed into that percentage. Earlier aggregate totals remain available as session counts, but cannot be reconstructed into topic history.

Use **Progress → Export backup** to download imported sets, local statistics, recent mock results, question history and saved questions. **Restore backup** validates the file and asks before replacing this browser’s StudyPro data. Export the current browser first if it contains progress you want to keep. No account or automatic device sync is required.

Study Party offers invite links, discussion before reveal, host-controlled retries of missed quiz questions, topic recap, automatic reconnection while a room remains available, and practice hazard replay with scoring windows and taps. Room state remains in memory: a service restart or expiration ends it, and reconnection cannot restore a lost room. The service uses the free Render plan and its shared workspace allowance.
