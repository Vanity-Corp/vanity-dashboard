import type { Payload } from 'payload'

/**
 * Client seed — mirrors the corp-site's former hardcoded brand/artist arrays.
 * Images use the `imageUrl` bridge (paths served by the corp-site /public).
 */
export const brandSeed: { name: string; imageUrl: string }[] = [
  { name: 'BABY TO LOVE', imageUrl: '/brands/Baby To love.webp' },
  { name: 'Marionnaud', imageUrl: '/brands/Marionnaud.webp' },
  { name: 'business club by cmda', imageUrl: '/brands/Business club.webp' },
  { name: 'fraikin', imageUrl: '/brands/Fraikin.webp' },
  { name: 'CMI France', imageUrl: '/brands/CMI FRANCE.webp' },
  { name: 'Arca Group Energy', imageUrl: '/brands/Arca-group-energy.webp' },
  { name: 'ouverture serrurrie', imageUrl: '/brands/OSS SERRURIE.webp' },
  { name: 'piatto pizza', imageUrl: '/brands/piatto.webp' },
  { name: 'legal euro corp', imageUrl: '/brands/Legal Euro Corp.webp' },
  { name: 'Ecole Ducasse', imageUrl: '/brands/Ecole Ducasse.webp' },
  { name: 'Elektra', imageUrl: '/brands/Elektra.webp' },
  { name: 'Fally Ipupa', imageUrl: '/brands/Fally Ipupa.webp' },
  { name: 'Douceur et elegance', imageUrl: '/brands/Douceur et Elegance.webp' },
  { name: 'Dat Schaub', imageUrl: '/brands/Logo dat schaub.png' },
  { name: 'Avekapeti', imageUrl: '/brands/Avekapeti.webp' },
  { name: 'Logo cmda', imageUrl: '/brands/CMDA.webp' },
  { name: 'Interfimo', imageUrl: '/brands/Interfimo.webp' },
  { name: 'Wizbii', imageUrl: '/brands/Wizbii.webp' },
  { name: 'Life', imageUrl: '/brands/Life.webp' },
  { name: 'Cloud B', imageUrl: '/brands/Cloud B .webp' },
  { name: 'BTL DIFFUSION', imageUrl: '/brands/BTL DIFFUSION.webp' },
  { name: 'Little big friends', imageUrl: '/brands/Little Big Friends.webp' },
]

export const artistSeed: { name: string; imageUrl: string; link: string }[] = [
  { name: 'Nayra', imageUrl: '/clients/Nayra.webp', link: 'https://www.instagram.com/nayra932/' },
  { name: 'Nej', imageUrl: '/clients/Nej.webp', link: 'https://www.youtube.com/channel/UCD_MrT_8bODobOFp6SlrEQQ' },
  { name: 'Raska', imageUrl: '/clients/Raska.webp', link: 'https://www.youtube.com/c/RASKA_mp4' },
  { name: 'Redouane Bh', imageUrl: '/clients/REDOUANE_BH.webp', link: 'https://www.instagram.com/redouanebh/' },
  { name: 'Rose Ameziane', imageUrl: '/clients/Rose_ameziane.webp', link: 'https://www.instagram.com/roseameziane/?hl=fr' },
  { name: 'Siham Bengoua', imageUrl: '/clients/Siham_Bengoua.webp', link: 'https://www.instagram.com/sihambengoua/?hl=fr' },
  { name: 'Willaxxx', imageUrl: '/clients/Willaxxx.webp', link: 'https://www.instagram.com/lewillaxxx/' },
  { name: 'Willy Denzey', imageUrl: '/clients/WILLY_Denzey.webp', link: 'https://www.instagram.com/iamwillydenzey/' },
  { name: 'Doria', imageUrl: '/clients/Doria.webp', link: 'https://www.instagram.com/doriado_do/' },
  { name: 'Fally Ipupa', imageUrl: '/clients/Fally_Ipupa.webp', link: 'https://www.youtube.com/user/fallyipupa' },
  { name: 'Houssbad', imageUrl: '/clients/Houssbad.webp', link: 'https://www.instagram.com/houssbad/?hl=fr' },
  { name: 'Karim Zeribi', imageUrl: '/clients/Karim_Zeribi.webp', link: 'https://www.instagram.com/karim.zeribi/' },
  { name: 'Nabil Absi', imageUrl: '/clients/Nabil_Absi.webp', link: 'https://www.youtube.com/@NabilAbsi' },
  { name: 'Nassi', imageUrl: '/clients/Nassi.webp', link: 'https://www.instagram.com/nassiofficiel/?hl=fr' },
]

export const strategicSeed: { name: string; sector: string; focus: string }[] = [
  { name: 'CMI France', sector: 'Média', focus: 'Audit social & roadmap contenu' },
  { name: 'Ecole Ducasse', sector: 'Formation', focus: 'Positionnement digital' },
  { name: 'Marionnaud', sector: 'Retail', focus: 'Activation social media' },
  { name: 'Fraikin', sector: 'B2B', focus: 'Stratégie de visibilité' },
]

/** Idempotent: seeds Clients only if the collection is empty. */
export async function seedClients(
  payload: Payload,
): Promise<{ created: number; skipped: boolean }> {
  const existing = await payload.count({ collection: 'clients' })
  if (existing.totalDocs > 0) return { created: 0, skipped: true }

  let sortOrder = 0
  let created = 0

  for (const brand of brandSeed) {
    await payload.create({
      collection: 'clients',
      data: { ...brand, category: 'brand', active: true, sortOrder: sortOrder++ },
    })
    created++
  }

  sortOrder = 0
  for (const artist of artistSeed) {
    await payload.create({
      collection: 'clients',
      data: { ...artist, category: 'artist', active: true, sortOrder: sortOrder++ },
    })
    created++
  }

  return { created, skipped: false }
}

/**
 * Idempotent: seeds strategic clients only if none exist yet (checked per
 * category, so it still runs on a DB that already has brands/artists).
 */
export async function seedStrategicClients(
  payload: Payload,
): Promise<{ created: number; skipped: boolean }> {
  const existing = await payload.count({
    collection: 'clients',
    where: { category: { equals: 'strategic_client' } },
  })
  if (existing.totalDocs > 0) return { created: 0, skipped: true }

  let sortOrder = 0
  let created = 0
  for (const client of strategicSeed) {
    await payload.create({
      collection: 'clients',
      data: { ...client, category: 'strategic_client', active: true, sortOrder: sortOrder++ },
    })
    created++
  }
  return { created, skipped: false }
}
