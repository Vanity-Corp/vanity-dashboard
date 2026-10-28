import { createResourceService } from './resource.service'
import type { TeamMember } from '@/types'

export const teamService = createResourceService<TeamMember>('team-members')
