import type { APIResponse } from '../types'
import { cookies, headers } from 'next/headers'
import * as jwt from 'jsonwebtoken'
import { auth } from '~/lib/auth'
export const key = 'meow'

export async function isAuthorized(): Promise<APIResponse<string>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session === null) {
    return {
      status_code: 401,
      error: 'Unauthorized',
    }
  }

  return {
    status_code: 200,
    content: session.user.name,
  }
}
// biome-ignore lint/suspicious/noExplicitAny : dont care
export const protectedAction = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<APIResponse<T>>,
) => {
  return async (...args: Args): Promise<APIResponse<T>> => {
    const isAuthenticated = await isAuthorized()
    if (isAuthenticated.status_code !== 200) {
      return {
        status_code: 401,
        error: 'Unauthorized',
      }
    }
    return await fn(...args)
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
