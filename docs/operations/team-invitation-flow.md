---
title: "Team Invitation Flow"
---

This document describes the complete Studio workspace invitation flow: creating and managing invitations, email-link acceptance, authenticated in-app discovery, acceptance and decline behavior, and QA coverage.

## Terminology

- **Workspace**: A Better Auth organization stored in `studio.organization`.
- **Member**: A user-to-workspace relationship stored in `studio.member`.
- **Invitation**: A Better Auth organization invitation stored in `studio.invitation`.
- **Active workspace**: The organization selected in the current Better Auth session.
- **Sender**: An owner or admin who creates and manages an invitation.
- **Invitee**: The user whose email address is on the invitation.

Invitation roles are `owner`, `admin`, `curator`, `editor`, and `viewer`. The invitation UI restricts which roles a sender can assign based on the sender's own role.

## End-to-End Overview

```text
Owner/admin sends invitation
  ├─ Better Auth creates a pending invitation with a seven-day expiry
  ├─ Resend sends an email containing /join-team?invitationId=...
  └─ Studio exposes the invitation to the invitee
       ├─ Email-link flow: /join-team validates and accepts it
       └─ In-app flow: modal, sidebar badge, and /invites page
            ├─ Accept: add membership, keep current workspace active
            └─ Decline: mark invitation rejected
```

The sender-facing pending list and all invitee-facing surfaces read the same `studio.invitation` records. Only invitations with `status = 'pending'` that have not expired are actionable.

## Data Model and Invitation States

The invitation table is defined in `packages/core/features/orgs/schema.ts`.

| Field | Purpose |
| --- | --- |
| `id` | UUID used as the `invitationId` in the email link and server actions |
| `organizationId` | Workspace the user is invited to |
| `email` | Intended invitee; matching is case-insensitive in application checks |
| `role` | Role granted when the invitation is accepted |
| `status` | `pending`, `accepted`, `rejected`, or `canceled` |
| `inviterId` | User who sent the invitation |
| `expiresAt` | Expiry timestamp; Better Auth normally sets this to seven days |
| `createdAt` | Creation timestamp |

An invitation is considered pending and actionable when:

- its status is `pending`; and
- `expiresAt` is in the future or is `null`.

Supporting `expiresAt = null` is intentional. It preserves compatibility with invitations created without an expiry timestamp.

Terminal states have these meanings:

| State | Set by | Result |
| --- | --- | --- |
| `accepted` | Invitee acceptance or membership reconciliation | Membership exists; invite no longer appears as pending |
| `rejected` | Invitee clicks **Decline** | Invite no longer appears to the invitee or sender as pending |
| `canceled` | Owner/admin cancels from workspace settings | Email link becomes inactive; invitee cannot accept |

Expired invitations keep their stored status but are excluded from pending queries and cannot be accepted.

## Profile Approval Versus Workspace Membership

Studio profile approval and workspace membership are separate states.

`autoApproveIfEligible` can change a pending profile to approved when the user's email has either:

- a valid pending workspace invitation; or
- an approved email domain.

This approval check is performed while resolving user status. It allows an invited user to enter authenticated Studio routes, but it does not itself create a workspace membership or accept the invitation.

Membership is created separately by:

- accepting through `/join-team`;
- accepting through the in-app modal or `/invites`; or
- protected-session reconciliation when an approved user has no active workspace.

## Sending and Managing Invitations

### Creating an invitation

The sender opens the workspace members settings and selects **Invite member**.

`inviteMemberFn`:

1. Requires an authenticated user.
2. Requires at least the `admin` organization role for the target workspace.
3. Validates the email and requested role.
4. Calls Better Auth `createInvitation`.
5. Captures the `org.invite_sent` product event.

Better Auth creates the invitation with a seven-day expiry. `cancelPendingInvitationsOnReInvite` is enabled, so reinviting the same address supersedes the previous pending invitation rather than leaving multiple active invitations for the same workspace and email.

### Sending the email

