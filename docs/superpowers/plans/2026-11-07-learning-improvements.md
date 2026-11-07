# StudyPro Learning Improvements Implementation Plan

**Goal:** Help learners identify and revisit gaps, understand answers, study together and safely transfer local progress.
**Architecture:** Keep individual history in versioned browser storage; derive review queues and topic summaries from recorded attempts. Extend the existing in-memory room protocol for invitations, replay and recovery; preserve exam-style hazard playback and add post-attempt review. Use an explicit, validated backup format.
**Tech stack:** React, Vite, Vitest, WebSockets and browser localStorage.
**Spec:** The seven improvements agreed in the conversation on 7 November 2026.

## Tasks
- [x] Add tested per-course attempt tracking, due-review selection and topic summaries; keep legacy aggregates separately labelled.
- [x] Wire solo quizzes and mock exams to history; display explanations, sources, saved questions, review queue and honest progress.
- [x] Add validated local backup export and restore without silently replacing existing data.
- [x] Add group invite links, missed-question replay, discussion prompts, reconnection and clearer connection feedback.
- [x] Add accessible post-clip hazard replay, scoring-window timeline and response markers.
- [x] Verify keyboard/mobile and cross-device quiz, hazard, recovery and backup flows on the MacBook and iMac; document remaining hosted-service limits.

Verification scope: two-device browser flows cover quiz, replay, reconnection and backup; a mobile-width visual check and a keyboard-focus check were performed. A full screen-reader and accessibility audit remains outstanding.
