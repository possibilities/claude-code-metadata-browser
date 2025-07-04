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

        // Extract text content from message
        let messageContent = ''
        if (data.message?.content) {
          if (typeof data.message.content === 'string') {
            messageContent = data.message.content
          } else if (Array.isArray(data.message.content)) {
            // Handle array of content blocks
            messageContent = data.message.content
              .filter((block: { type: string }) => block.type === 'text')
              .map((block: { type: string; text: string }) => block.text)
              .join('\n')
          }
        }

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
              <pre className='whitespace-pre text-sm font-mono overflow-x-auto'>
                {isExpanded ? JSON.stringify(data, null, 2) : truncatedContent}
              </pre>
            </div>

            <div className='mt-2 text-xs text-muted-foreground'>
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