Better Auth calls the Studio `sendInvitationEmail` hook. The hook sends the localized `team-invite` template through the shared email package.

The link format is:

```text
{VITE_STUDIO_URL}/join-team?invitationId={invitationId}
```

The email includes the workspace name, inviter identity, and both a button and copyable URL.

In non-production environments without `RESEND_SENDING_API_KEY`, the email package logs a simulated email to the server console. The logged template data includes the invitation URL and can be used for local testing.

### Sender pending-invitation list

Workspace settings load pending invitations with `getPendingInvitationsFn`. Only admins and owners can access this data.

The sender can:

- **Resend**: Better Auth creates/replaces the pending invitation and sends a fresh email. This captures `org.invite_resent`.
- **Cancel**: Better Auth marks the invitation canceled. This captures `org.invite_canceled`.

After either action, the workspace data is refreshed so the pending list reflects the new state.

## Email-Link Flow

The email link opens the public `/join-team` route. Its loader calls `getInvitationDataFn`, which resolves one of these variants:

| Variant | Condition | User experience |
| --- | --- | --- |
| `invalid` | Missing ID, unknown invitation, canceled/rejected invitation, or expired invitation | Explains that the link is inactive and asks the user to request a new invitation |
| `accepted` | Invitation status is already `accepted` | Confirms the user has already joined |
| `public` | Invitation is pending and no user is signed in | Shows workspace and target email, then links to login with a return URL |
| `wrong-account` | A user is signed in, but their email does not match the invitation | Shows both account contexts and offers sign-out |
| `joining` | A matching user is signed in and the invitation is pending | Automatically starts acceptance |

### Authentication redirect

For a signed-out invitee, the login return URL preserves the invitation ID:

```text
/join-team?invitationId={invitationId}
```

After login, the route reloads the invitation and enters the `joining` state when the authenticated email matches.

### Email-link acceptance

The `joining` state calls `joinTeamFn` without a `switchToOrganization` override. The server function therefore uses its email-flow default of `true`.

Shared acceptance logic in `acceptInvitationForUser`:

1. Loads a pending, non-expired invitation.
2. Verifies that the authenticated email matches the invitation email case-insensitively.
3. Checks whether the user is already a member.
4. If not a member, calls Better Auth `acceptInvitation`.
5. If already a member, marks the stale pending invitation accepted without creating a duplicate membership.
6. Sets the invited workspace as active for the current session.
7. Captures `org.joined` with `switched_workspace: true`.

After acceptance, the route invalidates authentication status queries and navigates to the Studio root. The invited workspace is active.

## Authenticated In-App Flow

The in-app flow lets an already authenticated Studio user discover and act on invitations without opening the email.

### Current-user invitation query

`listCurrentUserInvitationsFn` is authenticated and returns pending invitations whose email matches the current user's email case-insensitively.

The query:

- excludes expired invitations;
- includes invitations with no expiry;
- joins workspace and inviter details;
- sorts oldest invitations first; and
- returns only the data needed by invitee UI.

All invitee surfaces use the React Query key:

```text
["current-user-invitations"]
```

The query has a 60-second stale time. It is deliberately not part of protected route bootstrap data.

### Pending-invitations modal

`PendingInvitesModal` is mounted with the authenticated sidebar container.

The modal:

- opens when one or more pending invitations are returned;
- does not open while the user is already on `/invites`;
- displays all currently returned invitations;
- supports Accept and Decline directly;
- links to the durable `/invites` page; and
- can be dismissed without changing invitation state.

Dismissal is client-memory state, keyed by the current ordered invitation IDs. It prevents the same set from reopening repeatedly during that mounted session. A changed invite set can open the modal again, and a full reload can show unresolved invitations again.

### Sidebar item and badge

The sidebar footer shows an **Invites** item above the user card only while the user has pending invitations.

- It links to `/invites`.
- Its badge shows the current pending count.
- The badge uses the same current-user invitation query as the modal and page.
- The entire item disappears after the final invitation is accepted or declined.
- Users with no pending invitations do not spend permanent sidebar space on this transient workflow.

