import type { CollectionConfig } from 'payload'
import { HeroBlock } from './blocks/HeroBlock'

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text', required: true },

    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },

    {
      name: 'template',
      type: 'select',
      options: ['home', 'service', 'landing', 'contact', 'pricing', 'portfolio', 'booking'],
    },

    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        StatsBlock,
        FeatureCardsBlock,
        ServiceGridBlock,
        TextMediaBlock,
        ProcessBlock,
        PortfolioBlock,
        VideoBlock,
        BookingBlock,
        PricingBlock,
        FAQBlock,
        CTABlock,
        ContactBlock,
      ],
    },

    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
