# Choosy

## Purpose

We are building `choosy` -- a skeleton app for building out evaluation and labeling workflows that can be presented to users both internal and external to Artsy.

The first known use case will be for the Comp Retrieval (Valuation) project, which well help us tune a model that gives price guidance to sellers of artworks.

- a frontend to allow users to label training data and store user-submitted data in a TBD backend
- functionality to label given target lots against pre-retrieved lots, based on a canned dataset
- later allow free-field input for new artwork evaluation
- internal users initally, external users eventually

## Project management

Work is tracked on the GitHub Project board, not in a markdown checklist:
**[Choosy: Tasks & Wishlist](https://github.com/users/anandaroop/projects/8)**
(`gh project ... --owner anandaroop` with project number `8`).

- Epics are repo **Milestones**, numbered `00`–`06`, plus `99 Wishlist` as the
  catch-all — not sub-issues. Epic discussion happens in an agent session,
  not as GitHub issue comments, so a milestone's title/description is enough;
  it doesn't need its own discussable issue. Every ticket's `Milestone` field
  is set to exactly one of these, and the board groups/swimlanes by
  `Milestone`.
- Status flow: `Todo` → `In Progress` (before the first commit) →
  `In review` (PR opened, linked via `Closes #NN`) → `Done` (PR merged).
- The `chore` label marks work an agent cannot do (credentials, external
  service setup) — these go to the developer, not into a PR.
- Implementation follows the design doc's phase sequencing, shipped as one
  stacked PR per milestone via `/gh-stack`: 00 → 01 → 02 → 03 → 04 → 05 → 06,
  with 01/02 parallelizable. Each PR closes all tickets in its milestone.
- Discovering new work mid-task → a new issue in `99 Wishlist` or the
  relevant milestone, not a code comment or a silent fix elsewhere.
- Note: `gh issue edit <n> --milestone <value>` requires the milestone
  **title**, not its number — passing a bare number silently fails with
  `'<n>' not found` on this `gh` version.

Begin every session by scanning the milestones, determining which one is current, and reading the tickets in that milestone.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
