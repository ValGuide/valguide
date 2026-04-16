---
title: "Toast Messages"
---

All toast notifications in the Studio app. Last updated: 2026-02-07.

## Tours

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ❌ error | `tours.locales.updateError` | Failed to update languages | tour-editor-context.tsx |
| ✅ success | `tours.publish.success` | Translation published successfully | tour-edit-page.tsx |
| ❌ error | `tours.publish.error` | Failed to publish translation | tour-edit-page.tsx |
| ✅ success | `tours.publish.tourPublished` | Tour published with {stopCount} stops | tours.$nanoId.index.tsx, tour-editor-context.tsx |
| ❌ error | `tours.publish.tourPublishError` | Failed to publish tour | tours.$nanoId.index.tsx, tour-editor-context.tsx |
| ✅ success | `tours.unpublish.success` | Content unpublished | tour-edit-page.tsx, tours.$nanoId.index.tsx |
| ❌ error | `tours.unpublish.error` | Failed to unpublish | tour-edit-page.tsx, tours.$nanoId.index.tsx |
| ✅ success | `tours.discard.success` | Draft discarded | tour-edit-page.tsx |
| ❌ error | `tours.discard.error` | Failed to discard draft | tour-edit-page.tsx |
| ❌ error | `tours.assets.updateError` | Failed to update tour assets | tour-editor-context.tsx |
| ✅ success | `tours.archive.success` | Tour archived successfully | archive-tour-dialog.tsx |
| ❌ error | `tours.archive.error` | Failed to archive tour | archive-tour-dialog.tsx |
| ✅ success | `tours.recover.success` | Tour recovered successfully | recover-tour-dialog.tsx |
| ❌ error | `tours.recover.error` | Failed to recover tour | recover-tour-dialog.tsx |
| ✅ success | `tours.delete.success` | Tour deleted | delete-tour-dialog.tsx |
| ❌ error | `tours.delete.error` | Failed to delete tour | delete-tour-dialog.tsx |
| ✅ success | `tours.locales.updateSuccess` | Languages updated | tours.$nanoId.index.tsx |
| ❌ error | `tours.locales.updateError` | Failed to update languages | tours.$nanoId.index.tsx |

## Tour Slug Settings

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `tours.editor.slug.saveSuccess` | *(slug saved)* | tour-slug-settings.tsx |
| ❌ error | `tours.editor.slug.saveError` | *(slug save failed, or dynamic message)* | tour-slug-settings.tsx |

## Stops

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ❌ error | `stops.locales.updateError` | Failed to update languages | stop-editor-context.tsx |
| ✅ success | `stops.publish.success` | Stop translation published successfully | stop-editor-context.tsx, stop-edit-page.tsx |
| ❌ error | `stops.publish.error` | Failed to publish stop translation | stop-editor-context.tsx, stop-edit-page.tsx |
| ✅ success | `stops.unpublish.success` | Stop translation unpublished | stop-editor-context.tsx |
| ❌ error | `stops.unpublish.error` | Failed to unpublish stop translation | stop-editor-context.tsx |
| ✅ success | `tours.unpublish.success` | Content unpublished | stop-edit-page.tsx |
| ❌ error | `tours.unpublish.error` | Failed to unpublish | stop-edit-page.tsx |
| ✅ success | `tours.discard.success` | Draft discarded | stop-edit-page.tsx |
| ❌ error | `tours.discard.error` | Failed to discard draft | stop-edit-page.tsx |
| ❌ error | `stops.assets.updateError` | Failed to update stop assets | stop-editor-context.tsx |
| ❌ error | `stops.assets.addError` | Failed to add asset to stop | stop-editor-context.tsx |
| ❌ error | `stops.assets.removeError` | Failed to remove asset | stop-editor-context.tsx |
| ✅ success | `stops.actions.removeSuccess` | Stop removed from tour | tour-editor-context.tsx |
| ❌ error | `stops.actions.removeError` | Failed to remove stop | tour-editor-context.tsx |
| ❌ error | `stops.actions.addError` | Failed to add stop | tour-editor-context.tsx |
| ✅ success | `stops.actions.reorderSuccess` | Stops reordered | tour-editor-context.tsx |
| ❌ error | `stops.actions.reorderError` | Failed to reorder stops | tour-editor-context.tsx |

