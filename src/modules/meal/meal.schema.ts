import { z } from 'zod'
import { buildJsonSchemas } from 'fastify-zod'

const mealSchema = z.object({
  name: z.string(),
  description: z.string(),
  date_time: z.string(),
  is_diet: z.boolean(),
})

export type MealInput = z.infer<typeof mealSchema>

const mealResponseSchema = z.object({
  meal: z.object({
    id: z.string(),
    user_id: z.string(),
    name: z.string(),
    description: z.string(),
    date_time: z.string(),
    is_diet: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
})

export const { schemas: mealSchemas, $ref } = buildJsonSchemas(
  {
    mealSchema,
    mealResponseSchema,
  },
  { $id: 'meal' },
)
