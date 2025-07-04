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
        const messageContent = data.message?.content || ''

        const truncatedContent =
          messageContent.length > 300
            ? messageContent.slice(0, 300) + '...'
            : messageContent

        return (
          <Card
            key={entry.id}
            className='p-4 cursor-pointer hover:bg-muted/50 transition-colors'
            onClick={() => toggleExpanded(entry.id)}
          >
            <div className='flex items-start justify-between gap-4 mb-2'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={messageRole === 'user' ? 'default' : 'secondary'}
                >
                  {messageRole}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {getRelativeTime(entry.created)}
                </span>
              </div>
              {data.parentUuid && (
                <Badge variant='outline' className='text-xs'>
                  Branch
                </Badge>
              )}
            </div>

            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <pre className='whitespace-pre-wrap text-sm font-mono'>
                {isExpanded ? messageContent : truncatedContent}
              </pre>
            </div>

            {messageContent.length > 300 && (
              <div className='mt-2 text-xs text-muted-foreground'>
                {isExpanded ? 'Click to collapse' : 'Click to expand'}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
