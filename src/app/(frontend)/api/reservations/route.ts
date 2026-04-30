import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const payload = await getPayload({ config })

  await payload.create({
    collection: 'studio-bookings',
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
      date: body.date,
      status: 'pending',
    },
  })

  return NextResponse.json({ message: 'Réservation enregistrée' })
}
