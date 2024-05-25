import fastify from 'fastify'
import { userRoutes } from './modules/user/user.route'

const app = fastify()

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})

app.register(userRoutes, { prefix: 'api/users' })

app.get('/api/healthcheck', (req, res) => {
  res.send({ message: 'Success' })
})

export default app
