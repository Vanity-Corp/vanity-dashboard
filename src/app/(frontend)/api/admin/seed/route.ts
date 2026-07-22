import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { seedClients, seedPages } from '@/lib/seedClients'

/**
 * Dev seed utility. Reuses the running server's Payload instance (no separate
 * init / schema push), so it can't hang like `payload run` can.
 *
 * Usage: while logged into /admin, open http://localhost:3000/api/admin/seed
 * Idempotent — does nothing if Clients already exist.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json(
      { ok: false, message: 'Connexion admin requise (ouvrez /admin puis réessayez).' },
      { status: 401 },
    )
  }

  const clients = await seedClients(payload)
  const pages = await seedPages(payload)
  return NextResponse.json({ ok: true, clients, pages })
}
