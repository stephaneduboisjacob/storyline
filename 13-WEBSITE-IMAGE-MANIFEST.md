# 13 — Website Image Manifest

**Project:** StoryLine marketing site — 7 languages (FR, EN, ES, IT, DE, RU, ZH), worldwide.
**Rule zero:** every image is **text-free**. All words (headlines, UI, captions) render in code per language. No watermarks, no logos inside images.
**Deliver format:** highest resolution available, JPG (photos) or PNG (emblems/textures); filename exactly as listed, into `./design/images/`.

---

## 0. The Style Bibles (prepend to every prompt)

### BIBLE A — Photography (use for all photos)
> Warm nostalgic editorial photograph, golden-hour window light, soft Kodak Portra 400 film grain, palette of cream, honey amber, terracotta and sage green with deep green accents, shallow depth of field, authentic candid moment, photorealistic, no text, no watermark, no logo, natural skin tones.

### BIBLE B — Soft illustration (use for concept art)
> Soft mixed-media illustration, hand-painted gouache texture with delicate ink linework, warm palette of cream, honey amber, terracotta, sage and deep green, gentle golden glow, elegant storybook mood, generous negative space, no text, no watermark.

**Why one style everywhere:** the site must feel like one warm world, not a stock-photo collage. Same light, same palette, seven languages, one family.

---

## 1. Brand foundation (4)

