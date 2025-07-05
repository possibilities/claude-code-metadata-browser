import { getProjects, getSessionsForProject } from '../../../actions'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

interface ProjectPageProps {
  params: Promise<{
    projectPath: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectPath } = await params
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

  return (
    <>
      <AppSidebar projects={projects} sessions={sessions} />
      <SidebarInset>
        <header className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger />
            <h1 className='text-lg font-semibold'>Events</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className='flex items-center justify-center min-h-[calc(100vh-57px)]'>
          <div className='text-center text-muted-foreground'>
            <p className='text-lg mb-2'>Select a session</p>
            <p className='text-sm'>
              Choose a session from the sidebar to view its entries
            </p>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
