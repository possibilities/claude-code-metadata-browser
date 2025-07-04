'use server'

import Database from 'better-sqlite3'

export interface HookEntry {
  id: string
  data: string
  cwd: string
  created: number
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