The `/invites` route remains available through direct navigation, bookmarks, and stale open tabs. Its empty state therefore remains valid even though it is not linked from the sidebar when the count is zero.

### `/invites` page

The authenticated `/invites` route ensures the shared invitation query and renders:

- loading placeholders;
- an error state with retry;
- one card per invitation with workspace, inviter, and role;
- Accept and Decline actions; or
- an empty state when no pending invitations remain.

The page is the durable place to rediscover an invitation after dismissing the modal.

### In-app acceptance

The in-app Accept action calls:

```text
joinTeamFn({ invitationId, switchToOrganization: false })
```

It uses the same shared validation and membership logic as the email flow, but does not change the active workspace.

After acceptance:

1. The current-user invitations query is invalidated.
2. Sidebar data is invalidated so workspace membership and invite count refresh.
3. Router data is invalidated.
4. A success toast confirms the joined workspace.
5. The toast offers **Switch workspace**.

If the user selects **Switch workspace**, `switchTeamFn` changes the active organization, clears sidebar query data, and reloads the page. If they do not select it, they remain in their original workspace.

The `org.joined` event records `switched_workspace: false` for the initial in-app acceptance.

### In-app decline

The Decline action:

1. Loads the pending invitation by ID.
2. Verifies that it belongs to the authenticated user's email.
3. Calls Better Auth `rejectInvitation`.
4. Invalidates the current-user invitation and sidebar queries.
5. Shows a success toast.

The rejected invitation disappears from the modal, badge count, `/invites`, and the sender's pending list. Its email link is no longer actionable.

## Active Workspace and Bootstrap Reconciliation

The protected-session bootstrap has pre-existing reconciliation behavior for approved users who do not have an active workspace.

- If an authenticated user already has a valid active workspace, bootstrap does not auto-accept new invitations. The in-app flow presents them for an explicit decision.
- If an approved user has no active workspace, bootstrap may reconcile all valid pending invitations for their email, add the memberships, and select a workspace. This ensures users without any active organization are not stranded outside Studio.

The invite UI query is not added to bootstrap. It remains a separate React Query request used only by the modal, page, and sidebar badge.

## Authorization and Security

- Only users with sufficient workspace role can create, resend, cancel, or list sender-side pending invitations.
- Invitee list, accept, and decline operations require authentication.
- Accept and decline verify the authenticated email against the invitation email.
- Invitation lookup only permits pending, non-expired invitations.
- Better Auth owns membership creation and invitation state transitions.
- Existing membership is handled idempotently; the flow does not create duplicate memberships.
- The requested organization and invitation IDs are validated server-side rather than trusted from UI state.
- A signed-in user cannot use another person's email link to join.

## Cache and UI Consistency

The in-app actions invalidate:

- `["current-user-invitations"]` for modal, page, and badge state;
- `["sidebar"]` for available workspace membership; and
- router data after acceptance.

The explicit invalidation is required because the current-user invitation query has a 60-second stale time. Without it, accepted or declined invitations could remain visible until the query becomes stale.

The email-link flow separately invalidates authentication status queries before navigating because it can change both membership and the active organization.

## Key Files

| Area | File |
| --- | --- |
| Invitation schema | `packages/core/features/orgs/schema.ts` |
| Better Auth organization and email configuration | `packages/core/features/auth/better-auth.server.ts` |
| Create invitation | `packages/core/features/orgs/invite-member.fn.ts` |
| Resend invitation | `packages/core/features/orgs/resend-invite.fn.ts` |
| Cancel invitation | `packages/core/features/orgs/cancel-invite.fn.ts` |
| Sender pending list | `packages/core/features/orgs/get-pending-invitations.server.ts` |
| Public invitation resolution | `packages/core/features/orgs/get-invitation-data.server.ts` |
| Email-link route | `apps/studio/src/routes/join-team.tsx` |
| Shared acceptance logic | `packages/core/features/orgs/accept-invitation.server.ts` |
| Acceptance server function | `packages/core/features/orgs/join-team.fn.ts` |
| Invitee pending list | `packages/core/features/orgs/list-current-user-invitations.fn.ts` |
| Invitee decline function | `packages/core/features/orgs/decline-current-user-invitation.fn.ts` |
| Shared invite query | `apps/studio/src/features/invites/query-options.ts` |
| Modal | `apps/studio/src/features/invites/components/pending-invites-modal.tsx` |
| Invites page | `apps/studio/src/features/invites/components/invites-page.tsx` |
| Shared invite actions | `apps/studio/src/features/invites/components/invites-actions.ts` |
| Sidebar integration | `apps/studio/src/components/app-sidebar-container.tsx` |
| Email template | `packages/email/emails/team-invite-email.tsx` |

