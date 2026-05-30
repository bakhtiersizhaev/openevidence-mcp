# Security Policy

## Supported Versions

Security fixes are handled for the latest release and the current `main` branch unless maintainers state otherwise in a release note.

## Reporting a Vulnerability

If GitHub Security Advisories are enabled for this repository, use a private security advisory. If not, open a minimal public issue that says you have a security report and provide only sanitized, non-sensitive details.

Do not publish exploit details, session artifacts, account identifiers, private screenshots, patient-identifiable information, or other sensitive data in public issues, pull requests, discussions, logs, or screenshots.

## Sensitive Data Warning

Do not share browser profile files, storage-state files, cookies, session tokens, screenshots with private account data, or patient-identifiable information.

Treat these as secrets:

- browser profile directories
- `storage-state.json`
- cookies and session tokens
- `.env` files
- MCP client configs that reveal private local paths or account context
- logs containing account, medical, or patient-identifiable data

## In Scope

Security reports are useful when they involve this repository's code or documentation, including:

- browser session state leakage;
- unsafe handling of local files or environment variables;
- auth/session handling bugs in the login, smoke, or MCP server flows;
- MCP tool descriptions that could cause unsafe agent selection or tool poisoning risk;
- prompt-injection or data-exfiltration risks caused by this server's behavior;
- dependency or supply-chain risks in the npm package;
- documentation that could lead users to expose session state or private data.

## Out of Scope

These issues are outside this repository's security scope:

- vulnerabilities in OpenEvidence itself;
- attempts to bypass OpenEvidence authentication, paywalls, access controls, or terms;
- requests for medical advice or clinical decision support;
- user-specific compliance decisions, including HIPAA, GDPR, institutional governance, or professional rules;
- reports requiring access to another person's account, private data, or systems.

## Session State Handling

This project uses the user's own authenticated browser session. The project does not collect credentials and does not require an official OpenEvidence API token.

The recommended one-time login stores the local browser profile here by default:

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

If authentication fails or a session expires, rerun:

```bash
npm run login:session
```

Delete the local browser profile if you no longer want this MCP server to use the saved session.

## User Responsibility

Users are responsible for using their own OpenEvidence account, following applicable terms, protecting session state, and meeting any privacy, security, institutional, or clinical governance requirements that apply to their work.
