# 11 — Roadmap & Build Phases

The founder decides the build order — the decision menu is §4. Everything else is sequencing for once that's picked.

## Phase 0 — Foundations (week 1–2)

Infra slice of `10` §7 (domain live, user/DB/secrets, first ARI originate→record round-trip), repo scaffold (`apps/web|callerd|worker`, migrations, question-bank seed FR/EN), voice-stack reconnaissance (reuse `ai_engine`/`local_ai_server` or standalone). **Exit:** one complete manual test call that records, lands encrypted, and shows up in a DB row.

## Phase 1 — The Weekly Call MVP (weeks 3–8)

- callerd: scheduling (windows, jitter, retries), AMD, identity check, 45-min cap (`02`)
- Brain v1: persona card, context builder, question bank, follow-ups from call digests, FR-first (`03`)
- Pipeline v1: ingest + encryption; transcription local Whisper; memory_items extraction (`05`)
- Web v1: dashboard, call list, sync player, suggest-a-question (`06`)
- Consent v1: in-call recording announcement (build-tested), profile scopes, consent event chain (`01`)
- **5 pilot families + dogfood family #0; free 12 weeks; weekly Sunday review ritual**

**Exit:** ≥ 4 families completing 6+ calls, answer rate > 70%, talk-ratio > 60% elder, families asking "when's the book?"

## Phase 2 — The Product (months 3–6)

- Episodes + private podcast feed with per-member tokens
- Book builder v1 (LLM-structured manuscript, family review, names policy) + first print run before Christmas
- Manifesto call flow live (call ~4) + renewal ritual
- Billing self-serve: BTCPay store + card rail; gift-year flow
- Memory v2: threads across months, "she lights up" routing, family-tree awareness
- Bilingual polish, care-flag settings, snowbird ranges

**Exit:** 15–25 paying families, first books delivered, first organic gift purchase, churn < 20%/quarter.

## Phase 3 — The Echo, gated (months 6–12+)

- Legal sign-off (jurisdiction by jurisdiction) + grief-professional protocol design
- Voice clone pipeline (corpus-gated), retrieval-grounded generation, hard refusals, ceremony flow, graduation ritual (`07`)
- Mobile app (Capacitor) on the same API; partnerships (senior orgs, caregivers)
- 100-family capacity work (Whisper scheduling, staging hardening)

**Gates, not dates:** no Echo ships because a calendar says so — only because §7's activation gates all pass.

## 4. Decision menu — what we build FIRST (founder's call)

### Option A — Call-first (recommended)
Build `callerd` + brain + minimal recording first; family "app" is an email with an audio link for weeks 1–4.
✅ Fastest path to the emotional core and the corpus; pilot calls start in ~3 weeks; everything else hangs off real recordings. ❌ The paying daughter sees little UI at first; feedback skews technical.

### Option B — Web-first
Build the family portal against simulated calls (canned recordings).
✅ Onboarding/sales surface early; good for pre-selling with a demo. ❌ Risk of polishing a shell while the hard, differentiating part (telephony + brain) waits; the demo can't lie for long.

### Option C — Consent-first
Build the consent chain + vault encryption + export before the first real call.
✅ Maximum-privacy positioning from day one; cleanest story for cautious families. ❌ Two weeks of invisible infrastructure before anyone hears a voice; better as a parallel track than a starting point.

**Recommendation: A, with C's vault-encryption slice pulled into Phase 1 (it's §8's checklist item anyway), and B deferred to Phase 2 when there's real content to show.**

## 5. Kill / pivot criteria (dossier discipline)

| Signal | Meaning |
|---|---|
| Pilot families stop answering the weekly call by week 6 | The call isn't loved → persona/latency fix or stop |
| < 40% of pilot families would pay $15 at week 12 | Price/value mismatch → reposition before scaling |
| Nobody orders a book after seeing the manuscript | The proof artifact fails → book flow or product story wrong |
| Answer rate < 50% across healthy elders | Robocall stigma / carrier issue → fix STIR/SHAKEN, numbers, onboarding card |
| Distress protocol triggered wrongly > 1/50 calls | Brain safety bug → halt pilots, fix, re-test |

## 6. This week (concrete next actions)

1. Pick the build order (§4 menu) — founder decision.
2. Buy the domain (shortlist in `choose-a-domain-for-your-deployment`); until then `storyline.example.com` carries everything.
3. Phase 0 infra slice + repo scaffold (2 days).
4. Recruit dogfood family #0 (your own) + the first 5 pilot families from personal network — the outreach message writes itself: "I'm building the thing that calls your mother every week and keeps her stories. Can I try it with your family, free, for twelve weeks?"

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
