# Security Policy

## Supported versions

Security updates are handled on the default branch. If versioned releases are added later, this policy will be updated with supported release lines.

## Reporting a vulnerability

Please do **not** open a public issue with exploit details, private tokens, database contents, or other sensitive information.

Preferred reporting path:

1. Open a private security advisory for this repository on GitHub, if available.
2. Include a clear description, affected area, reproduction steps, impact, and any suggested fix.
3. If a private advisory is not available, open a public issue with only a minimal description asking for a secure contact path. Do not include exploit details publicly.

## What to include

Helpful reports include:

- Affected commit, branch, or version.
- Steps to reproduce.
- Expected vs. actual behavior.
- Impact and likelihood.
- Relevant logs or screenshots with secrets redacted.

## Scope

In scope:

- Authentication and session handling.
- Google OAuth integration.
- Local database access and data isolation.
- Server functions and API routes.
- Dependency vulnerabilities that affect this app.

Out of scope:

- Social engineering.
- Denial-of-service testing against hosted instances without permission.
- Reports that require access to another user's account, data, or device without consent.

## Maintainer response

The maintainer will review reports as time allows, prioritize confirmed vulnerabilities by severity, and coordinate fixes before public disclosure when appropriate.
