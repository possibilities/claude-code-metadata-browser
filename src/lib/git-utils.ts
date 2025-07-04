import { execSync } from 'child_process'
import { config } from './config'

export function isInWorktreesPath(projectPath: string): boolean {
  if (!config.worktreesPath) return false
  return projectPath.startsWith(config.worktreesPath)
}

export function getParentRepositoryPath(worktreePath: string): string | null {
  try {
    const gitDir = execSync('git rev-parse --absolute-git-dir', {
      cwd: worktreePath,
      encoding: 'utf8',
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

export function resolveProjectPath(projectPath: string): string {
  if (!isInWorktreesPath(projectPath)) {
    return projectPath
  }

  const parentPath = getParentRepositoryPath(projectPath)
  return parentPath || projectPath
}