## Failure and Recovery Behavior

| Failure | Expected behavior |
| --- | --- |
| Current-user invite query fails | `/invites` shows retry; sidebar count and modal do not invent cached invitation data |
| Accept fails | Invitation remains pending and an error toast is shown |
| Decline fails | Invitation remains pending and an error toast is shown |
| Optional workspace switch fails | Membership remains accepted; current workspace stays active; switch error toast is shown |
| Email delivery is not configured locally | Server logs a simulated email and invite link |
| Invitation expires before action | It disappears from pending surfaces and the email link shows inactive/expired |
| Sender cancels before action | It disappears from pending surfaces and cannot be accepted |
| Invitation was accepted elsewhere | Refetch removes it; reopening the email link shows already accepted |

## How to Test Everything for QA

### Test setup

Prepare:

1. Two browser profiles or an incognito window so sender and invitee sessions remain separate.
2. A sender account that is an owner or admin of workspace **A**.
3. An invitee account with a verified email.
4. Preferably, the invitee should already be a member of workspace **B** so active-workspace preservation can be verified.
5. Access to the invitation email. In local development without Resend credentials, copy the simulated `inviteLink` from the Studio server console.

Use a fresh invitation for each destructive scenario. Do not reuse an invitation after Accept, Decline, Cancel, Resend, or expiry testing.

### 1. Sender creates and manages an invitation

1. Sign in as the sender and open workspace **A** member settings.
2. Confirm owner/admin can see **Invite member**.
3. Invite the invitee email with a non-default role such as Editor.
4. Confirm a success toast appears.
5. Confirm the invitation appears in the sender's pending list with the correct email, role, inviter, and expiry.
6. Confirm an invitation email is delivered or a simulated email is logged.
7. Confirm the email link uses `/join-team?invitationId=...`.
8. Use **Resend invitation**.
9. Confirm a new email/link is produced and only the current pending invitation remains actionable.
10. Create another fresh invitation, click **Cancel invitation**, and confirm it disappears from the pending list.
11. Open the canceled link and confirm it shows the inactive/expired state.

### 2. Email link while signed out

1. Create a fresh invitation.
2. Open its link in a signed-out browser.
3. Confirm the page shows workspace **A**, the invited email, and **Sign in to accept invitation**.
4. Sign in using the invited email.
5. Confirm login returns to the same `/join-team?invitationId=...` URL.
6. Confirm the joining state appears and completes automatically.
7. Confirm the user becomes a member of workspace **A** with the invited role.
8. Confirm workspace **A** becomes the active workspace.
9. Reopen the same link and confirm the already-accepted state.

### 3. Email link with the wrong account

1. Create a fresh invitation for the invitee.
2. Sign in as a different user in the test browser.
3. Open the invitation link.
4. Confirm the page identifies that the signed-in account differs from the invited email.
5. Confirm no membership is created.
6. Use the sign-out action, sign in with the invited email, and confirm acceptance succeeds.

### 4. In-app modal, sidebar badge, and durable page

