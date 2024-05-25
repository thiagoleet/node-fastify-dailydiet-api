import fastify from 'fastify'
import { userRoutes } from './modules/user/user.route'
import { userSchemas } from './modules/user/user.schema'

const app = fastify()

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})

for (const schema of [...userSchemas]) {
  app.addSchema(schema)
}

app.register(userRoutes, { prefix: 'api/users' })

app.get('/api/healthcheck', (req, res) => {
  res.send({ message: 'Success' })
})

export default app
