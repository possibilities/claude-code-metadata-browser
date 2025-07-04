'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRelativeTime } from '@/lib/utils'
import type { ChatEntry } from '@/app/actions'

interface ChatsListProps {
  entries: ChatEntry[]
}

export function ChatsList({ entries }: ChatsListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className='space-y-3'>
      {entries.map(entry => {
        const data = JSON.parse(entry.data)
        const isExpanded = expandedIds.has(entry.id)
        const messageRole = data.message?.role || data.type

        // Format JSON data for display
        const fullJson = JSON.stringify(data, null, 2)
        const jsonLines = fullJson.split('\n')
        const truncatedJson =
          jsonLines.length > 10
            ? jsonLines.slice(0, 10).join('\n') + '\n...'
            : fullJson

        return (
          <Card
            key={entry.id}
            className='p-4 cursor-pointer hover:bg-muted/50 transition-colors'
            onClick={() => toggleExpanded(entry.id)}
          >
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
              {isExpanded ? fullJson : truncatedJson}
            </pre>

            <div className='mt-2 text-xs text-muted-foreground'>
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
