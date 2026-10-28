import { apiFetch } from '@/lib/api-client'
import type { IntegrationsConfig, BrandingConfig } from '@/types'

export const settingsService = {
  getIntegrations: () => apiFetch<IntegrationsConfig>('/settings/integrations'),
  getIntegrationsFull: () => apiFetch<IntegrationsConfig>('/settings/integrations/reveal'),
  setIntegrations: (payload: IntegrationsConfig) =>
    apiFetch<IntegrationsConfig>('/settings/integrations', { method: 'PUT', body: payload }),
  setBranding: (payload: BrandingConfig) =>
    apiFetch<BrandingConfig>('/settings/branding', { method: 'PUT', body: payload }),
  getMaxLoginAttempts: () => apiFetch<{ maxLoginAttempts: number }>('/settings/max-login-attempts'),
  setMaxLoginAttempts: (maxLoginAttempts: number) =>
    apiFetch<{ maxLoginAttempts: number }>('/settings/max-login-attempts', {
      method: 'PUT',
      body: { maxLoginAttempts },
    }),
  getBrandingPublic: () => apiFetch<BrandingConfig>('/branding'),
}
