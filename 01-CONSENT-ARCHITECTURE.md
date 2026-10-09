# 01 — Consent Architecture

> The founder's rule: **100% consent and approval from the person in question, always.** This file turns that sentence into machinery.

## 1. Principles

1. **She is the data subject and the primary rights-holder.** Not the paying family member. Money buys the service; her voice owns the voice.
2. **Consent is captured while she is alive and lucid.** The family can never grant the Echo after the fact. No manifesto, no echo.
3. **Consent is granular.** "Voice archive: yes. Family podcast: yes. Book: yes. Echo: yes, but only my children, only 10 years." All of that is one consent profile.
4. **Consent is revocable and re-asked.** She can change her mind on any call, and once a year we ask again, gently.
5. **Consent is enforced in code**, at artifact generation AND at delivery — not just stored in a database row someone could forget to check.

## 2. The three consent subjects

| Subject | What they consent to |
|---|---|
| **The elder (her)** | Being called, being recorded, the uses of the recording, the Echo and its scopes |
| **Family members** | Hearing the recordings; receiving the podcast; their own access scope |
| **Third parties mentioned** | Her stories name other people. We cannot consent for them — so transcripts keep, by default, first names only in any *shared/published* artifact (the book), and full raw access stays inside the family circle she named. |

## 3. The Consent Scopes matrix

A consent profile is a set of named scopes. Each artifact generator and each delivery endpoint is mapped to required scopes — enforced by a single `require_scopes()` gate in code.

| Scope key | Controls | Default |
|---|---|---|
| `capture.call` | The weekly call itself may happen | on |
| `capture.record` | The call is recorded | on (announced every call) |
| `use.family_feed` | Family members can listen to episodes/transcripts | on |
| `use.family_raw` | Family can download full raw recordings (vs. edited episodes) | on |
| `use.book` | Her words may appear in the printed book | on |
| `use.book_names` | Full names of other people may appear in the book | off (first names) |
| `use.echo.voice` | Her voice may be cloned for the Echo | **off** |
| `use.echo.persona` | Her speech patterns/memories may drive an Echo | **off** |
| `echo.audience` | Who may speak with the Echo (list of member roles/ids) | empty |
| `echo.duration` | Echo retention (years, or "until family closes it") | — |
| `echo.topics_excluded` | Topics the Echo must refuse (free list, e.g. "health, the lawsuit") | empty |
| `export.third_party` | Any sharing beyond the named family (research, media) | **off, always** |

## 4. The Manifesto Call

Onboarding, after 2–3 normal story calls have built comfort, the caller says (French-first version drafted in `03`):

> "Jacqueline, may I ask you something a little serious today? … Some families like the idea that one day, far away, their children could hear a computer imitate Mama's voice telling her stories — like an echo of her. It would only ever happen if YOU say yes, today, while you're here. You can say no, and nothing changes — the calls, the podcast, the book, all stay exactly the same. You can also change your mind any week. So: would you like your family to have that echo one day, yes or no?"

The answer (voice, plus DTMF confirmation `press 1`) is recorded, hashed, timestamped, and stored as the **manifesto record**. If yes: the follow-up asks audience ("only your children? grandchildren too?") and any limits she volunteers. The whole manifesto is itself the first artifact in the Echo's audit trail — and, honestly, usually the most moving recording in the archive.

**Baseline capacity note:** onboarding also records a short "capacity baseline" (date, orientation questions she already answered naturally). If lucidity later declines, the *existing* consent stands (it was given when she was sharp), but no *new or expanded* scopes may be granted. Consent can shrink; it cannot grow, if capacity is in doubt.

## 5. Consent state machine

