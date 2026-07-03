import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { corsHeaders, optionsResponse, resendSendEmail } from '../_lib'

export async function OPTIONS(request: Request) {
  return optionsResponse(request.headers.get('origin'))
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)
  const body = await request.json()
  const payload = await getPayload({ config })

  let status: 'confirmed' | 'pending' = 'pending'

  try {
    await resendSendEmail({
      from: process.env.RESEND_FROM_RESERVATION || 'contact@vanitycorp.fr',
      to: process.env.RESEND_TO_RESERVATION || 'Corp.vanity@gmail.com',
      subject: 'Nouvelle réservation',
      html: `<h2>Nouvelle réservation</h2><p><b>Nom:</b> ${body.name || ''}</p><p><b>Email:</b> ${body.email || ''}</p><p><b>Téléphone:</b> ${body.phone || ''}</p><p><b>Date:</b> ${body.date || ''}</p><p><b>Notes:</b><br/>${body.notes || ''}</p>`,
    })

    status = 'confirmed'
  } catch (error) {
    payload.logger.error({ error }, 'Reservation email delivery failed')
  }

  await payload.create({
    collection: 'studio-bookings',
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
      date: body.date,
      status,
    },
  })

  return NextResponse.json({ message: 'Réservation enregistrée', status }, { headers })
}
