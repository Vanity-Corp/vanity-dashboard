import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Images, Boxes, Building2, Users2,
  Newspaper, Briefcase, Quote, Tags, Inbox, UserCheck, Settings, LogOut, ChevronRight,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth.store'
import { getInitials } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { useBranding } from '@/hooks/use-branding'
import { AdminProfileDialog } from '@/components/dashboard/AdminProfileDialog'

// Grouped navigation for the Vanity dashboard. `section` matches
// lib/nav-sections.ts / the backend's NAV_SECTIONS — an item is hidden
// entirely (not just disabled) when the user's role doesn't grant canView.
type NavItem = { title: string; href: string; icon: typeof LayoutDashboard; section: string }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Général',
    items: [
      { title: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, section: 'dashboard' },
      { title: 'Pages', href: '/dashboard/pages', icon: FileText, section: 'pages' },
      { title: 'Média', href: '/dashboard/media', icon: Images, section: 'media' },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { title: 'Services', href: '/dashboard/services', icon: Boxes, section: 'services' },
      { title: 'Clients', href: '/dashboard/clients', icon: Building2, section: 'clients' },
      { title: 'Équipe', href: '/dashboard/team', icon: Users2, section: 'team' },
      { title: 'Articles', href: '/dashboard/articles', icon: Newspaper, section: 'articles' },
      { title: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase, section: 'portfolio' },
      { title: 'Témoignages', href: '/dashboard/testimonials', icon: Quote, section: 'testimonials' },
      { title: 'Tarifs', href: '/dashboard/pricing', icon: Tags, section: 'pricing' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { title: 'Demandes', href: '/dashboard/submissions', icon: Inbox, section: 'submissions' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { title: 'Membres', href: '/dashboard/members', icon: UserCheck, section: 'members' },
      { title: 'Paramètres', href: '/dashboard/settings', icon: Settings, section: 'settings' },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { data: branding } = useBranding()
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(href)
  }

  const canViewSection = (section: string) => {
    if (!user) return false
    const access = user.role?.sections.find((s) => s.section === section)
    return !!(access?.canView || access?.canEdit)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg shrink-0 bg-primary text-primary-foreground font-semibold text-sm">
                  {branding?.dashboardLogoUrl ? (
                    <img src={branding.dashboardLogoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    'V'
                  )}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">
                    {branding?.dashboardTitle || 'Vanity Dashboard'}
                  </span>
                  <span className="text-xs text-muted-foreground">Administration</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canViewSection(item.section))
          if (visibleItems.length === 0) return null
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                        <Link to={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <ModeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto py-2"
              tooltip="Profil"
              onClick={() => setProfileOpen(true)}
            >
              <Avatar className="size-8 shrink-0">
                {user?.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
                <AvatarFallback className="text-xs">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="font-medium text-sm truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <Badge variant="secondary" className="w-fit text-xs py-0">
                  {user?.role?.name ?? ''}
                </Badge>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground shrink-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive"
              tooltip="Déconnexion"
            >
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
      <AdminProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </Sidebar>
  )
}
