import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
        <Badge className="w-fit" variant="secondary">
          Payload CMS + shadcn/ui
        </Badge>

        <Card>
          <CardHeader className="gap-4">
            <Image
              alt="Payload Logo"
              className="rounded-md"
              height={56}
              src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
              width={56}
            />
            <div className="space-y-1">
              <CardTitle className="text-3xl tracking-tight">
                {user ? `Welcome back, ${user.email}` : 'Welcome to your new vanity dashboard'}
              </CardTitle>
              <CardDescription>
                The frontend has been rebuilt with Tailwind CSS and reusable shadcn components.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <a href={payloadConfig.routes.admin} rel="noopener noreferrer" target="_blank">
              <Button>Open admin panel</Button>
            </a>
            <a href="https://payloadcms.com/docs" rel="noopener noreferrer" target="_blank">
              <Button variant="outline">Read Payload docs</Button>
            </a>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-sm">
              Edit <code>src/app/(frontend)/page.tsx</code> to continue building your UI.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
