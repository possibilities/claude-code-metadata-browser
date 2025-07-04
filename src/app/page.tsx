'use client'

import { useState, useEffect } from 'react'
import { getHookEntries, getEntriesForSession, type HookEntry } from './actions'
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
        let data: HookEntry[]
        if (selectedProject && selectedSession) {
          data = await getEntriesForSession(selectedProject, selectedSession)
        } else if (selectedProject) {
          const allEntries = await getHookEntries()
          data = allEntries.filter(entry => entry.cwd === selectedProject)
        } else {
          data = await getHookEntries()
        }
        setEntries(data)
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
            ) : entries.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No entries found
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
