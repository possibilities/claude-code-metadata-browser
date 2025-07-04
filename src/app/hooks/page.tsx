import { getProjects } from '../actions'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Home() {
  const projects = await getProjects()

  return (
    <>
      <AppSidebar projects={projects} />
      <SidebarInset>
        <header className='flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger />
            <h1 className='text-lg font-semibold'>Hooks Log Viewer</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className='p-4'>
          <div className='max-w-[1400px] mx-auto'>
            <div className='text-center py-8 text-muted-foreground'>
              <p className='text-lg mb-2'>Select a project to get started</p>
              <p className='text-sm'>
                Choose a project from the sidebar to view its hook logs
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
