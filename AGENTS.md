# Mosha maintainer contract

Scope: standalone public React/Vite UI studio and CSS/HTML/TSX exports. Do not reintroduce authentication, databases, backend routes or app-builder/PWA scaffolding without a separate approved requirement.

Preserve the existing design and MIT notices. Treat settings restored from localStorage and all export input as untrusted. Use src/lib/mosha/validation.ts, encode text as text/data, validate color and numeric parameters, and keep 2–6 complete cards. Never insert user strings as executable JSX/HTML/CSS. Preserve keyboard, touch and reduced-motion behavior.

Run npm ci, npm run typecheck, npm run lint, npm test, npm run build and npm run test:browser before a release. Every stage produces machine reports, logs, source SHA, artifact hashes and a repo-first handoff. A green job without complete reports is insufficient. Record failed tests and browser/platform limitations; do not claim independent review of work you implemented yourself.

No application submission, social posting, fake adoption, paid promotion or npm publishing is implied by code work. Show real captures, not mockups. Preserve earlier source in Git; never rewrite main history. A public URL is live only after deployment and an external read verify it.
