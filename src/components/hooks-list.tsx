'use client'

import { useState, useMemo } from 'react'
import { getRelativeTime } from '@/lib/utils'
import type { HookEntry } from '@/app/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HooksListProps {
  entries: HookEntry[]
}

export function HooksList({ entries }: HooksListProps) {
  const [selectedCwd, setSelectedCwd] = useState<string>('all')

  const cwds = useMemo(() => {
    const uniqueCwds = new Set(entries.map(entry => entry.cwd))
    return Array.from(uniqueCwds).sort()
  }, [entries])

  const filteredEntries = useMemo(() => {
    if (selectedCwd === 'all') return entries
    return entries.filter(entry => entry.cwd === selectedCwd)
  }, [entries, selectedCwd])

  return (
    <>
      <div className='mb-6'>
        <Select value={selectedCwd} onValueChange={setSelectedCwd}>
          <SelectTrigger className='w-full font-mono'>
            <SelectValue placeholder='Select a directory' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All directories</SelectItem>
            {cwds.map(cwd => (
              <SelectItem key={cwd} value={cwd}>
                {cwd}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-4'>
        {filteredEntries.map(entry => {
          let parsedData
          try {
            parsedData = JSON.parse(entry.data)
          } catch {
            parsedData = entry.data
          }

          return (
            <Card
              key={entry.id}
              className='group hover:shadow-md transition-shadow'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <Badge variant='secondary' className='font-mono text-xs'>
                    {entry.cwd}
                  </Badge>
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
    </>
  )
}
