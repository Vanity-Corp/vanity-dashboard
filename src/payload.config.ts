import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { PricingPackages } from './collections/PricingPackages'
import { QuoteRequests } from './collections/QuoteRequests'
import { Projects } from './collections/Projects'
import { Services } from './collections/Services'
import { StudioBookings } from './collections/StudioBookings'
import { TeamMembers } from './collections/TeamMembers'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      title: 'Dashboard',
      titleSuffix: '- Vanity Corp',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/assets/vanity_corp_Icon_color.png',
        },
      ],
    },

    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: '@/components/AdminSidebar#AdminSidebar',
      views: {
        dashboard: {
          Component: '@/components/Dashboard#Dashboard',
        },
      },
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },
    },
  },
  collections: [
    Users,
    Pages,
    Services,
    Projects,
    Testimonials,
    TeamMembers,
    PricingPackages,
    Leads,
    QuoteRequests,
    StudioBookings,
    Articles,
    Media,
  ],
  globals: [SiteSettings, Navigation, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  i18n: {
    supportedLanguages: { en, fr },

    fallbackLanguage: 'fr',
  },
})
