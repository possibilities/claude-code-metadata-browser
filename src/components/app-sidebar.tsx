'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
import type { Project, Session } from '@/lib/types'

interface AppSidebarProps {
  projects: Project[]
  sessions?: Session[]
}

export function AppSidebar({ projects, sessions }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const pathSegments = pathname.split('/').filter(Boolean)

  const projectIndex = pathSegments[0] === 'hooks' ? 1 : 0
  const currentProjectPath = pathSegments[projectIndex] || null

  const currentProject = projects.find(p => {
    const parts = p.cwd.split('/')
    const projectPath = parts.slice(-2).join('-')
    return projectPath === currentProjectPath
  })

  const handleProjectChange = (project: Project) => {
    const parts = project.cwd.split('/')
    const projectPath = parts.slice(-2).join('-')
    router.push(`/hooks/${projectPath}`)
  }

  const handleSessionChange = (sessionId: string) => {
    if (currentProjectPath) {
      router.push(`/hooks/${currentProjectPath}/${sessionId}`)
    }
  }

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
                    onClick={() => handleProjectChange(project)}
                  >
                    <span>{project.displayName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {sessions && sessions.length > 0 && (
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sessions.map(session => (
                  <SidebarMenuItem key={session.sessionId}>
                    <SidebarMenuButton
                      isActive={
                        pathSegments[projectIndex + 1] === session.sessionId
                      }
                      onClick={() => handleSessionChange(session.sessionId)}
                    >
                      <div className='flex flex-col items-start w-full'>
                        <span className='text-sm'>{session.sessionId}</span>
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
      )}
    </Sidebar>
  )
}
