# Architectural Decision Record (ADR): SEO & GEO Discovery Layer

**Document Ref:** ARCH-ADR-2026-07-21-01  
**Project:** Enterprise-Grade Search & Generative Engine Discovery  
**Author:** Software Architect AI, Zipytiny  
**Status:** 🟩 Approved  
**Date:** July 21, 2026  

---

## 1. Context & Problem Statement

ZipyTiny is built as a Single Page Application (SPA) using React, Vite, and client-side routing. While client-side routing provides a seamless desktop-grade user experience for authenticated workspaces, it poses severe challenges for search engine optimization (SEO) and generative engine optimization (GEO):
1. **Crawler Incompatibility:** Many search crawlers (e.g., Bingbot, DuckDuckGo, smaller LLM scraper spiders) do not execute heavy client-side Javascript or wait for asynchronous API calls to finish before indexing. They will index a blank container shell or static placeholder titles.
2. **Dynamic Meta Tags:** Social sharing crawlers (Open Graph, Twitter/X cards) inspect raw server-rendered HTML headers exclusively. They do not execute Javascript at all, preventing dynamic, client-side metadata updates from showing up.
3. **Performance Overhead:** Dynamically compiling schemas on the client-side adds to CPU execution threads, hurting Core Web Vitals performance indicators like Interaction to Next Paint (INP).

We need an architecture that supports high-performance public landing pages, dynamically injects pristine SEO/GEO metadata headers, serves validated Schema.org JSON-LD microdata, and keeps page load times exceptionally low.

---

## 2. Proposed Architecture & System Design

To solve the client-rendering issues while maintaining our unified React/Vite codebase, we will utilize a hybrid backend routing approach using our Express development server:

```
                  +-----------------------------------+
                  |          Web Request              |
                  |  (e.g., /tools/youtube-summarizer) |
                  +-----------------------------------+
                                    |
                                    v
                  +-----------------------------------+
                  |          Express Server           |
                  |     - Parses incoming route       |
                  |     - Selects metadata config     |
                  +-----------------------------------+
                                    |
                  +-----------------+-----------------+
                  |                                   |
                  v                                   v
        [Static Client-Side SPA]           [Dynamic Metadata Injection]
        - Loads React bundle               - Reads base index.html
        - Handles dynamic sandbox UI       - Injects title, meta, canonical
        - Drives client interactions       - Injects JSON-LD <script> tags
                  |                                   |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------------------------+
                  |      Hydrated Browser Response    |
                  |  - Complete crawlable metadata    |
                  |  - Fast responsive client bundle  |
                  +-----------------------------------+
```

---

## 3. Dynamic Metadata & Schema Injection Engine

The Backend Engineer will implement a server-side interceptor middleware in `server.ts`. When a public route under `/tools/*` is requested, the Express server will:
1. Intercept the request before serving the static `index.html`.
2. Load a lightweight, memory-cached configuration map containing the metadata and JSON-LD schemas for that specific route.
3. Perform a rapid string-replacement on the `<head>` placeholders inside the `index.html` stream.
4. Serve the fully-populated, pre-indexed HTML directly to the scraper or web client.

### Server-Side Injection Pattern (Express Server Middleware)
```typescript
// server.ts (Interception Example)
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

const SEO_CONFIGS: Record<string, { title: string; desc: string; schema: object }> = {
  '/tools/youtube-lecture-summarizer': {
    title: 'AI YouTube Lecture Summarizer & Workspace | Zipytiny',
    desc: 'Turn any YouTube video or lecture into a structured learning workspace instantly. Generate high-quality summaries, active-recall flashcards, and quizzes.',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ZipyTiny AI YouTube Lecture Summarizer",
      "url": "https://zipytiny.com/tools/youtube-lecture-summarizer",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All"
    }
  }
  // Add other routes...
};

app.get('/tools/*', (req, res, next) => {
  const route = req.path;
  const config = SEO_CONFIGS[route];
  
  if (!config) {
    return next(); // Fallback to standard static routing
  }
  
  const indexHtmlPath = path.join(process.cwd(), 'dist', 'index.html');
  fs.readFile(indexHtmlPath, 'utf8', (err, html) => {
    if (err) return next(err);
    
    // Inject custom headers dynamically before serving
    let modifiedHtml = html
      .replace('<title>Zipytiny</title>', `<title>${config.title}</title>`)
      .replace(
        '<meta name="description" content="" />',
        `<meta name="description" content="${config.desc}" />`
      )
      .replace(
        '</head>',
        `<script type="application/ld+json">${JSON.stringify(config.schema)}</script>\n<link rel="canonical" href="https://zipytiny.com${route}" />\n</head>`
      );
      
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedHtml);
  });
});
```

