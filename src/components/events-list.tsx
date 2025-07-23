'use client'

import { getRelativeTime } from '@/lib/utils'
import type { EventEntry } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EventsListProps {
  entries: EventEntry[]
}

export function EventsList({ entries }: EventsListProps) {
  return (
    <div className='space-y-3'>
      {entries.map(entry => {
        let parsedData
        try {
          parsedData = JSON.parse(entry.data)
        } catch {
          parsedData = entry.data
        }

        const eventName = parsedData?.hook_event_name || 'unknown'
        const toolName = parsedData?.tool_name || 'unknown'
        const showToolName =
          eventName === 'PreToolUse' || eventName === 'PostToolUse'

        return (
          <Card key={entry.id} className='p-4 gap-4'>
            <div className='flex items-center justify-between mb-0.5'>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>{eventName}</Badge>
                {showToolName && <Badge variant='secondary'>{toolName}</Badge>}
              </div>
              <span className='text-xs text-muted-foreground'>
                {getRelativeTime(entry.created)}
              </span>
            </div>
            <pre className='whitespace-pre text-sm font-mono overflow-x-auto'>
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </Card>
        )
      })}
    </div>
  )
}
