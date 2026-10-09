# 08 — Security, Privacy & Compliance

## 1. Threat model

| # | Attacker | Asset | Mitigation |
|---|---|---|---|
| 1 | Server compromise (the big one) | The corpus (her voice) | Envelope encryption at rest (`05` §4); family DEKs not derivable from server alone when vault mode chosen; plaintext audio lives minutes; least-privilege service user; no shared credentials with VoIPClaw/BTCPay stacks |
| 2 | Ransomware / wipe | Archive + DB | Nightly off-host encrypted backups, immutable destination, quarterly tested restores; audit chain survives |
| 3 | Rogue insider | Recordings | All access via audited, scoped paths; no bulk-download role; hash-chained audit; ops on the box via Tailscale only |
| 4 | Cloud AI providers | Voice/transcript leakage | Local-first: Whisper local, LLM contexts anonymized (names/phones/addresses stripped before any API call); API modes are explicit per-family opt-ins with a published sub-processor list |
| 5 | Family member misuse | Raw archive | Per-member tokens/roles; raw scope separate; revocation instant; every listen audited in vault-mode families |
| 6 | Token/feed leak | Episodes | Per-member feed tokens, 24 h signed URLs, rotate + revoke (`06` §3) |
| 7 | Legal overreach / estate dispute | Whole archive | Data minimization; consent chain as the single source of truth; counsel-reviewed response playbook |
| 8 | Fraudster with a clone | Family trust | Echo never calls non-audience numbers (`07` §5); live-vs-echo verification ritual; optional TTS watermark |
| 9 | The company itself drifting | Everything | The Hard Rules (`README`), public posture, hash-chained audit the family can export |

## 2. Server hardening (this box, specifically — from the dossier's warnings)

- **Postgres 5432 currently listens on 0.0.0.0 → bind to localhost/Tailscale before StoryLine carries one real family.** Same for FreePBX 8443 admin exposure.
- Dedicated Unix user `storyline`, dedicated DB `storyline` + role with zero privileges beyond it, table RLS as second lock.
- Secrets in a single `storyline.env` (0600, service user), **never in docs/git**; the box has a plaintext-credential habit (`.env`, notes files) — StoryLine doesn't inherit it.
- Services bind localhost; the only public surfaces: nginx 443 (`storyline.example.com`) and the SIP trunk Asterisk already manages.
- Swap pressure on this server is real (dossier noted swap full) — transcription workers get memory caps and off-peak scheduling so a Whisper burst can't starve the VoIP stack.

## 3. Data flows & residency

- All storage and processing on this single server (continent of residence for Québec families: document it honestly in the privacy page; if expansion demands EU residency, the architecture is one `storyline-worker` replica away).
- Outbound: SIP trunk (call setup), LLM API (anonymized text only, default mode), ElevenLabs (TTS of the **caller's** lines — her voice is never sent to TTS providers; only the echo ever uses voice cloning, posthumously, per consent), BTCPay/Stripe (billing metadata).
- Inbound email (magic links, digests) via own Mailu — no third-party mail reader.

## 4. Law 25 / PIPEDA feature map ( Québec-first)

| Right | Feature |
|---|---|
| Consent (granular, purpose) | The whole of `01`; scopes matrix |
| Access | Family export (full, standard formats) — day one (`05` §8) |
| Rectification | Transcript corrections; profile edits |
| Erasure / portability | Crypto-shred flow; export covenant |
| Transparency | Plain-language privacy page FR/EN; sub-processor list; "what the AI sees" diagram |
| Privacy by design | Local-first STT; anonymized LLM contexts; minimization at every stage |
| Person in charge | Nominate before pilot #1; contact channel published |

EU AI Act (expansion): AI-interaction disclosure = the caller's honesty rule + echo banners; synthetic-voice labeling posture satisfied by design (`03` §1, `07` §4).

## 5. Recording-law posture

Canada: federally one-party. Québec prudence + our own standard: the greeting announces recording **every call**, the announcement is in the file, and a build test verifies it (`02` §10). Two-party-style jurisdictions (US states) if ever expanded: announcement + DTMF ack before conversation.

## 6. Sub-processors (published list, v1)

| Processor | Data | Mode |
|---|---|---|
| SIP carrier | Call metadata | Required |
| LLM API | Anonymized conversation text | Default; local model = opt-out |
| ElevenLabs | Caller's TTS lines only | Default |
| Whisper | — | Local, none leaves |
| BTCPay / Stripe | Billing | Card mode opt-in |
| Print partner | Book files | Only on order, only approved manuscript |

## 7. Breach & incident playbook (one page, rehearsed)

Contain (isolate service user) → assess scope via audit chain → notify affected families plainly (no legalese first) → Law 25 / PIPEDA regulator steps via counsel → post-mortem in the open with pilots. The trust product must respond like a trust product.

## 8. Security checklist before pilot family #1

- [ ] 5432/8443 off the public interface
- [ ] `storyline` user, DB role, RLS on, env secrets, no creds in repo
- [ ] Raw plaintext audio TTL ≤ 15 min enforced + tested
- [ ] Vault mode (family passphrase) implemented and offered at onboarding
- [ ] Nightly off-host backup + **one performed restore drill, documented**
- [ ] Audit chain verifier script green over a synthetic consent lifecycle
- [ ] TLS + HSTS on storyline.example.com; admin routes Tailscale-only
- [ ] Uptime/disk/queue/backup-age alerts firing to a monitored channel

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
