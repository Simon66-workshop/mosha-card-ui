# Plan B implementation self-review — 2026-09-16

This is implementation self-review plus executable tests, not an independent outside audit. The authorized scope is standalone public Mosha UI distribution, safe exports, real integration tests and a deployable demo. Official applications and social posting remain paused.

## Reproduced defects and fixes

Original application: a7a1ee4938460b2183ba181a44b403cbb1205f94. The original clean install failed before tests due to a package/lock mismatch. A separate diagnostic run against unchanged application code executed 15 contracts: 2 passed, 13 failed (run 35120627935). Initial implementation fb36604e218e5b8542725b38ba8cd0b91df4a703 passed clean install, tsc, lint, 15 contracts and 15 real Chromium checks (run 35123223962).

- HTML/CSS injection boundaries: normalized hex colors and finite bounded parameters. Text remains escaped/literal; JSON-backed TSX accepts quotes, braces, backticks, line breaks and Chinese without interpreting them as JSX.
- Persisted-state repair: complete fields/symbols, unique IDs, 2–6 cards, valid dimensions and keyboard edits saved. Deleting a preceding card now preserves selected identity.
- Real reuse: generated HTML actually opens; generated TSX actually compiles and renders twice with distinct filter IDs/backgrounds; unrelated host heading styling remains unchanged.
- Accessibility and geometry: focus, Enter/Space, Escape, touch-compatible buttons, accessible mobile toolbar names, responsive scaling and reduced-motion checks.
- Runtime cleanup: no auth, DB, migrations, server or app-builder PWA required. 51 runtime dependencies reduced to 7. Standalone TSX needs React; full HTML needs no external font request. Studio keeps optional original Google Fonts.

## Dependency findings

The initial diagnostic browser tooling used Playwright 1.55.0. Actual audit found 1 high Playwright installer advisory and 2 low ESLint/plugin-kit findings; runtime-only audit was zero. Playwright was upgraded to 1.62.0 and all 15 browser checks passed again in run 35123582090. The remaining ESLint issue is being closed through a compatible 9.x update, not a forced major migration. Final acceptance requires fresh audit JSON with zero findings and the full gate sequence on the exact reviewed head.

Primary advisory: https://github.com/advisories/GHSA-7mvr-c777-76hp
ESLint transitive advisory: https://github.com/advisories/GHSA-xffm-g5w8-qvg7

## Scope and limitations retained

No quantified speedup claim. No complete browser certification: Chromium is exercised, Safari/iOS are not. The HTML interaction script is a full-document example; dynamic host removal needs observer/listener cleanup by the integrator. Multiple exports share the reserved mosha namespace; mixing different recipe versions is not guaranteed. Tiny 6-card mobile layouts scale down and may require larger host regions for readable text.

The screenshots depict the actual studio and generated test fixtures, not customer deployments. Existing branded artwork/video is retained separately, without claiming it was newly captured during this audit. Manual comparison to the existing studio-fan reference checked layout, 66Workshop mark, typography, colors, cards and controls; intentional changes are the GitHub link, input validation messages, export help and accessibility behavior.

## Deployment gate

TinyFish reached the repository without an authenticated GitHub session and could not change Settings > Pages. No login barrier was bypassed. The Pages workflow is prepared, but public URL availability must be reported separately from code/CI acceptance. Repository owner may need to choose Source: GitHub Actions and run the deploy workflow.

## Historical execution note

The one-shot runner successfully generated source and lockfile but its token could not update workflows. The normal authorized GitHub connector subsequently published the exact accessible commit. No credentials, permission escalation or forced ref overwrite was used. The temporary source transport and apply workflow are absent from the final application tree. Negative execution evidence remains in the linked historical runs.
