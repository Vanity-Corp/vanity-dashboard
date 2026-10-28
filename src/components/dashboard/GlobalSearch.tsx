import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Eye, FileText, Boxes, Building2, Users2, Newspaper, Briefcase, Quote, UserCheck, Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { usePermissions } from '@/hooks/use-permissions'
import { PERMISSIONS } from '@/lib/permissions'
import { pagesService } from '@/services/pages.service'
import { servicesService } from '@/services/services.service'
import { clientsService } from '@/services/clients.service'
import { teamService } from '@/services/team.service'
import { articlesService } from '@/services/articles.service'
import { portfolioService } from '@/services/portfolio.service'
import { testimonialsService } from '@/services/testimonials.service'
import { membersService } from '@/services/members.service'
import { submissionsService } from '@/services/submissions.service'

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g'), '')

function matches(q: string, ...fields: (string | null | undefined)[]) {
  const nq = norm(q)
  return fields.some((f) => f && norm(f).includes(nq))
}

// Global search palette: opens from the header, fans out to every resource's
// existing list() call in parallel (client-side filtered — only Members
// supports a real server-side `search` param) and renders grouped results.
// Each resource is a flat list page (no per-item detail route in this app),
// so every row navigates to that resource's list page. Groups are hidden
// entirely when the current user lacks the read permission for that section.
export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)
  const q = debounced.trim()
  const enabled = open && q.length >= 2
  const navigate = useNavigate()
  const { can } = usePermissions()

  const canPages = can(PERMISSIONS.pagesRead)
  const canServices = can(PERMISSIONS.servicesRead)
  const canClients = can(PERMISSIONS.clientsRead)
  const canTeam = can(PERMISSIONS.teamRead)
  const canArticles = can(PERMISSIONS.articlesRead)
  const canPortfolio = can(PERMISSIONS.portfolioRead)
  const canTestimonials = can(PERMISSIONS.testimonialsRead)
  const canMembers = can(PERMISSIONS.membersRead)
  const canSubmissions = can(PERMISSIONS.submissionsRead)

  const pages = useQuery({ queryKey: ['search', 'pages', q], queryFn: pagesService.list, enabled: enabled && canPages })
  const services = useQuery({ queryKey: ['search', 'services', q], queryFn: servicesService.list, enabled: enabled && canServices })
  const clients = useQuery({ queryKey: ['search', 'clients', q], queryFn: clientsService.list, enabled: enabled && canClients })
  const team = useQuery({ queryKey: ['search', 'team', q], queryFn: teamService.list, enabled: enabled && canTeam })
  const articles = useQuery({ queryKey: ['search', 'articles', q], queryFn: articlesService.list, enabled: enabled && canArticles })
  const portfolio = useQuery({ queryKey: ['search', 'portfolio', q], queryFn: portfolioService.list, enabled: enabled && canPortfolio })
  const testimonials = useQuery({ queryKey: ['search', 'testimonials', q], queryFn: testimonialsService.list, enabled: enabled && canTestimonials })
  const members = useQuery({
    queryKey: ['search', 'members', q],
    queryFn: () => membersService.list({ search: q }),
    enabled: enabled && canMembers,
  })
  const submissions = useQuery({ queryKey: ['search', 'submissions', q], queryFn: () => submissionsService.list(), enabled: enabled && canSubmissions })

  const pageRows = (pages.data ?? []).filter((p) => matches(q, p.title, p.slug))
  const serviceRows = (services.data ?? []).filter((s) => matches(q, s.title, s.slug, s.eyebrow))
  const clientRows = (clients.data ?? []).filter((c) => matches(q, c.name, c.sector, c.focus))
  const teamRows = (team.data ?? []).filter((m) => matches(q, m.name, m.position))
  const articleRows = (articles.data ?? []).filter((a) => matches(q, a.title, a.slug, a.excerpt))
  const portfolioRows = (portfolio.data ?? []).filter((p) => matches(q, p.title, p.slug, p.client))
  const testimonialRows = (testimonials.data ?? []).filter((t) => matches(q, t.name, t.company, t.role))
  const memberRows = members.data ?? []
  const submissionRows = (submissions.data ?? []).filter((s) => matches(q, s.name, s.email, s.message))

  const loading = [pages, services, clients, team, articles, portfolio, testimonials, members, submissions]
    .some((r) => r.isLoading && r.fetchStatus !== 'idle')
  const totalResults = pageRows.length + serviceRows.length + clientRows.length + teamRows.length
    + articleRows.length + portfolioRows.length + testimonialRows.length + memberRows.length + submissionRows.length

  const reset = () => {
    setQuery('')
    setOpen(false)
  }

  const goTo = (path: string) => {
    navigate(path)
    reset()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden md:flex h-8 w-64 items-center rounded-md border bg-transparent pl-9 pr-3 text-left text-sm text-muted-foreground hover:bg-accent"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        Rechercher...
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Recherche</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une page, un service, un client, un membre…"
              className="pl-9"
            />
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-1">
            {q.length < 2 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tapez au moins 2 caractères.
              </p>
            ) : loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : totalResults === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun résultat pour « {q} ».
              </p>
            ) : (
              <>
                {pageRows.length > 0 && (
                  <Group title="Pages" icon={<FileText className="h-3.5 w-3.5" />}>
                    {pageRows.map((p) => (
                      <Row key={p.id} title={p.title} subtitle={p.slug} onOpen={() => goTo('/dashboard/pages')} />
                    ))}
                  </Group>
                )}
                {serviceRows.length > 0 && (
                  <Group title="Services" icon={<Boxes className="h-3.5 w-3.5" />}>
                    {serviceRows.map((s) => (
                      <Row key={s.id} title={s.title} subtitle={s.eyebrow ?? s.slug} onOpen={() => goTo('/dashboard/services')} />
                    ))}
                  </Group>
                )}
                {clientRows.length > 0 && (
                  <Group title="Clients" icon={<Building2 className="h-3.5 w-3.5" />}>
                    {clientRows.map((c) => (
                      <Row key={c.id} title={c.name} subtitle={c.sector ?? undefined} onOpen={() => goTo('/dashboard/clients')} />
                    ))}
                  </Group>
                )}
                {teamRows.length > 0 && (
                  <Group title="Équipe" icon={<Users2 className="h-3.5 w-3.5" />}>
                    {teamRows.map((m) => (
                      <Row key={m.id} title={m.name} subtitle={m.position ?? undefined} onOpen={() => goTo('/dashboard/team')} />
                    ))}
                  </Group>
                )}
                {articleRows.length > 0 && (
                  <Group title="Articles" icon={<Newspaper className="h-3.5 w-3.5" />}>
                    {articleRows.map((a) => (
                      <Row key={a.id} title={a.title} subtitle={a.slug} onOpen={() => goTo('/dashboard/articles')} />
                    ))}
                  </Group>
                )}
                {portfolioRows.length > 0 && (
                  <Group title="Portfolio" icon={<Briefcase className="h-3.5 w-3.5" />}>
                    {portfolioRows.map((p) => (
                      <Row key={p.id} title={p.title} subtitle={p.client ?? undefined} onOpen={() => goTo('/dashboard/portfolio')} />
                    ))}
                  </Group>
                )}
                {testimonialRows.length > 0 && (
                  <Group title="Témoignages" icon={<Quote className="h-3.5 w-3.5" />}>
                    {testimonialRows.map((t) => (
                      <Row key={t.id} title={t.name} subtitle={t.company ?? undefined} onOpen={() => goTo('/dashboard/testimonials')} />
                    ))}
                  </Group>
                )}
                {memberRows.length > 0 && (
                  <Group title="Membres" icon={<UserCheck className="h-3.5 w-3.5" />}>
                    {memberRows.map((m) => (
                      <Row
                        key={m.id}
                        title={`${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.email}
                        subtitle={m.email}
                        onOpen={() => goTo('/dashboard/members')}
                      />
                    ))}
                  </Group>
                )}
                {submissionRows.length > 0 && (
                  <Group title="Demandes" icon={<Inbox className="h-3.5 w-3.5" />}>
                    {submissionRows.map((s) => (
                      <Row key={s.id} title={s.name} subtitle={s.email} onOpen={() => goTo('/dashboard/submissions')} />
                    ))}
                  </Group>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Group({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </p>
      <div className="rounded-md border divide-y">{children}</div>
    </div>
  )
}

function Row({ title, subtitle, onOpen }: { title: string; subtitle?: string; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </button>
      <Button variant="ghost" size="icon-sm" title="Voir" onClick={onOpen}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  )
}
