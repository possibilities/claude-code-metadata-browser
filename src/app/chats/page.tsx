import { getChatProjects } from '../actions'
import { ChatsAppSidebar } from '@/components/chats-app-sidebar'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function ChatsHome() {
  const projects = await getChatProjects()

  return (
    <>
      <ChatsAppSidebar projects={projects} />
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
              <p className='text-lg mb-2'>Select a project to get started</p>
              <p className='text-sm'>
                Choose a project from the sidebar to view its chat sessions
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
