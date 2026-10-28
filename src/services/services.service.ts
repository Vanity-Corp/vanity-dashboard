import { createResourceService } from './resource.service'
import type { Service } from '@/types'

export const servicesService = createResourceService<Service>('services')
