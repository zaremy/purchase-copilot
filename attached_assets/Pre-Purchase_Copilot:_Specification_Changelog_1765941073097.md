# Pre-Purchase Copilot: Specification Changelog

This document tracks all major updates and revisions to the Pre-Purchase Copilot product specification.

---

## Version 1.1 - December 16, 2025

### Major Feature Addition: Contextual Checklist Generation

**Summary**: The LLM now proactively generates vehicle-specific inspection items based on the decoded VIN attributes (make, model, year, engine type). This transforms the checklist from a generic, one-size-fits-all tool into a targeted inspection plan tailored to each vehicle.

**Changes Made**:

1.  **Data Model Update** (`feature_spec.md`):
    *   Updated `InspectionItem` object to include `source` field ('base' or 'llm_generated') and `llm_justification` field.
    *   Added detailed description of the Contextual Checklist feature, including trigger, process flow, and example generated items.

2.  **LLM Prompt Specifications** (`llm_prompts.md`):
    *   Added **Prompt Template 0: Contextual Checklist Generation**.
    *   Defined input schema (vehicle attributes) and output schema (suggested inspection items with justifications).
    *   Specified that the LLM should focus on common failures, recalls, and TSBs that can be checked during a visual inspection or test drive.

3.  **Product Requirements Document** (`prd.md`):
    *   Updated product summary to highlight the dual role of the LLM: vehicle-specific expert and structured-data analyst.
    *   Updated MVP feature list to specify "Hybrid Inspection Checklist."
    *   Added new LLM capability: "Generate Contextual Checklist."
    *   Added UX section for how contextual checklist items will be presented to users (modal, user approval, visual distinction).

4.  **User Journey Update** (`architecture.md`):
    *   Inserted a new step in Journey 1 (Single-Car Purchase Flow) after VIN decoding: "Contextual Checklist - LLM generates 3-5 vehicle-specific inspection items."
    *   Renumbered subsequent steps to maintain flow.

5.  **README Update** (`README.md`):
    *   Expanded "Key Differentiator" section to "Key Differentiators" (plural).
    *   Added "Contextual Checklist Generation" as the first differentiator, with a concrete example.

### Future Roadmap Additions (V2.0)

Added two post-MVP features to the "Later (V2.0)" backlog:

*   **VIN Scanning from Camera (via OCR)**: Allow users to capture the VIN by taking a photo of the VIN card on the windshield.
*   **Vehicle Identification from Photo (via LMOCR)**: Allow users to initiate a workflow by taking a photo of a car, with the LLM identifying the make, model, and trim to kick off the checklist.

**Rationale**: These features will further streamline the initial capture process but are not critical for the MVP.

---

## Version 1.0 - December 16, 2025

### Initial Release

Complete product specification and artifact set created, including:

*   Comprehensive PRD covering all 15 required sections
*   Detailed architecture and user flows
*   Feature specifications with data model, scoring algorithm, and negotiation builder
*   Technical architecture with PostgreSQL schema and VIN integration strategy
*   UX/IA with textual wireframes for all critical screens
*   Complete 68-item base inspection checklist
*   LLM prompt templates with guardrail enforcement examples
*   System architecture diagram

**Key Decisions**:
*   Monetization: Per-vehicle purchase model ($14.99)
*   Acquisition wedge: First-time buyers + cautious enthusiasts
*   LLM constraint: Field-only analysis, no unstructured data
*   Scoring model: Simple, transparent, weighted approach
