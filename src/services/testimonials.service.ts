import { createResourceService } from './resource.service'
import type { Testimonial } from '@/types'

export const testimonialsService = createResourceService<Testimonial>('testimonials')
