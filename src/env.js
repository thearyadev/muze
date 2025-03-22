import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    MUSIC_PATH: z.string().default('/music'),
    COVER_ART_PATH: z.string().default('/covers'),
    APP_URL: z.string().default('http://localhost:3000'),
    TAG: z.string().default('dev'),
  },

  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    MUSIC_PATH: process.env.MUSIC_PATH,
    COVER_ART_PATH: process.env.COVER_ART_PATH,
    APP_URL: process.env.APP_URL,
    TAG: process.env.TAG,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
