# Baseline evidence

Application baseline a7a1ee4938460b2183ba181a44b403cbb1205f94; regression-only diagnostic commit 235ba13ad9edaf7f1ce8ba78f10fdadea03a4618, run 35120627935. Original npm ci failed because the lockfile was inconsistent. The diagnostic run used isolated dependencies without modifying the application. It then executed 15 contracts: 2 passed, 13 failed. These results are expected RED, not a production pass. Source and diagnostic dependency archive: artifact 10455934204; ZIP SHA256 9766fca027b1411d13f6763645feeb22ef5379bf829cb4da8d0a6af365bde43a.

The container cannot resolve GitHub/npm. Its system Chromium also blocks local navigation with ERR_BLOCKED_BY_ADMINISTRATOR. That browser restriction is not bypassed; browser acceptance runs on the authorized GitHub Actions runner. Local typecheck/lint/contract/build checks ran using the downloaded diagnostic dependencies, not a clean installation. Clean-install acceptance requires CI.

TinyFish attempted Settings > Pages but was not authenticated to GitHub. It made no changes. Public-deployment success must be verified separately.
