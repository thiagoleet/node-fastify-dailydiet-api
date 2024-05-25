import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export async function userRoutes(app: FastifyInstance) {
  app.get('/', (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ message: '/ route hit' })
  })
  app.post('/register', () => {})
  app.post('/login', () => {})
  app.delete('/logout', () => {})
  app.log.info('user routes registered')
}
