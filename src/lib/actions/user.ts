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
    cookiestore.set('auth', token, {secure: process.env.NODE_ENV === 'production', sameSite: "strict", httpOnly: true, maxAge: 60 * 60 * 24 * 365})
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

export const setCurrentTrack = protectedAction(async (trackId?: string) => {
  // find user
  const username = (await getUsername()).content ?? ""
  const user = await db.select().from(users).where(eq(users.username, username))
  if (!user) {
    return {
      status_code: 401,
      error: "Unable to find user.",
    }
  }
  await db.update(users).set({currentTrackId: trackId, currentTrackPosition: 0}).where(eq(users.username, username))

  return {
    status_code: 200,
    content: undefined,
  }
})
export const setCurrentTrackPosition = protectedAction(async (position: number) => {
  // find user
  const username = (await getUsername()).content ?? ""
  const user = await db.select().from(users).where(eq(users.username, username))
  if (!user[0]) {
    return {
      status_code: 401,
      error: "Unable to find user.",
    }
  }
  await db.update(users).set({currentTrackPosition: Math.floor(position)}).where(eq(users.username, user[0].username))

  return {
    status_code: 200,
    content: undefined,
  }
})

export const getCurrentTrack = protectedAction(async () => {
  // find user
  const username = (await getUsername()).content ?? ""
  const user = await db.select().from(users).where(eq(users.username, username))
  if (!user[0]) {
    return {
      status_code: 401,
      error: "Unable to find user.",
    }
  }
  return {
    status_code: 200,
    content: {setCurrentTrackId: user[0].currentTrackId, setCurrentTrackPosition: user[0].currentTrackPosition},
  }
})
