import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background relative'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      <main className='flex items-center justify-center p-8 min-h-screen'>
        <div className='grid gap-6 md:grid-cols-2 max-w-2xl w-full'>
          <Link href='/events' className='block'>
            <Card className='h-full transition-colors hover:bg-accent cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-2xl'>Events</CardTitle>
                <CardDescription>
                  Lifecycle events from Claude Code sessions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href='/chats' className='block'>
            <Card className='h-full transition-colors hover:bg-accent cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-2xl'>Chats</CardTitle>
                <CardDescription>
                  Chat transcripts aggregated by project
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
