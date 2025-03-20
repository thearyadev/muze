'use client'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import React from 'react'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '~/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { createUserData } from '~/lib/actions/user'
const formSchema = z.object({
  username: z.string().min(2).max(256),
  password: z.string().min(2).max(256),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [register, setRegister] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    if (register) {
      await authClient.signUp.email({
        email: values.username,
        password: values.password,
        name: values.username,
        fetchOptions: {
          onSuccess: async () => {
            await createUserData()
            router.push('/app/home')
          },
          onError: (context) => {
            setIsLoading(false)
            form.resetField('password')
            toast.error(context.error.message)
          },
        },
      })
      return
    }
    await authClient.signIn.email({
      email: values.username,
      password: values.password,
      fetchOptions: {
        onSuccess: () => {
          router.push('/app/home')
        },
        onError: (context) => {
          setIsLoading(false)
          form.resetField('password')
          toast.error(context.error.message)
        },
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4 ">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
            {register ? 'create an account' : 'login to muze'}
          </h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel hidden>username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-10 bg-zinc-800 border-zinc-700"
                      placeholder="email"
                      type="email"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel hidden>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-10 bg-zinc-800 border-zinc-700"
                      placeholder="password"
                      type="password"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="">
              <Button type="submit" className="w-full">
                {isLoading ? 'logging in...' : register ? 'register' : 'login'}
              </Button>
            </div>
          </form>
        </Form>

        <p
          className="hover:underline text-xs text-gray-500 text-center cursor-pointer"
          onClick={() => setRegister(!register)}
        >
          {register ? 'back' : 'register'}
        </p>
      </div>
    </div>
  )
}
