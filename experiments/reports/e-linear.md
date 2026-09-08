# E: Linear-lite on Texo (one-shot) — FAILED, cancelled at 72m50s

Same prompt and acceptance list as K (`experiments/LINEAR-LITE.md`). Start 02:24:17Z, cancelled
03:37:04Z by the orchestrator. Branch `eva/w2-e-linear`, one commit (`012e414`): team/label specs,
project/issue extended, `scripts/seed-linear.ts`, seed test adjusted. 258 insertions. No extension,
no board, no routes, nothing browser-verified. 0 of 7 acceptance items.

## Call mix (from the transcript)

| | E (on Texo) | K (from scratch) |
|---|---|---|
| read/grep/glob calls | 79 | (started writing at call 3) |
| write/edit calls | 3 | many |
| bash/eval | 13 | |
| first commit at | ~60 min | minutes |
| wall-clock | 72m50s, cancelled | 22m22s, complete |
| acceptance | 0/7 | 6/6 applicable |

## Verdict

The contracts did not fail (P7 and P9 blind probes passed against the same surface). The
discovery surface failed: E was told to reuse ~20 wave-1 primitives and had no way to learn
their APIs except by opening each source file, several at multiple line ranges, then the
reports, then the adapters and the conformance suite for edge semantics it did not need for a
kanban. Reuse only beats rebuild when learning the reusable thing is cheaper than writing it;
today Texo's primitives are cheap to write and expensive to learn.

## Implication (ledger P12)

"One-shot on Texo" needs a generated API index: every `@texo/ui` export and every hook, with
props and one usage line, injected into the agent's context so discovery is one read instead of
eighty. Re-run E with that index before drawing a wall-clock conclusion about the framework.
