# 02 — Telephony & Call Engine

Goal: place a warm, reliable, scheduled phone call to an elder on the existing Asterisk infrastructure, record it cleanly, and hand the audio + events to the pipeline. She uses a plain phone. We do everything else.

## 1. What we reuse (already in production on this server)

| Existing asset | Reuse |
|---|---|
| Asterisk + FreePBX (`pbx.example.com`, port 5038 AMI up) | SIP registration, outbound dialing, MixMonitor recording, codec negotiation |
| Existing DIDs / SIP trunk | Outbound caller ID; dedicated DID for StoryLine if families should see a distinct number |
| `ai_engine` + `local_ai_server` containers (VoIPClaw voice stack) | Candidate ASR/TTS/LLM services for the conversation brain — confirm interfaces in Phase 0 |
| PostgreSQL 18 | New `storyline` database, dedicated role (no shared credentials) |
| Nginx + certbot | `storyline.example.com` TLS termination → API |
| PM2 / Docker | Process supervision for the new `storyline-callerd` service |

> **Phase 0 task:** locate/confirm the compose project behind `ai_engine`/`local_ai_server`/`admin_ui` (images `asterisk-ai-voice-agent-*`) and document its API surface. If interfaces don't fit, the conversation engine runs standalone against Whisper + an LLM API + ElevenLabs (see `03`).

## 2. Architecture

```
 scheduler (storyline-api, Postgres-backed cron)
        │ inserts call_jobs
        ▼
 storyline-callerd (Node/TS daemon)  ── ARI/AMI ──▶  Asterisk
        │                                              │
        │  originate call to elder                     │ SIP trunk
        ▼                                              ▼
 media bridge:  elder ◇◆ [ASR ⇄ brain ⇄ TTS]      her phone rings
        │
        ├── MixMonitor → /srv/storyline/raw/<call_id>.opus
        └── event stream → Postgres (call_events)
```

- **ARI over raw dialplan** is the choice: the conversation loop needs dynamic media control (streaming audio both ways, barge-in, early media). A small internal dialplan context hands the channel to the ARI app (`Stasis(storyline)`).
- `storyline-callerd` is a single Node daemon: ARI websocket client + job poller + state machine. PM2-managed, or containerized alongside the others.

## 3. Call lifecycle state machine

```
 scheduled ─▶ dialing ─▶ ringing ─▶ answered ─▶ in_conversation ─▶ winding_down ─▶ ended ─▶ processing ─▶ archived
                 │          │            │
                 │          └▶ no_answer ──▶ retry (see §5) ─▶ missed_final
                 └▶ failed (congestion/bad number) ─▶ ops_alert
 answered branches:
   ├─ answering machine detected (AMD) ─▶ leave_short_message ─▶ ended
   ├─ someone else picks up (voiceprint/confirmation mismatch) ─▶ confirm_identity (DTMF pin) ─▶ wrong_person ─▶ ended politely
   └─ she asks to stop / reschedule ─▶ honor immediately ─▶ rescheduled
```

In-conversation sub-states are owned by the brain (`03`): `greeting → consent_announce → story_loop → wind_down`.

## 4. Scheduling model

| Field | Values | Notes |
|---|---|---|
| `preferred_window` | e.g. Tue 15:00–17:00 | She picks; default mid-afternoon (loneliness peak, no meal risk) |
| `timezone` | America/Toronto | Per elder |
| `cadence` | weekly (default) / biweekly / twice-weekly | Daily is allowed only as short "sunsetting" mode, see `07` |
| `jitter` | ±10 minutes | A call at exactly 15:00:00 every week feels like a dentist; 15:07 feels like a friend |
| `quiet hours` | never before 09:00, after 20:00 local | Hard rule |
| `blackout dates` | family-set (hospital stays, etc.) | |
| `seasonal` | snowbirds: number + timezone swap with date ranges | Québec classic |

