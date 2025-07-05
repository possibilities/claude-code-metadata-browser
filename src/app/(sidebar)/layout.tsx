import { cookies } from 'next/headers'
import { SidebarProvider } from '@/components/ui/sidebar'

export default async function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
}
