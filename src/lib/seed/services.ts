import type { Payload } from 'payload'

/** Mirrors the corp-site's former lib/services.ts (icons stored as Lucide names). */
export const serviceSeed = [
  {
    slug: 'studio-de-tournage',
    eyebrow: 'Studio de tournage',
    title: 'Des espaces pensés pour vos productions',
    color: '#7c86ff',
    link: 'studio-de-tournage',
    imageUrl: '/newicones/green screend.png',
    reverse: false,
    sortOrder: 0,
    description:
      'Découvrez nos espaces, équipements et options de location pour vos productions. Nous mettons à disposition un environnement professionnel conçu pour maximiser la qualité de vos contenus tout en simplifiant vos tournages.',
    features: [
      { name: 'Espace modulable.', description: 'Un studio adaptable pour différents formats de tournage, du contenu social media aux productions plus ambitieuses.', icon: 'Camera' },
      { name: 'Éclairage professionnel.', description: 'Des solutions d’éclairage optimisées pour garantir un rendu visuel cohérent et esthétique.', icon: 'Lightbulb' },
      { name: 'Matériel disponible.', description: 'Accédez à l’équipement essentiel pour produire efficacement sans contraintes techniques.', icon: 'Clapperboard' },
    ],
  },
  {
    slug: 'accompagnement-strategique',
    eyebrow: 'Accompagnement stratégique',
    title: 'Une vision claire pour votre croissance',
    color: '#ed6aff',
    link: 'accompagnement-strategique',
    imageUrl: '/img/Stratégie.webp',
    reverse: true,
    sortOrder: 1,
    description:
      'Community management, audit digital et stratégie sur mesure pour votre croissance. Nous analysons votre présence actuelle et construisons des actions concrètes pour améliorer votre visibilité et vos performances.',
    features: [
      { name: 'Audit digital.', description: 'Analyse complète de votre présence en ligne pour identifier les opportunités d’amélioration.', icon: 'BarChart' },
      { name: 'Stratégie sur mesure.', description: 'Des recommandations adaptées à votre marché et à vos objectifs business.', icon: 'Target' },
      { name: 'Community management.', description: 'Gestion et animation de vos réseaux sociaux pour créer une audience engagée.', icon: 'Users' },
    ],
  },
  {
    slug: 'audiovisuel',
    eyebrow: 'Audiovisuel',
    title: 'Donnez vie à votre image',
    color: '#00d3f2',
    link: 'audiovisuel',
    imageUrl: '/img/Production.webp',
    reverse: false,
    sortOrder: 2,
    description:
      'Prestations vidéo/photo, tournage, montage et livraison multi-formats. Nous vous accompagnons de la conception à la livraison pour produire du contenu impactant et adapté à tous vos canaux.',
    features: [
      { name: 'Production vidéo.', description: 'Tournage professionnel pour vos contenus marketing, corporate ou réseaux sociaux.', icon: 'Video' },
      { name: 'Photographie.', description: 'Des visuels de qualité pour valoriser votre marque et vos produits.', icon: 'ImageIcon' },
      { name: 'Montage & formats.', description: 'Optimisation et déclinaison de vos contenus pour toutes les plateformes.', icon: 'Film' },
    ],
  },
]

/** Idempotent: seeds Services only if the collection is empty. */
export async function seedServices(payload: Payload): Promise<{ created: number; skipped: boolean }> {
  const existing = await payload.count({ collection: 'services' })
  if (existing.totalDocs > 0) return { created: 0, skipped: true }

  let created = 0
  for (const service of serviceSeed) {
    await payload.create({ collection: 'services', data: service })
    created++
  }
  return { created, skipped: false }
}
