# Mosha Plan B — final release receipt

Date: 2026-09-16. Code delivery and public deployment are separate gates.

## Frozen references

- Repository: Simon66-workshop/mosha-card-ui (public, MIT)
- Merged PR: https://github.com/Simon66-workshop/mosha-card-ui/pull/1
- Main: `7810f934464b500a933593b2ff3d91fdfa157a71`
- Feature: `88a4ff44adf81743794d96583eb0dac349fd0f25`
- Tree: `fa0194ceba330258eb3308d64241dd716e2b3efa`
- Original application: `a7a1ee4938460b2183ba181a44b403cbb1205f94`

## Final main acceptance — PASS

Run https://github.com/Simon66-workshop/mosha-card-ui/actions/runs/35125457812 completed successfully, including evidence publication. Clean npm ci, typecheck, lint and production build passed. Contract tests: 15/15. Actual Chromium browser checks: 15/15. Complete and runtime-only npm audits both returned zero advisories at execution. This is not a guarantee of absence of all vulnerabilities.

Artifact `10458607811`, ZIP SHA-256 `5164c1b3558961b17c7e763564d1562a30d8477103752babb25162e3e5c2e270`. Downloaded ZIP CRC passed. Source archive was rebuilt into Git objects locally and matched the exact tree above. All four screenshot hashes match browser.json. No application exceptions, console errors or failed local assets were recorded in that browser run.

Raw reports, logs and captures: [runs/7810f934464b500a933593b2ff3d91fdfa157a71](runs/7810f934464b500a933593b2ff3d91fdfa157a71).

## Product improvements

The public distribution is now a standalone React/Vite studio with 7 direct runtime dependencies instead of 51. Auth, DB, migrations, server and app-builder/PWA scaffold are no longer required. Existing visuals, seven presets and card editing are retained. Clean installation uses an npm-generated lockfile.

Export data is normalized: hex colors, finite bounded numeric parameters, complete card records and 2–6 cards. HTML/CSS input boundaries and TSX literal text encoding are regression-tested. Restored data is repaired, keyboard edits persist, and deleting a preceding card preserves selected identity. Generated full HTML runs; two generated React components compile and render with distinct filter IDs, independent state/backgrounds and unchanged unrelated host heading styles. Exported TSX uses React only; complete HTML needs no external fonts. Interactions still use JavaScript; no zero-JavaScript claim.

## Screenshots and scope

Four actual 2160×1500 PNG captures: studio, liquid preset, export controls, and two-instance React integration fixture. Browser: Chromium 151.0.7922.34 / Playwright 1.62.0. These are real app/test fixtures, not generated mockups or customer deployments. The fourth image intentionally contains literal special-character test input and an unchanged host heading; use it as integration proof rather than a customer success image.

Desktop, mobile-sized layouts, keyboard behavior and reduced motion were exercised. Safari/iOS and independent native runtimes were not certified. This is implementation self-review with executable verification, not independent third-party security certification or an original-art rights audit.

## Public deployment — BLOCKED, not live

Run https://github.com/Simon66-workshop/mosha-card-ui/actions/runs/35125457715 passed installation, checks and build, but failed at actions/configure-pages@v5: `Get Pages site failed ... Not Found`. Upload/deploy steps were skipped. The Pages site is not enabled/configured. A prior browser attempt could not access GitHub Settings authenticated; no login barrier was bypassed.

Required owner action: repository Settings → Pages → Build and deployment → Source: GitHub Actions. Then Actions → Deploy studio to Pages → Run workflow on main (or re-run the failed deployment). Intended URL https://simon66-workshop.github.io/mosha-card-ui/ must not be promoted as live until deployment succeeds and the public page is checked. No passwords, API keys or access tokens are needed in chat.

## Negative evidence and remaining maintenance

Original clean install failed from manifest/lock mismatch. Isolated diagnostic dependencies against unchanged app source produced 2 pass / 13 fail; original JSON is retained in main at docs/audit/baseline/contracts.json.gz. This was not a passing original build. Development advisories were patched: Playwright 1.62.0 and ESLint 9.39.5. Npm still emits an ESLint 9 lifecycle deprecation warning; runner action-runtime deprecation warnings also remain. They are not hidden or counted as zero warnings; a future major-toolchain upgrade is separate work.

Full-document HTML examples are not a lifecycle-managed DOM plugin; dynamic host removal needs cleanup. Very narrow six-card layouts may reduce text readability. Different recipe versions share a reserved mosha namespace, so arbitrary mixed-version compatibility is not guaranteed.

Codex OSS application: PAUSED / NOT SUBMITTED. X post: NOT SENT. npm publication: NOT DONE. No award, payout, official endorsement, artificial stars or external adoption is claimed.
