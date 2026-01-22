---
layout: default
title: Implementation Specs
status: current
last_updated: 2026-01-21
anchors:
  - code_path: /server/
  - code_path: /client/
---

# Implementation Specs

The definitive technical reference for building the Pre-Purchase Copilot MVP.

---

## System Architecture

### High-Level Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Mobile App | React Native + Expo | iOS First, Offline-Capable |
| Backend API | Node.js + Express | RESTful, Stateless |
| Database | PostgreSQL | Structured + JSONB |
| AI Engine | OpenAI GPT-4o | JSON Mode Only |

### Key Decisions

**Why No Llama Stack?**
Eliminated due to hallucination risk on small models and engineering complexity for MVP.

**Why No Multi-Agent?**
Eliminated to ensure <3s latency for users standing in front of a car.

**Why Hybrid Offline?**
Fetch deep context online, cache locally for the inspection moment.

---

## Feature Logic: Hybrid Morphological Engine

Instead of hard-coding thousands of rules, we use a **Hybrid Approach**: Structured inputs define the "Morphological Grid," and the LLM generates the tailored checklist based on that grid.

### 1. The Input Grid (Structured)

| Input | Source |
|-------|--------|
| Vehicle Identity | VIN Decode |
| Geography | Rust Belt / Coastal / Desert |
| Usage Profile | Daily / Towing / Track |
| Seller Type | Private / Dealer / Curbstoner |

### 2. The Output (Generated)

```json
{
  "checklist_items": [
    {
      "id": "chk_rust_01",
      "category": "Undercarriage",
      "task": "Check subframe mounts for salt corrosion",
      "reason": "Known failure point for [Model] in [Region]",
      "criticality": "HIGH"
    },
    {
      "id": "chk_turbo_02",
      "category": "Engine",
      "task": "Listen for wastegate rattle on cold start",
      "reason": "Common issue for [Engine] at [Mileage]",
      "criticality": "MEDIUM"
    }
  ]
}
```

---

## Data Model

### Core Schema

**candidates**
- candidate_id (UUID)
- vin (VARCHAR)
- risk_score (INT)
- asking_price (NUMERIC)
- status (ENUM: active, archived)

**field_responses**
- response_id (UUID)
- item_id (UUID)
- value_enum (pass/fail)
- photo_path (TEXT)
- notes (TEXT)

### JSONB Structures

**vehicles.nhtsa_data**
Stores the full raw response from the NHTSA vPIC API to allow for future re-parsing without re-fetching.

**conversations.llm_response**
Stores the exact JSON received from OpenAI for audit trails and debugging hallucination issues.

---

## LLM Strategy: The Copilot Contract (Guardrails)

To prevent "AI slop" and maintain trust, the LLM must adhere to strict rules defined in the system prompt.

### Rule 1: Facts vs. Inferences
MUST explicitly label outputs as "FACT" (from VIN/User) or "INFERENCE" (AI deduction).

### Rule 2: Cite Your Sources
Every recommendation MUST cite the triggering field (e.g., "Because mileage > 100k...").

### Rule 3: No Repair Advice
NEVER give repair instructions. Only give *inspection* instructions.

### Prompt Engineering Strategy

**System Prompt:**
```
"You are an expert vehicle inspector. You output ONLY valid JSON. You do not chat. You analyze structured data."
```

**User Prompt:**
```
"Context: { "vin": "...", "mileage": 120000, "region": "rust_belt" }. Generate 5 critical inspection items."
```
