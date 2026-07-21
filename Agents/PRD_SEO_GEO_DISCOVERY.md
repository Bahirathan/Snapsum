# Product Requirements Document (PRD): SEO & GEO Discovery Layer

**Document Ref:** PM-PRD-2026-07-21-01  
**Project:** Enterprise-Grade Search & Generative Engine Discovery  
**Author:** Head of Product, Zipytiny  
**Status:** 📋 Draft (Ready for Architecture Review)  
**Date:** July 21, 2026  

---

## Executive Summary

This Product Requirements Document (PRD) outlines the user-facing and functional requirements for the **ZipyTiny SEO & GEO Discovery Layer**. 

The goal of this initiative is to create a series of high-performance, intent-driven, public landing pages (YouTube Video Summarizer, PDF Active Recall Workspace, and Interactive AI Tutor) and support them with dynamic, AI-generated search-optimized modules. This will allow ZipyTiny to capture high-volume academic and professional search traffic, convert casual searchers into registered active workspace users, and position ZipyTiny as the premier authority in generative-engine citations.

---

## User Problem

1. **Passive Learning Overwhelm:** Students, researchers, and professional learners have access to endless online video lectures and long PDF textbooks, but they struggle to actively absorb, recall, or test their knowledge on this material.
2. **Shallow AI Tools:** Existing tool results on search engines are dominated by low-utility "summarizers" that simply spit out walls of text without any pedagogical structure, spaced repetition, active recall quizzes, or visual mind maps.
3. **Fragmented Learning Workflows:** Users must jump between one tool for video transcription, another for flashcard creation, and another for interactive tutoring, increasing friction and reducing retention.

---

## Business Objective

1. **Lower CAC via Organic Growth:** Maximize natural search acquisition by ranking for transactional keyword intents like "Convert YouTube lecture to quiz" and "Make active recall flashcards from PDF slides."
2. **Increase Free-to-Trial Activation:** Guide users from a high-intent public tool entry point seamlessly into the immersive ZipyTiny workspace environment.
3. **Establish Topical Authority:** Turn ZipyTiny into an E-E-A-T benchmark (Experience, Expertise, Authoritativeness, Trustworthiness) by embedding learning science structures directly inside our public landing pages.

---

## Personas

### 1. Prepped Patricia (The Medical Student)
* **Needs:** Needs to quickly ingest complex 2-hour medical pathology lecture videos and slides, generate high-quality active recall flashcards for exam review, and test her understanding of anatomical relations.
* **Goal:** Maximize study speed, minimize manual deck-building effort, and review cards based on solid spaced repetition rules.

### 2. Lifelong Leo (The Professional Developer)
* **Needs:** Wants to parse 50-page technical whitepapers, architectural design documents, or video tutorials on system scaling, get an instant conceptual overview, and interact with an AI Tutor to clarify advanced edge cases.
* **Goal:** Rapidly acquire skills for on-the-job execution without reading endless pages of filler content.

---

## User Journey

```
+---------------------------------------------------------------------------------+
| 1. High-Intent Entry                                                            |
|    - User searches for "convert YouTube lecture into interactive quiz" on       |
|      Google/Perplexity. Finds ZipyTiny's dedicated public summarizer page.     |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| 2. Interactive Public Value Capture                                             |
|    - Lands on an ultra-clean, high-contrast, fast-loading public page.          |
|    - Pastes a YouTube link or drops a sample PDF.                               |
|    - The page displays a premium, real-time structured overview, sample         |
|      flashcards, and a generated mini-quiz.                                     |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| 3. The Seamless Call-to-Action (Gate-to-Workspace)                              |
|    - To interact with the full AI Tutor, expand the Mind Map, or save the       |
|      flashcard deck, the user is prompted with an elegant signup modal.         |
|    - One-click Google Sign-in instantly builds their premium Workspace.         |
+---------------------------------------------------------------------------------+
```

---

## Functional Requirements

### 1. Public Multi-Intent Landing Pages
* **FR-1.1:** Build three distinct SEO-optimized public landing routes:
  1. `/tools/youtube-lecture-summarizer`
  2. `/tools/pdf-study-guide-generator`
  3. `/tools/interactive-ai-tutor`
* **FR-1.2:** Every public landing page must include:
  * A clear, high-contrast hero section with an input field (URL paste / PDF drag-and-drop).
  * A visually engaging explanation of how the technology converts dry data into active workspaces.
  * A structured FAQ module using clean HTML semantic headings.
  * An "Interactive Play Sandbox" where users can see a live, styled sample of a completed workspace (Summary, Mind Map preview, sample Flashcards, active Quiz).

### 2. Conversational Q&A / Accordion Module
* **FR-2.1:** Render interactive accordion components for FAQs.
* **FR-2.2:** Each FAQ accordion header must use semantic `H3` elements.
* **FR-2.3:** FAQ answers must contain rich text supporting bolding, semantic lists, and outbound links to authority learning-science papers (e.g., studies on active recall and spacing effects).

