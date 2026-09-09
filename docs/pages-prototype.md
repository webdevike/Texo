# Pages workspace and Prototype requests

Route: `/pages/:pageId` (currently `customers`). Layout follows the wireframe: icon rail,
sidebar, page tabs in the top row, a toolbar with **Prototype** on the right, and the real
page rendered inset below.

## Prototype mode
- **Off**: the page runs as built (row click opens the details drawer).
- **On**: the page is inert. Hovering highlights the nearest `data-target` element and
  names it; clicking opens a floating composer anchored to that spot. Saving adds a pin and a
  row in the **Requests** rail panel.
- A request records intent only. Nothing wires the described interaction up.

## Targets
Pages mark elements with `data-target="key"` and `data-target-label="Label"`. Nested keys
join with dots (`page.content.table.row`). Repeated elements add `data-record` and
`data-record-label`; `data-record-template` (table rows) makes the composer default to
"every record" instead of "only this one".

## Persistence
`project/prototype.json`, served by `tools/project-files.ts` alongside `project/canvas.json`.
Explicit **Save requests**; external edits while dirty surface as a conflict with a
**Reload requests** button. Requests whose record is not rendered (filtered out) are listed
as "Not on screen with the current filters." rather than dropped.
