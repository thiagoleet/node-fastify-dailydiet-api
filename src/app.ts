import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import fjwt, { FastifyJWT } from '@fastify/jwt'
import fCookie from '@fastify/cookie'
import { userRoutes } from './modules/user/user.route'
import { userSchemas } from './modules/user/user.schema'
import { env } from './env'

const app = fastify()

// jwt
app.register(fjwt, {
  secret: env.JWT_SECRET,
})

app.addHook('preHandler', async (req) => {
  req.jwt = app.jwt
})
app.register(fCookie, {
  secret: env.COOKIE_SECRET,
  hook: 'preHandler',
})

// Protecting routes
app.decorate(
  'authenticate',
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.access_token

    if (!token) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const decoded = req.jwt.verify<FastifyJWT['user']>(token)
    req.user = decoded
  },
)

// Logger hook
app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})

for (const schema of [...userSchemas]) {
  app.addSchema(schema)
}

// Users Routes
app.register(userRoutes, { prefix: 'api/users' })

// Healthcheck
app.get('/api/healthcheck', (req, res) => {
  res.send({ message: 'Success' })
})

export default app
