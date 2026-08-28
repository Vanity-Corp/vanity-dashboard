import { render } from '@react-email/render'
import type { Payload } from 'payload'

import { ContactEmail } from '@/components/emails/contactEmail'
import { QuoteRequestEmail } from '@/components/emails/quote-request-email'
import type { Submission } from '@/payload-types'

interface ResolvedRecipients {
  fromAddress: string
  contact: string
  quote: string
  reservation: string
}

/**
 * Destination mailboxes are CMS-driven (SiteSettings → email group), with
 * environment fallbacks, then a final hardcoded default. Editors can change
 * where form emails go without a deploy.
 */
async function resolveRecipients(payload: Payload): Promise<ResolvedRecipients> {
  const settings = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const email = settings?.email ?? {}

  const fallbackTo =
    email.notificationRecipient || process.env.SMTP_TO || 'Corp.vanity@gmail.com'

  return {
    fromAddress: email.fromAddress || process.env.SMTP_FROM || 'contact@vanitycorp.fr',
    contact: email.contactRecipient || fallbackTo,
    quote: email.quoteRecipient || fallbackTo,
    reservation: email.reservationRecipient || fallbackTo,
  }
}

const listValues = (items?: { value?: string | null }[] | null): string =>
  (items ?? [])
    .map((item) => item?.value)
    .filter((value): value is string => Boolean(value))
    .join(', ')

const CLIENT_TYPE_LABELS: Record<string, string> = {
  particulier: 'Particulier',
  societe: 'Société / Professionnel',
}

function formatDate(value?: string | null): string | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function reservationHtml(doc: Submission): string {
  const hours = listValues(doc.hours)
  const row = (label: string, value?: string | null) =>
    value ? `<p style="margin:4px 0"><strong>${label} :</strong> ${value}</p>` : ''

  return `
    <h2>Nouvelle réservation studio</h2>
    ${row('Nom', doc.name)}
    ${row('Email', doc.email)}
    ${row('Téléphone', doc.phone)}
    ${row('Type de client', doc.clientType ? CLIENT_TYPE_LABELS[doc.clientType] ?? doc.clientType : undefined)}
    ${row('Date', formatDate(typeof doc.date === 'string' ? doc.date : undefined))}
    ${row('Créneaux', hours)}
    ${row('Message', doc.message)}
  `
}

/**
 * Render + send the notification email for a submission via Payload's configured
 * transport. Throws on delivery failure (caller decides how to record status).
 */
export async function sendSubmissionEmail(payload: Payload, doc: Submission): Promise<void> {
  const recipients = await resolveRecipients(payload)

  let to: string
  let subject: string
  let html: string

  if (doc.type === 'contact') {
    to = recipients.contact
    subject = 'Contact'
    html = await render(
      ContactEmail({
        name: doc.name ?? '',
        email: doc.email,
        phone: doc.phone ?? '',
        message: doc.message ?? '',
      }),
    )
  } else if (doc.type === 'quote') {
    to = recipients.quote
    subject = 'Nouvelle demande de devis'
    html = await render(
      QuoteRequestEmail({
        name: doc.name ?? '',
        email: doc.email,
        phone: doc.phone ?? '',
        clientType: doc.clientType ?? '', // "Qui êtes-vous ?"
        budget: doc.budget ?? '',
        services: doc.projectType ?? '', // service sélectionné
        features: doc.message ?? '', // description libre du projet
      }),
    )
  } else {
    to = recipients.reservation
    subject = 'Nouvelle réservation studio'
    html = reservationHtml(doc)
  }

  await payload.sendEmail({
    from: recipients.fromAddress,
    to,
    subject,
    html,
    replyTo: doc.email,
  })
}
