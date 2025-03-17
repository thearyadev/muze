'use server'
import { db } from '~/server/db'
import {
  isAuthorized as _isAuthorized,
  openAction,
  protectedAction,
} from './helper'
import { userListens, users_data } from '~/server/db/schema'
import { eq, sql, and } from 'drizzle-orm'

export const isAuthorized = openAction(async () => {
  return await _isAuthorized()
})

export const getUsername = protectedAction(async () => {
  return await isAuthorized()
})

export const createUserData = protectedAction(async () => {
  const { content: username } = await getUsername()
  if (username === undefined) {
    return {
      status_code: 401,
      error: 'Unauthorized',
    }
  }
  await db.insert(users_data).values({
    username: username,
    currentTrackId: null,
    currentTrackPosition: 0,
  })
  return {
    status_code: 200,
  }
})

export const setCurrentTrack = protectedAction(async (trackId?: string) => {
  // find user
  const username = (await getUsername()).content ?? ''
  const user = await db
    .select()
    .from(users_data)
    .where(eq(users_data.username, username))
  if (!user) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }
  await db
    .update(users_data)
    .set({ currentTrackId: trackId, currentTrackPosition: 0 })
    .where(eq(users_data.username, username))

  return {
    status_code: 200,
    content: undefined,
  }
})

export const setCurrentTrackPosition = protectedAction(
  async (position: number) => {
    // find user
    const username = (await getUsername()).content ?? ''
    const user = await db
      .select()
      .from(users_data)
      .where(eq(users_data.username, username))
    if (!user[0]) {
      return {
        status_code: 401,
        error: 'Unable to find user.',
      }
    }
    await db
      .update(users_data)
      .set({ currentTrackPosition: Math.floor(position) })
      .where(eq(users_data.username, user[0].username))

    return {
      status_code: 200,
      content: undefined,
    }
  },
)

export const getCurrentTrack = protectedAction(async () => {
  // find user
  const username = (await getUsername()).content ?? ''
  const user = await db
    .select()
    .from(users_data)
    .where(eq(users_data.username, username))
  if (!user[0]) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }
  return {
    status_code: 200,
    content: {
      setCurrentTrackId: user[0].currentTrackId,
      setCurrentTrackPosition: user[0].currentTrackPosition,
    },
  }
})

export const logTrackListen = protectedAction(async (trackId: string) => {
  const username = (await getUsername()).content ?? ''
  const user = await db
    .select()
    .from(users_data)
    .where(eq(users_data.username, username))
  if (!user[0]) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }

  const [lastListen] = await db
    .select({ dt: userListens.lastListen })
    .from(userListens)
    .where(eq(userListens.userId, user[0].id))
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
      and(eq(userListens.userId, user[0].id), eq(userListens.trackId, trackId)),
    )
  if (!trackUserListen) {
    await db.insert(userListens).values({
      userId: user[0].id,
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
          eq(userListens.userId, user[0].id),
          eq(userListens.trackId, trackId),
        ),
      )
  }

  return {
    status_code: 200,
  }
})
