'use client'

import { useState, useEffect } from 'react'
import { getEntriesForSession, type HookEntry } from './actions'
import { HooksList } from '@/components/hooks-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [entries, setEntries] = useState<HookEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true)
      try {
        if (selectedProject && selectedSession) {
          const data = await getEntriesForSession(
            selectedProject,
            selectedSession,
          )
          setEntries(data)
        } else {
          setEntries([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [selectedProject, selectedSession])

  return (
    <>
      <AppSidebar
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        onProjectChange={setSelectedProject}
        onSessionChange={setSelectedSession}
      />
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
            {loading ? (
              <div className='text-center py-8 text-muted-foreground'>
                Loading...
              </div>
            ) : !selectedProject ? (
              <div className='text-center py-8 text-muted-foreground'>
                <p className='text-lg mb-2'>Select a project to get started</p>
                <p className='text-sm'>
                  Choose a project from the sidebar to view its hook logs
                </p>
              </div>
            ) : !selectedSession ? (
              <div className='text-center py-8 text-muted-foreground'>
                <p className='text-lg mb-2'>Select a session</p>
                <p className='text-sm'>
                  Choose a session from the sidebar to view its entries
                </p>
              </div>
            ) : entries.length === 0 ? (
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
