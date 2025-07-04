'use client'

import { getRelativeTime } from '@/lib/utils'
import type { HookEntry } from '@/app/actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HooksListProps {
  entries: HookEntry[]
}

export function HooksList({ entries }: HooksListProps) {
  return (
    <div className='space-y-4'>
      {entries.map(entry => {
        let parsedData
        try {
          parsedData = JSON.parse(entry.data)
        } catch {
          parsedData = entry.data
        }

        const sessionId = parsedData?.session_id

        return (
          <Card
            key={entry.id}
            className='group hover:shadow-md transition-shadow'
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary' className='font-mono text-xs'>
                    {entry.cwd.split('/').slice(-2).join('/')}
                  </Badge>
                  {sessionId && (
                    <Badge variant='outline' className='font-mono text-xs'>
                      Session: {sessionId.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
                <span className='text-sm text-muted-foreground'>
                  {getRelativeTime(entry.created)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <pre className='overflow-x-auto font-mono text-sm leading-relaxed'>
                <code className='text-foreground'>
                  {JSON.stringify(parsedData, null, 2)}
                </code>
              </pre>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
