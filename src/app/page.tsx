import { getHookEntries } from './actions'
import { HooksList } from '@/components/hooks-list'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Home() {
  const entries = await getHookEntries()

  return (
    <main className='min-h-screen p-4'>
      <div className='fixed top-4 right-4 z-50'>
        <ThemeToggle />
      </div>
      <div className='max-w-[1400px] mx-auto'>
        <HooksList entries={entries} />
      </div>
    </main>
  )
}
