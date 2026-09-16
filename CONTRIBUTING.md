# Contributing

Open a reproducible issue before a large new subsystem. Preserve the small static studio and existing design. Include browser/version, OS, card count/layout/preset, minimal reproduction, expected/actual behavior and a screenshot without secrets or client data.

Use Node 22.12+, npm ci, npm run typecheck, npm run lint, npm test, npm run build. Install Chromium for browser QA with `npx playwright install --with-deps chromium`, then `npm run test:browser`. The browser suite uses the production Pages base path, so build with `GITHUB_PAGES=1 npm run build` first. Do not confuse checked cases with universal security or cross-browser coverage.

Keep user text as data, validate restored/exported settings, and test literal punctuation, invalid colors, card boundaries, multi-instance styles and keyboard/touch controls. Capture real rendered code. A useful external integration is welcome; label prototypes and deployments accurately.
