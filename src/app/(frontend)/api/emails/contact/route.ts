import { NextResponse } from 'next/server'

import { createSubmission } from '@/lib/submissions'

import { corsHeaders, optionsResponse, verifyFormToken } from '../../_lib'

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

  // Persist first (durable). Email delivery is wired in Phase 2 (Nodemailer),
  // which will update `status` to 'sent' / 'failed'.
  const submission = await createSubmission({
    type: 'contact',
    name: body.name as string | undefined,
    email: body.email as string,
    phone: body.phone as string | undefined,
    message: body.message as string | undefined,
    raw: body,
  })

  return NextResponse.json(
    { message: 'Message enregistré', status: submission.status, id: submission.id },
    { headers },
  )
}
