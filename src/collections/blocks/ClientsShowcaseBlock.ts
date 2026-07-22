import type { Block } from 'payload'

/**
 * A page section that shows a marquee of Clients of a given category.
 * The Clients collection is the data source; this block controls the section's
 * heading and which category to display. The corp-site renders it with its own
 * bespoke slider component (design stays in code).
 */
export const ClientsShowcaseBlock: Block = {
  slug: 'clientsShowcase',
  labels: { singular: 'Section Clients', plural: 'Sections Clients' },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Sur-titre' },
    { name: 'heading', type: 'text', label: 'Titre', required: true },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie de clients',
      required: true,
      defaultValue: 'brand',
      options: [
        { label: 'Marques', value: 'brand' },
        { label: 'Artistes', value: 'artist' },
        { label: 'Clients stratégiques', value: 'strategic_client' },
      ],
    },
    { name: 'maxItems', type: 'number', label: 'Nombre max (optionnel)' },
  ],
}
