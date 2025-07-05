export interface HookEntry {
  id: string
  data: string
  cwd: string
  created: number
}

export interface Project {
  cwd: string
  displayName: string
}

export interface Session {
  sessionId: string
  projectCwd: string
  startTime: number
}

export interface ChatEntry {
  id: string
  data: string
  cwd: string
  filepath: string
  created: number
}

export interface ChatSession {
  sessionId: string
  projectCwd: string
  startTime: number
  filepath: string
}
