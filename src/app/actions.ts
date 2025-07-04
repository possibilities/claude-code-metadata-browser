'use server'

import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import { config, validateConfig } from '@/lib/config-node'

function isInWorktreesPath(projectPath: string): boolean {
  if (!config.worktreesPath) return false
  return projectPath.startsWith(config.worktreesPath)
}

function getParentRepositoryPath(worktreePath: string): string | null {
  try {
    const gitDir = execSync('git rev-parse --absolute-git-dir', {
      cwd: worktreePath,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim()

    const worktreePattern = /^(.*)\/\.git\/worktrees\//
    const match = gitDir.match(worktreePattern)

    if (match) {
      return match[1]
    }

    return null
  } catch {
    return null
  }
}

function resolveProjectPath(projectPath: string): string {
  if (!isInWorktreesPath(projectPath)) {
    return projectPath
  }

  const parentPath = getParentRepositoryPath(projectPath)
  return parentPath || projectPath
}

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
  validateConfig()
  const db = new Database(config.databasePath!, { readonly: true })

  try {
    const stmt = db.prepare('SELECT * FROM entries ORDER BY created DESC')
    const entries = stmt.all() as HookEntry[]
    return entries.map(entry => ({
      ...entry,
      cwd: resolveProjectPath(entry.cwd),
    }))
  } finally {
    db.close()
  }
}

export async function getProjects(): Promise<Project[]> {
  validateConfig()
  const db = new Database(config.databasePath!, { readonly: true })

  try {
    const stmt = db.prepare('SELECT DISTINCT cwd FROM entries ORDER BY cwd')
    const results = stmt.all() as { cwd: string }[]

    const projectMap = new Map<string, Project>()

    for (const { cwd } of results) {
      const resolvedPath = resolveProjectPath(cwd)

      if (!isInWorktreesPath(cwd) || resolvedPath === cwd) {
        const parts = resolvedPath.split('/')
        const displayName = parts.slice(-2).join('/')
        projectMap.set(resolvedPath, { cwd: resolvedPath, displayName })
      }
    }

    return Array.from(projectMap.values()).sort((a, b) =>
      a.cwd.localeCompare(b.cwd),
    )
  } finally {
    db.close()
  }
}

export async function getSessionsForProject(
  projectCwd: string,
): Promise<Session[]> {
  validateConfig()
  const db = new Database(config.databasePath!, { readonly: true })

  try {
    const stmt = db.prepare('SELECT DISTINCT cwd FROM entries')
    const allPaths = stmt.all() as { cwd: string }[]

    const relevantPaths = allPaths
      .filter(({ cwd }) => resolveProjectPath(cwd) === projectCwd)
      .map(({ cwd }) => cwd)

    if (relevantPaths.length === 0) return []

    const placeholders = relevantPaths.map(() => '?').join(', ')
    const sessionStmt = db.prepare(`
      SELECT DISTINCT
        json_extract(data, '$.session_id') as sessionId,
        cwd as originalCwd,
        MIN(created) as startTime
      FROM entries
      WHERE cwd IN (${placeholders})
        AND json_extract(data, '$.session_id') IS NOT NULL
      GROUP BY sessionId
      ORDER BY startTime DESC
    `)

    const sessions = sessionStmt.all(...relevantPaths) as Array<{
      sessionId: string
      originalCwd: string
      startTime: number
    }>

    return sessions.map(session => ({
      sessionId: session.sessionId,
      projectCwd: projectCwd,
      startTime: session.startTime,
    }))
  } finally {
    db.close()
  }
}

export async function getEntriesForSession(
  projectCwd: string,
  sessionId: string,
): Promise<HookEntry[]> {
  validateConfig()
  const db = new Database(config.databasePath!, { readonly: true })

  try {
    const pathStmt = db.prepare('SELECT DISTINCT cwd FROM entries')
    const allPaths = pathStmt.all() as { cwd: string }[]

    const relevantPaths = allPaths
      .filter(({ cwd }) => resolveProjectPath(cwd) === projectCwd)
      .map(({ cwd }) => cwd)

    if (relevantPaths.length === 0) return []

    const placeholders = relevantPaths.map(() => '?').join(', ')
    const stmt = db.prepare(`
      SELECT * FROM entries
      WHERE cwd IN (${placeholders})
        AND json_extract(data, '$.session_id') = ?
      ORDER BY created DESC
    `)

    const entries = stmt.all(...relevantPaths, sessionId) as HookEntry[]
    return entries.map(entry => ({
      ...entry,
      cwd: resolveProjectPath(entry.cwd),
    }))
  } finally {
    db.close()
  }
}