---

## 4. Public Sandbox Client Architecture

To protect production database limits and lower Gemini API cost overheads, the public preview interactive sandboxes will utilize a dual-mode data resolver:
* **Demo Mode (Default):** Popular educational video and text examples (e.g., "Intro to Neural Networks", "Calculus Limits") will be fully pre-compiled and served from static JSON files in `/src/data/demos/*`. This eliminates slow AI generation times and zero-token usage for 90% of casual search traffic.
* **Live Generation Mode (Throttled):** When a user inputs a custom URL/file, they invoke a lightweight public backend API `/api/public/generate` protected by strict IP rate-limiting (e.g., maximum 3 generations per IP address per day).

---

## 5. File & Directory Additions

To implement this design, we will structure the file and component hierarchy as follows:

```
/src/
  ├── components/
  │   └── seo/
  │       ├── SeoHeroSection.tsx       # Universal Hero Input Component
  │       ├── SeoSandboxWorkspace.tsx  # Dynamic interactive sandbox preview
  │       ├── SeoFaqAccordion.tsx     # Semantic H3 accordion for FAQ schemas
  │       └── SeoFeatureBento.tsx      # High-speed product value visualization
  ├── pages/
  │   └── tools/
  │       ├── YoutubeSummarizerPage.tsx # Route: /tools/youtube-lecture-summarizer
  │       ├── PdfGeneratorPage.tsx      # Route: /tools/pdf-study-guide-generator
  │       └── AiTutorPage.tsx           # Route: /tools/interactive-ai-tutor
  └── data/
      └── demos/
          ├── computer-science.json     # Cached, high-quality, cited workspace data
          └── biology-slides.json       # Pre-rendered PDF study material data
```

---

## 6. Core Web Vitals & Bundle Optimization

To ensure our public pages stay under the strict performance budgets (Lighthouse Performance >95):
1. **Dynamic Imports & Code-Splitting:** The private workspace routes and heavy libraries (like `recharts` and complex PDF parsers) will be dynamically imported via standard React lazy-loading (`React.lazy`). This ensures that visitors landing on our public SEO pages only download a tiny fraction of the bundle (<120kb initial JS load).
2. **CSS Delivery:** Tailwind CSS compiles utility-first classes statically at build-time. We will guarantee zero client-side CSS recalculation overhead.

---

## 7. Security & API Defenses

* **CORS Whitelisting:** The `/api/public/generate` endpoints will restrict requests strictly to origin `https://zipytiny.com` and our local development domains.
* **Strict Parameter Checking:** Any input URL pasted into the YouTube Summarizer will be verified against strict regex patterns to prevent arbitrary server-side request forgery (SSRF) attempts.

---

## 8. Definition of Done

* [ ] Approved ADR document committed to the project.
* [ ] Routing, dynamic metadata injection, and pre-rendering mechanism defined.
* [ ] Rate-limiting configurations and sandbox demo mode rules validated.
* [ ] Code-splitting boundaries established to protect public-facing bundle sizes.
* [ ] Document signed off by the Project Director.

---

## 9. Handoff

**Handoff to:** [FRONTEND_ENGINEER.md] & [BACKEND_ENGINEER.md]  
The Frontend and Backend Engineers are directed to begin simultaneous development:
* **Frontend:** Implement the semantic layout pages under `/src/pages/tools/*` and create the shared bento grids and accessible accordion components.
* **Backend:** Deploy the middleware metadata injection engine in `server.ts` and set up sitemap compilation routes.
