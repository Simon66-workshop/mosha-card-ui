# Baseline install failure

Run 35120393592, source b95e036481f17be5b283fedbe9d103428835b4cc, application unchanged from a7a1ee4938460b2183ba181a44b403cbb1205f94. `npm ci --ignore-scripts` failed: package.json and package-lock.json out of sync (AJV and json-schema-traverse versions/dependencies). No contract tests executed in that run. This is an install-contract failure, NOT the expected export RED result.

A follow-up diagnostic run installs a small independent tool/dependency set in a runner-temporary directory and symlinks it to the unchanged application solely to execute export tests. It must not be described as a clean install or baseline build PASS. The original lockfile remains unchanged until the approved standalone-OSS migration.
