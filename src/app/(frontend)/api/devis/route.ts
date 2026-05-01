import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { QuoteRequestEmail } from '@/components/emails/quote-request-email'

import { corsHeaders, optionsResponse, resendSendEmail } from '../_lib'

export async function OPTIONS(request: Request) {
  return optionsResponse(request.headers.get('origin'))
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)
  const body = await request.json()
  const payload = await getPayload({ config })
  const features = Array.isArray(body.features) ? body.features : [body.features].filter(Boolean)

  let status: 'sent' | 'failed' = 'failed'

  try {
    await resendSendEmail({
      from: process.env.RESEND_FROM_QUOTE || 'contact@vanitycorp.fr',
      to: process.env.RESEND_TO_QUOTE || 'Corp.vanity@gmail.com',
      subject: 'Nouvelle demande de devis',
      react: QuoteRequestEmail({
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        clientType: body.projectType || '',
        budget: body.budget || '',
        services: body.message || '',
        features: features.join(', '),
      }),
    })

    status = 'sent'
  } catch (error) {
    payload.logger.error({ error }, 'Quote email delivery failed')
  }

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

  return NextResponse.json({ message: 'Devis enregistré', status }, { headers })
}
