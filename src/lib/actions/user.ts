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
    const cookiestore = await cookies()
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
    cookiestore.set('auth', token, {secure: true, sameSite: "strict", httpOnly: true, maxAge: 60 * 60 * 24 * 365})
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
  return await _isAuthorized()
})

export const getUsername = protectedAction(async () => {
  return await isAuthorized()
})

export const logout = protectedAction(async () => {
  const cookiestore = await cookies()
  cookiestore.set('auth', '')
  return {
    status_code: 200,
    content: undefined,
  }
})
