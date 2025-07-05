import { resolve } from 'path'

function expandTilde(filepath: string | undefined): string | undefined {
  if (!filepath) return filepath
  if (filepath === '~') {
    const home = process.env.HOME
    if (!home) {
      throw new Error(
        'HOME environment variable is required when using tilde (~) in paths.',
      )
    }
    return home
  }
  if (filepath.startsWith('~/')) {
    const home = process.env.HOME
    if (!home) {
      throw new Error(
        'HOME environment variable is required when using tilde (~) in paths.',
      )
    }
    return resolve(home, filepath.slice(2))
  }
  return filepath
}

export const config = {
  databasePath: expandTilde(process.env.HOOKS_DB_PATH),
  chatDatabasePath: expandTilde(process.env.CHATS_DB_PATH),
  worktreesPath: expandTilde(process.env.WORKTREES_PATH),
}

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

export function validateEnvironment() {
  const pathsUsingTilde = [
    process.env.HOOKS_DB_PATH,
    process.env.CHATS_DB_PATH,
    process.env.WORKTREES_PATH,
  ].some(path => path === '~' || path?.startsWith('~/'))

  if (pathsUsingTilde && !process.env.HOME) {
    throw new Error(
      'HOME environment variable is required when using tilde (~) in paths.',
    )
  }
}

export function validateConfig() {
  validateEnvironment()
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
  validateEnvironment()
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
