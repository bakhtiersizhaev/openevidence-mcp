# Contributing to OpenEvidence MCP

Thank you for considering contributing to OpenEvidence MCP. This project is unofficial, is not affiliated with OpenEvidence, and does not provide medical advice.

## How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## Development Setup

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
npm ci
npx playwright install chromium
npm run build
```

Copy `.env.example` to `.env` only if you need custom paths or polling settings. Do not commit `.env`.

## Verification

Available checks:

```bash
npm run build
npm run check
npm test
npm run smoke
```

`npm run smoke` requires a valid local OpenEvidence session. Run `npm run login:session` first if needed.

There is currently no `npm run lint` script. If a PR cannot run one of the available checks, explain why.

## Commit Convention

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

## Reporting Issues

Open an issue with a clear title and description. Include:
- OS and Node.js version
- npm version
- MCP client
- install method
- command used
- sanitized logs
- auth status
- whether the local browser profile exists
- Steps to reproduce
- Expected vs actual behavior

Do not include secrets, cookies, session tokens, browser profile files, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers.

## Pull Request Checklist

- [ ] I did not commit secrets, cookies, browser profile files, or storage-state files.
- [ ] I ran build/test or explained why not.
- [ ] I updated docs if behavior changed.
- [ ] I kept OpenEvidence affiliation/disclaimer wording intact.

## Code of Conduct

Be respectful, constructive, and professional.

## License

By contributing, you agree your contributions will be licensed under Apache-2.0.
