import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { ReactElement } from 'react'

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

// ✅ FONCTION MANQUANTE À AJOUTER
export const optionsResponse = (origin?: string | null) =>
  new NextResponse(null, { status: 204, headers: corsHeaders(origin) })

export const resendSendEmail = async ({
  from,
  to,
  subject,
  html,
  react,
}: {
  from: string
  to: string | string[]
  subject: string
  html?: string
  react?: ReactElement
}) => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing')
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    ...(react ? { react } : { html: html || '' }),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}
