import { createResourceService } from './resource.service'
import type { PortfolioProject } from '@/types'

export const portfolioService = createResourceService<PortfolioProject>('portfolio')
