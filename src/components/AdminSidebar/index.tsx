'use client'

import { CalendarClock, FileText, Image, Inbox, LayoutDashboard, LogOut, MessageSquareQuote, Newspaper, PanelLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

type NavItem = { href: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; badge?: number }

export const AdminSidebar = () => {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const counts = useMemo(() => ({ devis: 0, emails: 0, reservations: 0 }), [])

  const navItems: NavItem[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/collections/team-members', icon: Users, label: 'Vaniteam' },
    { href: '/admin/collections/articles', icon: Newspaper, label: 'Articles' },
    { href: '/admin/collections/pages', icon: FileText, label: 'Pages' },
    { href: '/admin/collections/media', icon: Image, label: 'Média' },
    { href: '/admin/collections/quote-requests', icon: MessageSquareQuote, label: 'Devis', badge: counts.devis },
    { href: '/admin/collections/leads', icon: Inbox, label: 'Emails', badge: counts.emails },
    { href: '/admin/collections/studio-bookings', icon: CalendarClock, label: 'Réservation', badge: counts.reservations },
  ]

  return (
    <aside className={cn('twp sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#0b0d15] text-white transition-all duration-200', collapsed ? 'w-24' : 'w-80')}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        {!collapsed && <span className="text-3xl font-bold tracking-tight">VANITEAM</span>}
        <button className="rounded-lg border border-white/20 p-2 hover:bg-white/10" onClick={() => setCollapsed((c) => !c)} type="button">
          <PanelLeft className={cn("size-6 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return <Link key={item.href} href={item.href} className={cn('flex items-center gap-4 rounded-xl px-4 py-3 text-xl font-semibold transition', isActive ? 'bg-primary text-primary-foreground' : 'text-white/85 hover:bg-white/10 hover:text-white', collapsed && 'justify-center px-2')}>
            <Icon className="size-6" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && typeof item.badge === 'number' && item.badge > 0 ? <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-sm">{item.badge}</span> : null}
          </Link>
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className={cn('mb-2 flex items-center gap-3 rounded-xl px-3 py-2', collapsed && 'justify-center')}><Inbox className="size-5" />{!collapsed && <span className="text-base">Notifications</span>}</div>
        <a className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-base hover:bg-white/10', collapsed && 'justify-center')} href="/admin/logout"><LogOut className="size-5" />{!collapsed && <span>Déconnexion</span>}</a>
      </div>
    </aside>
  )
}
