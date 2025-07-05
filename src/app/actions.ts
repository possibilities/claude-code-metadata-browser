'use server'

import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { config, validateConfig, validateChatConfig } from '@/lib/config-node'
import { perfLogger } from '@/lib/perf-logger'
import type {
  HookEntry,
  Project,
  Session,
  ChatEntry,
  ChatSession,
} from '@/lib/types'

const projectPathCache = new Map<string, string>()

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
  const cached = projectPathCache.get(projectPath)
  if (cached !== undefined) {
    return cached
  }

  let resolved: string
  if (!isInWorktreesPath(projectPath)) {
    resolved = projectPath
  } else {
    const parentPath = getParentRepositoryPath(projectPath)
    resolved = parentPath || projectPath
  }

  projectPathCache.set(projectPath, resolved)
  return resolved
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
  const dbType = databasePath.includes('chats') ? 'chats' : 'hooks'
  const actionName = `getProjectsGeneric.${dbType}`

  return perfLogger.measure(
    actionName,
    async () => {
      perfLogger.start(`${actionName}.openDb`)
      const db = new Database(databasePath, { readonly: true })
      perfLogger.end(`${actionName}.openDb`)

      try {
        perfLogger.start(`${actionName}.query`)
        const stmt = db.prepare(`
          SELECT cwd, MAX(created) as lastActivity 
          FROM entries 
          GROUP BY cwd 
          ORDER BY lastActivity DESC
        `)
        const results = stmt.all() as { cwd: string; lastActivity: number }[]
        perfLogger.end(`${actionName}.query`, { cwdCount: results.length })

        perfLogger.start(`${actionName}.transform`)
        const projectMap = new Map<
          string,
          { project: Project; lastActivity: number }
        >()

        for (const { cwd, lastActivity } of results) {
          const resolvedPath = resolveProjectPath(cwd)

          if (!isInWorktreesPath(cwd) || resolvedPath === cwd) {
            const parts = resolvedPath.split('/')
            const displayName = parts.slice(-2).join('/')
            const existing = projectMap.get(resolvedPath)

            if (!existing || lastActivity > existing.lastActivity) {
              projectMap.set(resolvedPath, {
                project: { cwd: resolvedPath, displayName },
                lastActivity,
              })
            }
          }
        }

        const result = Array.from(projectMap.values())
          .sort((a, b) => b.lastActivity - a.lastActivity)
          .map(item => item.project)

        perfLogger.end(`${actionName}.transform`, {
          projectCount: result.length,
        })

        return result
      } finally {
        perfLogger.start(`${actionName}.closeDb`)
        db.close()
        perfLogger.end(`${actionName}.closeDb`)
      }
    },
    { dbType },
  )
}

