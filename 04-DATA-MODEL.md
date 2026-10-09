# 04 — Data Model (PostgreSQL)

One database, `storyline`, dedicated role `storyline_app` (no superuser, no cross-service credentials — per the dossier's operational rules). Every user-facing row carries `family_id` for row-level tenancy; every sensitive action lands in `audit_log`.

## 1. Entity overview

```
families 1─* members 1─* consents(scopes)
families 1─1 subscription ─ payments
families 1─* elders 1─* call_schedules ─* calls ─* call_events
calls 1─1 recordings ─* transcripts ─* memory_items
calls *─* question_bank (asked_questions)
elder 1─* manifestos (consent records, hash-chained)
families 1─* episodes (podcast cuts) / books / book_orders
```

## 2. Core DDL

```sql
CREATE TABLE families (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,                    -- "Famille Tremblay"
  locale        text NOT NULL DEFAULT 'fr-CA',
  created_at    timestamptz NOT NULL DEFAULT now(),
  archived_at   timestamptz
);

CREATE TABLE members (            -- family-side users (the daughters, grandkids)
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     uuid NOT NULL REFERENCES families(id),
  email         citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name  text NOT NULL,
  role          text NOT NULL DEFAULT 'member',   -- owner|executor|member
  podcast_token text UNIQUE,                      -- private-feed token, rotatable
  locale        text NOT NULL DEFAULT 'fr-CA',
  created_at    timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz
);

CREATE TABLE elders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id       uuid NOT NULL REFERENCES families(id),
  full_name       text NOT NULL,
  preferred_name  text NOT NULL,                  -- "Jacqueline"
  language        text NOT NULL DEFAULT 'fr-CA',
  phone_e164      text NOT NULL,
  timezone        text NOT NULL DEFAULT 'America/Toronto',
  persona_name    text NOT NULL DEFAULT 'Marie',   -- the caller's name for her
  birth_year      int,
  profile_json    jsonb NOT NULL DEFAULT '{}',     -- family tree, loves/off-limit topics, pin
  status          text NOT NULL DEFAULT 'active',  -- active|paused|deceased|archived
  died_at         date
);
CREATE INDEX ON elders (family_id);

CREATE TABLE call_schedules (
  elder_id        uuid PRIMARY KEY REFERENCES elders(id),
  cadence         text NOT NULL DEFAULT 'weekly',  -- weekly|biweekly|twice_weekly|sunset_daily
  weekday         smallint NOT NULL DEFAULT 2,     -- Tuesday
  window_start    time NOT NULL DEFAULT '15:00',
  window_end      time NOT NULL DEFAULT '17:00',
  jitter_minutes  smallint NOT NULL DEFAULT 10,
  max_minutes     smallint NOT NULL DEFAULT 45,
  blackouts       daterange[] NOT NULL DEFAULT '{}',
  snowbird_ranges jsonb,                          -- [{from,to,tz,e164}]
  enabled         boolean NOT NULL DEFAULT true
);

CREATE TYPE call_state AS ENUM (
  'scheduled','dialing','ringing','answered','in_conversation',
  'winding_down','ended','processing','archived',
  'no_answer','failed','amd_voicemail','wrong_person','rescheduled','missed_final'
);

CREATE TABLE calls (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id      uuid NOT NULL REFERENCES elders(id),
  scheduled_for timestamptz NOT NULL,
  started_at    timestamptz,
  ended_at      timestamptz,
  state         call_state NOT NULL DEFAULT 'scheduled',
  duration_s    int,
  hangup_cause  text,
  talk_ratio_elder real,                          -- 0..1, quality metric
  latency_p95_ms int,
  care_flags    jsonb NOT NULL DEFAULT '[]',       -- see 03 §8 (never diagnoses)
  brain_meta    jsonb NOT NULL DEFAULT '{}',       -- model versions, question ids used
  retry_of      uuid REFERENCES calls(id)
);
CREATE INDEX ON calls (elder_id, scheduled_for DESC);

CREATE TABLE call_events (                         -- append-only telemetry
  id        bigserial PRIMARY KEY,
  call_id   uuid NOT NULL REFERENCES calls(id),
  ts        timestamptz NOT NULL,
  kind      text NOT NULL,                         -- amd_result|dtmf|barge_in|turn|wind_down…
  payload   jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE recordings (
  call_id         uuid PRIMARY KEY REFERENCES calls(id),
  sha256          text NOT NULL,                  -- checksum at capture, verified at ingest
  enc_path        text NOT NULL,                  -- object-store path of encrypted artifact
  bytes           bigint NOT NULL,
  codec           text NOT NULL DEFAULT 'opus',
  duration_s      int NOT NULL,
  recorded_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz                     -- set ⇒ crypto-shredded
);

CREATE TABLE transcripts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES recordings(call_id),
  language    text NOT NULL DEFAULT 'fr',
  text        text NOT NULL,
  segments    jsonb NOT NULL,        -- [{spk:'elder'|'caller', t0,t1, text}]
  stt_meta    jsonb NOT NULL DEFAULT '{}',   -- model, werr estimate
  reviewed_by uuid REFERENCES members(id),   -- family corrections
  quality     smallint                    -- 0..100
);

CREATE TABLE memory_items (   -- the growing treasure: what the brain remembers
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id    uuid NOT NULL REFERENCES elders(id),
  kind        text NOT NULL,              -- person|place|event|story|fact|thread
  name        text NOT NULL,              -- "Roland", "la cabane à sucre"
  detail      text,
  first_call  uuid REFERENCES calls(id),
  last_call   uuid REFERENCES calls(id),
  mentions    int NOT NULL DEFAULT 1,
  sentiment   text,                       -- lights_up|neutral|sensitive
  open_thread boolean NOT NULL DEFAULT false,   -- follow up next week
  merged_into uuid REFERENCES memory_items(id)  -- entity resolution
);
CREATE INDEX ON memory_items (elder_id, kind);
CREATE INDEX ON memory_items (elder_id) WHERE open_thread;

CREATE TABLE question_bank (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category  text NOT NULL,               -- enfance|famille|travail|amour|épreuves|joie|sagesse|goûts
  depth     smallint NOT NULL,           -- 1 light, 2 warm, 3 deep
  locale    text NOT NULL,
  text      text NOT NULL,
  source    text NOT NULL DEFAULT 'core' -- core|family
);
CREATE TABLE asked_questions (
  call_id     uuid REFERENCES calls(id),
  question_id uuid REFERENCES question_bank(id),
  answered    boolean,
  PRIMARY KEY (call_id, question_id)
);
```

## 3. Consent tables (see `01` for semantics)

```sql
CREATE TABLE consent_profiles (        -- current effective scopes (denormalized snapshot)
  elder_id     uuid PRIMARY KEY REFERENCES elders(id),
  scopes       jsonb NOT NULL,          -- {"use.echo.voice":false, "echo.audience":[...]…}
  version      int NOT NULL DEFAULT 1,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consent_events (          -- append-only, hash-chained evidence chain
  id           bigserial PRIMARY KEY,
  elder_id     uuid NOT NULL REFERENCES elders(id),
  kind         text NOT NULL,           -- informed|manifesto_recorded|amend|renew|revoke|posthumous_lock
  scopes_after jsonb NOT NULL,
  evidence_recording uuid REFERENCES recordings(call_id),
  evidence_hash text,                   -- sha256 of manifesto audio + transcript
  prev_hash    text NOT NULL,           -- chain
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON consent_events (elder_id, created_at);
```

## 4. Artifacts & billing

```sql
CREATE TABLE episodes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   uuid NOT NULL REFERENCES families(id),
  call_id     uuid REFERENCES calls(id),
  title       text NOT NULL,             -- "Le bal de Sainte-Anne"
  enc_path    text NOT NULL,             -- edited 15–25 min best-of, encrypted at rest
  duration_s  int NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE books (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   uuid NOT NULL REFERENCES families(id),
  title       text NOT NULL,             -- "Jacqueline, Volume 3"
  year        int NOT NULL,
  manuscript  jsonb NOT NULL,            -- chapters {title, text, source_call_ids, photos[]}
  status      text NOT NULL DEFAULT 'draft'  -- draft|family_review|print_ready|ordered
);

CREATE TABLE book_orders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     uuid NOT NULL REFERENCES books(id),
  format      text NOT NULL,             -- hardcover|softcover|pdf
  qty         int NOT NULL,
  ship_to     jsonb NOT NULL,
  print_cost_cents int, price_cents int NOT NULL,
  payment_id  uuid REFERENCES payments(id),
  status      text NOT NULL DEFAULT 'new'
);

CREATE TABLE payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   uuid NOT NULL REFERENCES families(id),
  kind        text NOT NULL,             -- subscription|book|legacy_license
  amount_cents int NOT NULL,
  currency    text NOT NULL DEFAULT 'CAD',
  rail        text NOT NULL,             -- btcpay|card
  rail_ref    text,
  status      text NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  family_id uuid PRIMARY KEY REFERENCES families(id),
  plan      text NOT NULL DEFAULT 'capture',     -- pilot|capture|capture_plus
  status    text NOT NULL DEFAULT 'active',
  renews_at date
);
```

## 5. Audit & keys

```sql
CREATE TABLE audit_log (                -- append-only, hash-chained; NOTHING updates/deletes
  id         bigserial PRIMARY KEY,
  family_id  uuid,
  actor_type text NOT NULL,             -- member|elder|system|executor|counsel
  actor_id   text,
  action     text NOT NULL,             -- scope_check.pass|scope_check.deny|export|download|echo.session|…
  object     text,
  prev_hash  text NOT NULL,
  hash       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE family_keys (              -- envelope encryption, see 05 §4
  family_id   uuid PRIMARY KEY REFERENCES families(id),
  dek_wrapped bytea NOT NULL,           -- family DEK, wrapped by master KEK (or family passphrase)
  kek_mode    text NOT NULL DEFAULT 'server',   -- server | family_passphrase | split
  created_at  timestamptz NOT NULL DEFAULT now(),
  rotated_at  timestamptz
);
```

## 6. Row-level tenancy & conventions

- App-level enforcement everywhere + **Postgres RLS on hot tables** as belt-and-braces: `USING (family_id = current_setting('app.family_id')::uuid)`.
- All timestamps `timestamptz`. All money integer cents CAD. UUIDs for anything customer-visible in URLs (no enumeration).
- Migrations: plain SQL files in `db/migrations/NNN_*.sql`, applied by a tiny runner — no ORM magic in the critical path; Prisma only in the web app as a typed reader.

## 7. Retention matrix (defaults; family-adjustable narrower)

| Data | Retention |
|---|---|
| Recordings, transcripts, memory_items | Life of the archive; deleted on family directive (crypto-shred) |
| consent_events, audit_log | Forever (it's the evidence chain; tiny) |
| call_events telemetry | 24 months |
| payments | 7 years (accounting) |
| Draft LLM contexts | Never persisted — memory tables only, no raw prompt logs |

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
