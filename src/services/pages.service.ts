import { createResourceService } from './resource.service'
import type { Page } from '@/types'

export const pagesService = createResourceService<Page>('pages')
