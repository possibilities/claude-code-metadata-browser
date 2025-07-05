'use server'

export const runtime = 'nodejs'

import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import { config, validateConfig, validateChatConfig } from '@/lib/config-node'
import type {
  HookEntry,
  Project,
  Session,
  ChatEntry,
  ChatSession,
} from '@/lib/types'

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

async function getProjectsGeneric(databasePath: string): Promise<Project[]> {
  const db = new Database(databasePath, { readonly: true })

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

export async function getProjects(): Promise<Project[]> {
  validateConfig()
  return getProjectsGeneric(config.databasePath!)
}

interface SessionQueryConfig {
  databasePath: string
  sessionIdField: string
  includeFilepath?: boolean
}

async function getSessionsGeneric<T extends Session | ChatSession>(
  projectCwd: string,
  config: SessionQueryConfig,
): Promise<T[]> {
  const db = new Database(config.databasePath, { readonly: true })

  try {
    const stmt = db.prepare('SELECT DISTINCT cwd FROM entries')
    const allPaths = stmt.all() as { cwd: string }[]

    const relevantPaths = allPaths
      .filter(({ cwd }) => resolveProjectPath(cwd) === projectCwd)
      .map(({ cwd }) => cwd)

    if (relevantPaths.length === 0) return []

    const placeholders = relevantPaths.map(() => '?').join(', ')
    const selectFields = config.includeFilepath
      ? `json_extract(data, '${config.sessionIdField}') as sessionId,
         filepath,
         cwd as originalCwd,
         MIN(created) as startTime`
      : `json_extract(data, '${config.sessionIdField}') as sessionId,
         cwd as originalCwd,
         MIN(created) as startTime`

    const groupByClause = config.includeFilepath
      ? 'GROUP BY sessionId, filepath'
      : 'GROUP BY sessionId'

    const sessionStmt = db.prepare(`
      SELECT DISTINCT
        ${selectFields}
      FROM entries
      WHERE cwd IN (${placeholders})
        AND json_extract(data, '${config.sessionIdField}') IS NOT NULL
      ${groupByClause}
      ORDER BY startTime DESC
    `)

    const sessions = sessionStmt.all(...relevantPaths) as Array<{
      sessionId: string
      originalCwd: string
      startTime: number
      filepath?: string
    }>

    return sessions.map(session => {
      const baseSession = {
        sessionId: session.sessionId,
        projectCwd: projectCwd,
        startTime: session.startTime,
      }

      if (config.includeFilepath) {
        return { ...baseSession, filepath: session.filepath } as T
      }

      return baseSession as T
    })
  } finally {
    db.close()
  }
}

export async function getSessionsForProject(
  projectCwd: string,
): Promise<Session[]> {
  validateConfig()
  return getSessionsGeneric<Session>(projectCwd, {
    databasePath: config.databasePath!,
    sessionIdField: '$.session_id',
    includeFilepath: false,
  })
}

interface EntryQueryConfig {
  databasePath: string
  sessionIdField: string
  orderBy: 'ASC' | 'DESC'
}

async function getEntriesGeneric<T extends HookEntry | ChatEntry>(
  projectCwd: string,
  sessionId: string,
  config: EntryQueryConfig,
): Promise<T[]> {
  const db = new Database(config.databasePath, { readonly: true })

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
        AND json_extract(data, '${config.sessionIdField}') = ?
      ORDER BY created ${config.orderBy}
    `)

    const entries = stmt.all(...relevantPaths, sessionId) as T[]
    return entries.map(entry => ({
      ...entry,
      cwd: resolveProjectPath(entry.cwd),
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
  return getEntriesGeneric<HookEntry>(projectCwd, sessionId, {
    databasePath: config.databasePath!,
    sessionIdField: '$.session_id',
    orderBy: 'DESC',
  })
}

export async function getChatProjects(): Promise<Project[]> {
  validateChatConfig()
  return getProjectsGeneric(config.chatDatabasePath!)
}

export async function getChatSessionsForProject(
  projectCwd: string,
): Promise<ChatSession[]> {
  validateChatConfig()
  return getSessionsGeneric<ChatSession>(projectCwd, {
    databasePath: config.chatDatabasePath!,
    sessionIdField: '$.sessionId',
    includeFilepath: true,
  })
}

export async function getChatEntriesForSession(
  projectCwd: string,
  sessionId: string,
): Promise<ChatEntry[]> {
  validateChatConfig()
  return getEntriesGeneric<ChatEntry>(projectCwd, sessionId, {
    databasePath: config.chatDatabasePath!,
    sessionIdField: '$.sessionId',
    orderBy: 'ASC',
  })
}