1. Sign in as the invitee and make workspace **B** active.
2. In the sender session, create a fresh invitation to workspace **A**.
3. In the invitee session, refresh or wait for the invitation query to refetch.
4. Confirm the pending-invitations modal opens outside `/invites`.
5. Confirm the invitation card shows workspace **A**, inviter, and assigned role.
6. Dismiss the modal without acting.
7. Confirm the sidebar **Invites** item appears and shows badge `1`.
8. Navigate around Studio and confirm the dismissed modal does not repeatedly reopen for the unchanged invite set.
9. Open **Invites** from the sidebar.
10. Confirm `/invites` displays the same invitation and the modal does not open over that page.
11. Reload with the invitation unresolved and confirm it remains discoverable.

### 5. In-app acceptance preserves the active workspace

1. Start with workspace **B** active and a pending invite to workspace **A**.
2. Accept the invitation from either the modal or `/invites`.
3. Confirm a success toast names workspace **A**.
4. Confirm the invitation disappears from the list.
5. Confirm the sidebar badge decrements, or the entire Invites item disappears when the count reaches zero.
6. Confirm the user is now a member of workspace **A** with the invited role.
7. Confirm workspace **B** remains active.
8. Confirm workspace **A** is available in the workspace switcher.
9. Click **Switch workspace** in the success toast.
10. Confirm the page reloads with workspace **A** active.

Repeat once without clicking **Switch workspace** and confirm no automatic switch occurs.

### 6. In-app decline

1. Create a fresh invitation.
2. Confirm it appears in the modal, sidebar count, and `/invites`.
3. Click **Decline**.
4. Confirm the success toast appears.
5. Confirm the invitation disappears from all invitee surfaces.
6. Confirm the sender no longer sees it in the pending list.
7. Confirm no membership was created.
8. Open the original email link and confirm it is inactive.

### 7. Multiple invitations

1. Create invitations for the same invitee from two different workspaces.
2. Confirm the modal and `/invites` show both invitations.
3. Confirm the sidebar badge is `2`.
4. Accept one and decline the other.
5. Confirm the count changes after each action and ends at zero.
6. Confirm only the accepted workspace membership exists.
7. Confirm the `/invites` empty state appears.

### 8. Expiry and no-expiry compatibility

These cases require a controlled QA database or fixture tooling.

1. Create an invitation and set `expiresAt` to a past timestamp.
2. Confirm it is absent from sender and invitee pending lists.
3. Confirm its email link shows inactive/expired.
4. Create an otherwise valid pending invitation with `expiresAt = null`.
5. Confirm it appears in sender and invitee pending lists.
6. Confirm it can be accepted.

### 9. Authorization and validation

1. Confirm a user below admin cannot create, resend, cancel, or list sender-side invitations through the UI.
2. If testing APIs directly, confirm the same operations reject insufficient roles.
3. Attempt to accept or decline an invitation while authenticated as a different email.
4. Confirm both operations fail and no invitation or membership state changes.
5. Submit an unknown invitation ID and confirm it fails without exposing invitation details.

### 10. Error and retry states

Using request interception or a controlled failing environment:

1. Fail the current-user invitation query and confirm `/invites` shows the load error and retry control.
2. Restore the request and confirm **Try again** loads invitations.
3. Fail an Accept request and confirm an error toast appears and the invitation remains visible.
4. Fail a Decline request and confirm an error toast appears and the invitation remains visible.
5. Accept successfully, then fail only the optional workspace-switch request.
6. Confirm membership remains accepted, the original workspace remains active, and a switch error toast appears.

### 11. Regression and presentation checks

1. Test desktop and mobile sidebar layouts.
2. Confirm long workspace and inviter names truncate or wrap without covering actions.
3. Confirm Accept and Decline are disabled while an action is in progress.
4. Confirm English, German, and Romansh pages render without missing translation keys.
5. Confirm direct navigation to localized and unlocalized `/invites` routes works.
6. Confirm a user with zero invitations sees no Invites sidebar item, no modal, and the `/invites` empty state when navigating directly.
7. Confirm existing workspace switching, logout, and member-management behavior still works.
8. For a newly registered pending profile, confirm a valid invitation permits profile auto-approval but membership is not present until acceptance or no-active-workspace reconciliation runs.
