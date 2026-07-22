'use client'

import {
  Briefcase,
  CalendarClock,
  FileText,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  PanelLeft,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  badge?: number
  /** For the unified submissions views: which `type` filter this entry represents. */
  submissionType?: 'contact' | 'quote' | 'reservation'
}

export const AdminSidebar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSubmissionType = searchParams.get('where[type][equals]')
  const [collapsed, setCollapsed] = useState(false)
  const [counts, setCounts] = useState({ devis: 0, emails: 0, reservations: 0 })

  useEffect(() => {
    let mounted = true

    const loadCounts = async () => {
      try {
        const response = await fetch('/api/admin/notifications', { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as { devis: number; emails: number; reservations: number }
        if (mounted) {
          setCounts({
            devis: data.devis ?? 0,
            emails: data.emails ?? 0,
            reservations: data.reservations ?? 0,
          })
        }
      } catch {
        // no-op: keep default zero counters if fetch fails
      }
    }

    void loadCounts()
    const interval = setInterval(loadCounts, 30_000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // Opening a submissions tab acknowledges its notifications: clear the badge
  // immediately (optimistic) and mark that type's submissions read on the server.
  const countKeyByType: Record<'contact' | 'quote' | 'reservation', 'emails' | 'devis' | 'reservations'> = {
    contact: 'emails',
    quote: 'devis',
    reservation: 'reservations',
  }

  const markTypeRead = (type: 'contact' | 'quote' | 'reservation') => {
    setCounts((prev) => ({ ...prev, [countKeyByType[type]]: 0 }))
    void fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
      cache: 'no-store',
    }).catch(() => {
      // no-op: the 30s poll will re-sync if this fails
    })
  }

  const navItems: NavItem[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/collections/team-members', icon: Users, label: 'Vaniteam' },
    { href: '/admin/collections/articles', icon: Newspaper, label: 'Articles' },
    { href: '/admin/collections/pages', icon: FileText, label: 'Pages' },
    { href: '/admin/collections/clients', icon: Briefcase, label: 'Clients' },
    { href: '/admin/collections/media', icon: Image, label: 'Média' },
    {
      href: '/admin/collections/submissions?where[type][equals]=quote',
      icon: MessageSquareQuote,
      label: 'Devis',
      badge: counts.devis,
      submissionType: 'quote',
    },
    {
      href: '/admin/collections/submissions?where[type][equals]=contact',
      icon: Inbox,
      label: 'Emails',
      badge: counts.emails,
      submissionType: 'contact',
    },
    {
      href: '/admin/collections/submissions?where[type][equals]=reservation',
      icon: CalendarClock,
      label: 'Réservation',
      badge: counts.reservations,
      submissionType: 'reservation',
    },
  ]

  return (
    <aside
      className={cn(
        'twp sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#0b0d15] text-white transition-all duration-200',
        collapsed ? 'w-24' : 'w-80',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        {!collapsed && (
          <span className="text-3xl font-bold tracking-tight">
            <img src="\assets\vanity_corp_logo.svg" className="w-52" />
          </span>
        )}
        <button
          className="rounded-lg border border-white/20 p-2 hover:bg-white/10"
          onClick={() => setCollapsed((c) => !c)}
          type="button"
        >
          <PanelLeft className={cn('size-6 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isSubmissionsView = pathname === '/admin/collections/submissions'
          const isActive = item.submissionType
            ? isSubmissionsView && activeSubmissionType === item.submissionType
            : item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.submissionType) markTypeRead(item.submissionType)
              }}
              className={cn(
                'flex items-center gap-4 rounded-xl px-4 py-3 text-xl font-semibold transition',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/85 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon className="size-6" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && typeof item.badge === 'number' && item.badge > 0 ? (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-sm">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div
          className={cn(
            'mb-2 flex items-center gap-3 rounded-xl px-3 py-2',
            collapsed && 'justify-center',
          )}
        >
          <Inbox className="size-5" />
          {!collapsed && <span className="text-base">Notifications</span>}
        </div>
        <a
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-base hover:bg-white/10',
            collapsed && 'justify-center',
          )}
          href="/admin/logout"
        >
          <LogOut className="size-5" />
          {!collapsed && <span>Déconnexion</span>}
        </a>
      </div>
    </aside>
  )
}
