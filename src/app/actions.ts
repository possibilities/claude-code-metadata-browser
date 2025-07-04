'use server'

import Database from 'better-sqlite3'

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

export async function getHookEntries(): Promise<HookEntry[]> {
  const db = new Database('/home/mike/.claude/hooks.db', { readonly: true })

  try {
    const stmt = db.prepare('SELECT * FROM entries ORDER BY created DESC')
    const entries = stmt.all() as HookEntry[]
    return entries
  } finally {
    db.close()
  }
}

export async function getProjects(): Promise<Project[]> {
  const db = new Database('/home/mike/.claude/hooks.db', { readonly: true })

  try {
    const stmt = db.prepare('SELECT DISTINCT cwd FROM entries ORDER BY cwd')
    const results = stmt.all() as { cwd: string }[]

    return results.map(({ cwd }) => {
      const parts = cwd.split('/')
      const displayName = parts.slice(-2).join('/')
      return { cwd, displayName }
    })
  } finally {
    db.close()
  }
}

export async function getSessionsForProject(
  projectCwd: string,
): Promise<Session[]> {
  const db = new Database('/home/mike/.claude/hooks.db', { readonly: true })

  try {
    const stmt = db.prepare(`
      SELECT DISTINCT 
        json_extract(data, '$.session_id') as sessionId,
        cwd as projectCwd,
        MIN(created) as startTime
      FROM entries 
      WHERE cwd = ? 
        AND json_extract(data, '$.session_id') IS NOT NULL
      GROUP BY sessionId
      ORDER BY startTime DESC
    `)
    const sessions = stmt.all(projectCwd) as Session[]
    return sessions
  } finally {
    db.close()
  }
}

export async function getEntriesForSession(
  projectCwd: string,
  sessionId: string,
): Promise<HookEntry[]> {
  const db = new Database('/home/mike/.claude/hooks.db', { readonly: true })

  try {
    const stmt = db.prepare(`
      SELECT * FROM entries 
      WHERE cwd = ? 
        AND json_extract(data, '$.session_id') = ?
      ORDER BY created DESC
    `)
    const entries = stmt.all(projectCwd, sessionId) as HookEntry[]
    return entries
  } finally {
    db.close()
  }
}
