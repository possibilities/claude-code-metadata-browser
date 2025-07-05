# Claude Code Metadata Viewer

A viewer for logs created by `claude-code-generic-hooks store` and `claude-code-chat-stream --to-db`

This application displays:

- **Events**: Lifecycle events from Claude Code sessions
- **Chats**: Chat transcripts aggregated by project

See [Claude Code Generic Hooks](https://github.com/possibilities/claude-code-generic-hooks) and [Claude Code Chat Stream](https://github.com/possibilities/claude-code-chat-stream)

## Usage

```
EVENTS_DB_PATH=~/.claude/hooks.db \
CHATS_DB_PATH=~/.claude/chats.db \
WORKTREES_PATH=~/worktrees \
    pnpm run dev
```

Note: `WORKTREES_PATH` defaults to `~/worktrees` if not specified.
