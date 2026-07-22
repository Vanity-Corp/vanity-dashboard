import type { Block } from 'payload'

/**
 * Generic editable content section: eyebrow + heading + body + optional image,
 * bullet/chip items, and a call-to-action. `key` lets the corp-site locate a
 * specific section in code (e.g. 'about', 'worldmap', 'cta') to render it in
 * its bespoke layout slot.
 */
export const RichSectionBlock: Block = {
  slug: 'richSection',
  labels: { singular: 'Section texte', plural: 'Sections texte' },
  fields: [
    {
      name: 'key',
      type: 'text',
      label: 'Identifiant (pour le code)',
      admin: { description: 'Ex: about, worldmap, cta, team — utilisé par le site pour placer la section.' },
    },
    { name: 'eyebrow', type: 'text', label: 'Sur-titre' },
    { name: 'heading', type: 'text', label: 'Titre' },
    { name: 'body', type: 'textarea', label: 'Texte' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image' },
    {
      name: 'items',
      type: 'array',
      label: 'Éléments (puces / chips)',
      fields: [{ name: 'value', type: 'text' }],
    },
    { name: 'ctaLabel', type: 'text', label: 'Bouton — texte' },
    { name: 'ctaHref', type: 'text', label: 'Bouton — lien' },
  ],
}
