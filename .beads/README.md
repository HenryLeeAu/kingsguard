# Kingsguard task tracking

This project uses [Beads](https://github.com/gastownhall/beads) (`bd`) for task
tracking. The initial setup was verified with bd 1.3.0 and embedded Dolt.
No separate database server or editor plugin is required.

## Setup on a fresh clone

```sh
brew install beads
bd bootstrap
bd prime
bd ready
```

Use `bd bootstrap` to restore the existing project database. Do not reinitialize
or force-reset an existing database. Other installation methods are documented
in the [Beads installation guide](https://github.com/gastownhall/beads/blob/main/docs/getting-started/installation.md).

## Development workflow

```sh
bd dolt pull
bd ready
bd show <id>
bd update <id> --claim
```

Implement the task on a task branch, add appropriate tests and documentation,
and run `pnpm check`. Commit, push, and open a PR following `AGENTS.md`. Record
the validation result and PR link before closing the implementation task:

```sh
bd update <id> --notes "Validation result and PR URL"
bd close <id> --reason "Implemented and validated; PR ready for review"
bd dolt push
```

Task completion means implementation and validation are complete and the PR is
ready for review. It does not mean the PR has been merged.

For new work, provide a description and acceptance criteria:

```sh
bd create "Task title" --type feature --priority 2 \
  --description "Problem and intended scope" \
  --acceptance "Observable completion criteria"
bd dep add <blocked-task> <prerequisite-task>
```

Only add dependencies when one task actually requires another. Use `bd prime`
for command guidance. With bd 1.3.0 in embedded mode, the full `bd doctor` suite
is unavailable; use `bd doctor --check=artifacts`,
`bd doctor --check=conventions`, and `bd dolt status` for targeted diagnostics.

## Storage and synchronization

Git tracks the Beads configuration and these instructions. The task database is
stored locally under `.beads/embeddeddolt/`, which is ignored by Git. Embedded
mode allows one writer at a time; run mutating bd commands sequentially.

Task data is synchronized separately with `bd dolt push` and `bd dolt pull` to
`refs/dolt/data` on the configured repository remote. A normal `git push` does
not publish task changes. A fresh clone uses `bd bootstrap` to retrieve them.
The configured shared remote requires repository write access for task pushes;
fork contributors should arrange their own planning remote before creating tasks.

JSONL exports are optional interchange files, not the source of truth or a full
backup. No editor or Git hooks are installed by this setup; agents discover the
workflow through `AGENTS.md`.
