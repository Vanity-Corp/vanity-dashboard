import config from '@payload-config'
import { getPayload } from 'payload'

import { sendSubmissionEmail } from './email'

export type SubmissionType = 'contact' | 'quote' | 'reservation'

/**
 * Whitelisted input for creating a submission. We never spread the raw request
 * body into `payload.create` (that allowed clients to set arbitrary fields such
 * as `status`); callers map known fields explicitly and may pass the full body
 * through `raw` for forward-compatibility / debugging.
 */
export interface SubmissionInput {
  type: SubmissionType
  email: string
  name?: string
  phone?: string
  message?: string
  clientType?: string
  projectType?: string
  budget?: string
  features?: string[]
  date?: string
  hours?: string[]
  raw?: Record<string, unknown>
}

/**
 * Persist a submission FIRST (durable, before any email I/O), THEN attempt
 * delivery, THEN update the delivery status. This ordering is the core
 * guarantee: no submission is ever lost, even if the process dies mid-send.
 *
 *   1. create record            → status 'pending' (committed to DB)
 *   2. attempt email delivery
 *   3. update status            → 'sent' (delivered) or 'failed' (stored anyway)
 */
export async function createSubmission(input: SubmissionInput) {
  const payload = await getPayload({ config })

  const doc = await payload.create({
    collection: 'submissions',
    data: {
      type: input.type,
      email: input.email,
      name: input.name,
      phone: input.phone,
      message: input.message,
      clientType: input.clientType,
      projectType: input.projectType,
      budget: input.budget,
      features: (input.features ?? []).filter(Boolean).map((value) => ({ value })),
      date: input.date,
      hours: (input.hours ?? []).filter(Boolean).map((value) => ({ value })),
      status: 'pending',
      lifecycle: 'new',
      raw: input.raw,
    },
  })

  let status: 'sent' | 'failed' = 'failed'
  try {
    await sendSubmissionEmail(payload, doc)
    status = 'sent'
  } catch (error) {
    payload.logger.error({ error }, 'Submission email delivery failed')
  }

  return payload.update({
    collection: 'submissions',
    id: doc.id,
    data: { status },
  })
}
