# 05 — Recording & Storage Pipeline

From the second she says "allô" to the hardcover book on the shelf. Every stage is consent-checked (`01` §7), encrypted, and audited.

## 1. Stage map

```
[A] Capture        Asterisk MixMonitor → /srv/storyline/raw/<call_id>.opus (chmod 600)
        │ within 5 min
[B] Ingest         checksum verify → loudness normalize → optional denoise → envelope-encrypt → object store
        │
[C] Transcribe     local Whisper (FR/EN + franglais) + diarization (elder vs caller) → quality gate
        │
[D] Understand     memory extraction: people/places/stories/threads → memory_items; highlights → episode candidates
        │
[E] Artifacts      episode (15–25 min best-of) · annual book manuscript · manifestos/evidence bundles
        │
[F] Deliver        family web app + private podcast feed + book print flow
```

Workers are a simple Postgres-backed job queue (`pg SKIP LOCKED`) — no Kafka on this box; one `storyline-worker` process, PM2/docker supervised, jobs idempotent and resumable.

## 2. [A] Capture rules

- Opus 24 kbps mono 16 kHz; sidecar JSON (hangup cause, DTMF, timing).
- The greeting containing the recording announcement is part of every file — the compliance self-proof.
- Raw dir on tmpfs-adjacent fast disk; **plaintext lifetime ≤ 15 minutes** — ingest encrypts, then `shred` + truncate the original.

## 3. [B] Ingest details

1. `sha256` must match the value recorded at capture (`recordings.sha256`) — else quarantine + ops alert.
2. ffmpeg: loudness normalize to −16 LUFS, gentle high-pass 80 Hz, optional `arnndn` denoise for noisy lines; keep the original as `*_orig` only until quality-checked.
3. Encrypt (§4) → `/srv/storyline/store/families/<family_id>/calls/YYYY/<call_id>.opus.crypt`.
4. `recordings` row updated (`enc_path`, bytes); audit: `ingest.ok`.

Sizing: 45 min ≈ 20 MB; a 5-year weekly archive ≈ 5 GB/family — trivial for 1 TiB; growth alarm at 80% anyway (`10`).

## 4. Encryption at rest (envelope, `crypt` primitives)

- Per-family **DEK** (X25519/secretbox), wrapped by:
  - `server` mode: master KEK from the server's key file (default), **or**
  - `family_passphrase`: the family sets a passphrase (Argon2id → KEK). Server then *cannot* decrypt without them — maximal privacy, no password-reset. Offered at onboarding as "Coffre-fort familial", default off with honest trade-off text, **or**
  - `split`: passphrase + server share (2-of-2). Recommended default for families that pick the vault option; recovery still possible with family + our share together.
- Every artifact (recordings, episodes, transcripts, book manuscripts) is encrypted as a file with the family DEK; DB stores only paths + hashes.
- **Deletion = crypto-shred**: destroy the wrapped DEK row + the wrapped key copy. Data becomes unreadable noise even from backups. (Backups hold ciphertext + wrapped keys; deletion propagation documented in runbook.)
- Uses the same primitives as the founder's `crypt` tool (X25519 + ChaCha20-Poly1305, Argon2id) — potentially a thin Rust `storyline-vault` binary reused for export bundles: families download a `.crypt` archive + the passphrase flow they already know.

## 5. [C] Transcription

- Local Whisper large-v3 (CPU, ~real-time×0.3 on this box for 45 min audio; queue overnight if bursty). No audio leaves the server by default (pillar; API mode is per-family opt-in, listed sub-processor).
- Diarization: caller audio is known exactly (we generated it) → cheap alignment trick: subtract our own TTS timeline; remaining speech = her. Pyannote only when ambiguous.
- Output: `transcripts.segments[]` word-timed for the sync player (`06`), language tag per segment (fr/en/mixed).
- Quality gate: WER estimate + duration coverage; below threshold → human queue (family can correct inline, which also trains nothing — corrections are data, not training).

## 6. [D] Memory extraction (the treasure grows)

LLM pass over each transcript (context = transcript + existing `memory_items` for the elder):

- **Merge/update**: "Roland" mentioned again → mentions++, sentiment refresh.
- **New entities**: people, places, stories, facts → new `memory_items`, `first_call` linked.
- **Thread mining**: unfinished stories, promised photos, "next time I'll tell you…" → `open_thread = true` (feeds next week's brain context, `03` §3).
- **Highlights**: 2–4 candidate clips per call (story peaks = longest elder monologues + sentiment "lights_up") → episode shortlist.
- All extraction cites `call_id` + segment ranges — every book sentence is traceable to her actual words ("source_of_truth" principle: the book quotes her; nothing is invented).

## 7. [E] Artifacts

**Episode (weekly):** best-of 15–25 min: light intro line (rotating, warm, honest — "Cette semaine chez Jacqueline…"), her segments with soft crossfades, chaptered by `memory_items`. Produced by ffmpeg EDL from segments; stored encrypted; published to the feed per consent scope `use.family_feed`.

**Book (annual or on-demand):**
1. Manuscript builder: chapters from the year's `memory_items` + top transcripts; LLM **edits structure, never voice** — her words verbatim or clearly ellipsed.
2. Family review UI (`06`): reorder, drop, caption photos (texted-in by members!), approve.
3. Names scrubbed to first names unless `use.book_names`.
4. Print flow: PDF via typographic template (HTML/CSS paged, elegant, serif, photo plates) → print-on-demand partner (Lulu-class API) or local short-run printer for the pilot's Christmas deadline. `book_orders` + payments per `09`.

**Evidence bundles (consent/audit):** any `consent_events` recording + transcript + hash chain excerpt, exportable as one `.crypt` file — what a court or a doubting relative gets.

## 8. Export (the covenant)

One-click family export = `.crypt` archive containing: all recordings (originals), transcripts, memory_items JSON, episodes, book manuscripts/PDFs, consent + audit chain, and (if consented) the voice model artifacts (`07`). Decryptable with the family passphrase/`crypt` — **the company can die without killing the grandmothers**. Export is available on day one, not "on request".

## 9. Integrity, backup, deletion

- Manifest per family directory (`sha256` of every artifact, itself hashed); nightly verify job samples 5%.
- Backups: nightly rsync of ciphertext + DB dump (encrypted, off-host — follow `backup-server.sh` patterns; **test a restore quarterly**, per the dossier's own warning).
- Deletion request flow: revoke scopes → mark → 7-day cooling (fraud/accident guard, reversible) → crypto-shred DEK + artifact purge + audit entry. The audit chain survives (hashes only, no content).

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
