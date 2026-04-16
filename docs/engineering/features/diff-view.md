---
title: "Draft vs Published Diff View"
---

Compare draft changes against published content before publishing.

## Overview

The diff view feature helps editors see exactly what will change when they publish. It reduces publishing anxiety and helps translators identify content changes.

## How It Works

### Field-Level Indicators

When editing a tour or stop, fields that have changed since the last publish show a colored indicator next to the label:

- **Amber dot** — Field has changed from the published version
- **Green dot** — Field is new (locale was never published)

### Compare Changes Button

In the form header, a "Compare Changes" button shows when there are unpublished changes:

- Click to toggle diff view mode
- Shows count of changed fields (e.g., "2 changes")
- Keyboard shortcut: **Cmd/Ctrl + D**

### Inline Diff Display

When diff view is enabled:

- Changed text fields show word-level differences
- <span style="background: rgba(0,200,0,0.2)">Additions in green</span>
- <span style="background: rgba(200,0,0,0.2); text-decoration: line-through">Deletions in red with strikethrough</span>
- The diff replaces the input field (read-only while viewing diff)

### State Persistence

The diff view preference is saved to localStorage, so it persists across sessions.

## Supported Fields

### Tour Editor
- Title
- Description

### Stop Editor
- Title
- Description
- Transcription (data available, UI not yet rendered)

## Edge Cases

| State | Behavior |
|-------|----------|
| Never published | All fields shown as "new" (green indicator) |
| No changes | "No changes since last publish" message, no toggle shown |
| Published tab active | Diff toggle disabled (only available in draft mode) |

## Technical Details

### Server Functions

```typescript
// Tour locale diff
compareTourLocaleDiffFn({ data: { nanoId, locale } })
// Returns: { hasChanges, changedFields, fieldDiffs, publishedAt }

// Stop locale diff  
compareStopLocaleDiffFn({ data: { nanoId, locale } })
// Returns: { hasChanges, changedFields, fieldDiffs, publishedAt }
```

### React Hook

```typescript
const { 
  diffEnabled,      // boolean - is diff mode active
  setDiffEnabled,   // toggle diff mode
  changedCount,     // number of changed fields
  getFieldDiff,     // get diff data for a specific field
  publishedAt,      // when locale was last published
} = useDiffView({ type: 'tour', nanoId, locale })
```

### Components

| Component | Purpose |
|-----------|---------|
| `ChangedFieldIndicator` | Colored dot indicator |
| `DiffToggle` | Button to toggle diff mode |
| `InlineDiff` | Word-level diff display |
| `DiffFieldLabel` | Label wrapper with indicator |
| `TourMetadataFormWithDiff` | Tour form with diff support |
| `StopLocaleEditorWithDiff` | Stop form with diff support |

## Related Documentation

- [Publishing Overview Architecture](../../design/ux/publishing-overview-architecture.md)
- [Publishing](../content-model/publishing.md)
