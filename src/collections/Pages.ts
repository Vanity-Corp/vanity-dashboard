import type { CollectionConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { ClientsShowcaseBlock } from './blocks/ClientsShowcaseBlock'
import { RichSectionBlock } from './blocks/RichSectionBlock'

/**
 * Content-driven pages. Each page carries its title, SEO metadata, and an
 * ordered list of editable `sections`. The corp-site keeps its bespoke design
 * in code and reads this content per page (by `slug`), rendering each section
 * in its own layout slot.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Contenu',
  },
  access: {
    read: allowPublicRead,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [revalidateCollection('pages')],
    afterDelete: [revalidateCollectionDelete('pages')],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Identifiant de page',
      required: true,
      unique: true,
      admin: { description: "Ex: 'home', 'studio', 'audiovisuel'." },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'Métadonnées (SEO)',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Titre (balise <title>)' },
        { name: 'metaDescription', type: 'textarea', label: 'Description' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Image de partage' },
      ],
    },
    {
      name: 'sections',
      type: 'blocks',
      label: 'Sections',
      blocks: [RichSectionBlock, ClientsShowcaseBlock],
    },
  ],
}
