import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Cette page n'existe pas.</p>
      <Button asChild>
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </Button>
    </div>
  )
}
