---
title: "Publishing & Overview Architecture"
---

This document defines where publishing actions live, what the Tour Overview shows vs the Edit Tour page, and best practices based on industry CMS patterns.

---

## Industry Analysis

| CMS | Publishing Location | Reasoning |
|-----|---------------------|-----------|
| **Sanity** | Edit view (Studio) | Edit → Publish is immediate action |
| **Storyblok** | Edit view (Visual Editor) | Same - contextual to content |
| **Contentful** | Edit view sidebar | Always visible while editing |
| **Bloomberg Connects** | Global header + Edit | "Publish Draft" in header OR edit live directly |
| **Smartify** | Partner Portal CMS | Real-time publishing |

**Conclusion**: Publishing belongs primarily on the **Edit page**, but a **quick-action summary** on Overview improves workflow.

---

## Screen Responsibilities

### Tour Overview (Hub/Dashboard)

The Tour Overview is a **status hub** that shows the current state and provides navigation to detailed editing.

| Shows | Purpose |
|-------|---------|
| ✅ Status badge (Published/Draft/Changed) | Quick visual indicator |
| ✅ **Publish summary panel** with quick action | For ready-to-publish tours |
| ✅ Last published date per locale | When was it last live? |
| ✅ Completeness indicators per locale | Translation status |
| ✅ Translations list with status each | Per-locale badges |
| ✅ Stops list with quick status | How many stops, completion |
| ⚠️ **"Has changes" indicator** (not full diff) | Simple changed badge, not inline diff |
| ✅ Cover image preview | Visual confirmation |
| ✅ Quick links: Edit, Preview, Analytics | Navigation actions |

### Edit Tour (Workspace)

The Edit Tour page is the **primary editing workspace** where content changes happen.

| Shows | Purpose |
|-------|---------|
| ✅ Full editing forms | Content entry |
| ✅ **Primary Publish button** | Main publish action location |
| ✅ Draft/Published tabs | Compare versions |
| ✅ Tour progress checklist | Blocking vs non-blocking items |
| ✅ Language-specific content | Locale editing |
| ✅ Inline editing | Direct manipulation |
| ⚠️ **Side-by-side diff toggle** (optional) | For reviewing changes |
| ✅ Cover image upload | Full editing capability |
| ✅ Save, Publish, Discard | All content actions |

---

## Diff Display Strategy

### Overview Page: Summary Only (No Inline Diff)

The Overview page should **not** show full diffs - this creates visual noise on a dashboard view.

Instead, show:
1. **"Has unpublished changes"** badge per locale (e.g., "Published · Changed")
2. **Changed indicator icons** next to each translation row
3. **"View changes" link** → navigates to Edit view with diff toggle

### Edit Page: Full Diff Capability

The Edit page can offer:
1. **Draft/Published tabs** for switching between views
2. **Optional "Compare" toggle** to show side-by-side or inline diff
3. **Field-level change indicators** (highlight changed fields)

This follows the pattern used by Storyblok ("Changed" badge), Sanity ("edited since published"), and Contentful.

---

## Publishing Flow

```
List Tours → Tour Overview (status hub) → Edit Tour (content editing + publish)
                    ↓                              ↓
           [Quick actions]              [Primary publish location]
           - Edit EN/DE/RM              - Save draft
           - Preview                    - Publish (this locale)
           - Publish ready locales      - Discard changes
```

### Tour Overview Quick Actions

On the Tour Overview, provide:
- **"Publish" button** when there are unpublished changes ready
- Links to edit each locale
- Preview button (view as visitor)
- Archive action

### Edit Tour Primary Actions

On the Edit Tour page (where publishing primarily lives):
- **Primary "Publish" button** in sidebar
- Save (auto-save or manual)
- Discard unpublished changes
- Unpublish (remove from public)

---

## Key Insights from Competitor Analysis

### Bloomberg Connects Pattern

Bloomberg allows editing **either Live OR Draft** with a version switcher:
- You can make quick fixes directly to Live
- Or create a Draft for larger changes
- "Publish Draft" replaces Live with Draft content

ValGuide's Draft/Published tabs in Edit view achieve a similar mental model. Consider adding a global version indicator in the header.

### Storyblok Pattern

Three states clearly shown:
- **Unpublished** (Draft): Never published, preview only
- **Published**: Live on production
- **Changed**: Published but has draft changes

ValGuide should show these same three states clearly.

### Sanity Pattern

Uses `drafts.` prefix in document IDs:
- Always editing draft
- Publish copies draft to published
- "Perspectives" for querying (published vs previewDrafts)

This maps to ValGuide's separate draft/published tables.

---

## Per-Locale Publishing

From our [publishing.md](../../engineering/content-model/publishing.md):

> **Publishing is per-language.** When you click Publish, you publish only the language you're currently editing.

This is a key differentiator from some CMSs that publish all locales together:
- **Contentful**: All locales together (unless premium plan)
- **Storyblok**: Configurable per-locale or all together
- **ValGuide**: Always per-locale (more editorial flexibility)

The Overview should clearly show which locales are published, which have changes, and which are missing.

---

## Implementation Checklist

### Tour Overview Enhancements

- [ ] Add quick Publish button when locales have unpublished changes
- [ ] Show per-locale status badges (Published / Changed / Draft)
- [ ] Show last published timestamp per locale
- [ ] Add "has changes" indicator next to each translation
- [ ] Link to Edit with diff view when changes exist

### Edit Tour Enhancements

- [ ] Implement diff view toggle (compare Draft vs Published)
- [ ] Show field-level change indicators
- [ ] Side-by-side or inline diff option
- [ ] Clear "Discard changes" action

---

## Related Documentation

- [Publishing](../../engineering/content-model/publishing.md) — Core publishing behavior
- [Status Model](../../engineering/content-model/status-model.md) — How status, publishing, and archiving work
- [UX Guide](./ux-guide.md) — General UX principles
