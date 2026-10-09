# StoryLine

A consent-first family storytelling concept: regular conversations become stories and keepsakes for a family archive. Any synthetic voice feature would require separate, explicit, recorded consent and clear limits on how it can be used.

## Project status

This repository contains product specifications, a static marketing-site prototype, and a small geo-language helper. It is not a complete telephony, recording, or voice-generation product. Roadmap documents describe proposals, not shipped capabilities.

## Principles

- The person whose voice and stories are collected controls consent and its scope.
- Families can export their archive.
- A synthetic voice must never be represented as the person being alive or speaking now.
- Sensitive audio and personal stories require strong protection, retention controls, and a clear deletion path.

## Contents

- `00`–`09` — product vision, consent, telephony and voice specifications, data model, storage, family app, Echo safety, and business model
- `10-INFRASTRUCTURE-DEPLOYMENT.md` — generic deployment architecture
- `11-ROADMAP-AND-BUILD-PHASES.md` — proposed delivery phases
- `13-WEBSITE-IMAGE-MANIFEST.md` — visual asset brief
- `site/` — static site source
- `geo-service/` — geo-language helper prototype

## Preview the static site

From the repository root:

```sh
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000`. The helper service requires its own local database configuration; do not point it at production data while developing.

## Safety and privacy

Do not add real call recordings, voice samples, family records, credentials, or identifying customer data to this repository. See [SECURITY.md](SECURITY.md) before discussing a potential vulnerability.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidance.

## License

No license has been selected yet. Public visibility does not grant permission to reuse the code.

## Contact

Stephane Jacob <jacobstephane@outlook.com>
