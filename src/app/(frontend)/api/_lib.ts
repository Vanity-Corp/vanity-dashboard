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

/**
 * Verify the shared form-submission token sent by the corp-site proxy.
 * If `FORM_SUBMISSION_TOKEN` is unset (e.g. local testing), verification is
 * skipped so the endpoints still work out of the box.
 */
export const verifyFormToken = (request: Request): boolean => {
  const expected = process.env.FORM_SUBMISSION_TOKEN
  if (!expected) return true
  return request.headers.get('x-form-token') === expected
}
