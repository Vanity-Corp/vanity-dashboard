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

  const features = Array.isArray(body.features)
    ? (body.features as string[])
    : [body.features].filter(Boolean) as string[]

  // Persist first (durable). Single record — no more double-write to a separate
  // "leads" collection. Email delivery is wired in Phase 2.
  const submission = await createSubmission({
    type: 'quote',
    name: body.name as string | undefined,
    email: body.email as string,
    phone: body.phone as string | undefined,
    message: body.message as string | undefined,
    projectType: body.projectType as string | undefined,
    budget: body.budget as string | undefined,
    clientType: body.clientType as string | undefined,
    features,
    raw: body,
  })

  return NextResponse.json(
    { message: 'Devis enregistré', status: submission.status, id: submission.id },
    { headers },
  )
}
