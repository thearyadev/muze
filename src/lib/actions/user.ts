'use server'
import { cookies } from 'next/headers'
import * as jwt from 'jsonwebtoken'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import {
  isAuthorized as _isAuthorized,
  key,
  openAction,
  protectedAction,
} from './helper'

export const authorize = openAction(
  async (username: string, password: string) => {
    const cookiestore = cookies()
    const user = (
      await db.select().from(users).where(eq(users.username, username))
    )[0]
    if (!user || user.password !== password) {
      return {
        status_code: 401,
        error: 'Unauthorized',
      }
    }
    const token = jwt.sign(username, key)
    cookiestore.set('auth', token)
    return {
      status_code: 200,
      content: token,
    }
  },
)

export const register = openAction(
  async (username: string, password: string) => {
    await db.insert(users).values({ username: username, password: password })
    return {
      status_code: 200,
      content: undefined,
    }
  },
)

export const isAuthorized = openAction(async () => {
  return _isAuthorized()
})

export const getUsername = protectedAction(async () => {
  return _isAuthorized()
})

export const logout = protectedAction(async () => {
  const cookiestore = cookies()
  cookiestore.set('auth', '')
  return {
    status_code: 200,
    content: undefined,
  }
})
