import type { APIResponse } from '../types'
import { headers } from 'next/headers'
import { auth } from '~/lib/auth'
import { db } from '~/server/db'
import { users_data } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { tryCatch } from '../try-catch'

async function getUserFromUsername(username: string) {
  const { data: userQuery, error } = await tryCatch(
    db
      .select()
      .from(users_data)
      .where(eq(users_data.username, username))
      .execute(),
  )
  if (error) {
    return null
  }
  const [user] = userQuery
  if (!user) {
    return null
  }
  return user
}

export type UserPreVerify = Awaited<ReturnType<typeof getUserFromUsername>>
export type User = NonNullable<UserPreVerify>

export async function isAuthorized(): Promise<APIResponse<string>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session === null) {
    return {
      status_code: 401,
      error: 'Unauthorized',
      content: null,
    }
  }

  return {
    status_code: 200,
    content: session.user.name,
    error: null,
  }
}
// biome-ignore lint/suspicious/noExplicitAny : dont care
export const protectedAction = <T, Args extends any[]>(
  fn: (user: User, ...args: Args) => Promise<APIResponse<T>>,
) => {
  return async (...args: Args): Promise<APIResponse<T>> => {
    const isAuthenticated = await isAuthorized()
    if (isAuthenticated.status_code !== 200) {
      return {
        status_code: 401,
        error: 'Unauthorized',
        content: null,
      }
    }

    const user = await getUserFromUsername(isAuthenticated.content || '')
    if (user === null) {
      return {
        status_code: 401,
        error: 'Unauthorized',
        content: null,
      }
    }

    return await fn(user, ...args)
  }
}

// biome-ignore lint/suspicious/noExplicitAny : dont care
export const openAction = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<APIResponse<T>>,
) => {
  return async (...args: Args): Promise<APIResponse<T>> => {
    return await fn(...args)
  }
}
