# Development dependency findings closed — 2026-09-16

This record supersedes the in-progress dependency paragraph in SELF_REVIEW.md. Application source is unchanged by these dependency updates.

Initial tree: 3 npm advisory entries (2 low ESLint/plugin-kit, 1 high Playwright installer). Runtime-only audit was already zero. Playwright was upgraded from 1.55.0 to 1.62.0 in a9d34601c9a01fb0fec0e158ab44af9e9ccf9b3c. ESLint and @eslint/js were upgraded within 9.x to 9.39.5 in d2d8c6707fe101e257038e330da97ab20cc3cce1.

Actual audit closure run: https://github.com/Simon66-workshop/mosha-card-ui/actions/runs/35124306848
Artifact: 10457999317, SHA-256 9cdf6dfe676761b195d30e8e76d29e75b3e6bbe55f91a2c4618f8922fc2f50c3.

Verified artifact contents: audit-after.json and audit-production-after.json both report info=0, low=0, moderate=0, high=0, critical=0, total=0. Clean install, typecheck, lint, 15/15 contracts and 15/15 browser checks passed with the updated dependency set. These are database results at execution time, not a claim of absence of all vulnerabilities.

The maintenance run tested its updated working tree before committing package.json/lock. Final release acceptance must use the permanent OSS quality gates on the exact final commit; no earlier workflow SHA is substituted for that check. The one-shot dependency maintenance workflow is removed after completion.

## Permanent raw evidence

After main CI passes, its actual-source reports, logs and screenshots are committed to the oss-evidence branch under runs/<source SHA> by a contents-only job. Publication of evidence does not alter application branches and does not prove Pages deployment.

## Original RED kept

baseline/contracts.json.gz contains the original complete 15-case diagnostic JSON (2 pass / 13 fail), including compiler diagnostics. The gzip stream is deterministic (mtime=0). Decompressed SHA-256: 124efb9acb69ac46bf6541173b2367da275a2fdabf14598b67544b256bf3c8ba. Read with `gzip -dc docs/audit/baseline/contracts.json.gz`. The full diagnostic archive remains linked in baseline/README.md.
