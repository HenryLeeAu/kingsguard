# Changesets

Changesets records user-facing package changes and prepares versions and
changelogs. It does not publish anything when you add a changeset or prepare versions.
Use the repository-local CLI after `pnpm install`; no global installation is needed.
Changesets 3 supports Node 22.11+, 24, and 26+; use this project's CI versions
(Node 22.13+ within 22.x, or Node 24) with pnpm 10.12.1 for contributor tooling. The locked CLI dependencies require at least Node 22.13;
this tooling requirement does not change the published plugin runtime requirement.

## Record a package change

For a change users receive in `@kingsguard/eslint-plugin-sentinel-react`, run:

```sh
pnpm changeset
```

Select the React package, choose the release type, and describe the change from a
user's perspective. Commit the generated `.changeset/*.md` file with the PR.
A focused bug fix without broader diagnostics can use a patch changeset. Changes
to reported cases, default rules, permissions, or supported versions need release
policy review before choosing a bump; do not infer the release type from the size
of the diff. Repository-only documentation, tests, and internal tooling changes
can omit a changeset when they do not affect the shipped package. There is no
blanket requirement for every PR to include one.

## Inspect pending changes

```sh
pnpm changeset:status
```

This reports pending package releases without changing versions. Configuration
uses `main` as the comparison branch. Keep your local `main` current when using
comparison commands, or pass `--since=origin/main` after fetching the remote.
The private root is not released. Framework packages are versioned independently;
there are no fixed or linked release groups and no ignored publishable packages.

## Prepare versions and changelogs

On a dedicated release-preparation branch, after reviewing the pending changes:

```sh
pnpm changeset:version
```

This consumes changeset files, updates package versions and changelogs, and may
update dependency ranges. Review the diff, refresh the pnpm lockfile if needed,
and run `pnpm check`. Changesets does not automatically commit these changes.

The first beta needs a separate release-preparation step: the exact beta version
and prerelease setup must be agreed before running version preparation. An ordinary
`changeset:version` command does not automatically create a beta.

Sentinel also declares `plugin.meta.version` in
`packages/sentinel-react/src/index.ts`. Changesets does not update that value;
release preparation must synchronize it with the package version and verify both
before building the release artifact.

The configuration records public-package intent, but this setup adds no publish
script or workflow and grants no release authorization. npm publication remains a
separate, explicitly approved step after package validation.
