import {
  getProjects,
  getSessionsForProject,
  getEntriesForSession,
} from '../../../actions'
import { AppSidebar } from '@/components/app-sidebar'
import { HooksList } from '@/components/hooks-list'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
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
  const isWorktree = project.cwd.includes('worktree')
  const projectName = project.cwd.split('/').slice(-2).join('/')

  return (
    <>
      <AppSidebar projects={projects} sessions={sessions} />
      <SidebarInset>
        <header className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2'>
          <div className='flex items-center gap-4'>
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/hooks'>Hooks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/hooks/${projectPath}`}>
                    {projectName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className='flex items-center gap-2'>
                    <span className='font-mono text-xs'>
                      {sessionId.slice(0, 8)}...
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {isWorktree ? 'Worktree' : 'Project'}
                    </Badge>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>
        <main className='p-4'>
          <div className='max-w-[1400px] mx-auto'>
            {entries.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No entries found for this session
              </div>
            ) : (
              <HooksList entries={entries} />
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