### 1.1 `logo-emblem.png` — 1024×1024, transparent-friendly
**Prompt (B):** Minimalist emblem of a vintage telephone handset seen from the side, cradled like a small nest, with three golden soundwave arcs rising from the earpiece like a singing bird's call. Deep green emblem on cream background, flat vector style with subtle paper grain, perfectly centered, lots of margin.
*Usage: favicon base, loading mark, footer sign-off. (We'll vectorize the winner in code.)*

### 1.2 `og-cover.jpg` — 1200×630 (16:9-ish)
**Prompt (A):** An elderly woman in her eighties with silver hair laughing warmly while holding the receiver of an old cream-colored rotary telephone, seated by a sunlit kitchen window with lace curtains, steam rising from a teacup, the right two-thirds of the frame occupied by her and the phone, the left third intentionally soft and empty for headline space, wide composition.
*Usage: social share card (same for all languages — words added in code).*

### 1.3 `apple-touch-icon.png` — 512×512
**Prompt (B):** Same emblem as 1.1, simplified to two shapes only: handset silhouette + one soundwave arc, deep green on warm cream, flat, centered, generous margin.

### 1.4 `texture-linen.jpg` — 2048×2048, seamless
**Prompt:** Seamless texture of warm cream linen paper with very subtle fiber grain and the faintest warm stain of tea, extremely soft, no objects, no pattern direction, uniform lighting, tileable.
*Usage: page background texture at ~4% opacity over cream.*

---

## 2. Hero (3)

### 2.1 `hero-grandma-call.jpg` — 2400×1350 (16:9) — **THE money shot**
**Prompt (A):** The defining photograph: an elderly woman around 80 with softly curled silver hair and warm laugh lines, mid-laughter, holding a vintage cream rotary telephone receiver to her ear, seated in a cozy kitchen by a large window with golden late-afternoon light streaming through lace curtains, terracotta tiles, a teapot and wildflowers on the table, a cat asleep on a chair, shot at eye level with a 50mm lens feel, her face and the receiver sharp, background melting into honey-toned bokeh, the mood is pure joy and companionship.
*Usage: hero background, right-weighted composition; headline overlays left.*

### 2.2 `hero-portrait-side.jpg` — 1600×2000 (3:4)
**Prompt (A):** Vertical companion portrait of the same scene: close framing on hands and face — one wrinkled hand holding the old receiver, eyes crinkled with a smile, golden window light, deep green cardigan, cream background, intimate and dignified.
*Usage: hero on mobile / side panel on desktop "About the call" section.*

### 2.3 `hero-horizon.jpg` — 2560×1080 (21:9)
**Prompt (A):** Ultrawide cozy interior at dusk: a hallway console table with an old telephone and a warm lamp glowing, soft shadows, warm amber and deep green tones, lots of soft negative space in the center for overlay text, cinematic, quiet anticipation, as if the phone is about to ring.
*Usage: alternating hero backdrop / announcement band.*

---

## 3. Grandmothers of the world (6) — the multilingual strip

One 3:4 portrait (1600×2000) per culture, all Bible A, all "laughing or smiling while on a phone call, holding a phone" (mix of old handsets, cordless, and simple mobiles — real phones real grandmothers use), each with culturally authentic setting, dignified, joyful, never caricature:

### 3.1 `portrait-fr.jpg` — Québécoise mémé
**Prompt (A):** Portrait of a French-Canadian grandmother in her late seventies with short white hair, floral blouse, gold locket, laughing on a corded kitchen phone, rustic wood-panelled Québec kitchen, maple syrup tin and wildflowers on the counter, warm window light.

### 3.2 `portrait-es.jpg` — Abuela
**Prompt (A):** Portrait of a Latina grandmother in her eighties with silver hair in a bun, embroidered shawl, gold earrings, smiling on a mobile phone, sunlit courtyard with terracotta pots, bougainvillea, linen table with oranges, warm afternoon light.

### 3.3 `portrait-it.jpg` — Nonna
**Prompt (A):** Portrait of an Italian grandmother in her eighties with grey hair pinned up, apron over a cardigan, laughing on a cordless phone, rustic kitchen table with fresh pasta, flour dust in the air, tomatoes and basil, golden window light over a stone sill.

### 3.4 `portrait-de.jpg` — Oma
**Prompt (A):** Portrait of a German grandmother in her late seventies with neat silver bob, wool vest over blouse, pearl earrings, warmly mid-conversation on a phone, cozy Alpine living room with wooden furniture, geraniums on the windowsill, soft morning light, teapot and honey jar.

### 3.5 `portrait-ru.jpg` — Babushka
**Prompt (A):** Portrait of a Russian grandmother in her eighties wearing a delicate floral headscarf and knitted shawl, kind crinkled eyes, holding a phone, winter frost patterns on the window behind, warm lamplight, jar of preserves and dill on the table, cozy and dignified.

### 3.6 `portrait-zh.jpg` — Nǎinai (奶奶)
**Prompt (A):** Portrait of a Chinese grandmother in her late seventies with short greying hair, jade bracelet, buttoned blouse, smiling on a mobile phone, traditional wooden tea table with a clay teapot and steam, paper-cut window decoration softly blurred, warm golden light.

*Usage: a full-bleed horizontal strip "Her voice, in her language" — the section that proves we are worldwide. May double as language-switcher illustrations.*

---

## 4. How it works (4 illustrations, 1600×1200, 4:3, Bible B)

### 4.1 `how-1-the-call.jpg`
**Prompt (B):** A vintage rotary telephone on a small wooden table by a window, and from its handset golden soundwave threads flow out like glowing yarn, gently swirling toward the upper right, warm room implied with minimal strokes.

### 4.2 `how-2-the-archive.jpg`
**Prompt (B):** The golden threads from a telephone arrive and coil around a set of beautiful wooden spools arranged on a shelf like a little library of glowing amber spools, one small key resting in front, soft vault-like coziness, not cold.

### 4.3 `how-3-the-podcast.jpg`
**Prompt (B):** A woman in her fifties sitting by a train window in autumn, earbuds in, eyes closed with a soft smile, phone in her hands, golden leaves outside, a faint golden soundwave ribbon flowing from the phone to her heart.

### 4.4 `how-4-the-book.jpg`
**Prompt (B):** An open hardcover book on a kitchen table from which warm light and small painted memories rise like paper cutouts — a bicycle, a wedding, a farmhouse, a cat — floating gently above the pages.

---

## 5. Product surfaces (4)

### 5.1 `book-cover-art.jpg` — 1600×2400 (2:3)
**Prompt (B):** Elegant hardcover book cover art, portrait orientation, NO TEXT ANYWHERE: a delicate hand-painted portrait silhouette of an elderly woman's profile framed by a botanical wreath of wildflowers and wheat, embossed gold on deep green, thin double-line border, small telephone handset motif at the base, classic heirloom typography-free design.
*Usage: book cover in mockups (real title typeset in code for the demo, print version later).*

### 5.2 `book-on-table.jpg` — 2000×1500 (4:3)
**Prompt (A):** A beautiful hardcover book with plain deep-green cover lying open-faced-down on a linen-covered coffee table next to a teacup, reading glasses, and two scattered vintage sepia photographs, afternoon window light, an asleep cat's tail just entering frame.

### 5.3 `podcast-cover-art.jpg` — 2048×2048 (1:1)
**Prompt (B):** Square podcast album art, no text: a cream rotary telephone handset resting on a warm amber background shaped by soft concentric golden soundwave rings, three small wildflowers laid beside it, textured paper feel, iconic and readable at thumbnail size.

### 5.4 `episode-art-kitchen.jpg` — 2048×2048 (1:1)
**Prompt (B):** Square illustration companion: a cozy illustrated kitchen scene in one corner (teapot, window, small stove) with golden soundwaves sweeping across a cream field, no text — episode artwork for the demo feed.

---

## 6. The pillars (4 illustrations, 1600×1200, Bible B)

### 6.1 `pillar-consent.jpg`
**Prompt (B):** An elderly woman's wrinkled hand placing a small golden key into the open palm of a younger hand above it, a faint circle of light around the exchange, plain warm background — trust, inheritance, permission; no faces needed.

### 6.2 `pillar-vault.jpg`
**Prompt (B):** A warm wooden library wall of little drawers like a card catalog, three drawers open glowing amber with golden soundthread spools inside, a plant on top, a soft hearth light from the left — the family archive, safe and alive.

### 6.3 `pillar-family.jpg`
**Prompt (A):** Overhead view of a multigenerational family hands sharing bread and tea at a long wooden table, grandmother's hands at center, candles, cream linen, terracotta plates, warm evening light, faces softly out of frame — belonging.

### 6.4 `pillar-echo.jpg` — the tasteful Echo visual
**Prompt (B):** A quiet room at dusk: an armchair by a window with warm afterglow light entering, a pair of headphones resting on the chair, a single golden soundwave ribbon rising from them toward the window where one small bird flies into the soft light — hopeful, serene, absolutely not sad; the light stays.

---

## 7. Emotional backdrops (3, wide, soft-focus — for quote bands & stats)

### 7.1 `bg-hands-teacup.jpg` — 2560×1080 (21:9)
**Prompt (A):** Macro of two wrinkled hands cupped around a steaming teacup on a saucer with a small wildflower beside it, extremely shallow depth of field, warm amber tones, dark edges vignetting softly toward a calm center.

### 7.2 `bg-old-letters.jpg` — 2560×1080
**Prompt (A):** Flat-lay of scattered vintage sepia family photographs, handwritten letters and dried flowers on cream linen, soft window light from the left, dust motes, nostalgic and orderly-chaotic, all faces softly aged by time.

### 7.3 `bg-soundwave-dawn.jpg` — 2560×1080
**Prompt (B):** Abstract: gentle horizontal golden soundwave lines rippling across a calm dawn horizon in cream and honey tones with a soft deep-green band below, minimalist, vast negative space in the middle for large typographic quotes (text added in code).

---

## 8. Gift & CTA moments (2)

### 8.1 `gift-moment.jpg` — 2000×1500 (4:3)
**Prompt (A):** A gift moment on a wooden bench: a wrapped kraft-paper parcel tied with twine, a hardcover deep-green book, and cream headphones arranged together, warm fairy-light bokeh in the background, one poinsettia leaf — a Christmas-morning feeling without showing a tree or being holiday-specific.

### 8.2 `cta-phone-dusk.jpg` — 2560×1080 (21:9)
**Prompt (A):** A windowsill at blue-hour dusk with an old cream telephone glowing under a warm lamp, city lights bokeh far outside the window, a small potted plant, wide soft empty center space for the final call-to-action words (added in code) — the day's last call, inviting.

---

## 9. Optional nice-to-haves (generate if the batch goes well)

### 9.1 `404-tangled.jpg` (1600×1200, B): a rotary phone whose cord loops into a heart shape on a wooden floor, sheepish and charming.
### 9.2 `noise-kitchen-ambience.jpg` (2560×1080, A): out-of-focus kitchen background with bokeh lights — spare section divider.
### 9.3 `portrait-grandpa.jpg` + `portrait-nonno.jpg` (3:4, A): grandfathers laughing on the phone (workshop cap; suspenders + vespa helmet vibes) — inclusivity bonus for the strip.
### 9.4 `texture-waves.png` (2048×256, B): a transparent-background decorative golden soundwave ribbon for section transitions (or we draw it in SVG — your call).

---

## 10. Delivery checklist

- [ ] Filenames exactly as above (lowercase, hyphens), dropped into `design/images/`
- [ ] Photos JPG q≥90, illustrations PNG where transparent, texture JPG
- [ ] No text/watermarks anywhere (double-check — AI loves sneaking text in)
- [ ] Faces: pick generations where eyes/smile look natural; reject uncanny ones ruthlessly — warmth beats quantity
- [ ] Consistency pass: hold the portraits side by side — same light temperature, same mood; regenerate outliers

**Total: 30 core images + 4 optional.** Once these land in `design/images/`, the website build starts immediately — no other blocker exists.

---

Contact: Stephane Jacob <jacobstephane@outlook.com>
