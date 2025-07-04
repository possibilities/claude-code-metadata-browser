export const config = {
  databasePath: process.env.HOOKS_DB_PATH,
}

export function validateConfig() {
  if (!config.databasePath) {
    throw new Error(
      'HOOKS_DB_PATH environment variable is required. Please set it to the path of your hooks.db file.',
    )
  }
}
