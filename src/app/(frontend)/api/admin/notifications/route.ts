import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config })

  const [quotes, emails, reservations] = await Promise.all([
    payload.count({
      collection: 'quote-requests',
      where: { status: { equals: 'new' } },
    }),
    payload.count({
      collection: 'leads',
      where: {
        and: [{ type: { equals: 'contact' } }, { status: { equals: 'new' } }],
      },
    }),
    payload.count({
      collection: 'studio-bookings',
      where: { status: { equals: 'pending' } },
    }),
  ])

  return NextResponse.json({
    devis: quotes.totalDocs,
    emails: emails.totalDocs,
    reservations: reservations.totalDocs,
  })
}
