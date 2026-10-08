# shlink-web-component

A React and TypeScript component library with the screens of Shlink, the URL shortener: short URLs, tags, visits statistics, domains and redirect rules. It is consumed by the Shlink web client. Work arrives as factory tasks; `.factory/contract.json` defines the checks that decide pass or fail.

## Stack
Language: TypeScript · UI: React with Tailwind · Build: Vite · Tests: Vitest in browser mode with Playwright Chromium and Testing Library · Lint: oxlint · Format: oxfmt · Node 24, npm

## Commands
- Install: `npm ci && npx playwright install chromium`
- Lint: `node --run lint`
- Format check: `node --run format:check` (fix with `node --run format`)
- Types: `node --run types`
- Tests: `node --run test`

## Layout
- Source lives in `src/`, grouped by feature (`short-urls/`, `tags/`, `visits/`, `domains/`, `redirect-rules/`, `settings/`, `utils/`); dependencies are wired through the container in `src/container/`.
- Tests live in `test/`, mirroring `src/`, with helpers in `test/__helpers__/`. Snapshot files are updated only when the visible output intentionally changes.
- The local development app lives in `dev/`.
- Specs live in `specs/`.

## Rules
- Changes stay inside `src/**`, `test/**`, `dev/**`, `specs/**`, `package.json` and `package-lock.json`.
- Do not edit `vite.config.ts`, `tsconfig.json`, `oxlint.config.ts`, `oxfmt.config.ts`, `test/__helpers__/setup.ts`, `.factory/**`, `.github/**` or `AGENTS.md`.
- Follow the conventions of the existing components and tests; accessibility checks in tests must keep passing.
- New dependencies need a clear reason in the spec; prefer what the project already depends on.
- No secrets and no network access at runtime or in tests.
