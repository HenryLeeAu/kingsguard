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

## Parallel slice development

- Before implementation, give each slice a specification with scope, exclusions,
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
- The coordinator supplies task and context snapshots to workers and collects
  their findings, progress, and validation. Keep coordination records separate
  from concurrent source edits.
- Workers stay within their slice, run its checks, and return commit/branch or PR
  references, validation results, and known limitations. Send newly discovered
  work or blockers to the coordinator rather than silently expanding scope.
- The coordinator integrates overlapping changes one at a time into a task or
  integration branch, preserving earlier slices' behavior and tests. Resolve
  conflicts deliberately and run `pnpm check` after each integrated slice before
  proceeding. Independent branch checks do not validate the combined result.
  This does not authorize merging GitHub PRs or publishing packages.
- Record review outcomes, integration status, validation, and PR links with the task.
  Keep implementation completion separate from integration/merge status; if
  integration remains outstanding, track it explicitly rather than implying
  that closing a slice means it has landed.

## TypeSafe specification checks

- Use the `typesafe-ai` skill to cross-check semantic claims, conditional
  boundaries, and acceptance-test clarity in new or materially changed slice
  specifications before their formal review. Read the relevant live docs.
  Use ordinary code for exact checks; keep this preflight focused on judgments
  that depend on meaning. If the skill, credentials, or API are unavailable,
  record the missing check and continue source-based review without claiming
  TypeSafe ran or substituting it for a required reviewer.
- Pin the specification and relevant source versions. Supply approved policies,
  confirmed decisions, draft text, and concrete scenarios, clearly separating
  facts, proposals, assumptions, and open decisions. Record the coordinating
  agent's initial judgment and assumptions separately; do not send its conclusion,
  expected labels, or other reviewers' answers to TypeSafe.
- Ask one narrow question at a time in each question definition, with explicit
  criteria and an undetermined outcome. Batch independent questions over the same
  relevant state. Distinguish whether conditions can overlap from whether rules
  conflict when they overlap. Do not silently assume missing domain facts or
  treat a request to define policy as an adopted decision.
- Inspect the full answer distribution and separate confidence, not just the
  selected label. Near-tied leading options (for example, 0.46 versus 0.44), low
  confidence, or disagreement with the agent's judgment trigger reconsideration
  of the question, context, criteria, and expected answer. Check source evidence,
  competing interpretations, and counterexamples before declaring either model
  wrong. These signals are reasons to investigate, not proof of a defect.
- Confidence describes answer concentration, not correctness or specification
  quality; high-confidence undetermined can be appropriate. Do not invent model
  reasoning or use an unvalidated confidence threshold as an approval gate.
  The coordinator investigates first and asks the user only for a specific
  unresolved product decision, without inventing policy to settle disagreement.
- Keep an already documented open decision in its existing slice. Add a verified
  small omission to that slice; create a separate design slice only when a new
  decision exceeds its scope or needs independent work. Record confirmed
  decisions and acceptance cases, and block only implementation that actually
  depends on them. Do not split tasks solely because confidence is low.
- Record inputs or reproducible references, question criteria, model version,
  answers, probabilities, confidence, and the coordinator's evidence-based
  disposition with the existing task. Keep credentials out of records. Bound
  requests, reuse unchanged results when evidence and question meaning are
  unchanged, and never rerun merely to seek a preferred answer.
- TypeSafe provides advisory evidence and does not replace the independent
  reviews below. Its output alone cannot approve policy, close a task, release a
  review gate, authorize implementation, merge a PR, or publish a package.

## Independent slice review

- Before dispatching reviewers, present the review scope, exclusions, acceptance
  criteria, and required validation evidence to the user. Wait for the user to
  confirm these conditions before starting the review. Apply this requirement to
  both specification and implementation reviews. If the conditions change
  materially, obtain confirmation again before reviewing the changed scope.
- Each slice requires two independent reviewers at the specification gate and
  again for the completed implementation (or design deliverable). Use fresh
  contexts, separate from the implementer, with the same specification snapshot,
  repository base, and candidate commit or frozen diff. Reviewers inspect the
  relevant source, tests, documented escape hatches, and acceptance criteria.
- Collect both initial reports before sharing either reviewer's conclusions with
  the other. Reviews must identify evidence, severity, and a ready/blocked verdict;
  passing tests alone are not proof that the specification is satisfied.
- Reviewers are read-only: do not edit files or commit. Run checks
  only in an isolated review checkout when they produce files. The coordinator
  supplies snapshots and records reviewer identities, reviewed versions, reports,
  decisions, and validation with the task.
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
- Include a changeset with the PR when changes affect a published package's
  behavior, API, shipped files, or consumer compatibility. Name the affected
  package, describe the user-facing change, and choose the release type using
  the agreed release policy. Ask about unclear release semantics rather than
  guessing the version bump.
- Internal-only changes may omit a changeset; explain why in the PR. Judge the
  actual package impact, not just file extensions. Release-preparation changes
  that only consume approved changesets do not require another changeset.
- Check the available package scripts before creating the record. Use
  `pnpm release:add-change` when provided, or `pnpm exec changeset` when the
  repository-local Changesets CLI is installed. Include the generated file in
  the implementation commit. Do not change package versions or publish as part
  of recording a change, and do not rely on CI alone to catch missing records.
- Unless explicitly instructed otherwise, commit completed changes on a task
  branch, push the branch, and create a pull request (or update the existing pull
  request for that task). Include a summary, validation results, and known
  limitations in the pull request description, and report its URL to the user.
- Report what changed, validation results, and known limitations.
- Do not publish npm packages or merge pull requests unless explicitly requested.
