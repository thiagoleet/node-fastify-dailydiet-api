import { FastifyInstance } from 'fastify'
import {
  createMeal,
  deleteMeal,
  getMeal,
  getMeals,
  mealSummary,
  updateMeal,
} from './meal.controller'
import { $ref } from './meal.schema'

export async function mealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref('mealSchema'),
        response: {
          201: $ref('mealResponseSchema'),
        },
      },
    },
    createMeal,
  )

  app.get('/', { preHandler: [app.authenticate] }, getMeals)

  app.get('/:id', { preHandler: [app.authenticate] }, getMeal)

  app.put(
    '/:id',
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref('mealSchema'),
        response: {
          200: $ref('mealResponseSchema'),
        },
      },
    },
    updateMeal,
  )

  app.delete('/:id', { preHandler: [app.authenticate] }, deleteMeal)

  app.get('/summary', { preHandler: [app.authenticate] }, mealSummary)

  app.log.info('meal routes registered')
}
