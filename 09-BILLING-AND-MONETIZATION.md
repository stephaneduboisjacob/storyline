# 09 — Billing & Monetization

## 1. Pricing (v1, pilot-tested before carved in stone)

| Item | Price | Notes |
|---|---|---|
| **StoryLine (capture)** | **$15/month** or $150/year | Weekly calls, private podcast, transcript library, family app, unlimited members |
| Hardcover book | $89 (incl. layout & a print) | Softcover $49, PDF $19; extra copies at cost + margin |
| Gift year | $180 | Christmas/Mother's Day packaging — "12 months of Mom's voice"; expected to be a top acquisition channel |
| Legacy license (Echo) | $299–$999 one-time | Phase 3 only; per corpus size (`07` §7) |
| Pilot families (first 10) | Free 12 weeks | In exchange: feedback, testimonials (consented), patience with rough edges |

Rationale: under a phone plan's price, over an impulse's hesitation. The daughter compares it to flowers-and-a-card frequency, not to software. The book is the emotional proof at Christmas; the subscription is the quiet engine.

## 2. Payment rails

**BTCPay (already in production, `your-btcpay-server.example`)** — crypto-native, no chargebacks, no processor deplatforming risk for the "sensitive" category, and on-brand. Pilot can run BTC-only if card rails aren't ready.

**Cards (Stripe or Stripe via a CA PSP)** — add before public launch, not for the pilot: the daughter buys where her other subscriptions live. Positioning note: the combination "card or Bitcoin" is itself a quiet differentiator for privacy-minded families.

Implementation:

- `subscriptions` + `payments` per `04`; billing worker sends renewal reminders via Mailu (never dunning emails to elders — billing talks to members only).
- BTCPay: reuse the existing store or create a dedicated StoryLine store + webhook (`invoice.settled` → `payments.status=paid`); price display in CAD with BTC amount at checkout.
- Grace policy: 2 failed weeks → pause calls with a gentle email ("her Tuesday call is paused — fix payment here"); **never a robotic voice about money on the call, ever.**
- Refunds: books yes (pre-print), subscriptions pro-rata + full export always ("you keep everything, always" — the covenant is a retention feature, not a leak).

## 3. The economics (single-server reality)

| Cost line | Monthly (25 families) | Notes |
|---|---|---|
| SIP trunk + DIDs | ~$40–80 | Reuses existing carrier relationship |
| LLM API (contexts anonymized) | ~$50–150 | ~$1–2/family at weekly cadence |
| ElevenLabs TTS | ~$50–100 | Caller lines only |
| Whisper | $0 | Local CPU |
| Print | per order | Pass-through + margin |
| Server | $0 | Already owned (marginal load small: §10 budgets) |

At 25 families: ~$600 MRR at maybe $150–250 variable cost → healthy for a founder-run pilot; the model stays >70% gross margin even with rented GPU/CPU bursts later. Unit test at 100 families informs the real number; scenario, not forecast (dossier language rule).

## 4. Growth loops (organic, warm)

1. **The book on the coffee table** — every visitor asks "what is THIS?" — engraved `storyline…` inside the cover.
2. **Gift years** — siblings give it to each other for the parents.
3. **The sample minute** — consented clip of a real grandma on the landing page (the product demos itself).
4. Care-sector partnerships (Phase 2+): CLSC-adjacent senior services, synagogues/churches/parishes, caregivers' associations — they don't buy, they refer.

## 5. What we never do

- No "premium tiers" gating her voice from parts of the family.
- No ads, no data deals, no "insights" products (`export.third_party` has no UI, `01` §3).
- No subscription for the dead (`07`), no cancellation hostage-taking (export-first).
- No price experiment on grieving families; the legacy license price is published and flat.

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
