# Zipytiny Operational Command Protocol
**Document Ref:** GOV-WORKFLOW-2026-07-21-01  
**Status:** 🟩 ACTIVE (Mandated by the Founder)  
**Effective Date:** July 21, 2026  

---

## 👑 The Chain of Command (Cascade of Authority)

Any code modification, business strategy pivot, or campaign launch must strictly flow through this protocol. No skipped steps, direct coding, or bypassed approvals are permitted.

```
       [ 👨‍💼 Founder (User) ]
                 │ (Directs / Inspires)
                 ▼
          [ 💼 CEO Agent ]
                 │ (Objectives, KPIs & Strategic Mandate)
                 ▼
     [ 📋 Project Director AI ] ◄───► [ 🎯 Product Manager AI ]
                 │ (Schedules & Sequence)       (PRD & Acceptance Criteria)
                 ▼
    [ 👥 Specialized Agents Group ]
    ┌──────────────────────┬──────────────────────┬──────────────────────┐
    ▼                      ▼                      ▼                      ▼
[ Architect ]       [ FE / BE Eng ]        [ AI Engineer ]        [ SEO / GEO Eng ]
    │                      │                      │                      │
    └──────────────────────┼──────────────────────┴──────────────────────┘
                           ▼
              [ 🛠️ Implementation Engineer ]
                           │ (Final Integration & Code Quality Merge)
                           ▼
                    [ 🧪 QA Engineer ]
                           │ (Testing & Automated Validation)
                           ▼
                    [ 🛡️ CTO Review ]
                           │ (Final Technical Production Sign-off)
                           ▼
                     [ 🚀 PRODUCTION ]
```

---

## 📋 Phase-by-Phase Execution Playbook

### Phase 1: Strategic Alignment (Founder to CEO)
1. **The Founder** delivers a high-level request or business direction.
2. **The CEO** acts as the primary strategic gatekeeper. The CEO must:
   * Evaluate the request against the core company mission (Transform any video or document into an intelligent learning workspace).
   * Define the key **Business Objectives** and **KPIs**.
   * Formulate the recommended decision and hand off a clear strategic order to the **Project Director** and **Product Manager**.

### Phase 2: Technical Program & Requirements Definition
1. **The Product Manager** writes a comprehensive PRD detailing user stories and acceptance criteria.
2. **The Project Director** initializes a sprint cycle on the `PROJECT_DASHBOARD.md`, sequences the development card pipeline, and manages the dependency matrix.
3. **The Software Architect** reviews and designs the system boundaries, ensuring clean modularity and documenting patterns.

### Phase 3: Collaborative Specialized Engineering
1. **Frontend / Backend / AI / SEO Engineers** work on their designated modules synchronously based on the dependency matrix.
2. Every engineer updates their tasks in the `PROJECT_DASHBOARD.md` to `In Progress` and then `Waiting Review`.

### Phase 4: Core Consolidation & Integration
1. **The Implementation Engineer** consolidates all code edits. They ensure that there is no duplicated code, verify style alignments, and compile the application successfully.
2. **The QA Engineer** executes unit tests, lints the codebase, and verifies that all acceptance criteria are fully satisfied.

### Phase 5: Technical Governance & Deployment
1. **The CTO Review Agent** runs a final technical sanity check, lints, compiles, and signs off.
2. Only after CTO approval does the code proceed to deployment.

---

## 🛠️ Enforcement Rules
* **No Unsolicited Work**: No agent is allowed to write production code before a strategic mandate is passed down from the CEO and requirements are detailed by the PM.
* **Audit Trail**: Every workflow stage must update the `PROJECT_DASHBOARD.md` to ensure absolute transparency.
