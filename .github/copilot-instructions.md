# Copilot Instructions — Pre-Purchase Pal

## Do
- Follow existing patterns in the repo; inspect before editing.
- Make the smallest viable change that satisfies acceptance tests.
- Keep types explicit and narrow.
- Prefer clear, deterministic logic over "clever" abstractions.

## Don't
- Don't introduce new frameworks or architecture without an explicit spec.
- Don't add logging of VIN/email/phone/notes.
- Don't commit secrets or env files.

## Required for PR-ready work
- Provide acceptance-test evidence (commands run + results).
- Call out any auth/billing/entitlement impacts.
- List data fields touched and where they are stored.
