# Security

Mosha is a local UI editor and source generator, not an authentication system. Do not enter secrets/client records into demo content or publish them in screenshots or generated files. Settings remain in localStorage unless you manually export/share them.

Input normalization and context-correct text encoding address the known export issues documented in the audit. This is not a complete security certification. Report ordinary reproducible bugs through an issue with harmless data. For sensitive vulnerabilities, use GitHub private vulnerability reporting if enabled; do not post weaponized payloads or private data publicly. No private reporting channel is claimed enabled by this file.

The removed app-builder backend/auth code is retained in Git history only. This standalone distribution provides no backend or session protections and must not be substituted for a service that needs them.
