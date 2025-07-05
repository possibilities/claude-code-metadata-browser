import {
  getChatProjects,
  getChatSessionsForProject,
  getChatEntriesForSession,
  getProjectInfo,
} from '../../../../actions'
import { ChatsAppSidebar } from '@/components/chats-app-sidebar'
import { ChatsList } from '@/components/chats-list'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { SessionHeader } from '@/components/session-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface SessionPageProps {
  params: Promise<{
    projectPath: string
    sessionId: string
  }>
}

export default async function ChatsSessionPage({ params }: SessionPageProps) {
  const { projectPath, sessionId } = await params
  const projects = await getChatProjects()

  const project = projects.find(p => {
    const parts = p.cwd.split('/')
    const path = parts.slice(-2).join('-')
    return path === projectPath
  })

  if (!project) {
    return <div>Project not found</div>
  }

  const sessions = await getChatSessionsForProject(project.cwd)
  const entries = await getChatEntriesForSession(project.cwd, sessionId)
  const projectInfo = await getProjectInfo(project.cwd)
  const isWorktree = project.cwd.includes('worktree')
  const projectName = project.cwd.split('/').slice(-2).join('/')

  return (
    <>
      <ChatsAppSidebar projects={projects} sessions={sessions} />
      <SidebarInset className='flex-1 min-w-0'>
        <header className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2'>
          <div className='flex items-center gap-4'>
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/chats'>Chats</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/chats/${projectPath}`}>
                    {projectName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <span className='font-mono text-xs'>
                      {sessionId.slice(0, 8)}...
                    </span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>
        <main className='p-4'>
          <div>
            <SessionHeader
              projectName={projectName}
              projectPath={projectPath}
              sessionId={sessionId}
              projectInfo={projectInfo}
              entryCount={entries.length}
              sessionType='chats'
              isWorktree={isWorktree}
            />
            {entries.length === 0 ? (
              <div className='text-center text-muted-foreground py-8'>
                No messages found for this session
              </div>
            ) : (
              <ChatsList entries={entries} />
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
