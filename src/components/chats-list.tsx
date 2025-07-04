'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRelativeTime } from '@/lib/utils'
import type { ChatEntry } from '@/app/actions'

interface ChatsListProps {
  entries: ChatEntry[]
}

export function ChatsList({ entries }: ChatsListProps) {
  return (
    <div className='space-y-3'>
      {entries.map(entry => {
        const data = JSON.parse(entry.data)
        const messageRole = data.message?.role || data.type
        const fullJson = JSON.stringify(data, null, 2)

        return (
          <Card key={entry.id} className='p-4 gap-4'>
            <div className='flex items-start justify-between gap-4 mb-0.5'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={messageRole === 'user' ? 'default' : 'secondary'}
                >
                  {messageRole}
                </Badge>
                {data.parentUuid && (
                  <Badge variant='outline' className='text-xs'>
                    Branch
                  </Badge>
                )}
              </div>
              <span className='text-xs text-muted-foreground'>
                {getRelativeTime(entry.created)}
              </span>
            </div>

            <pre className='whitespace-pre text-sm font-mono overflow-x-auto'>
              {fullJson}
            </pre>
          </Card>
        )
      })}
    </div>
  )
}
