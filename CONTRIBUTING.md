# Contributing to OpenEvidence MCP

Thank you for considering contributing to OpenEvidence MCP.

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
npm install
npx playwright install chromium
cp .env.example .env
npm run build
```

## Commit Convention

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.

## Reporting Issues

Open an issue with a clear title and description. Include:
- OS and Node.js version
- Steps to reproduce
- Expected vs actual behavior

## Code of Conduct

Be respectful, constructive, and professional.

## License

By contributing, you agree your contributions will be licensed under Apache-2.0.