Retry policy: no-answer → retry +1 day, then +3 days, then pause and notify family after 2 consecutive `missed_final` weeks (this is care signal #1 — and a **notification**, not an alarm; we are not a medical service).

## 5. Call flow detail

1. **Originate** from StoryLine DID (CNAM like `STORYLINE` or a family-chosen label such as `APPEL DE SUZANNE` where the carrier supports it).
2. **Answer detection** → play greeting in her language: FR: *"Bonjour Jacqueline ! C'est encore moi. Avant qu'on commence, je vous rappelle que notre conversation est enregistrée pour vos proches. On commence ?"* (recording announcement = every call, per `01` §9.)
3. **Identity check (first 2 calls or after number change):** "Is this Jacqueline?" + optional family-set PIN if the household has multiple elders.
4. **Conversation** (the brain, `03`). MixMonitor records from the first ring-answered second.
5. **Wind-down ritual:** the brain closes warmly and confirms next week. Never end mid-story; hard cap 45 min with two gentle warnings ("we don't want to keep you — same time next week?").
6. **Post-call:** recording checksummed and moved to ingest; events persisted; family notified ("This week's call with Jacqueline: 32 minutes — she told the tomato story again ❤️" — tone per family settings).

## 6. Answering-machine & edge handling

- AMD → leave a 12-second message: who we are, that we'll try again Thursday, and the family's number if she wants to talk now. No content left on machines (privacy: voicemail isn't hers alone).
- Busy/declined → retry per §5.
- She sounds rushed/annoyed → the brain offers "five-minute version" or reschedule; scheduler learns `short_call_ok`.
- **Robocall-block anxiety:** first calls often land as "Spam Likely" on mobiles. Mitigations: dedicated DID with proper STIR/SHAKEN from the carrier, warm-up period (low-volume, consistent pattern), families told to have her save the number ("add us to contacts, Mamie") — an onboarding card ships for exactly this.

## 7. Recording capture

- `MixMonitor(filename, b(bridged-only))`, **Opus 24kbps mono 16 kHz** (voice quality, tiny files: ~45 min ≈ 20 MB).
- Recorded locally under `/srv/storyline/raw/`, chmod 600, owned by the storyline service user; ingest worker picks up within minutes, encrypts, and the raw plaintext copy is shredded (see `05`).
- A sidecar JSON of DTMF events, transfers, and hangup cause codes accompanies each file.

## 8. Safety boundaries (say them out loud in the docs, enforce in code)

- **We are not an emergency service.** The greeting and the website say so. The brain never promises help; distress protocol is defined in `03` §8 and is care + optional family flag, never 911.
- **Outbound only to verified elder numbers** — no arbitrary dialing, ever. Rate caps per number per day (≤ 3 attempts). No inbound cold routing; inbound calls to the DID play "StoryLine — pour joindre votre famille…" and route nowhere (Phase 2: inbound "call me now" from her — nice feature, later).
- **No outbound sales or third-party content on the call. Ever.** The call is hers.

## 9. Quality targets

| Metric | Target |
|---|---|
| Post-dial delay to first audio | < 1.5 s |
| Turn-taking gap (she stops → our voice starts) | < 1.2 s (p95) — see `03` §6 |
| Call setup success | > 99% |
| Audio: no echo/robot voice on her side | g.722/opus end-to-end where trunk allows; jitterbuffer on |
| Recording integrity | checksum at capture, verified at ingest, 100% match |

## 10. Test harness (Phase 0)

- A second Asterisk extension + SIP softphone scripted as "fake Jacqueline" for nightly call robot tests: answers, speaks prerecorded phrases (whisper-transcribed to score the brain's turn-taking).
- Replay suite: 20 recorded consent-greeting variants must always contain the announcement (grep the transcript, fail the build if missing) — the compliance unit test.

## 11. Open questions (resolve in Phase 0)

1. Confirm `ai_engine` container API (STT/TTS?) vs standalone Whisper + ElevenLabs.
2. Dedicated DID now or reuse VoIPClaw trunk with distinct CNAM?
3. Carrier AMD quality — or run our own AMD via the brain's first 2 seconds of audio?
4. STIR/SHAKEN attestation level available on the current trunk.

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
