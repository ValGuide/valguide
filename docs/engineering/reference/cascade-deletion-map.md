---
title: "Cascade Deletion Map"
---

Reference for all `onDelete` behaviors across schema foreign keys. **Update this file whenever you change `onDelete` behavior in any `schema.ts`.**

## Delete an Organization

All org-owned data is removed:

| Table | Column | Behavior |
|-------|--------|----------|
| `member` | `organizationId` | cascade |
| `invitation` | `organizationId` | cascade |
| `organizationSlug` | `organizationId` | cascade |
| `tour` | `organizationId` | cascade |
| `stop` | `organizationId` | cascade |
| `asset` | `organizationId` | cascade |
| `theme` | `organizationId` | cascade |

Deleting a tour/stop further cascades — see below.

## Delete a Tour

| Table | Column | Behavior |
|-------|--------|----------|
| `tourLocaleDraft` | `tourId` | cascade |
| `tourLocale` | `tourId` | cascade |
| `tourSettingsDraft` | `tourId` | cascade |
| `tourSettings` | `tourId` | cascade |
| `tourStopDraft` | `tourId` | cascade |
| `tourStop` | `tourId` | cascade |
| `tourAssetDraft` | `tourId` | cascade |
| `tourAsset` | `tourId` | cascade |
| `tourSlug` | `tourId` | cascade |

## Delete a Stop

| Table | Column | Behavior |
|-------|--------|----------|
| `stopLocaleDraft` | `stopId` | cascade |
| `stopLocale` | `stopId` | cascade |
| `stopSettingsDraft` | `stopId` | cascade |
| `stopSettings` | `stopId` | cascade |
| `tourStopDraft` | `stopId` | cascade |
| `tourStop` | `stopId` | cascade |
| `stopAssetDraft` | `stopId` | cascade |
| `stopAsset` | `stopId` | cascade |

## Delete an Auth User

User deletion preserves all org-owned content. Columns are set to `null`:

| Table | Column | Behavior |
|-------|--------|----------|
| `member` | `userId` | cascade (removes membership) |
| `invitation` | `inviterId` | cascade (removes invitations they sent) |
| `tour` | `createdBy` | **set null** |
| `tour` | `updatedBy` | **set null** |
| `stop` | `createdBy` | **set null** |
| `stop` | `updatedBy` | **set null** |
| `asset` | `uploadedBy` | **set null** |
| `feedback` | `userId` | **set null** |
| `tourLocaleDraft` | `updatedBy` | set null |
| `tourLocale` | `publishedBy` | set null |
| `stopLocaleDraft` | `updatedBy` | set null |
| `stopLocale` | `publishedBy` | set null |
| `tourSettingsDraft` | `updatedBy` | set null |
| `tourSettings` | `publishedBy` | set null |
| `stopSettingsDraft` | `updatedBy` | set null |
| `stopSettings` | `publishedBy` | set null |
| `tourSlug` | (none) | no user FK |
| `theme` | `createdBy` | set null |

## Design Rationale

Tours, stops, assets, and feedback belong to the **organization**, not to individual users. Deleting a user must never destroy org content. The `set null` approach preserves data while indicating the original author/uploader is no longer in the system.
