import type { Payload } from 'payload'

import { seedClients } from './clients'
import { seedPages } from './pages'

export { seedClients } from './clients'
export { seedPages } from './pages'

/** Run all seeders. Each is idempotent, so this is safe to run repeatedly. */
export async function runSeed(payload: Payload) {
  const clients = await seedClients(payload)
  const pages = await seedPages(payload)
  return { clients, pages }
}