```
                    ┌────────────┐
   onboarding ───▶  │ not_set    │
                    └─────┬──────┘
              informed + recorded
                    ┌─────▼──────┐
   ┌──────────────▶│  active    │──────────────┐
   │  (renew ok)   └─────┬──────┘              │
   │          amend scope │                revoke │
   │            ┌─────────▼────────┐        │
   └────────────┤  amended (vN)    │        │
                └─────────┬────────┘        │
                     annual renewal      ┌──▼─────────┐
                          ok            │  revoked   │
                ┌───────────────────┐   └────────────┘
                │ renewed (vN+1)    │        │
                └───────────────────┘        ▼
                                    confirmed_revoked_final
                                              │
                                    elder passes away
                                              ▼
                                   ┌────────────────────┐
                                   │ posthumous_locked  │  scopes frozen forever
                                   └────────────────────┘  enforcement = manifesto
```

- **Amend:** any call, via the preferences ritual ("Would you like to change anything about what we're allowed to do?").
- **Renew:** once a year, one question, no pressure, default = keep as-is.
- **Revoke while alive:** immediate effect; Echo entitlement is destroyed; capture stops if that scope is revoked.
- **Posthumous locked:** nothing expands after death. Only the executor may *narrow* or close.

## 6. Family governance (after death)

- The **elder named an account owner** (usually the paying daughter) — while she lives, she outranks everyone.
- After: the manifesto scopes + a named **executor of the archive** govern. The executor may narrow, never expand.
- Disputes: majority of named members can narrow; nobody can expand. Court orders trump, and we comply through the legal process, logged.
- Deletion: the executor can close the whole archive → crypto-shredded (see `05`, `08`).

## 7. Enforcement points (where the code checks)

| Point | Check |
|---|---|
| Call placed | `capture.call` active for elder |
| Recording started | `capture.record` + in-call announcement present in recording |
| Episode published | `use.family_feed` + episode audience ⊆ consented audience |
| Raw download | `use.family_raw` for that member |
| Book generation | `use.book`; names scrubbed unless `use.book_names` |
| Echo training | `use.echo.voice` + `use.echo.persona`, manifesto present, hash-chained evidence intact |
| Echo session | requester ∈ `echo.audience`; topic ∉ `echo.topics_excluded`; disclosure line played |
| Export/API | `export.third_party` is off unless she explicitly consented (it ships off and no UI exists to turn it on) |

Every check writes to `audit_log` (append-only, hash-chained — see `04`).

## 8. Edge cases

| Case | Resolution |
|---|---|
| She dies with no manifesto | Capture archive → family (export + book rights stand, they were consented). No Echo. Ever. |
| Dementia progresses mid-service | Capture may continue **only** with family assent + her ongoing comfort (no distress on calls; the AI monitors this). Scopes frozen. Renewals stop. |
| She says something contradictory later ("I never said yes") | The manifesto record + audit chain answers it; we immediately offer revocation anyway. |
| Family demands the Echo; she said no | We show them her recorded "no" — kindly. That is the product working. |
| Divorce/removal of a member | Audience scopes re-evaluated; revoked members lose tokens immediately. |
| Company acquired / shuts down | Export-first architecture; families get the full archive + model artifacts (if consented) and a wind-down covenant. The grandmothers don't die with the company. |

## 9. Legal touchpoints (counsel review gates — not legal advice)

- **Québec Law 25 / PIPEDA:** consent, access, rectification, portability, deletion → all are first-class features here; map in `08`.
- **Call recording law:** Canada is federally one-party, Québec prudence says announce. We announce recording **in the greeting of every call** regardless — cheap, honest, protective.
- **EU AI Act (for later expansion):** AI interaction transparency + synthetic-voice labeling → the Echo's disclosure lines in `07` are designed to satisfy this posture.
- **Counsel gate:** the Echo does not launch in any jurisdiction until a privacy lawyer signs off on the manifesto model. Budgeted in `11`.

## 10. The beautiful part

Recorded consent is not paperwork — it is her voice saying "yes, my children may keep me." Families will replay the manifesto recording more than anything else we ever capture. The compliance feature is the product's emotional core. Build it like it matters, because it is both.

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
