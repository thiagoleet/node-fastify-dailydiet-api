import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.enum(['sqlite3', 'pg']).default('sqlite3'),
  JWT_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  const errorMessage = 'Invalid enviroment variables!'
  console.error(errorMessage, _env.error.format())

  throw new Error(errorMessage)
}

export const env = _env.data
