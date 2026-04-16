---
title: "Localisation in ValGuide"
---

This document summarizes the main localisation models relevant to ValGuide, their trade-offs, and the recommended approach for museum guide authoring.

## Options, Trade-Offs, And Recommended Approach

---

## The problem space

ValGuide is a **domain-specific CMS for museums**, not a general-purpose CMS.
Museum guides are:

* Long-form, narrative content
* Often audio-first
* Translated and reviewed **per language**, often by different people
* Published with high sensitivity to correctness and tone

Localisation is therefore not just a technical concern — it shapes how confidently museums can work.

---

## The three common localisation models (as seen in CMSs)

### Option 1 — Field-level localisation

*(Sanity, Contentful)*

Each translatable field contains values for multiple languages side-by-side.

**Strengths**

* Easy comparison across languages
* Good for short, structured fields
* Works well for marketing sites, product data, UI strings

**Weaknesses**

* Quickly becomes overwhelming
* Breaks writing flow for long text
* Feels like spreadsheet work
* Poor fit for audio-first or narrative content

**Assessment for ValGuide**
❌ Not suitable as the primary model
Museum creators don’t think in fields — they think in texts, scripts, and stories.

---

### Option 2 — Document-level localisation (locale toggle)

*(Strapi)*

Each language is a separate editing context. The entire document switches language.

**Strengths**

* Calm, focused authoring
* Matches how translators and curators work
* Scales well to long text and audio
* Clear mental model: *“I’m editing German now”*

**Weaknesses**

* Harder to compare languages inline
* Requires a good overview to see what’s missing

**Assessment for ValGuide**
✅ Strong fit
This matches museum workflows and supports confidence when editing.

---

### Option 3 — Hybrid (both models)

*(Sanity supports this at schema level)*

Different fields or documents can use different localisation strategies.

**Strengths**

* Extremely flexible
* Powerful for CMS architects

**Weaknesses**

* Complex to understand
* Easy to misuse
* Requires training and governance

**Assessment for ValGuide**
❌ Too complex for your audience
Museums should not have to choose localisation strategies.

---

## Recommendation for ValGuide (clear and opinionated)

### ✅ Choose **document-level localisation** as the primary and visible model

This means:

* One language at a time in the editor
* A clear language switcher
* No side-by-side multilingual fields while editing

This enforces a **focused, low-stress authoring experience** that mirrors real museum work.

---

## How ValGuide should implement this (the plan)

### 1. Editing experience (Edit Guide / Edit Stop)

* Use a **language toggle** at the top
* The entire editor switches language
* All content shown belongs to the active language
* Media, audio, and long text are authored per language

Mental model:

> “This is the German version of the guide.”

---

### 2. Overview page (this is critical)

Because you don’t show all languages in the editor, the **Overview page compensates**.

For each language, show:

* Language name
* Title (or “Untitled”)
* State:

  * Empty
  * Incomplete
  * Ready
  * Published (later)
* Optional last-updated info

This lets teams:

* See progress without editing
* Delegate translation work
* Decide when something is publishable

---

### 3. Publishing model (aligned with Bloomberg Connects)

Follow the unified publishing pattern (see status-model.md and unified-tour-publish.md):

* **Guide Status**: Published / Unpublished / Archived
* **Language State**: Published / Unpublished with "Changed" indicator

**What "Publish" does from Edit Guide:**

1. Publishes the **active language's translation**
2. Publishes **global guide aspects**: structure, settings, assets
3. Publishes **all stop translations** in the active language

**Stops are published with the guide:**

* One click publishes everything — guide and all its stops
* If a stop is shared across multiple guides, its content is updated everywhere
* This follows Bloomberg Connects' atomic publishing model
* The stop editor shows "Used in X guides" to indicate shared stops

Publishing:

* Never unpublishes live content while editing
* Replaces the published version only when explicitly publishing

---

### 4. Future-proofing (without exposing complexity)

Internally, you can still support:

* Field-level localisation for small metadata later (e.g. tags)
* Per-language publishing

But:

* This is not user-selectable
* Not exposed as a choice
* Not part of the core mental model

---

## The guiding principle (the one to trust)

> **If content is written, read, or recorded end-to-end, localisation should change the document — not the fields.**

This is why:

* General CMSs must offer everything
* ValGuide should offer **one calm, opinionated path**

---

## Final takeaway

* Field-level localisation optimises for **comparison**
* Document-level localisation optimises for **authorship**
* Museums need authorship far more than comparison

---

## Alignment with status-model.md

**Note on Overview page states:** The "Empty / Incomplete / Ready" states mentioned in section 2 are **out of scope** for the current implementation. Per status-model.md § Explicit Non-Goals, translation completeness and progress tracking are not part of the current model.

The Overview page should show:
* Language name
* Title (or "Untitled")
* **Published** or **Unpublished** indicator only

This may be revisited in future iterations.
