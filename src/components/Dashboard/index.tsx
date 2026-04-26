import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { icon: '📁', label: 'Projects', value: '12 active' },
  { icon: '✉️', label: 'New leads', value: '37 this week' },
  { icon: '⭐', label: 'Testimonials', value: '9 published' },
]

export const Dashboard = () => {
  return (
    <section className="twp mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vanity Dashboard</h1>
          <p className="text-muted-foreground text-sm">Customized with Tailwind CSS + shadcn/ui style components.</p>
        </div>
        <Badge variant="secondary">Payload Admin</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ icon, label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span aria-hidden className="text-xl">
                {icon}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Use these shortcuts to manage your site faster.</CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-3">
          <Button>Create page</Button>
          <Button variant="outline">Manage media</Button>
        </CardFooter>
      </Card>
    </section>
  )
}
