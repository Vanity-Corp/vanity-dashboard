'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import {
  Briefcase,
  CalendarClock,
  DollarSign,
  FileText,
  FolderKanban,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Navigation,
  Newspaper,
  PanelBottom,
  PanelLeft,
  Users,
} from 'lucide-react'

type NavItem = {
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
}

const navItems: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/collections/pages', icon: FileText, label: 'Pages' },
  { href: '/admin/collections/services', icon: Briefcase, label: 'Services' },
  { href: '/admin/collections/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/admin/collections/testimonials', icon: MessageSquareQuote, label: 'Testimonials' },
  { href: '/admin/collections/team-members', icon: Users, label: 'Team Members' },
  { href: '/admin/collections/pricing-packages', icon: DollarSign, label: 'Pricing' },
  { href: '/admin/collections/leads', icon: Inbox, label: 'Leads' },
  { href: '/admin/collections/studio-bookings', icon: CalendarClock, label: 'Bookings' },
  { href: '/admin/collections/articles', icon: Newspaper, label: 'Articles' },
  { href: '/admin/collections/media', icon: Image, label: 'Media' },
  { href: '/admin/globals/navigation', icon: Navigation, label: 'Navigation' },
  { href: '/admin/globals/footer', icon: PanelBottom, label: 'Footer' },
]

export const AdminSidebar = () => {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const activeItem = useMemo(
    () =>
      navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
        ?.label,
    [pathname],
  )

  return (
    <aside
      className={cn(
        'twp sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-all duration-200',
        collapsed ? 'w-18' : 'w-72',
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <div
          className={cn('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center')}
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <PanelLeft className="size-4" />
          </div>
          {!collapsed && <span className="truncate text-sm font-semibold">Vanity Admin</span>}
        </div>

        <button
          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setCollapsed((current) => !current)}
          type="button"
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      {!collapsed && (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          Sidebar rebuilt with the shadcn sidebar style and lucide icons.
        </p>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <li key={item.href}>
                <Link
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                    collapsed && 'justify-center',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <a
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center',
          )}
          href="/admin/logout"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="size-4" />
          {!collapsed && <span>Logout</span>}
        </a>
        {!collapsed && activeItem ? (
          <p className="mt-2 px-2 text-xs text-muted-foreground">Current: {activeItem}</p>
        ) : null}
      </div>
    </aside>
  )
}
