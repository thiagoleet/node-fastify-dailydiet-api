/* eslint-disable camelcase */
import { randomUUID } from 'node:crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import { MealInput } from './meal.schema'
import { knex } from '../../database'
import { z } from 'zod'

export async function createMeal(
  req: FastifyRequest<{ Body: MealInput }>,
  reply: FastifyReply,
) {
  const { name, description, date_time, is_diet } = req.body
  const user_id = req.user.id
  const id = randomUUID()
  try {
    const meal = await knex('meals')
      .insert({
        id,
        user_id,
        name,
        description,
        date_time,
        is_diet,
      })
      .and.returning('*')

    return reply.status(201).send({ meal: meal[0] })
  } catch (error) {
    console.error('Error inserting meal:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function getMeals(req: FastifyRequest, reply: FastifyReply) {
  const user_id = req.user.id

  const meals = await knex('meals').where({ user_id })

  return reply.status(200).send({ meals, total: meals.length })
}

export async function getMeal(req: FastifyRequest, reply: FastifyReply) {
  const getMealParamsSchema = z.object({ id: z.string().uuid() })
  const { id } = getMealParamsSchema.parse(req.params)
  const user_id = req.user.id

  const meal = await knex('meals')
    .where({
      user_id,
      id,
    })
    .first()

  if (!meal) {
    return reply.status(404).send({ mesage: 'Meal not found' })
  }

  return reply.status(200).send({ meal })
}

export async function updateMeal(
  req: FastifyRequest<{ Body: MealInput }>,
  reply: FastifyReply,
) {
  const getMealParamsSchema = z.object({ id: z.string().uuid() })
  const { id } = getMealParamsSchema.parse(req.params)
  const user_id = req.user.id
  const { name, description, date_time, is_diet } = req.body

  const meal = await knex('meals').where({ id, user_id }).first()

  if (!meal) {
    return reply.status(404).send({ message: 'Meal not found' })
  }

  try {
    const updatedMeal = await knex('meals')
      .where({ id, user_id })
      .update({
        name,
        description,
        date_time,
        is_diet,
        updated_at: knex.fn.now(),
      })
      .returning('*')

    return reply.status(200).send({ meal: updatedMeal[0] })
  } catch (error) {
    console.error('Error updating meal:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function deleteMeal(req: FastifyRequest, reply: FastifyReply) {
  const getMealParamsSchema = z.object({ id: z.string().uuid() })
  const { id } = getMealParamsSchema.parse(req.params)
  const user_id = req.user.id

  const meal = await knex('meals').where({ id, user_id }).first()

  if (!meal) {
    return reply.status(404).send({ message: 'Meal not found' })
  }

  try {
    await knex('meals').where({ id, user_id }).delete()

    return reply.status(204).send()
  } catch (error) {
    console.error('Error deleting meal:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function mealSummary(req: FastifyRequest, reply: FastifyReply) {
  const user_id = req.user.id

  const meals = await knex('meals').where({ user_id })

  let maxSequence = 0
  let currentSequence = 0

  meals.forEach((meal) => {
    if (meal.is_diet) {
      currentSequence += 1
      maxSequence = Math.max(maxSequence, currentSequence)
    } else {
      currentSequence = 0
    }
  })

  const summary = {
    total_meals: meals.length,
    total_meals_in_diet: meals.filter((meal) => meal.is_diet).length,
    total_meals_not_in_diet: meals.filter((meal) => !meal.is_diet).length,
    best_sequence: maxSequence,
  }

  return reply.status(200).send({ summary, total: meals.length })
}
