import { useLocation } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { NAV_SECTIONS } from '@/lib/nav-sections'
import { NotificationsBell } from '@/components/dashboard/NotificationsBell'
import { GlobalSearch } from '@/components/dashboard/GlobalSearch'

function labelForPath(pathname: string): string {
  if (pathname === '/dashboard') return "Vue d'ensemble"
  const match = NAV_SECTIONS.find((s) => pathname.startsWith(`/dashboard/${s.key}`))
  return match?.label ?? 'Page'
}

export function AppHeader() {
  const { pathname } = useLocation()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mr-1" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{labelForPath(pathname)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch />
        <NotificationsBell />
      </div>
    </header>
  )
}
