// Load .env BEFORE importing the Payload config (the config reads DATABASE_URL
// at import time). `payload run` does not auto-load .env like `next dev` does.
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import { runSeed } from './lib/seed'

/**
 * CLI seed: `pnpm seed`. Note this triggers a full Payload init (incl. schema
 * push) which can be slow/hang on some setups — if so, use the seed route
 * instead: open http://localhost:3000/api/admin/seed while logged into /admin.
 */
const run = async () => {
  const dbTarget = (process.env.DATABASE_URL || '(unset)').replace(/:[^:@/]*@/, ':****@')
  // eslint-disable-next-line no-console
  console.log('[seed] DATABASE_URL =', dbTarget)

  const payload = await getPayload({ config })
  const { clients, pages } = await runSeed(payload)

  payload.logger.info(
    `Clients: ${clients.skipped ? 'already present' : `seeded ${clients.created}`}. ` +
      `Pages created: ${pages.created.length ? pages.created.join(', ') : 'none (all present)'}.`,
  )
  process.exit(0)
}

void run()
