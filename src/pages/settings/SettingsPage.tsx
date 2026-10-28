import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralSettings } from './GeneralSettings'
import { RolesSettings } from './RolesSettings'
import { IntegrationsSettings } from './IntegrationsSettings'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configuration du tableau de bord.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="roles">Rôles</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="roles" className="mt-6">
          <RolesSettings />
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
