# 06 — Family Web App

The daughter's window into the service. Next.js 14 + TypeScript + Prisma-reader + Tailwind, mirroring the VoIPClaw portal's proven patterns (`your-portal.example`), served at `storyline.example.com`. Mobile-first — she reads episodes on the bus.

## 1. Design rules

- **Grandma test applies to the buyer too:** everything on the site says what it does in plain words. "Her calls" — not "session logs". "Her book" — not "artifact lifecycle".
- French-first UI (fr-CA default), full EN mirror; no mixed pages.
- Big targets, calm colors, serif for her quotes (the voice feels present), zero jargon, zero dark patterns — the canceller is one tap and says "her archive is yours forever, here's the export".
- Every page that plays or shows her voice carries the consent state visibly: a small "Selon ses choix" chip linking to the consent page.

## 2. Screens

| Route (app/) | What it does |
|---|---|
| `/` marketing | The one sentence, a sample (real, consented) minute of a grandma story, pricing, "10-minute setup" |
| `/login`, `/invite/<token>` | Magic links via our Mailu SMTP; invite flow for members |
| `/dashboard` | This week's call status (Tue 15:07 ✓ / next: Thu), latest episode, care flags if enabled, one suggested action |
| `/calls` | Call history list: duration, mood sketch, topics, link to transcript |
| `/call/[id]` | **The sync player:** audio + word-highlighted transcript (segments from `04`), chapters by memory item, "♥ save clip" |
| `/stories` | Memory browser: people / places / story index (memory_items), each with every mention across calls |
| `/suggest` | "Ask Mom about…" — family question suggestions with attribution + status (queued / asked this week / answered ♥) |
| `/podcast` | Private feed setup: one-tap subscribe (tokened RSS per member), honest security note, revoke/rotate tokens |
| `/book` | Book builder: year view, chapter drag-order, photo upload/text-in, review gates, order (hard/soft/PDF), print status |
| `/consent` | **Her choices:** current scopes in plain language, listen-to-the-manifesto player, renewal date, "request a change on the next call" button (change requests route into the brain's next-call agenda — she decides, on the phone, in her voice) |
| `/settings` | Elder profile (name, number, window, timezone/snowbird), caller persona name, off-limit topics, care-flag prefs, blackouts |
| `/billing` | Plan, card/BTCPay, invoices, gift a year |
| `/family` | Members, roles (owner/executor/member), revoke access |
| `/export` | The covenant: full encrypted export + passphrase tools |
| `/legacy` | (Locked until conditions met) Echo status & ceremony — see `07`; hidden entirely for families without manifesto consent |

## 3. Private podcast feed — honest design

RSS can't be truly private (URL = bearer token). So:

- Tokened feed URL **per member** (in `members.podcast_token`), rotatable on tap, revocable per person (divorce case: his token dies, hers lives).
- Episodes stream from an authenticated endpoint (token → range-serve the decrypted opus); the RSS file itself contains short-lived signed URLs (24 h), so a leaked feed file goes stale fast.
- The honest note in the UI: "Ce flux est privé comme une clé de maison — ne le partagez pas." Good enough for the threat model (casual sharing), with per-member attribution for leaks; true DRM is a lie we don't sell.

## 4. Notifications (email via Mailu, later push)

- Call done → digest ("32 min avec Jacqueline — Roland revient encore dans ses histoires ❤️").
- Missed 2 weeks → gentle family ping (the care signal, `02` §5).
- Episode published, book review needed, renewal, gift received.
- Tone: short, warm, bilingual-capable; never surveillance-flavored ("activity report" is banned vocabulary).

## 5. API surface (internal + mobile later)

REST under `/api/v1` + session auth (NextAuth credentials+magic): episodes, transcripts, memory, suggestions, consent read (never write — consent changes only via the call, by her), exports. Capacitor mobile app in Phase 3 reuses this API verbatim.

## 6. Onboarding wizard (the 10 minutes that decide retention)

1. **Her:** name, phone, language, best day/time (from her rhythms, suggested), the caller's name.
2. **Family tree sketch:** names + relations (feeds the brain's pronoun sanity: who's Suzanne vs who's Sylvie).
3. **Off-limits topics + loves** ("don't mention Émile", "she lights up about the cabane").
4. **Consent primer:** what will be asked, when (call ~4), and that nothing after happens without her yes.
5. **Pay** (card or BTC, `09`) → first call scheduled within 48 h → family gets the "she said yes to Tuesday" email.

Total: 10 minutes, one sitting, phone-call follow-up from us for pilot families ("white-glove onboarding" is part of the pilot deal).

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