### 3. Factual Citation Display
* **FR-3.1:** Any AI-generated summary on the public or workspace preview screens must feature discrete hoverable citation tokens (e.g., `[01:24]`, `[Page 4]`).
* **FR-3.2:** Clicking a citation must navigate the user directly to the exact video timestamp or highlight the page coordinates in the document source panel.

### 4. Direct Workspace Onboarding
* **FR-4.1:** After typing a URL or uploading a file in the public sandbox, users click a premium primary button: `Generate AI Workspace`.
* **FR-4.2:** Show a multi-stage status indicator during processing: `Analyzing source...` -> `Structuring Knowledge Graph...` -> `Building interactive active-recall suite...`.
* **FR-4.3:** Upon completion, present the preview. To unlock full editing, exporting, AI chatting, and mind-map adjustments, prompt the user with a seamless signup dialog (`Sign up in 3 seconds to save this workspace`).

---

## Non-functional Requirements

* **NFR-1 (Performance):** Page load speed for public landing routes must be optimized to achieve a Lighthouse performance score of `>95` (LCP < 2s).
* **NFR-2 (Accessibility):** All custom dropdowns, inputs, and interactive accordions must be keyboard navigable, support focus styling, and use descriptive ARIA attributes.
* **NFR-3 (Responsive Integrity):** Fluid, mobile-first design scaling from 320px ultra-small phones to wide desktop monitors. Minimum click target size of 44px on mobile screens.

---

## User Stories

### US-1: public YouTube paste
As a **student preparing for exam prep**,  
I want to **paste a YouTube video URL into a dedicated public summarizer tool**,  
So that I can **instantly see what topics are covered, view structured summaries, and attempt active recall questions without creating an account first**.

### US-2: Interactive AI Tutor public trial
As a **professional learner**,  
I want to **view a demo conversation with the AI Tutor on the public homepage**,  
So that I can **understand how the tutor explains complex ideas simply using the Feynman technique before I sign up**.

---

## Acceptance Criteria

### AC-1: Public Tool Input and Processing (YouTube Route)
* **Given** a visitor navigates to `/tools/youtube-lecture-summarizer`,
* **When** they paste a valid YouTube URL and click "Generate AI Workspace",
* **Then** show an animated multi-stage loading status indicator.
* **And** once processed, render the static sample active workspace preview containing summaries, key concepts, and 3 sample quiz questions.

### AC-2: Interactive FAQs accessibility
* **Given** a visitor navigates to any public tool landing page,
* **When** they press the `TAB` key to navigate to the FAQ section,
* **Then** they must be able to focus, open, and close each accordion item using only the keyboard (`ENTER` or `SPACE` keys).
* **And** the focused item must display a clear high-contrast outline.

---

## Analytics

Track the following events inside our analytics stream:
* `seo_landing_viewed`: Triggers on landing page load. Attributes: `page_type` (youtube, pdf, tutor).
* `public_generation_initiated`: Triggers when the user inputs a URL/file and clicks generate on a public route.
* `public_generation_completed`: Triggers when the sandbox preview renders successfully.
* `conversion_dialog_shown`: Triggers when the registration gate is presented to the user.
* `user_activated_from_seo`: Triggers when the user registers/logs in after starting on an SEO public route.

---

## Risks

* **System Abuse (Spam Generations):** Unauthenticated public visitors could trigger excessive API requests, spiking Gemini token costs.
  * *Mitigation:* Implement backend IP-based rate-limiting on the public sandbox route. Limit public previews to 3 free generations per day.
* **Cold Starts:** Server-side functions compiling transcripts might delay initial response, triggering a bounce.
  * *Mitigation:* Cache public demo workspaces for popular, pre-analyzed educational YouTube URLs so that the response is instantaneous for standard high-traffic links.

---

## Dependencies

1. **SEO & GEO Engineer Guidelines:** Requires semantic keyword mapping, precise target search intents, and JSON-LD schema layouts to ensure the frontend markup aligns with indexing parameters.
2. **Software Architect System Routing:** Requires clean URL path planning, static routing configurations, and dynamic meta-tag insertion mechanisms.

---

## Success Metrics

* **Conversion Rate (Visitor to Registered User):** Target >10% of visitors from the public summarizer pages register a free account.
* **Page Speed Compliance:** Lighthouse Mobile Performance >= 90, Desktop >= 95.
* **User Engagement:** Average session time on `/tools/*` pages is >2 minutes, verifying that the interactive sandbox is holding user interest.

---

## Definition of Done

* [ ] Fully written and detailed PRD, reviewed and approved by the Project Director.
* [ ] All functional requirements have clear, measurable given/when/then acceptance criteria.
* [ ] Edge cases (rate limiting, malformed inputs, processing errors) are documented.
* [ ] Accessibility, performance, and SEO criteria are explicitly stated.
* [ ] Handoff to Software Architect completed.

---

## Handoff

**Handoff to:** [SOFTWARE_ARCHITECT.md]  
The Software Architect is directed to review this PRD and design the file structures, metadata models, dynamic routing patterns, and data schemas required to support these public routes and sandboxes.
