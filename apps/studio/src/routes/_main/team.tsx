import { createFileRoute } from '@tanstack/react-router'
import { TeamPageSkeleton } from '@/features/orgs/components/team-page-skeleton'
import { TeamMembersClient } from '@/features/team/components/team-members-client'
import { useTeam } from '@/features/team/hooks/use-team'
import { teamQueryOptions } from '@/features/team/query-options'

export const Route = createFileRoute('/_main/team')({
  component: TeamPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQueryOptions()),
  pendingComponent: TeamPageSkeleton,
})

function TeamPage() {
  const { data, refetch } = useTeam()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <TeamMembersClient
        team={data.team}
        members={data.members}
        pendingInvites={data.pendingInvites}
        currentUserRole={data.currentUserRole}
        currentUserId={data.currentUserId}
        onAction={refetch}
      />
    </main>
  )
}
