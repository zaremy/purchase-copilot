# Pre-Purchase Copilot: Product Specification & Artifact Set

This directory contains the complete, internally consistent product specification and supporting artifacts for **Pre-Purchase Copilot**, an iOS App Store application designed to help consumers make informed decisions when purchasing used cars.

---

## 📄 Document Overview

### **Primary Document**

*   **`prd.md`** - The comprehensive Product Requirements Document (PRD). This is the single source of truth for the product vision, user needs, feature specifications, and go-to-market strategy. Start here.

### **Supporting Specifications**

*   **`architecture.md`** - Detailed system architecture, core data objects, and the four key user journeys (single-car purchase, multi-car comparison, scam/doc risk flow, and PPI flow).

*   **`feature_spec.md`** - In-depth feature specifications, including the data model, checklist taxonomy, scoring model v1, negotiation builder, vehicle dossier requirements, and the field-only LLM chatbot spec.

*   **`technical_architecture.md`** - Technical stack, system architecture diagram, PostgreSQL data schema, and VIN/history report integration strategy.

*   **`ux_wireframes.md`** - UX/IA, primary navigation, screen hierarchy, and detailed textual wireframe descriptions for all critical screens.

*   **`full_checklist.md`** - The complete 68-item inspection checklist, organized into 7 sections, with response types and scoring flags for each item.

*   **`llm_prompts.md`** - LLM prompt templates and system instructions for all Copilot capabilities (summary, comparison, question generation, negotiation pack), including guardrail enforcement examples.

### **Visual Assets**

*   **`architecture_diagram.png`** - System architecture diagram showing the React Native app, Express.js backend, PostgreSQL database, and third-party API integrations.

---

## 🎯 Product Summary

Pre-Purchase Copilot is a workflow-driven iOS application that transforms the chaotic process of buying a used car into a structured, repeatable, and data-driven workflow. It serves as a pre-purchase checklist, inspection tracker, candidate comparison tool, and negotiation assistant. The core differentiator is a specialized LLM "Copilot" that acts as a **structured-data analyst**, reasoning exclusively over user-provided form fields to identify risks, compare vehicles, and generate negotiation points.

### Key Differentiators

1. **Contextual Checklist Generation**: After VIN decoding, the LLM generates 3-5 vehicle-specific inspection items based on known issues, recalls, and TSBs for that exact make, model, and year (e.g., "Check for VANOS rattle on this BMW N54 engine"). This transforms a generic checklist into a targeted inspection plan.

2. **Field-Only Analysis**: Unlike generic AI chatbots, the Pre-Purchase Copilot LLM is strictly constrained to analyzing **structured field data only**. It does not interpret images, PDFs, or any unstructured evidence. This "field-only" approach ensures reliability, traceability, and user trust.

---

## 🚀 Quick Start for Product Teams

1.  **Read the PRD** (`prd.md`) - This provides the complete product vision, user personas, MVP scope, and business strategy.
2.  **Review the User Journeys** (`architecture.md`) - Understand the four critical workflows that the app must support.
3.  **Examine the Checklist** (`full_checklist.md`) - This is the core data capture tool. All features are built around this structured input.
4.  **Study the LLM Spec** (`llm_prompts.md`) - Understand the guardrails and prompt templates that ensure the Copilot is safe, reliable, and useful.
5.  **Review the Wireframes** (`ux_wireframes.md`) - Get a clear picture of the user interface and interaction patterns.

---

## 📊 Key Metrics & Success Criteria

*   **North Star Metric**: Weekly Active Dossiers (candidates with 70%+ checklist completion)
*   **Leading Indicators**: Checklist completion rate, Copilot queries per session, issues logged per candidate, conversion to paid
*   **MVP Success**: Users can successfully inspect a car, receive a risk score, compare multiple candidates, and generate a negotiation pack

---

## 🛠️ Technology Stack (MVP)

| Component | Technology |
|---|---|
| **Mobile App** | React Native + Expo |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL |
| **LLM** | OpenAI (GPT-4 Series) |
| **VIN Decoding** | NHTSA vPIC API (free) |

---

## 💰 Monetization Model

**Per-Vehicle Purchase ("Pay-per-Dossier")**

*   **Free Tier**: Up to 2 active candidates, full checklist, basic scoring
*   **Premium**: $14.99 one-time per vehicle to unlock unlimited candidates, advanced Copilot features (comparison, negotiation), and dossier export

---

## 🔒 Trust & Safety

*   **Field-Only LLM**: The LLM never sees unstructured data, reducing hallucination risk
*   **Cite-Your-Fields**: Every LLM statement is traceable to specific field IDs
*   **Calibrated Language**: The LLM uses probabilistic language and never makes definitive legal or financial claims
*   **Privacy**: All data is encrypted at rest and in transit. Users have full control over their data.

---

## 📅 MVP Delivery Milestones

1.  **The Inspector** - Core checklist and data capture
2.  **The Analyst** - Risk and completeness scoring
3.  **The Copilot** - LLM integration and risk summarization
4.  **The Shopper** - Comparison, negotiation, and dossier export
5.  **The Business** - Monetization, analytics, and App Store submission

---

## 📞 Contact & Feedback

This product specification was created by **Manus AI** as a comprehensive foundation for building Pre-Purchase Copilot. For questions, clarifications, or to discuss next steps, please refer to the project context.

---

**Last Updated**: December 16, 2025
