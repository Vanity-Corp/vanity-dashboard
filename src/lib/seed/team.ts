import type { Payload } from 'payload'

/** Mirrors the corp-site's former VaniteamGrid cards. */
export const teamSeed: { name: string; position: string; imageUrl: string; bio: string }[] = [
  {
    name: 'Yanis',
    position: 'Gestion de projet & stratégie',
    imageUrl: '/img/Yanis.webp',
    bio: 'L’âme stratégique de Vanity Corp, il est expert en gestion de projets et d’équipes. Ses compétences couvrent le montage, l’écriture de scripts, la création de contenu, le marketing d’influence, la négociation client et la gestion budgétaire. Il veille à la bonne conduite de chaque projet, de la conception à la réalisation.',
  },
  {
    name: 'Remy',
    position: 'Production audiovisuelle',
    imageUrl: '/img/rEMY.webp',
    bio: 'Notre couteau suisse de la production audiovisuelle, il possède une expertise variée allant des vidéos institutionnelles aux clips musicaux. Capable de gérer tous les aspects de la production et de diriger une équipe sur des projets majeurs, il garantit une qualité visuelle élevée.',
  },
  {
    name: 'Antoine',
    position: 'Graphiste & branding',
    imageUrl: '/img/ANTOINE.webp',
    bio: 'Antoine est notre graphiste, titulaire d’un BTS design graphique. Il a effectué un apprentissage chez Publicis de 2012 à 2014. Il s’est spécialisé sur Illustrator et a toujours eu un penchant pour la création de logos. Aujourd’hui, il est spécialisé dans le branding et l’image de marque.',
  },
  {
    name: 'Yahia',
    position: 'Stratégie digitale & community management',
    imageUrl: '/img/yahia.webp',
    bio: 'Yahia est notre expert en stratégie digitale. Community manager expérimenté, il déploie avec créativité notre présence sur les réseaux sociaux clés. Grâce à sa connaissance fine des communautés, il crée un contenu engageant qui amplifie notre image.',
  },
  {
    name: 'Menelle',
    position: 'Développement commercial',
    imageUrl: '/img/Manelle.webp',
    bio: 'Menelle est notre experte commerciale, spécialisée dans la création de solutions personnalisées pour nos clients et le développement de relations durables. Son dynamisme et sa réactivité en font une interlocutrice de confiance.',
  },
  {
    name: 'Kenza',
    position: 'Community manager',
    imageUrl: '/img/Kenza.webp',
    bio: 'Kenza est notre community manager, experte en gestion des réseaux sociaux et en création de contenus engageants. Grâce à son sens de la communication et à sa créativité, elle renforce notre présence en ligne et développe une communauté fidèle autour de la marque.',
  },
]

/** Idempotent: seeds team members only if the collection is empty. */
export async function seedTeam(payload: Payload): Promise<{ created: number; skipped: boolean }> {
  const existing = await payload.count({ collection: 'team-members' })
  if (existing.totalDocs > 0) return { created: 0, skipped: true }

  let sortOrder = 0
  let created = 0
  for (const member of teamSeed) {
    await payload.create({
      collection: 'team-members',
      data: { ...member, sortOrder: sortOrder++ },
    })
    created++
  }
  return { created, skipped: false }
}
