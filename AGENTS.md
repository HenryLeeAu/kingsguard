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

## Task tracking with Beads

- Use `bd` (Beads) for development tasks and dependencies. Do not maintain a
  separate markdown TODO list.
- Run `bd prime` at the start of a session and after context compaction. On a fresh
  clone, run `bd bootstrap` first to restore the database from the configured remote.
- Run `bd dolt pull`, then `bd ready` to find work and `bd show <id>` to read its
  scope. Create an issue with a description and acceptance criteria for new work.
- Claim a task with `bd update <id> --claim` before implementation. Add real
  prerequisites with `bd dep add <issue> <depends-on>`; do not invent dependencies
  between independent tasks.
- Follow the completion requirements below. Record validation and the PR URL in
  the issue, close completed implementation tasks with `bd close <id>`, then run
  `bd dolt push` to persist task updates. Closing a task does not authorize merging
  its PR.
- Git push and `bd dolt push` are separate: push both code and task updates.
  Keep local databases out of Git. See `.beads/README.md` for setup and storage.

## Parallel slice development

- Before implementation, give each slice a Beads issue with scope, exclusions,
  acceptance tests, and real dependencies. Apply the independent review process
  below to the specifications before dispatch. Specification review does not
  approve a future design that is still a task.
- Run independent, ready slices concurrently when useful. A design investigation
  may run alongside unrelated implementation, but its dependent implementation
  must wait for the design and any required review. Shared files alone are not a
  task dependency.
- Give each implementation worker a separate Git worktree and task branch from
  a recorded base commit. Never let concurrent workers edit the same checkout.
  Supply the issue specification, worktree path, branch, and expected deliverable;
  workers must verify their directory and branch before making changes.
- The coordinating agent owns the canonical Beads database. During delegated
  work, this overrides the general per-agent Beads steps above: workers receive
  issue/context snapshots and report findings, progress, and validation to the
  coordinator instead of running `bd`, including `bd prime` or read commands.
  The coordinator serializes all `bd` operations, waits for each process to exit,
  and handles claims, dependencies, notes, closure, and remote synchronization.
  Do not create independent task databases in worker worktrees.
- Workers stay within their slice, run its checks, and return commit/branch or PR
  references, validation results, and known limitations. Send newly discovered
  work or blockers to the coordinator rather than silently expanding scope.
- The coordinator integrates overlapping changes one at a time into a task or
  integration branch, preserving earlier slices' behavior and tests. Resolve
  conflicts deliberately and run `pnpm check` after each integrated slice before
  proceeding. Independent branch checks do not validate the combined result.
  This does not authorize merging GitHub PRs or publishing packages.
- Record review outcomes, integration status, validation, and PR links in Beads.
  Keep implementation completion separate from integration/merge status; if
  integration remains outstanding, track it explicitly rather than implying
  that closing a slice means it has landed.

## Independent slice review

- Each slice requires two independent reviewers at the specification gate and
  again for the completed implementation (or design deliverable). Use fresh
  contexts, separate from the implementer, with the same specification snapshot,
  repository base, and candidate commit or frozen diff. Reviewers inspect the
  relevant source, tests, documented escape hatches, and acceptance criteria.
- Collect both initial reports before sharing either reviewer's conclusions with
  the other. Reviews must identify evidence, severity, and a ready/blocked verdict;
  passing tests alone are not proof that the specification is satisfied.
- Reviewers are read-only: do not edit files, commit, or operate Beads. Run checks
  only in an isolated review checkout when they produce files. The coordinator
  supplies snapshots and records reviewer identities, reviewed versions, reports,
  decisions, and validation in Beads.
- If the reports disagree on correctness, scope, severity, or readiness, assign a
  third, fresh-context reviewer who did not implement or perform either review.
  Give this neutral reviewer the same reviewed artifacts, the disputed claims,
  and both reports. Resolve the dispute using specification evidence and focused
  tests, not majority voting. Agreeing findings do not require a third reviewer.
- If the dispute exposes unclear product intent or an unspecified escape hatch,
  ask the user to decide that specific behavior. Keep affected work blocked while
  continuing independent work. Record the decision and update the specification
  and acceptance tests before resuming; reviewers must not invent product policy.
- After fixes, recheck the findings against the updated version and run relevant
  checks. Both original reviewers assess the changed scope and update their
  verdicts; use a neutral reviewer for remaining disagreements. Changed behavior
  or scope invalidates approval for that portion, not unrelated verified work.
- Release a review gate only when both reviewers agree there are no unresolved
  blocking findings, or the neutral review resolves the disagreement with recorded
  evidence. Required product decisions and validation must also be complete. Do
  not treat missing reviews as approvals or close a slice with unresolved blockers.
  Prior single-review results remain evidence but do not satisfy this two-reviewer
  policy on their own. Review approval does not authorize merging a PR.

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
