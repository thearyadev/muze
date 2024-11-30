import type { APIResponse } from '../types'
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken'

export const key = 'meow'

export async function isAuthorized(): Promise<APIResponse<string>> {
  const cookiestore = await cookies()
  const token = cookiestore.get('auth')
  if (!token?.value) {
    return {
      status_code: 401,
      error: 'Unauthorized',
    }
  }
  try {
    const jwt_data = jwt.verify(token.value, key)
    return {
      status_code: 200,
      content: jwt_data.toString(),
    }
  } catch {
    return {
      status_code: 401,
      error: 'Unauthorized',
    }
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
