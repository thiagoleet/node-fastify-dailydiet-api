import { FastifyInstance } from 'fastify'
import { $ref } from './user.schema'
import { createUser, login } from './user.controller'

export async function userRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      schema: {
        body: $ref('createUserSchema'),
        response: {
          201: $ref('createUserResponseSchema'),
        },
      },
    },
    createUser,
  )

  app.post(
    '/login',
    {
      schema: {
        body: $ref('loginSchema'),
        response: {
          200: $ref('loginResponseSchema'),
        },
      },
    },
    login,
  )
  app.delete('/logout', () => {})
  app.log.info('user routes registered')
}
