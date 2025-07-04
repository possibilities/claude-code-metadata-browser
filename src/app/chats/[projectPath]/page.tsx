import { getChatProjects, getChatSessionsForProject } from '../../actions'
import { ChatsAppSidebar } from '@/components/chats-app-sidebar'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

interface ProjectPageProps {
  params: Promise<{
    projectPath: string
  }>
}

export default async function ChatsProjectPage({ params }: ProjectPageProps) {
  const { projectPath } = await params
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

  return (
    <>
      <ChatsAppSidebar projects={projects} sessions={sessions} />
      <SidebarInset>
        <header className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger />
            <h1 className='text-lg font-semibold'>Chats Viewer</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className='p-4'>
          <div className='max-w-[1400px] mx-auto'>
            <div className='text-center py-8 text-muted-foreground'>
              <p className='text-lg mb-2'>Select a session</p>
              <p className='text-sm'>
                Choose a chat session from the sidebar to view the conversation
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
