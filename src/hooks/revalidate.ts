import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * On-demand revalidation: when content changes in Payload, ping the corp-site's
 * revalidate endpoint so its cached (static) pages refresh immediately.
 *
 * No-ops if `CORP_SITE_URL` / `REVALIDATE_SECRET` are unset (e.g. local testing
 * without the corp-site running), so it never blocks a save.
 */
const CORP_SITE_URL = process.env.CORP_SITE_URL
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

async function ping(tag: string, logger?: { error?: (...args: unknown[]) => void }) {
  if (!CORP_SITE_URL || !REVALIDATE_SECRET) return
  try {
    await fetch(`${CORP_SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': REVALIDATE_SECRET,
      },
      body: JSON.stringify({ tag }),
      cache: 'no-store',
    })
  } catch (err) {
    logger?.error?.({ err }, `Revalidation ping failed for tag "${tag}"`)
  }
}

export const revalidateCollection =
  (tag: string): CollectionAfterChangeHook =>
  async ({ req }) => {
    await ping(tag, req?.payload?.logger)
  }

export const revalidateCollectionDelete =
  (tag: string): CollectionAfterDeleteHook =>
  async ({ req }) => {
    await ping(tag, req?.payload?.logger)
  }

export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  async ({ req }) => {
    await ping(tag, req?.payload?.logger)
  }
