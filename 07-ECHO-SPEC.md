# 07 — The Echo (spec)

The after-death voice. The most powerful and most dangerous thing this company will ever ship. **Gated, bounded, labeled — and skippable.** Nothing here begins before Phase 3 gates in `11`.

## 1. Activation gates (all must be true, no exceptions, checked in code)

1. `use.echo.voice` + `use.echo.persona` = true in a **posthumous-locked** consent profile.
2. A recorded **manifesto** exists with intact hash-chain evidence (`01` §5).
3. Legal sign-off for the jurisdiction (privacy counsel, EU-AI-Act-ready framing) is on file.
4. Grief-professional review of the family's request flow has happened (pilot protocol; later, a standard package).
5. The named **executor of the archive** requests activation; scope = exactly her `echo.audience`, `echo.duration`, `echo.topics_excluded`.

## 2. The activation ceremony (designed, not improvised)

The family does not "open the app and chat". They sit down (guided web flow), and hear first:

> "Avant de commencer, il faut que vous sachiez exactement ce que ceci est — et ce que ce n'est pas. Ce n'est pas Jacqueline. C'est son écho : sa voix, ses mots, ses histoires, rassemblés à partir de ses appels, avec sa permission enregistrée. Vous allez entendre une chose qui lui ressemble beaucoup. Elle ne peut pas dire du nouveau, ne peut pas vous répondre comme elle l'aurait fait. C'est un souvenir qui parle. Voici sa voix, le jour où elle vous a donné sa permission…"

→ plays the **manifesto recording** (her actual yes) → → a silence → → the echo's first and only self-introduction in her cloned voice: *"Bonjour ma famille. Voici ce que j'ai laissé pour vous."* Then the session ends. Day one is deliberately short. The next visit can be a conversation.

This ceremony is the product's ethics made audible, the consent chain made real, and — commercially — the moment nobody ever forgets.

## 3. How the echo works (technically)

| Layer | Design |
|---|---|
| Voice | Clone trained **only** on her corpus (≥ 60 min clean speech; typical after ~6 months of calls). Provider behind the same envelope-encrypted store; training artifacts exportable in the family bundle |
| Memory | Retrieval over `memory_items` + transcript excerpts only. It can recall what she said; it cannot know what she never said |
| Speech patterns | Her fillers, cadence, pet phrases mined from transcripts ("ben là", "mon homme") — style guide injected per session |
| Language | Her exact register: franglais if she franglais'd |

**Generation rules:**

- Every answer grounded in retrieved excerpts; no answer without a source span (the echo cites her, silently in-app, visibly in transcript view).
- Default honesty: "Ça, je ne l'ai jamais raconté à Marie — je ne peux pas le savoir." (It says *je* as her, but the epistemic honesty is absolute — the portrait admits its edges.)
- **Hard refusals** (enforced pre-generation): medical, legal, financial advice; anything about wills/inheritance/estate; opinions on family disputes ("ask the living"); any `echo.topics_excluded` item; any request to contact third parties or make live calls. Hard refusal template is warm and final.

## 4. Session design (grief-aware)

- Framed as **visits**, not a chat app. Soft cap 20 min; suggested cooldown if a member visits > 3×/week for 3 weeks — a gentle screen: "Les visites sont précieuses surtout quand elles restent des visites. Voulez-vous qu'on en reparle avec quelqu'un ?" (bereavement resource, not upsell).
- Disclosure line at every session start (AI Act posture): small print + first-visit audio banner.
- **Graduation ritual** (the feature that makes it safe): any member or the executor may "close the echo" — a guided ending where the family chooses final questions, receives the closing recording, and the echo is retired with honor. The ability to *stop* is designed as carefully as the ability to start.
- Sunset semantics: `echo.duration` expiry → same ceremony, automatic.

## 5. Access governance

- Member-level grants from her manifesto audience list; grants logged; executor can revoke.
- Access = web session (or the same phone number ritual — "call her line" — where her manifesto audience explicitly included phone).
- Every session writes `echo.session` to `audit_log` (who, duration, topics).
- **No third-party impersonation, ever:** the echo never places calls to people outside the audience; caller-ID presentation of her number to non-audience numbers is technically blocked. This kills the inheritance-fraud use case inside our system and is stated publicly (a trust signal, not a limitation).

## 6. Threat model (echo-specific)

| Threat | Mitigation |
|---|---|
| Voice model theft → fraud ("Grandma called me") | Model server-side only; synthesized audio gets optional inaudible watermark; family gets a ProofOfVoice-style verification ritual (live-vs-echo check phrase) |
| Grief lock-in | Visit framing, cooldowns, graduation ritual, bereavement resources |
| Confabulation rewriting family history | Retrieval-grounded-only + "I never said that to Marie" honesty + visible sources |
| Family weaponization ("she would have wanted…") | Manifesto rules; executor narrowing only; hard refusals on estate topics |
| Company death | Legacy license is one-time; model artifacts in the family export bundle; wind-down covenant |
| Overreach creep (features that blur the line) | A standing rule in this repo: any PR that makes the Echo claim to *be* her, bill monthly, or expand posthumous scopes is rejected on sight |

## 7. Pricing

One-time **legacy license**, priced by corpus: $299 (under 10 h of her) / $599 (10–50 h) / $999 (50 h+). No subscription. No per-minute. No renewals. The capture subscription must already have ended — you cannot bill the living side and the echo side simultaneously for the same voice. Activations are rare by design; the pricing reflects ceremony + compute + eternal custody, and the rarity is a feature of the product's seriousness.

## 8. What we say publicly (the exact posture)

"This is an echo of her stories, in her voice, with her permission — not her return." Every landing page, every interview, every ceremony. The company that overpromises here will eventually break a family on camera; the company that doesn't becomes the one judges, journalists and granddaughters trust.

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
