import { redirect } from 'next/navigation'
import LoginForm from '~/components/app/login_form'
import { api } from '~/trpc/server'
import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export default async function LoginPage() {
  const isAuthenticated = await api.user.isAuthenticated()
  if (isAuthenticated) {
    redirect('/app/home')
  }

  return (
    <div className="flex h-screen items-center justify-center justify-items-center">
      <Card className="w-[350px] border-0 bg-zinc-700">
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm></LoginForm>
        </CardContent>
      </Card>
    </div>
  )
}
