import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const payload = await getPayload({ config })
  const features = Array.isArray(body.features) ? body.features : [body.features].filter(Boolean)
  const status = process.env.RESEND_API_KEY ? 'sent' : 'failed'

  await payload.create({
    collection: 'quote-requests',
    data: {
      ...body,
      features: features.map((value: string) => ({ value })),
      status,
    },
  })

  await payload.create({
    collection: 'leads',
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      type: 'quote',
      status,
    },
  })

  return NextResponse.json({ message: 'Devis enregistré', status })
}
