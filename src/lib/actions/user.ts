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
import { tryCatch } from '../try-catch'

export const isAuthorized = openAction(async () => {
  return await _isAuthorized()
})

export const getUsername = protectedAction(async () => {
  return await isAuthorized()
})

export const createUserData = openAction(async () => {
  const { data: username, error: errorAuthCheck } = await tryCatch(
    isAuthorized(),
  )
  if (errorAuthCheck) {
    return {
      status_code: 401,
      error: 'Failed to initialize user data',
      content: null,
    }
  }

  if (username.content === null) {
    return {
      status_code: 401,
      error: 'Unauthorized',
      content: null,
    }
  }
  const { data: _, error: errorUserDataCreate } = await tryCatch(
    db.insert(users_data).values({
      username: username.content,
      currentTrackId: null,
      currentTrackPosition: 0,
    }),
  )
  if (errorUserDataCreate) {
    return {
      status_code: 500,
      error: 'Failed to initialize user data',
      content: null,
    }
  }
  return {
    status_code: 200,
    content: undefined,
    error: null,
  }
})

export const setCurrentTrack = protectedAction(
  async (user: User, trackId?: string) => {
    const { data: _, error } = await tryCatch(
      db
        .update(users_data)
        .set({ currentTrackId: trackId, currentTrackPosition: 0 })
        .where(eq(users_data.username, user.username)),
    )

    if (error) {
      return {
        status_code: 500,
        error: 'Failed to set current track',
        content: null,
      }
    }
    return {
      status_code: 200,
      content: undefined,
      error: null,
    }
  },
)

export const setCurrentTrackPosition = protectedAction(
  async (user: User, position: number) => {
    const { data: _, error } = await tryCatch(
      db
        .update(users_data)
        .set({ currentTrackPosition: Math.floor(position) })
        .where(eq(users_data.username, user.username)),
    )
    if (error) {
      return {
        status_code: 500,
        error: 'Failed to set current track position',
        content: null,
      }
    }
    return {
      status_code: 200,
      content: undefined,
      error: null,
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
    error: null,
  }
})

export const logTrackListen = protectedAction(
  async (user: User, trackId: string) => {
    const { data: lastListenQuery, error } = await tryCatch(
      db
        .select({ dt: userListens.lastListen })
        .from(userListens)
        .where(eq(userListens.userId, user.id))
        .orderBy(sql`${userListens.lastListen} desc`)
        .limit(1),
    )

    if (error) {
      return {
        status_code: 500,
        error: 'Failed to get last listen',
        content: null,
      }
    }
    const [lastListen] = lastListenQuery

    if (lastListen) {
      const diff = new Date().getTime() - lastListen.dt.getTime()
      if (diff < 30000) {
        return {
          status_code: 400,
          error: 'Cooldown period not met.',
          content: null,
        }
      }
    }

    const { data: trackUserListenQuery, error: errorTrackUserListen } =
      await tryCatch(
        db
          .select()
          .from(userListens)
          .where(
            and(
              eq(userListens.userId, user.id),
              eq(userListens.trackId, trackId),
            ),
          ),
      )
    if (errorTrackUserListen) {
      return {
        status_code: 500,
        error: 'Failed to set current track position',
        content: null,
      }
    }
    const [trackUserListen] = trackUserListenQuery

    if (!trackUserListen) {
      const { data: _, error } = await tryCatch(
        db.insert(userListens).values({
          userId: user.id,
          trackId: trackId,
          listens: 1,
          lastListen: new Date(),
        }),
      )

      if (error) {
        return {
          status_code: 500,
          error: 'Failed to log track listen',
          content: null,
        }
      }
    } else {
      const { data: _, error } = await tryCatch(
        db
          .update(userListens)
          .set({ listens: trackUserListen.listens + 1 })
          .where(
            and(
              eq(userListens.userId, user.id),
              eq(userListens.trackId, trackId),
            ),
          ),
      )
      if (error) {
        return {
          status_code: 500,
          error: 'Failed to log track listen',
          content: null,
        }
      }
    }

    return {
      status_code: 200,
      content: undefined,
      error: null,
    }
  },
)
