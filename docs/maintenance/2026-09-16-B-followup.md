# Plan B follow-up: verification and release closure

Authorized continuation of Plan B. Preserve existing visuals and runtime dependencies. Base main: 7810f934464b500a933593b2ff3d91fdfa157a71; exact downloaded source tree fa0194ceba330258eb3308d64241dd716e2b3efa was reproduced locally. Baseline artifact 10458607811 ZIP digest 5164c1b3558961b17c7e763564d1562a30d8477103752babb25162e3e5c2e270 and CRC verified.

## Findings and implementation order

1. Reproduce sparse-array normalization and emoji-truncation defects with six edge tests, then repair only validation.ts. Retain expected RED evidence.
2. Isolate browser-only React/adversarial fixtures outside dist. Record and compare the release tree before/after browser QA. A tested artifact must not be silently replaced or polluted by testing.
3. Add fail-closed release evidence verification: exact source, complete/unique checks, image hashes, production tree hashes and complete/runtime dependency audit receipts. Mutation-test rejection of missing, duplicate, stale and tampered evidence.
4. Make the Pages workflow run the same browser/audit/evidence gates before deployment. Preserve separate deployment failure status instead of counting a successful build as a live site.
5. Preserve raw reports, screenshots, source/artifact hashes and handoff in the repository. Merge only after fresh CI and exact candidate verification. No application submission, social post, paid service, credential extraction or promotion of artificial adoption.

## Deployment limitation already verified

Run 35125457715 passed install/types/lint/contracts/build, then failed at actions/configure-pages with `Get Pages site failed` / `Not Found`. Deploy was skipped. The browser did not have an authenticated GitHub session in the previous attempt. GitHub documents that initial Pages enablement needs repository settings or an appropriately authorized non-GITHUB_TOKEN credential; do not fabricate access or bypass the login gate.

## Tools and evidence scope

GitHub is accessed via the authorized connector because the local runtime cannot resolve github.com or registry.npmjs.org. Local static/transpiled diagnostic checks are not represented as a fresh full npm install. Canonical Node and Chromium verification runs in GitHub Actions, followed by download and verification of the exact source and raw reports. This is implementation self-review, not an independent third-party security certification.
