import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FolderGit2,
  GitBranch,
  MessageSquare,
  Webhook,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import type { ProjectInfo } from '@/app/actions'

interface SessionHeaderProps {
  projectName: string
  projectPath: string
  sessionId: string
  projectInfo: ProjectInfo
  entryCount: number
  sessionType: 'chats' | 'events'
  isWorktree: boolean
}

export function SessionHeader({
  projectName,
  projectPath,
  sessionId,
  projectInfo,
  entryCount,
  sessionType,
  isWorktree,
}: SessionHeaderProps) {
  const displayName = projectInfo.name || projectName
  const ProjectIcon = isWorktree ? GitBranch : FolderGit2
  const SessionIcon = sessionType === 'chats' ? MessageSquare : Webhook
  const otherType = sessionType === 'chats' ? 'events' : 'chats'
  const otherTypeSingular = sessionType === 'chats' ? 'event' : 'chat'

  return (
    <Card className='p-4 mb-4'>
      <div className='flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <ProjectIcon className='h-4 w-4 text-muted-foreground flex-shrink-0' />
          <h2 className='text-lg font-semibold'>{displayName}</h2>
          <Badge variant='secondary' className='text-xs'>
            {isWorktree ? 'Worktree' : 'Project'}
          </Badge>
        </div>
        <div className='flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <SessionIcon className='h-4 w-4' />
            <span>
              {entryCount} {sessionType === 'chats' ? 'message' : 'event'}
              {entryCount !== 1 ? 's' : ''}
            </span>
          </div>
          <Link
            href={`/${otherType}/${projectPath}/${sessionId}`}
            className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            <span>View {otherTypeSingular}</span>
            <ArrowRight className='h-3 w-3' />
          </Link>
        </div>
      </div>
    </Card>
  )
}
