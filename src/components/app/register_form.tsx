'use client'
import { useEffect } from 'react'
import { Button } from '../ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'

const formSchema = z.object({
  username: z.string().min(2).max(256),
  password: z.string().min(2).max(256),
})

export default function RegisterForm() {
  const router = useRouter()
  const registerMutation = api.user.register.useMutation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
    })
  }
  useEffect(() => {
    if (registerMutation.isSuccess) {
      router.push('/login')
    }
  }, [registerMutation, router])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel hidden>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-zinc-900"
                  placeholder="Username"
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
                  className="border-zinc-900"
                  placeholder="Password"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit">Register</Button>
        </div>
      </form>
    </Form>
  )
}
