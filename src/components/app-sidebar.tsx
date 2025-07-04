'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getRelativeTime } from '@/lib/utils'
import type { Project, Session } from '@/app/actions'
import { getProjects, getSessionsForProject } from '@/app/actions'

interface AppSidebarProps {
  selectedProject: string | null
  selectedSession: string | null
  onProjectChange: (project: string | null) => void
  onSessionChange: (session: string | null) => void
}

export function AppSidebar({
  selectedProject,
  selectedSession,
  onProjectChange,
  onSessionChange,
}: AppSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    getProjects().then(projectList => {
      setProjects(projectList)
    })
  }, [])

  useEffect(() => {
    if (selectedProject) {
      getSessionsForProject(selectedProject).then(sessionList => {
        setSessions(sessionList)
      })
    }
  }, [selectedProject])

  const currentProject = projects.find(p => p.cwd === selectedProject)

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {currentProject
                    ? currentProject.displayName
                    : 'Select Project'}
                  <ChevronDown className='ml-auto' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-[--radix-popper-anchor-width]'>
                {projects.map(project => (
                  <DropdownMenuItem
                    key={project.cwd}
                    onClick={() => {
                      onProjectChange(project.cwd)
                      onSessionChange(null)
                    }}
                  >
                    <span>{project.displayName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sessions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.map(session => (
                <SidebarMenuItem key={session.sessionId}>
                  <SidebarMenuButton
                    isActive={selectedSession === session.sessionId}
                    onClick={() => onSessionChange(session.sessionId)}
                  >
                    <div className='flex flex-col items-start w-full'>
                      <span className='text-sm truncate max-w-full'>
                        {session.sessionId.slice(0, 8)}...
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {getRelativeTime(session.startTime)}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