export async function getProjects(): Promise<Project[]> {
  validateConfig()
  return perfLogger.measure('getProjects', async () => {
    return getProjectsGeneric(config.databasePath!)
  })
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
  const dbType = config.databasePath.includes('chats') ? 'chats' : 'hooks'
  const actionName = `getSessionsGeneric.${dbType}`

  return perfLogger.measure(
    actionName,
    async () => {
      perfLogger.start(`${actionName}.openDb`)
      const db = new Database(config.databasePath, { readonly: true })
      perfLogger.end(`${actionName}.openDb`)

      try {
        perfLogger.start(`${actionName}.pathQuery`)
        const stmt = db.prepare('SELECT DISTINCT cwd FROM entries')
        const allPaths = stmt.all() as { cwd: string }[]
        perfLogger.end(`${actionName}.pathQuery`, {
          pathCount: allPaths.length,
        })

        perfLogger.start(`${actionName}.filterPaths`)
        const relevantPaths = allPaths
          .filter(({ cwd }) => resolveProjectPath(cwd) === projectCwd)
          .map(({ cwd }) => cwd)
        perfLogger.end(`${actionName}.filterPaths`, {
          relevantPathCount: relevantPaths.length,
        })

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

        const sql = `
        SELECT DISTINCT
          ${selectFields}
        FROM entries
        WHERE cwd IN (${placeholders})
          AND json_extract(data, '${config.sessionIdField}') IS NOT NULL
        ${groupByClause}
        ORDER BY startTime DESC
      `

        perfLogger.start(`${actionName}.sessionQuery`)
        const sessionStmt = db.prepare(sql)
        const sessions = sessionStmt.all(...relevantPaths) as Array<{
          sessionId: string
          originalCwd: string
          startTime: number
          filepath?: string
        }>
        perfLogger.end(`${actionName}.sessionQuery`, {
          sessionCount: sessions.length,
          projectCwd,
        })

        perfLogger.start(`${actionName}.transform`)
        const result = sessions.map(session => {
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
        perfLogger.end(`${actionName}.transform`)

        return result
      } finally {
        perfLogger.start(`${actionName}.closeDb`)
        db.close()
        perfLogger.end(`${actionName}.closeDb`)
      }
    },
    {
      projectCwd,
      dbType,
    },
  )
}

export async function getSessionsForProject(
  projectCwd: string,
): Promise<Session[]> {
  validateConfig()
  return perfLogger.measure(
    'getSessionsForProject',
    async () => {
      return getSessionsGeneric<Session>(projectCwd, {
        databasePath: config.databasePath!,
        sessionIdField: '$.session_id',
        includeFilepath: false,
      })
    },
    { projectCwd },
  )
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
  const dbType = config.databasePath.includes('chats') ? 'chats' : 'hooks'
  const actionName = `getEntriesGeneric.${dbType}`

  return perfLogger.measure(
    actionName,
    async () => {
      perfLogger.start(`${actionName}.openDb`)
      const db = new Database(config.databasePath, { readonly: true })
      perfLogger.end(`${actionName}.openDb`)

      try {
        perfLogger.start(`${actionName}.pathQuery`)
        const pathStmt = db.prepare('SELECT DISTINCT cwd FROM entries')
        const allPaths = pathStmt.all() as { cwd: string }[]
        perfLogger.end(`${actionName}.pathQuery`, {
          pathCount: allPaths.length,
        })

        perfLogger.start(`${actionName}.filterPaths`)
        const relevantPaths = allPaths
          .filter(({ cwd }) => resolveProjectPath(cwd) === projectCwd)
          .map(({ cwd }) => cwd)
        perfLogger.end(`${actionName}.filterPaths`, {
          relevantPathCount: relevantPaths.length,
        })

        if (relevantPaths.length === 0) return []

        const placeholders = relevantPaths.map(() => '?').join(', ')
        const sql = `
        SELECT * FROM entries
        WHERE cwd IN (${placeholders})
          AND json_extract(data, '${config.sessionIdField}') = ?
        ORDER BY created ${config.orderBy}
      `

        perfLogger.start(`${actionName}.mainQuery`)
        const stmt = db.prepare(sql)
        const entries = stmt.all(...relevantPaths, sessionId) as T[]
        perfLogger.end(`${actionName}.mainQuery`, {
          entryCount: entries.length,
          sessionId,
          projectCwd,
        })

        perfLogger.start(`${actionName}.transform`)
        const result = entries.map(entry => ({
          ...entry,
          cwd: resolveProjectPath(entry.cwd),
        }))
        perfLogger.end(`${actionName}.transform`)

        return result
      } finally {
        perfLogger.start(`${actionName}.closeDb`)
        db.close()
        perfLogger.end(`${actionName}.closeDb`)
      }
    },
    {
      projectCwd,
      sessionId,
      dbType,
    },
  )
}

export async function getEntriesForSession(
  projectCwd: string,
  sessionId: string,
): Promise<HookEntry[]> {
  validateConfig()
  return perfLogger.measure(
    'getEntriesForSession',
    async () => {
      return getEntriesGeneric<HookEntry>(projectCwd, sessionId, {
        databasePath: config.databasePath!,
        sessionIdField: '$.session_id',
        orderBy: 'DESC',
      })
    },
    { projectCwd, sessionId },
  )
}

export async function getChatProjects(): Promise<Project[]> {
  validateChatConfig()
  return perfLogger.measure('getChatProjects', async () => {
    return getProjectsGeneric(config.chatDatabasePath!)
  })
}

export async function getChatSessionsForProject(
  projectCwd: string,
): Promise<ChatSession[]> {
  validateChatConfig()
  return perfLogger.measure(
    'getChatSessionsForProject',
    async () => {
      return getSessionsGeneric<ChatSession>(projectCwd, {
        databasePath: config.chatDatabasePath!,
        sessionIdField: '$.sessionId',
        includeFilepath: true,
      })
    },
    { projectCwd },
  )
}

export async function getChatEntriesForSession(
  projectCwd: string,
  sessionId: string,
): Promise<ChatEntry[]> {
  validateChatConfig()
  return perfLogger.measure(
    'getChatEntriesForSession',
    async () => {
      return getEntriesGeneric<ChatEntry>(projectCwd, sessionId, {
        databasePath: config.chatDatabasePath!,
        sessionIdField: '$.sessionId',
        orderBy: 'ASC',
      })
    },
    { projectCwd, sessionId },
  )
}

export interface ProjectInfo {
  name?: string
  description?: string
}

export async function getProjectInfo(
  projectPath: string,
): Promise<ProjectInfo> {
  return perfLogger.measure(
    'getProjectInfo',
    async () => {
      try {
        const packageJsonPath = join(projectPath, 'package.json')
        if (!existsSync(packageJsonPath)) {
          return {}
        }

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
        return {
          name: packageJson.name,
          description: packageJson.description,
        }
      } catch {
        return {}
      }
    },
    { projectPath },
  )
}
