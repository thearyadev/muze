import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: number
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async jwt({ token, account, profile }) {
      if (account && account.type === 'credentials') {
        token.userId = account.providerAccountId
      }
      return token
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async session({ session, token, user }) {
      session.user.id = Number.parseInt(token.userId as string)
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Username' },
        password: { label: 'Password', type: 'password' },
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(credentials, req) {
        const { username, password } = credentials as {
          username: string
          password: string
        }
        const userQuery = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .execute()

        const user = userQuery.find(() => true)
        if (!user) {
          return null
        }
        if (user.password !== password) {
          return null
        }

        return {
          id: user.id.toString(), // requires string ?
          name: username,
        }
      },
    }),
  ],
}

export const getServerAuthSession = () => getServerSession(authOptions)
