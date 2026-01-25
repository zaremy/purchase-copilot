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

### Data Model

**Entitlements JSONB Schema** (stored in `profiles.entitlements`):
```typescript
interface EntitlementsPayload {
  version: 1;
  pro: boolean;           // master flag from RevenueCat subscription
  source: 'admin' | 'revenuecat';
  updatedAt: string;      // ISO timestamp
  expiresAt?: string;     // subscription expiration
  reason?: string;        // admin note or event type
  receiptId?: string;     // link to webhook_receipts or admin_receipts
}
```

**Feature Derivation** (server-side only):
- `pro=true` unlocks: reports, vin, photos, ai
- Client receives derived features, not raw `pro` flag
- Server resolves `pro` → feature flags; client never invents meaning

### entitlements.check
- **Name:** `entitlements.check`
- **Endpoint:** `GET /api/entitlements`
- **Inputs:** None (uses authenticated user from token)
- **Outputs:** `{ version: 1, features: { reports: boolean, vin: boolean, photos: boolean, ai: boolean }, updatedAt: string }`
- **Errors:** `UNAUTHORIZED`, `PROFILE_NOT_FOUND`
- **Side Effects:** None (read-only)
- **Auth:** Bearer token (authenticated user)
- **Idempotent:** Yes
- **Version:** 1.0
- **Notes:** Returns derived features, not raw `pro` flag. Null-safe (returns defaults if entitlements missing).

### entitlements.set
- **Name:** `entitlements.set`
- **Endpoint:** `POST /api/admin/entitlements/set`
- **Inputs:** `{ userId: string, pro: boolean, reason: string }`
- **Outputs:** `{ success: boolean, receiptId: string }`
- **Errors:** `UNAUTHORIZED`, `USER_NOT_FOUND`, `ADMIN_DISABLED`
- **Side Effects:** Updates `profiles.entitlements`, creates `admin_receipts` row
- **Auth:** X-Admin-Key header (server-only service key)
- **Security:** Disabled in production unless `ADMIN_ENDPOINTS_ENABLED=true`
- **Idempotent:** Yes (same set = same result)
- **Version:** 1.0

### entitlements.revoke
- **Name:** `entitlements.revoke`
- **Endpoint:** `POST /api/admin/entitlements/revoke`
- **Inputs:** `{ userId: string, reason: string }`
- **Outputs:** `{ success: boolean, receiptId: string }`
- **Errors:** `UNAUTHORIZED`, `USER_NOT_FOUND`, `ADMIN_DISABLED`
- **Side Effects:** Updates `profiles.entitlements` (pro=false), creates `admin_receipts` row
- **Auth:** X-Admin-Key header
- **Security:** Disabled in production unless `ADMIN_ENDPOINTS_ENABLED=true`
- **Idempotent:** Yes
- **Version:** 1.0
- **Notes:** Alias for `entitlements.set` with `pro=false`. Explicit revoke for audit clarity.

### entitlements.audit.list
- **Name:** `entitlements.audit.list`
- **Endpoint:** `GET /api/admin/entitlements/audit?userId=<uuid>`
- **Inputs:** `{ userId: string }`
- **Outputs:** `{ receipts: Array<{ type: 'webhook' | 'admin', id: string, createdAt: string, ... }> }`
- **Errors:** `UNAUTHORIZED`
- **Side Effects:** None (read-only)
- **Auth:** X-Admin-Key header
- **Idempotent:** Yes
- **Version:** 1.0

### billing.webhook
- **Name:** `billing.webhook`
- **Endpoint:** `POST /api/billing/webhook`
- **Inputs:** RevenueCat webhook payload
- **Outputs:** `{ received: true, dedupe?: boolean, processed?: boolean }`
- **Errors:** `INVALID_AUTH`
- **Side Effects:**
  1. Creates `webhook_receipts` row (idempotency via unique `event_id`)
  2. Fetches canonical state from RevenueCat subscriber API
  3. Updates `profiles.entitlements` from subscriber state
- **Auth:** Authorization header (bearer token configured in RevenueCat dashboard)
- **Idempotent:** Yes (duplicate events return `{ dedupe: true }`)
- **Version:** 1.0
- **Notes:** Uses INSERT-first transaction for concurrency safety. User ID resolved via `profiles.revenuecat_app_user_id` or `profiles.id`.

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
| `ADMIN_DISABLED` | Admin endpoints disabled in production |
| `INVALID_AUTH` | Webhook authorization header invalid |
| `PROFILE_NOT_FOUND` | User profile does not exist |
| `USER_NOT_FOUND` | Specified user does not exist |
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
