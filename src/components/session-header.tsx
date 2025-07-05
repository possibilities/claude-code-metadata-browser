import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderGit2, GitBranch, MessageSquare, Webhook } from 'lucide-react'
import type { ProjectInfo } from '@/app/actions'

interface SessionHeaderProps {
  projectName: string
  projectInfo: ProjectInfo
  entryCount: number
  sessionType: 'chats' | 'hooks'
  isWorktree: boolean
}

export function SessionHeader({
  projectName,
  projectInfo,
  entryCount,
  sessionType,
  isWorktree,
}: SessionHeaderProps) {
  const displayName = projectInfo.name || projectName
  const ProjectIcon = isWorktree ? GitBranch : FolderGit2
  const SessionIcon = sessionType === 'chats' ? MessageSquare : Webhook

  return (
    <Card className='p-4 mb-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <ProjectIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
          <h2 className='text-lg font-semibold'>{displayName}</h2>
          <Badge variant='secondary' className='text-xs'>
            {isWorktree ? 'Worktree' : 'Project'}
          </Badge>
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <SessionIcon className='h-4 w-4' />
          <span>
            {entryCount} {sessionType === 'chats' ? 'message' : 'event'}
            {entryCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Card>
  )
}
