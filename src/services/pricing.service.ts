import { createResourceService } from './resource.service'
import type { PricingPackage } from '@/types'

export const pricingService = createResourceService<PricingPackage>('pricing')
