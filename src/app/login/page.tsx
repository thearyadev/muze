import { redirect } from 'next/navigation'
import LoginForm from '~/components/app/login_form'
import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export default async function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center justify-items-center">
      <Card className="w-[350px] border-0 bg-zinc-700">
        <CardHeader>
          <CardTitle />
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
