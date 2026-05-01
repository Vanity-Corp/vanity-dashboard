import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { ContactEmail } from '@/components/emails/contactEmail'

import { corsHeaders, optionsResponse, resendSendEmail } from '../../_lib'

export async function OPTIONS(request: Request) {
  return optionsResponse(request.headers.get('origin'))
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)
  const body = await request.json()
  const payload = await getPayload({ config })

  let status: 'sent' | 'failed' = 'failed'

  try {
    await resendSendEmail({
      from: process.env.RESEND_FROM_CONTACT || 'contact@vanitycorp.fr',
      to: process.env.RESEND_TO_CONTACT || 'Corp.vanity@gmail.com',
      subject: 'Contact',
      react: ContactEmail({
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        message: body.message || '',
      }),
    })

    status = 'sent'
  } catch (error) {
    payload.logger.error({ error }, 'Contact email delivery failed')
  }

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

  return NextResponse.json({ message: 'Email traité', status }, { headers })
}
