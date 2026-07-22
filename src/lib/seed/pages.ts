import type { Payload } from 'payload'

/**
 * Page seeds — one entry per corp-site route. Each page carries its title, SEO
 * metadata, and starter sections. Idempotent per slug: a page is only created
 * if one with that slug doesn't already exist, so editors' changes are never
 * overwritten.
 *
 * TO EXTEND: add a new entry here when a new page/route is introduced.
 */
type SectionSeed =
  | { blockType: 'richSection'; key?: string; eyebrow?: string; heading?: string; body?: string }
  | {
      blockType: 'clientsShowcase'
      eyebrow?: string
      heading: string
      category: 'brand' | 'artist' | 'strategic_client'
    }

interface PageSeed {
  slug: string
  title: string
  seo: { metaTitle: string; metaDescription: string }
  sections: SectionSeed[]
}

export const pageSeeds: PageSeed[] = [
  {
    slug: 'home',
    title: 'Accueil',
    seo: {
      metaTitle: 'Vanity corp | Agence de communication créative 360',
      metaDescription:
        'Tout buzzer pour donner de la visibilité à votre projet est un savoir faire. Vanity Corp est une agence de communication créative 360.',
    },
    sections: [
      { blockType: 'clientsShowcase', heading: 'Ils nous ont fait confiance', category: 'brand' },
      { blockType: 'clientsShowcase', heading: 'Artistes & talents accompagnés', category: 'artist' },
    ],
  },
  {
    slug: 'studio',
    title: 'Studio de tournage',
    seo: {
      metaTitle: 'Studio photo, vidéo et podcast à Massy | Location studio 91',
      metaDescription:
        'Louez un studio photo, vidéo et podcast à Massy dans l’Essonne. Espace de 120m² équipé pour shootings, tournages, interviews, podcasts et contenus social media.',
    },
    sections: [{ blockType: 'richSection', key: 'hero', heading: 'Studio de tournage à Massy' }],
  },
  {
    slug: 'accompagnement',
    title: 'Accompagnement stratégique',
    seo: {
      metaTitle: 'Accompagnement stratégique & community management | Vanity Corp',
      metaDescription:
        'Audit digital, stratégie de contenu et community management pour développer durablement votre marque.',
    },
    sections: [
      { blockType: 'richSection', key: 'hero', heading: 'Accompagnement stratégique' },
      { blockType: 'clientsShowcase', heading: 'Clients accompagnés', category: 'strategic_client' },
    ],
  },
  {
    slug: 'audiovisuel',
    title: 'Audiovisuel',
    seo: {
      metaTitle: 'Production audiovisuelle : vidéo, photo, montage | Vanity Corp',
      metaDescription:
        'Production vidéo et photo, du concept à la livraison multi-format pour tous vos contenus.',
    },
    sections: [{ blockType: 'richSection', key: 'hero', heading: 'Production audiovisuelle' }],
  },
  {
    slug: 'realisations',
    title: 'Réalisations',
    seo: {
      metaTitle: 'Nos réalisations | Portfolio Vanity Corp',
      metaDescription: 'Découvrez nos projets et réalisations audiovisuelles et créatives.',
    },
    sections: [{ blockType: 'richSection', key: 'hero', heading: 'Nos réalisations' }],
  },
  {
    slug: 'estimation',
    title: 'Estimation gratuite',
    seo: {
      metaTitle: 'Estimation gratuite de votre projet | Vanity Corp',
      metaDescription:
        'Obtenez une estimation gratuite et personnalisée pour votre projet en quelques étapes.',
    },
    sections: [{ blockType: 'richSection', key: 'hero', heading: 'Estimation gratuite' }],
  },
  {
    slug: 'contact',
    title: 'Contactez-nous',
    seo: {
      metaTitle: 'Contactez-nous | Vanity Corp',
      metaDescription: 'Parlons de votre projet. Contactez l’équipe Vanity Corp.',
    },
    sections: [{ blockType: 'richSection', key: 'hero', heading: 'Contactez-nous' }],
  },
  {
    slug: 'tarifs',
    title: 'Nos tarifs',
    seo: {
      metaTitle: 'Nos tarifs | Vanity Corp',
      metaDescription: 'Découvrez nos offres et tarifs pour vos projets créatifs et audiovisuels.',
    },
    sections: [{ blockType: 'richSection', key: 'hero', heading: 'Nos tarifs' }],
  },
]

/** Idempotent: creates any page (by slug) that doesn't already exist. */
export async function seedPages(payload: Payload): Promise<{ created: string[] }> {
  const created: string[] = []

  for (const page of pageSeeds) {
    const existing = await payload.count({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
    })
    if (existing.totalDocs > 0) continue

    await payload.create({ collection: 'pages', data: page })
    created.push(page.slug)
  }

  return { created }
}
