# Linear-lite: the one-shot test app

The SAME prompt and acceptance list are given to two agents: E (on Texo, in a worktree of this
repo) and K (from scratch, empty directory, any stack). Wall-clock, turns, and agent-written LOC
are recorded for each. Neither agent sees the other.

## Prompt (verbatim to both)

Build "Linear-lite": a fast issue tracker for one workspace.
Entities: team {name, key}, project {name, team, status: planned|active|done}, issue {title,
description (long), team, project?, assignee? (member), status: backlog|todo|in_progress|done|
canceled, priority: 0..4, estimate? (number), due? (date), labels? (many-relation to label),
checklist? (repeatable group {text, done})}, member {name, email}, label {name, color}.
Views: issues LIST (sortable columns, filters on status/priority/assignee/project/label, search,
virtualized for 10k rows), issues BOARD (kanban by status, drag between columns updates status,
optimistic), issue DETAIL side panel (edit every field inline), project page (its issues).
Keybindings: `c` new issue, `/` focus search, `mod+k` command palette with every action, `j/k`
move selection, `enter` open, `esc` close, `1..5` set priority on selected, `s` then a letter
sets status, `a` assign, `g i` issues, `g b` board, `g p` projects, `?` help listing all keys.
Realtime: two browser tabs stay in sync (create/move/edit) without reload, optimistic updates
with rollback on server rejection.
Auth: login, signup, workspace scoping (a second user in a second workspace sees nothing).
Seed: 3 teams, 6 projects, 8 members, 10 labels, 10,000 issues.

## Acceptance (checked by the orchestrator in a browser; each item pass/fail)

1. Login gate, seeded user works, second-workspace user sees 0 issues.
2. Issues list renders 10k seeded rows, scrolls smoothly (10 wheel events under 16ms avg frame), sorts by priority, filters by status in [todo,done] with a correct total, search narrows.
3. Board shows 5 status columns with counts; dragging a card to another column changes its status (persisted after reload); a rejected update (server returns 422 for an invalid patch) rolls the card back.
4. Detail panel edits title, status, priority, assignee (searchable), labels (multi), due, checklist (add/toggle/remove) inline; changes persist.
5. Keybindings: `c` opens new issue; `mod+k` palette lists >= 15 commands, fuzzy search, Enter runs; `j/k` + `enter` opens detail; `1..5` sets priority on the selected row; `g b` switches to board; `?` shows help.
6. Realtime: two tabs; creating in A appears in B within 1s; moving a card in B updates A.
7. Theme: (Texo only) the theme configurator's sidebar/table settings visibly affect the app; (from scratch) N/A, recorded as not applicable.

## Measurement table (filled by the orchestrator)

| | On Texo (E) | From scratch (K) |
|---|---|---|
| Wall-clock to first browser-verified run | | |
| Agent turns | | |
| Agent-written LOC (excluding deps) | | |
| Acceptance items passed / 7 | | |
| Notes | | |
