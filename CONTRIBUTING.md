# Contributing to Portfoliofy

Thanks for your interest in contributing. This covers the practical steps for working on the codebase — for how it's structured and how to add a new feature, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting started

1. Fork the repository and clone your fork.
2. Follow the setup steps in [README.md](./README.md#getting-started) (install dependencies, configure environment variables, initialize the database).
3. Create a branch for your change: `git checkout -b feat/your-feature-name`.

## Development

- Package manager: `pnpm`, pinned to `pnpm@9.1.2` (see `packageManager` in `package.json`). Install it with `npm install -g pnpm` if you don't already have it.
- Node: version 20 (matches CI).
- Run the dev server: `pnpm dev`.

## Before you commit

A pre-commit hook (Husky) runs automatically and blocks the commit if any of these fail:

- `lint-staged` — ESLint (`--fix`) on staged `.ts`/`.tsx`/`.js`/`.jsx` files, and Prettier on staged `.ts`/`.tsx`/`.js`/`.jsx`/`.json`/`.css`/`.md` files.
- `pnpm typecheck` — TypeScript in strict mode, no emit.
- `pnpm test` — the Vitest suite.

You can run any of these yourself ahead of time:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/) — prefix your commit subject with `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`, or `chore:` as appropriate. Add a `!` after the type (e.g. `refactor!:`) for a breaking change.

## Submitting a pull request

1. Push your branch and open a PR against `main`.
2. CI (`.github/workflows/ci.yml`) runs lint, typecheck, and the test suite on every PR — all three must pass before merge.
3. Keep PRs focused on one change. For anything larger, open an issue first to discuss the approach before you build it.

## Adding a new resume section

If your contribution adds a new portfolio section (e.g. "Languages," "Certifications"), follow the step-by-step pattern in [ARCHITECTURE.md](./ARCHITECTURE.md#4-step-by-step-guide-adding-a-new-tab) instead of inventing a new one — it keeps drag-and-drop reordering, hide/show, and the Save-validation flow consistent across sections.

## Code style

- TypeScript strict mode — avoid `any` where a real type is available.
- Tailwind CSS for styling; match the utility-class conventions already used in the file you're editing rather than introducing a new one.
- Reuse existing hooks/components (`useResumeList`, `useTabEditor`, `ListTabLayout`, etc.) instead of re-implementing the same CRUD/list/form logic per section.

## Reporting bugs or requesting features

Open a [GitHub issue](https://github.com/fudailzafar/portfoliofy-v3/issues) with steps to reproduce (for bugs) or the problem you're trying to solve (for feature requests).
