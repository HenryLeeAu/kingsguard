# Kingsguard project instructions

You are working on Kingsguard:
<https://github.com/kingsguard-dev/kingsguard>

Kingsguard is an ecosystem of framework-aware UI tools. Its first product,
Sentinel, is an ESLint plugin that helps developers keep UI state declarative,
starting with React.

## Before making changes

- Read AGENTS.md if present, the README, docs/architecture.md, and relevant rules
  and tests.
- Check the current branch, uncommitted changes, and the merge status of PR #1.
  The initial scaffold is on feat/sentinel-scaffold. Avoid recreating existing
  functionality.
- Understand the existing implementation before modifying it.

## Development principles

- Keep the implementation small and focused. Use the existing pnpm, TypeScript,
  ESLint, and Vitest tooling.
- Recognize framework ownership and lexical scope. Do not rely solely on variable
  names or broadly prohibit DOM APIs.
- Minimize false positives. Preserve legitimate imperative operations such as
  focus, scrolling, and measurements.
- Keep React recognition logic in the adapter and diagnostic logic in rules.
- Angular, Vue, and axe-core are future extensions. Do not add placeholder packages
  or large abstractions unless the current task requires them.
- Do not introduce automatic fixes that could change behavior unless their safety
  can be demonstrated.
- Preserve existing user changes and avoid unrelated refactoring.

## Completion requirements

- When adding or changing a rule, include valid cases, invalid cases, and tests
  covering potential false positives.
- Update relevant documentation and explain detection boundaries and limitations.
- Run pnpm check and resolve issues introduced by your changes.
- Unless explicitly instructed otherwise, commit completed changes on a task
  branch, push the branch, and create a pull request (or update the existing pull
  request for that task). Include a summary, validation results, and known
  limitations in the pull request description, and report its URL to the user.
- Report what changed, validation results, and known limitations.
- Do not publish npm packages or merge pull requests unless explicitly requested.
