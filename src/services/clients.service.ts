import { createResourceService } from './resource.service'
import type { Client } from '@/types'

export const clientsService = createResourceService<Client>('clients')
