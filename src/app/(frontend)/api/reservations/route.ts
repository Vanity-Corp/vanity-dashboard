import { NextResponse } from 'next/server'

import { createSubmission } from '@/lib/submissions'

import { corsHeaders, optionsResponse, verifyFormToken } from '../_lib'

export async function OPTIONS(request: Request) {
  return optionsResponse(request.headers.get('origin'))
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  if (!verifyFormToken(request)) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401, headers })
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>)

  if (!body?.email) {
    return NextResponse.json({ message: 'Email requis', status: 'error' }, { status: 400, headers })
  }

  const hours = Array.isArray(body.hours)
    ? (body.hours as string[])
    : [body.hours].filter(Boolean) as string[]

  // Accept both the dashboard's original field names and the corp-site form's
  // names (fullName / projectDescription) for forward-compat with Phase 3.
  const submission = await createSubmission({
    type: 'reservation',
    name: (body.name ?? body.fullName) as string | undefined,
    email: body.email as string,
    phone: body.phone as string | undefined,
    message: (body.notes ?? body.projectDescription) as string | undefined,
    clientType: body.clientType as string | undefined,
    date: body.date as string | undefined,
    hours,
    raw: body,
  })

  return NextResponse.json(
    { message: 'Réservation enregistrée', status: submission.status, id: submission.id },
    { headers },
  )
}
