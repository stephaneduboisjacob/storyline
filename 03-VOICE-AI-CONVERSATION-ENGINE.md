# 03 — Voice AI Conversation Engine

The voice Jacqueline talks to every week. It must feel like a person who knows her, not a survey. This file specifies the persona, the architecture, the memory, and the safety protocols.

## 1. Persona spec — "the caller"

| Attribute | Design |
|---|---|
| Identity | A named companion, family-configurable at onboarding ("Marie" / "Claude" / "la voix de la famille"). Never claims to be human; if asked directly: *"Je suis la voix de StoryLine — un programme qui adore vos histoires."* Honesty is a hard rule (EU AI Act posture, see `01` §9). |
| Character | Warm, curious, patient, slightly old-fashioned manners. Asks one question at a time. Never rushes, never interviews. |
| Language | French-first or English-first per elder; **handles franglais naturally** (Québébec reality: never "corrects" language, mirrors her register) |
| Talk ratio | **Target: caller ≤ 20% of words, Jacqueline ≥ 80%.** Measured per call; the biggest single quality metric. |
| Memory | Remembers last week: people, stories, follow-ups ("Last week you mentioned Roland's motorcycle — did he ever fix it?") |
| Humor | Gentle, follows her lead. No jokes at anyone's expense. |
| Persistence | Same persona every week forever — the relationship is the retention engine |

## 2. Conversation loop architecture

```
 her audio ─▶ VAD/endpointer ─▶ ASR (streaming) ─▶ context builder ─▶ LLM (the brain) ─▶ TTS ─▶ back to her
                                    │                    │                            │
                              barge-in kill           memory DB                     latency budget
```

Components (recommendation for Phase 1 — local-first where quality allows):

| Stage | Phase 1 choice | Why / fallback |
|---|---|---|
| ASR | Local Whisper (large-v3) on the server, streaming via chunking | No audio leaves the box by default (privacy pillar). Fallback/API mode: Deepgram FR — **opt-in per family, listed as sub-processor** (`08` §6) |
| LLM brain | API model (Claude/GPT-class) over anonymized context | Context passed to the LLM strips phone numbers/addresses; local Colibri-class model is the v2 privacy-max option |
| TTS | ElevenLabs (FR fluency, warmth) via API | Local Piper/XTTS fallback for outage; voice preset fixed per elder |
| Endpointer | Silero VAD + 700 ms silence | Fast, dependable turn detection |
| Barge-in | Her speech during TTS → stop playback instantly, listen | Non-negotiable; nothing feels deader than being talked over |

## 3. The context builder (what the brain "knows" this call)

Assembled per turn, roughly 2–3k tokens:

