import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { icon: '📨', label: 'Emails reçus', value: 'Synchronisés automatiquement' },
  { icon: '🧾', label: 'Demandes de devis', value: 'Centralisées dans Devis' },
  { icon: '📅', label: 'Réservations', value: 'Nouvelles alertes en direct' },
]

export const Dashboard = () => {
  return (
    <section className="twp mx-auto flex w-full max-w-6xl flex-col gap-7 p-8 text-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Tableau de bord Vanity</h1>
          <p className="text-base text-muted-foreground">Interface personnalisée avec composants shadcn/ui.</p>
        </div>
        <Badge variant="secondary" className="px-4 py-2 text-base">Payload Admin</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map(({ icon, label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription className="text-base">{label}</CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span aria-hidden className="text-3xl">{icon}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Actions rapides</CardTitle>
          <CardDescription className="text-base">Accédez vite aux éléments les plus utilisés.</CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-3">
          <Button className="text-base">Créer une page</Button>
          <Button variant="outline" className="text-base">Gérer les médias</Button>
        </CardFooter>
      </Card>
    </section>
  )
}
