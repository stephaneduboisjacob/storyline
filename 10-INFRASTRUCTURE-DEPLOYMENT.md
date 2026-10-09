# Infrastructure and deployment concept

This document is a technology-neutral deployment outline for a future StoryLine service. It uses example paths and domains only; choose and document a separate environment before implementing production infrastructure.

## Service boundaries

```text
Caller → telephony provider or SIP gateway → call-session service
                                             ↓
                                      consent and policy checks
                                             ↓
                                  encrypted audio and transcript store
                                             ↓
                           family application and export service
```

Keep call control, application APIs, and data stores on private networks. Expose only the minimum public endpoints through a TLS-terminating proxy. Separate development, staging, and production databases, object stores, credentials, and retention policies.

## Data protection

- Encrypt recordings and archives before or at the storage boundary, with keys managed separately from the data.
- Keep provider credentials and encryption keys in a secret manager or protected environment file outside the repository.
- Avoid logging call audio, transcripts, authentication material, or family identifiers.
- Define retention, deletion, export, and incident-response procedures before collecting real data.
- Test backups and restores with synthetic records.

## Operations

Production deployment should use dedicated service accounts, restricted filesystem permissions, private database access, TLS, monitoring, and a documented rollback path. Example service and proxy files must be adapted and reviewed before installation. Never publish host inventories, private IPs, certificate keys, live credentials, or real recordings.

This concept does not prescribe a specific provider, host, port, or live domain. See [the consent architecture](01-CONSENT-ARCHITECTURE.md) and [security and privacy notes](08-SECURITY-PRIVACY-COMPLIANCE.md) before designing an implementation.

## Contact

Stephane Jacob <jacobstephane@outlook.com>