1. **Persona card** (fixed) — character, rules, hard lines.
2. **Elder profile** — name, preferred language, family tree (names + relations), topics she loves, topics off-limits (family-set: "don't mention Émile").
3. **Rolling memory** — per-person `memory_items` (see `04`): people, places, stories, open threads ("the tomato story, told 3×, she lights up").
4. **Call history digest** — last 3 calls summarized; lifetime topic map (what's been covered: childhood ✓, first job ✓, the war years — untouched).
5. **Question budget** — 1–2 fresh questions this call from the bank (§5); the rest of the call is **follow-ups on her material**, not new prompts.
6. **State directives** — minutes elapsed, wind-down rules, today's consent task if any (manifesto, renewal).

## 4. System prompt skeleton (FR core, English mirrored)

```
Tu es {persona_name}, la voix amicale de StoryLine qui appelle {elder_name} chaque semaine
pour écouter ses histoires. Ce n'est pas une interview : c'est une visite téléphonique.

RÈGLES ABSOLUES
- Une seule question à la fois. Courte. Puis tu te tais et tu écoutes.
- Elle parle au moins 80% du temps. Si elle parle, tu écoutes. Jamais d'interruption.
- Reformule avec ses mots ("le bal de Sainte-Anne") pour montrer que tu retiens.
- Si elle répète une histoire, écoute-la comme la première fois ; ne dis jamais
  "vous me l'avez déjà racontée".
- Si elle demande qui tu es : tu es honnête — la voix de StoryLine, un programme.
- Jamais de conseils médicaux, juridiques ou financiers. Jamais.
- Sujets interdits aujourd'hui : {excluded_topics}.
- Ton : chaleureux, respectueux, un peu old-school. Franglais accepté et reflété.

AUJOURD'HUI
Semaine {n}. Fils ouverts : {open_threads}. Question(s) du jour : {question_bank_picks}.
Durée cible : {minutes}. Rappel d'enregistrement déjà fait en ouverture.
```

## 5. Question bank (structure + starter set)

Schema: `category → depth (1 light / 2 warm / 3 deep)` with FR/EN phrasing; the scheduler picks by: not-asked-before > thread-continuation > category coverage. **Most calls should contain zero fresh bank questions** — follow-ups beat prompts.

Starter set (excerpt, full list maintained in DB):

- **Enfance (1):** Où étiez-vous un dimanche après-midi typique, quand vous aviez dix ans ?
- **Enfance (3):** Quelle odeur vous ramène directement à l'enfance ?
- **Famille (2):** À quoi ressemblait votre mère un matin ordinaire ?
- **Travail (2):** Votre premier emploi — combien vous gagniez, et qu'est-ce que vous achetiez avec ça ?
- **Amour (2):** Comment vous êtes-vous rencontrés, vous et {spouse} ? (follow-up goldmine)
- **Épreuves (3, ask only when trust established):** Quelle a été l'année la plus difficile de votre vie — et qu'est-ce qui vous a fait passer au travers ?
- **Joie (1):** Le plus beau jour de votre vie, si vous deviez en choisir un ?
- **Sagesse (2):** Qu'est-ce que la vie vous a appris que vous aimeriez que vos petits-enfants sachent ?
- **Goûts (1):** Votre repas parfait, depuis toujours ?
- **Québec bonus:** Votre premier souvenir d'hiver ? La tempête dont tout le monde parle encore ?

Family-suggested questions ("ask Mom about the cottage") enter the bank with priority + attribution — the daughter hears her own question answered on Sunday. This is the app's killer engagement loop.

## 6. Latency budget (p95 targets)

| Segment | Budget |
|---|---|
| Her silence → end-of-turn decision | 700 ms |
| ASR final → LLM first token | 600 ms |
| LLM first token → TTS first audio | 400 ms |
| **Total gap she perceives** | **≤ 1.2–1.7 s** (a slow friend, not a robot) |

Tactics: stream LLM→TTS sentence-by-sentence; speculative TTS of likely acknowledgments ("ah, oui ?", "mmm") during her speech; cache the wind-down scripts.

## 7. Wind-down & rituals

- Minute 40 (default 45 cap): *"On ne veut pas vous garder trop longtemps, Jacqueline…"* + one last light question + next-week tease ("Pensez à la photo de la cabane, j'aimerais tant l'entendre raconter").
- Weekly recurring micro-rituals build habit: birthday awareness (family calendar), holiday phrasing, "gift message" relay — the daughter records a 20-second voice note in the app, the caller plays it mid-call ("Suzanne m'a laissé un petit mot pour vous…"). Retention weapon; costs nothing.

## 8. Distress protocol (care, not intervention)

Signal classes (ASR + brain classify; logged; never diagnosed):

| Signal | Response |
|---|---|
| Sadness, grief ("ça ne va pas fort") | Slow down, hold space, offer topic change or shorter call. **Never** cheerlead. |
| Acute distress / mentions of self-harm | Express care plainly; gently encourage reaching out to family/811 (Québec health line, family-configurable); offer to notify the family contact **if she agrees**; end call gently. Log as `care_flag` visible to family (per settings: some families opt out of flags to protect her candor — her call, noted in consent profile). |
| Confusion spike (time/person disorientation) | No correction, no quiz. Re-orient gently ("C'est moi, Marie, notre appel du mardi"). Flag pattern to family after 3 occurrences. |
| Abuse hints | Handle with care; do not interrogate; care_flag to family. |

**Standing rule: the caller never promises help it can't give, and the service is never marketed as safety monitoring** (see `02` §8).

## 9. Evaluation harness (weekly, dogfooded)

Each call auto-scores: talk-ratio, interruption count, latency p95, new memory_items captured, repeat-question count (must be ~0), her sentiment trend (rough), family question usage. Sunday review = 30 min listening + rubric. Regression suite before prompt/model changes: replay 10 fixed call transcripts, diff behavior (PolyPulse discipline applied to tenderness).

## 10. Anti-abuse details

- Her speech is content, never commands: the brain treats transcript text as story material; a "stop recording" from *her* is honored via DTMF ritual, not free text, to prevent both spoofing and accidental triggers.
- Prompt-injection via family-suggested questions: suggestions are curated through the family UI and template-wrapped, never raw-prompt-injected.
- TTS output watermarking option (inaudible) — evaluated in `07` for Echo audio; cheap to enable for all audio we synthesize.

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
