import { NextResponse } from 'next/server'

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? ['*']

export const corsHeaders = (origin?: string | null): Record<string, string> => {
  const headerOrigin =
    allowedOrigins.includes('*') || !origin
      ? '*'
      : allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0] || '*'

  return {
    'Access-Control-Allow-Origin': headerOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export const optionsResponse = (origin?: string | null) =>
  new NextResponse(null, { status: 204, headers: corsHeaders(origin) })

export const resendSendEmail = async ({
  from,
  to,
  subject,
  html,
}: {
  from: string
  to: string | string[]
  subject: string
  html: string
}) => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Resend error ${response.status}: ${text}`)
  }

  return response.json()
}
