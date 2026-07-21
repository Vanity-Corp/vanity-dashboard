import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

type SubmissionType = 'contact' | 'quote' | 'reservation'

const VALID_TYPES: SubmissionType[] = ['contact', 'quote', 'reservation']

/**
 * GET — unread badge counts for the admin sidebar, grouped by type.
 * "Unread" = submissions whose `read` flag is not true. Requires auth.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ devis: 0, emails: 0, reservations: 0 }, { status: 401 })
  }

  const unreadOfType = (type: SubmissionType) =>
    payload.count({
      collection: 'submissions',
      where: {
        and: [{ type: { equals: type } }, { read: { not_equals: true } }],
      },
    })

  const [quotes, emails, reservations] = await Promise.all([
    unreadOfType('quote'),
    unreadOfType('contact'),
    unreadOfType('reservation'),
  ])

  return NextResponse.json({
    devis: quotes.totalDocs,
    emails: emails.totalDocs,
    reservations: reservations.totalDocs,
  })
}

/**
 * POST { type } — mark every unread submission of that type as read.
 * Called when the user opens the corresponding sidebar tab, clearing its badge.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { type?: string }
  const type = body.type as SubmissionType

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, message: 'Type invalide' }, { status: 400 })
  }

  await payload.update({
    collection: 'submissions',
    where: {
      and: [{ type: { equals: type } }, { read: { not_equals: true } }],
    },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
