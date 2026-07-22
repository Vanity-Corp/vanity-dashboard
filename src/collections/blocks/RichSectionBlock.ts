import type { Block } from 'payload'

/**
 * Generic editable content section: eyebrow + heading + body text + optional
 * image. `key` lets the corp-site locate a specific section in code (e.g.
 * 'about', 'cta') so it can render it in its bespoke layout slot.
 */
export const RichSectionBlock: Block = {
  slug: 'richSection',
  labels: { singular: 'Section texte', plural: 'Sections texte' },
  fields: [
    {
      name: 'key',
      type: 'text',
      label: 'Identifiant (pour le code)',
      admin: { description: 'Ex: about, cta — utilisé par le site pour placer la section.' },
    },
    { name: 'eyebrow', type: 'text', label: 'Sur-titre' },
    { name: 'heading', type: 'text', label: 'Titre' },
    { name: 'body', type: 'textarea', label: 'Texte' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image' },
  ],
}
