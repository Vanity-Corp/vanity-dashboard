import { createResourceService } from './resource.service'
import type { Article } from '@/types'

export const articlesService = createResourceService<Article>('articles')
