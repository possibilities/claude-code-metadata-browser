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
    <Card className='p-6 mb-4'>
      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <ProjectIcon className='h-5 w-5 text-muted-foreground' />
          <h2 className='text-2xl font-semibold'>{displayName}</h2>
          <Badge variant='secondary' className='text-xs'>
            {isWorktree ? 'Worktree' : 'Project'}
          </Badge>
        </div>
        {projectInfo.description && (
          <p className='text-muted-foreground'>{projectInfo.description}</p>
        )}
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