## Common

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `common.saved` | Saved | tour-editor-context.tsx, stop-editor-context.tsx |
| ❌ error | `common.saveError` | Failed to save | tour-editor-context.tsx, stop-editor-context.tsx |
| ❌ error | `common.error` | An error occurred | app-sidebar-container.tsx |

## Assets

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `assets.card.deleteSuccess` | Asset deleted | asset-card.tsx |
| ❌ error | `assets.card.deleteError` | Failed to delete asset | asset-card.tsx |
| ❌ error | `assets.upload.error` | Upload failed | asset-upload-inline.tsx, media-picker.tsx |

## Team

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `team.invite.success` | Invitation sent | team-members-client.tsx |
| ❌ error | `team.invite.inviteError` | Failed to send invitation | team-members-client.tsx |
| ❌ error | `team.removeError` | Failed to remove member | team-members-client.tsx |
| ✅ success | `team.roleUpdateSuccess` | Role updated | team-members-client.tsx |
| ❌ error | `team.roleUpdateError` | Failed to update role | team-members-client.tsx |
| ✅ success | `team.pending.resendSuccess` | Invitation resent | team-members-client.tsx |
| ❌ error | `team.pending.resendError` | Failed to resend invitation | team-members-client.tsx |
| ✅ success | `team.pending.cancelSuccess` | Invitation cancelled | team-members-client.tsx |
| ❌ error | `team.pending.cancelError` | Failed to cancel invitation | team-members-client.tsx |

## Organization

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ❌ error | `orgs.error` | Failed to create team | create-team-dialog.tsx |
| ✅ success | `orgs.teamSettings.saveSuccess` | *(slug saved)* | team-settings.tsx |
| ❌ error | `orgs.teamSettings.saveError` | *(slug save failed, or dynamic message)* | team-settings.tsx |

## Profile

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `profile.actions.updateSuccess` | Profile updated | profile-form.tsx |
| ❌ error | `profile.actions.updateError` | Failed to update profile | profile-form.tsx |

## Design/Themes

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `design.toast.created` | Theme created successfully | theme-customizer-container.tsx |
| ✅ success | `design.toast.updated` | Theme updated successfully | theme-customizer-container.tsx |
| ✅ success | `design.toast.deleted` | Theme deleted successfully | theme-customizer-container.tsx |
| ❌ error | *(dynamic)* | *(error message from server)* | theme-customizer-container.tsx |

## Feedback

| Type | i18n Key | Message (EN) | Location |
|------|----------|--------------|----------|
| ✅ success | `feedback.success` | Thank you for your feedback! | app-sidebar-container.tsx |

---

## Summary

| Category | Success | Error | Total |
|----------|---------|-------|-------|
| Tours | 8 | 8 | 16 |
| Tour Slug | 1 | 1 | 2 |
| Stops | 5 | 9 | 14 |
| Common | 1 | 2 | 3 |
| Assets | 1 | 2 | 3 |
| Team | 4 | 4 | 8 |
| Organization | 1 | 2 | 3 |
| Profile | 1 | 1 | 2 |
| Design | 3 | 1 | 4 |
| Feedback | 1 | 0 | 1 |
| **Total** | **26** | **30** | **56** |

## Changes Since Last Scan

- **Removed**: `tours.locales.updateSuccess` from tour-editor-context.tsx (locale update success toasts removed from editor contexts, kept in route)
- **Removed**: `stops.locales.updateSuccess` from stop-editor-context.tsx
- **Added**: `tours.editor.slug.saveSuccess/saveError` (tour-slug-settings.tsx)
- **Added**: `orgs.teamSettings.saveSuccess/saveError` (team-settings.tsx)
- **Added**: `tours.unpublish.success/error` in tours.$nanoId.index.tsx (route-level unpublish)
- **Added**: `tours.publish.tourPublished` in tour-editor-context.tsx
- **Added**: `tours.discard.success/error` in tour-edit-page.tsx
- **Added**: `stops.unpublish.error` in stop-editor-context.tsx
