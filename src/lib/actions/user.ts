'use server'
import { db } from '~/server/db'
import {
  isAuthorized as _isAuthorized,
  openAction,
  protectedAction,
} from './helper'
import { userListens, users_data } from '~/server/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import type { User } from '~/lib/actions/helper'

export const isAuthorized = openAction(async () => {
  return await _isAuthorized()
})

export const getUsername = protectedAction(async () => {
  return await isAuthorized()
})

export const createUserData = openAction(async () => {
  const username = await isAuthorized()
  if (username.content === undefined) {
    return {
      status_code: 401,
      error: 'Unauthorized',
    }
  }
  await db.insert(users_data).values({
    username: username.content,
    currentTrackId: null,
    currentTrackPosition: 0,
  })
  return {
    status_code: 200,
    content: undefined,
  }
})

export const setCurrentTrack = protectedAction(
  async (user: User, trackId?: string) => {
    await db
      .update(users_data)
      .set({ currentTrackId: trackId, currentTrackPosition: 0 })
      .where(eq(users_data.username, user.username))

    return {
      status_code: 200,
      content: undefined,
    }
  },
)

export const setCurrentTrackPosition = protectedAction(
  async (user: User, position: number) => {
    await db
      .update(users_data)
      .set({ currentTrackPosition: Math.floor(position) })
      .where(eq(users_data.username, user.username))
    return {
      status_code: 200,
      content: undefined,
    }
  },
)

export const getCurrentTrack = protectedAction(async (user: User) => {
  return {
    status_code: 200,
    content: {
      setCurrentTrackId: user.currentTrackId,
      setCurrentTrackPosition: user.currentTrackPosition,
    },
  }
})

export const logTrackListen = protectedAction(
  async (user: User, trackId: string) => {
    const [lastListen] = await db
      .select({ dt: userListens.lastListen })
      .from(userListens)
      .where(eq(userListens.userId, user.id))
      .orderBy(sql`${userListens.lastListen} desc`)
      .limit(1)

    if (lastListen) {
      const diff = new Date().getTime() - lastListen.dt.getTime()
      if (diff < 30000) {
        return {
          status_code: 400,
          error: 'Cooldown period not met.',
        }
      }
    }

    const [trackUserListen] = await db
      .select()
      .from(userListens)
      .where(
        and(eq(userListens.userId, user.id), eq(userListens.trackId, trackId)),
      )
    if (!trackUserListen) {
      await db.insert(userListens).values({
        userId: user.id,
        trackId: trackId,
        listens: 1,
        lastListen: new Date(),
      })
    } else {
      await db
        .update(userListens)
        .set({ lastListen: sql`NOW()`, listens: trackUserListen.listens + 1 })
        .where(
          and(
            eq(userListens.userId, user.id),
            eq(userListens.trackId, trackId),
          ),
        )
    }

    return {
      status_code: 200,
    }
  },
)
