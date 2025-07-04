import { homedir } from 'os'
import { resolve } from 'path'

function expandTilde(filepath: string | undefined): string | undefined {
  if (!filepath) return filepath
  if (filepath.startsWith('~/')) {
    return resolve(homedir(), filepath.slice(2))
  }
  return filepath
}

export const config = {
  databasePath: expandTilde(process.env.HOOKS_DB_PATH),
  chatDatabasePath: expandTilde(process.env.CHATS_DB_PATH),
  worktreesPath: expandTilde(process.env.WORKTREES_PATH),
}

// Validate all required environment variables at startup
if (!config.databasePath) {
  throw new Error(
    'HOOKS_DB_PATH environment variable is required. Please set it to the path of your hooks.db file.',
  )
}
if (!config.chatDatabasePath) {
  throw new Error(
    'CHATS_DB_PATH environment variable is required. Please set it to the path of your chats.db file.',
  )
}
if (!config.worktreesPath) {
  throw new Error(
    'WORKTREES_PATH environment variable is required. Please set it to the path of your git worktrees directory.',
  )
}

export function validateConfig() {
  if (!config.databasePath) {
    throw new Error(
      'HOOKS_DB_PATH environment variable is required. Please set it to the path of your hooks.db file.',
    )
  }
  if (!config.worktreesPath) {
    throw new Error(
      'WORKTREES_PATH environment variable is required. Please set it to the path of your git worktrees directory.',
    )
  }
}

export function validateChatConfig() {
  if (!config.chatDatabasePath) {
    throw new Error(
      'CHATS_DB_PATH environment variable is required. Please set it to the path of your chats.db file.',
    )
  }
  if (!config.worktreesPath) {
    throw new Error(
      'WORKTREES_PATH environment variable is required. Please set it to the path of your git worktrees directory.',
    )
  }
}
