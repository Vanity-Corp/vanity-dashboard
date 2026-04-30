import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const payload = await getPayload({ config })

  const status = process.env.RESEND_API_KEY ? 'sent' : 'failed'

  await payload.create({
    collection: 'leads',
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      type: 'contact',
      status,
    },
  })

  return NextResponse.json({ message: 'Email traité', status })
}
