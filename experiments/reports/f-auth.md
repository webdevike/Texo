# Slice F: auth + workspace scoping

Branch `eva/w1-f-auth`, worktree `work/texo-w1-f-auth`. Ports 4335 (host) / 4235 (vite).

## What landed

Auth is real, through the frozen contracts, with the Store as the only persistence.

- `experiments/contracts-spike/adapters/auth-cookie.ts`: `createCookieAuth(store, { secret?, ttl? })` implements `AuthProvider`.
  Users, workspaces, memberships and sessions are system entities (`_user`, `_workspace`, `_membership`, `_session`) written through
  `store.scoped({ workspaceId: "_auth" })`, so auth rows are partitioned away from every app workspace and the adapters never learn about auth.
  Passwords via `Bun.password.hash/verify`. Cookie `texo_session=<sessionId>.<hmac-sha256>` (HttpOnly, SameSite=Lax), secret from
  `TEXO_SESSION_SECRET` with a dev default; signature is compared with `timingSafeEqual`, expiry is enforced on read.
  `signup` creates user + workspace + owner membership. `switchWorkspace` refuses non-member workspaces (null).
  Two extras beyond the contract, used by the host: `role(session)` (owner|member) and `empty()` (first-boot seed check).
- `experiments/contracts-spike/contracts/auth.conformance.ts`: `runAuthConformance(label, () => ({ provider, store }))`, seven tests:
  signup then me; anonymous and forged cookies are null; wrong password / unknown email reject and right password logs in;
  duplicate email refused; logout invalidates; switch to non-member or unknown workspace returns null and the original session survives;
  two users in two workspaces cannot list, get or update each other's rows through `store.scoped(scopeOf(session))`.
- `experiments/contracts-spike/adapters/auth-cookie.test.ts`: conformance against sqlite AND memory stores, plus cookie specifics
  (foreign secret rejected, expired session rejected, users live only in the `_auth` scope, role resolves to owner).
- `experiments/contracts-spike/app/server.ts`: `POST /api/_auth/signup|login|logout|switch`, `GET /api/_auth/me`.
  `storeHandler(scopedStore)` resolves the session per request and serves `store.scoped({ ...scopeOf(session), actorId })`;
  `actorId` is the client's `x-texo-origin` header when sent (SSE echo-drop, agreed with W1Realtime) else the user id.
  Anonymous data calls and `/api/_events` get 401. `_texo/manifest` stays public. `_texo/specs` PUT/DELETE require role owner (403 otherwise).
  `_texo/settings/*` read/write through the scoped store, so the theme is per workspace. First boot with no users seeds
  `demo@texo.dev / demo1234` in workspace `Demo` and logs it. `AuthError` and Zod errors map to 401/403/422 JSON.
  The `for (entity of registry.all()) migrate` loop is now a single `migrateAll(registry, store)` call site (W1Relations replaces the body).
  Port from `TEXO_PORT` (default 4321).
- `experiments/contracts-spike/host/settings.ts`: unchanged API; comment states the per-workspace contract (caller passes the scoped store).
- `src/admin/client.ts`: every fetch sends `credentials: "include"`; exports `ok` (throws `HostError` with status) and `json()` init helper.
- `src/admin/auth-client.ts`: `authClient: AuthClient` over fetch against `/api/_auth/*`.
- `src/admin/auth-gate.tsx`: `AuthGate` resolves `me()` once, renders a centered bordered card (login / signup toggle, `Base*` only,
  no side stripes) until a session exists, then provides it. `useSession()` -> `{ session, logout, switchWorkspace }`.
  `WorkspaceSwitcher` = small `BaseSelect` over `session.workspaces` (member workspaces only) plus a sign-out icon.
- `src/main.tsx`: `AuthGate -> Themed -> TexoThemeProvider -> BrowserRouter -> App`. The theme setting loads AFTER the session, and
  the theme provider + `App` are keyed by `session.workspace.id`, so a workspace switch reloads theme and manifest.
- `src/app/app.tsx`: `WorkspaceSwitcher` as first child of the actions row (2 lines). Also one bug fix I hit while verifying:
  the component gallery renders every `Base*` alias with a text child, and `BaseNumberInput` (added at wave1-base) crashed the whole
  shell at `/theme` with "input is a void element tag" before any of my code ran. Added a `case 'BaseNumberInput'` preview. This is why
  I did NOT add a `BasePasswordInput` alias: any new input-like alias crashes the gallery; the gate uses `BaseTextInput type="password"`.
- `vite.config.mts`: local ports 4235 / 4335 (worktree-local, per brief).

## Verified

`cd experiments/contracts-spike && bun test`: 88 pass, 0 fail (71 existing + 17 auth) across 3 files.
`tsc --noEmit -p tsconfig.app.json`: only the pre-existing errors listed in the brief; nothing new.

curl against the host on :4335: anonymous `POST /api/issue/list` 401; `GET /api/_texo/manifest` 200 without a cookie; wrong password 401;
login sets the cookie and `me` resolves; `switch` to an unknown workspace 403; after `logout`, `me` is null.

Browser on http://localhost:4235 (screenshots in `experiments/reports/f-auth/`):
1. `01-gate.webp`: fresh load shows the sign-in card.
2. `02-demo-signed-in.webp`: login `demo@texo.dev / demo1234`; app renders with the workspace select (`Demo`) and sign-out in the actions row.
3. `03-demo-issue.webp`: created "Demo issue from auth slice" through the admin modal; `POST /api/issue/list` as demo returns total 1.
4. `04-demo-dark-theme.webp`: toggled demo's colour scheme; `GET /api/_texo/settings/theme` as demo now stores `colorScheme: dark`.
5. `05-two-signed-up-zero-issues.webp`: signed out (me -> null), signed up `two@texo.dev` in workspace `Two`; `issue/list` total 0,
   `settings/theme` returns the default preset, scheme light; `me.workspaces` = [Two].
6. `06-two-switcher-only-own-workspace.webp`: the switcher dropdown offers only `Two`; forcing `POST /api/_auth/switch` to Demo's id
   returns 403 "not a member of that workspace". Owner gate: Two's `PUT /api/_texo/specs` on its own workspace is allowed (422 for the
   deliberately empty spec, i.e. it passed auth and hit validation).
7. `07-two-switched-to-demo.webp`: after inserting a `member` membership for Two in Demo directly through the store, the switcher lists
   `Demo`; selecting it rebinds the session, the theme flips to demo's dark, and demo's issue appears. As a member, `PUT /api/_texo/specs`
   is 403 "only a workspace owner may change the schema".

## Open / notes for wave 2

- The frozen `Session` has no role; the host needs one for the owner gate, so `CookieAuth` exposes `role(session)` beyond `AuthProvider`.
  If wave 2 wants role in the client, the contract should grow `Session.role`.
- There is no UI to invite a user into a workspace (memberships beyond signup are store-only). Adding a member is a `_membership` row in
  scope `_auth`; see step 7 above for the exact call.
- Store adapters have no cross-scope uniqueness, so email uniqueness is enforced by the provider (list before create). Good enough for one
  host process; a real deployment wants a unique index.
- `_texo/manifest` is public per the brief. It lists entity names and the store kind; if that is too chatty later, gate it too.
- Sign-in card and switcher are functional, not styled beyond Mantine defaults + the workspace's theme.
- Gallery crash on `BaseNumberInput` was pre-existing at `wave1-base`; the preview case fix is in this branch. Any slice adding an
  input-like `Base*` alias must add a preview case in `ComponentPreview` or the whole app dies at `/theme`.
