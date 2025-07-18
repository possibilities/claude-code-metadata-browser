import {
  getProjects,
  getSessionsForProject,
  getEntriesForSession,
  getProjectInfo,
} from '../../../../actions'
import { AppSidebar } from '@/components/app-sidebar'
import { EventsList } from '@/components/events-list'
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
import type { Metadata } from 'next'

interface SessionPageProps {
  params: Promise<{
    projectPath: string
    sessionId: string
  }>
}

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { projectPath, sessionId } = await params
  const projects = await getProjects()

  const project = projects.find(p => {
    const parts = p.cwd.split('/')
    const path = parts.slice(-2).join('-')
    return path === projectPath
  })

  const projectName = project
    ? project.cwd.split('/').slice(-2).join('/')
    : projectPath

  return {
    title: `Events | ${projectName} | ${sessionId.split('-')[0]} | Claude Code Metadata Browser`,
  }
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { projectPath, sessionId } = await params
  const projects = await getProjects()

  const project = projects.find(p => {
    const parts = p.cwd.split('/')
    const path = parts.slice(-2).join('-')
    return path === projectPath
  })

  if (!project) {
    return <div>Project not found</div>
  }

  const sessions = await getSessionsForProject(project.cwd)
  const entries = await getEntriesForSession(project.cwd, sessionId)
  const projectInfo = await getProjectInfo(project.cwd)
  const isWorktree = project.cwd.includes('worktree')
  const projectName = project.cwd.split('/').slice(-2).join('/')

  return (
    <>
      <AppSidebar projects={projects} sessions={sessions} />
      <SidebarInset className='flex-1 min-w-0'>
        <header className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2'>
          <div className='flex items-center gap-4'>
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/events'>Events</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/events/${projectPath}`}>
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
              sessionType='events'
              isWorktree={isWorktree}
            />
            {entries.length === 0 ? (
              <div className='text-center text-muted-foreground py-8'>
                No entries found for this session
              </div>
            ) : (
              <EventsList entries={entries} />
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
