import type { Payload } from 'payload'

import { seedClients, seedStrategicClients } from './clients'
import { seedPages } from './pages'
import { seedServices } from './services'
import { seedTeam } from './team'

export { seedClients, seedStrategicClients } from './clients'
export { seedPages } from './pages'
export { seedServices } from './services'
export { seedTeam } from './team'

/** Run all seeders. Each is idempotent, so this is safe to run repeatedly. */
export async function runSeed(payload: Payload) {
  const clients = await seedClients(payload)
  const strategicClients = await seedStrategicClients(payload)
  const services = await seedServices(payload)
  const team = await seedTeam(payload)
  const pages = await seedPages(payload)
  return { clients, strategicClients, services, team, pages }
}
