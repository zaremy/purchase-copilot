# Tool Registry

> Every feature ships as a deterministic tool. This registry documents all tool contracts.

## Template

```
## [Tool Name]
- **Name:** `namespace.action`
- **Inputs:** `{ field: type }`
- **Outputs:** `{ field: type }`
- **Errors:** `ERROR_CODE_1`, `ERROR_CODE_2`
- **Side Effects:** Description of mutations, audit events
- **Auth:** Required entitlements
- **Idempotent:** Yes/No
- **Version:** 1.0
```

---

## Phase 3E: Billing Tools

### entitlements.check
- **Name:** `entitlements.check`
- **Inputs:** `{ userId: string, feature: 'pro' | 'reports' | 'vin' | 'photos' | 'ai' }`
- **Outputs:** `{ entitled: boolean, expiresAt?: string }`
- **Errors:** `USER_NOT_FOUND`, `INVALID_FEATURE`
- **Side Effects:** None (read-only)
- **Auth:** Authenticated user
- **Idempotent:** Yes
- **Version:** 1.0

### entitlements.grant
- **Name:** `entitlements.grant`
- **Inputs:** `{ userId: string, feature: string, expiresAt: string, source: 'revenuecat' | 'admin' }`
- **Outputs:** `{ success: boolean, entitlementId: string }`
- **Errors:** `USER_NOT_FOUND`, `INVALID_FEATURE`, `ALREADY_ENTITLED`
- **Side Effects:** Creates entitlement record, audit event
- **Auth:** Webhook signature or admin
- **Idempotent:** Yes (same grant = no-op)
- **Version:** 1.0

---

## Phase 3B: VIN Tools

### vin.decode
- **Name:** `vin.decode`
- **Inputs:** `{ vin: string }`
- **Outputs:** `{ year: number, make: string, model: string, trim?: string, engine?: string, bodyType?: string }`
- **Errors:** `INVALID_VIN`, `VIN_NOT_FOUND`, `RATE_LIMITED`
- **Side Effects:** None (read-only, cached)
- **Auth:** Pro entitlement
- **Idempotent:** Yes
- **Version:** 1.0

### vin.scan
- **Name:** `vin.scan`
- **Inputs:** `{ imageData: string }` (base64)
- **Outputs:** `{ vin: string, confidence: number }`
- **Errors:** `NO_BARCODE_FOUND`, `LOW_CONFIDENCE`, `INVALID_IMAGE`
- **Side Effects:** None
- **Auth:** Pro entitlement
- **Idempotent:** Yes
- **Version:** 1.0

---

## Phase 3C: Media Tools

### media.capture
- **Name:** `media.capture`
- **Inputs:** `{ vehicleId: string, checklistItemId?: string, type: 'photo' | 'video' }`
- **Outputs:** `{ mediaId: string, localUri: string }`
- **Errors:** `CAMERA_PERMISSION_DENIED`, `STORAGE_FULL`
- **Side Effects:** Creates local media file
- **Auth:** Pro entitlement
- **Idempotent:** No (creates new media each time)
- **Version:** 1.0

### media.attach
- **Name:** `media.attach`
- **Inputs:** `{ mediaId: string, vehicleId: string, checklistItemId: string }`
- **Outputs:** `{ success: boolean, attachmentId: string }`
- **Errors:** `MEDIA_NOT_FOUND`, `VEHICLE_NOT_FOUND`, `ITEM_NOT_FOUND`
- **Side Effects:** Updates checklist response with photo reference
- **Auth:** Pro entitlement
- **Idempotent:** Yes (re-attach = no-op)
- **Version:** 1.0

---

## Phase 3A: Reports Tool

### reports.generate
- **Name:** `reports.generate`
- **Inputs:** `{ vehicleId: string, format: 'pdf' | 'json', includePhotos?: boolean }`
- **Outputs:** `{ reportId: string, url: string, expiresAt: string }`
- **Errors:** `VEHICLE_NOT_FOUND`, `INSUFFICIENT_DATA`, `RATE_LIMITED`
- **Side Effects:** Creates report record, audit event
- **Auth:** Pro entitlement
- **Idempotent:** No (generates new report each time)
- **Version:** 1.0

### reports.share
- **Name:** `reports.share`
- **Inputs:** `{ reportId: string, method: 'link' | 'email', recipient?: string }`
- **Outputs:** `{ shareId: string, shareUrl: string }`
- **Errors:** `REPORT_NOT_FOUND`, `INVALID_RECIPIENT`, `SHARE_LIMIT_EXCEEDED`
- **Side Effects:** Creates share record, sends email if method=email
- **Auth:** Report owner
- **Idempotent:** Yes (same share params = same shareId)
- **Version:** 1.0

---

## Phase 3D: Guidance Orchestrator

### guidance.analyze
- **Name:** `guidance.analyze`
- **Inputs:** `{ vehicleId: string, checklistItemId?: string, question?: string }`
- **Outputs:** `{ analysis: string, confidence: number, suggestedActions: Action[], toolCalls: ToolCall[] }`
- **Errors:** `VEHICLE_NOT_FOUND`, `RATE_LIMITED`, `CONTEXT_TOO_LARGE`
- **Side Effects:** Audit event (prompt + response logged)
- **Auth:** Pro entitlement
- **Idempotent:** No (LLM responses vary)
- **Version:** 1.0

### guidance.suggest
- **Name:** `guidance.suggest`
- **Inputs:** `{ vehicleId: string, context: 'checklist' | 'report' | 'compare' }`
- **Outputs:** `{ suggestions: Suggestion[], reasoning: string }`
- **Errors:** `VEHICLE_NOT_FOUND`, `INSUFFICIENT_DATA`
- **Side Effects:** None (read-only analysis)
- **Auth:** Pro entitlement
- **Idempotent:** No
- **Version:** 1.0

---

## Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid auth token |
| `FORBIDDEN` | Valid auth but insufficient entitlements |
| `RATE_LIMITED` | Too many requests, retry after X seconds |
| `VALIDATION_ERROR` | Invalid input parameters |
| `NOT_FOUND` | Resource does not exist |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Versioning

- Tools use semantic versioning (major.minor)
- Breaking changes increment major version
- New optional fields increment minor version
- Deprecated tools marked with `@deprecated` and sunset date
