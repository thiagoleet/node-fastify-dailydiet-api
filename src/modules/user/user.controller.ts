import { FastifyReply, FastifyRequest } from 'fastify'
import bcrypt from 'bcrypt'
import { CreateUserInput } from './user.schema'
import { knex } from '../../database'
import { randomUUID } from 'node:crypto'

const SALT_ROUNDS = 10

export async function createUser(
  req: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
) {
  const { password, email, name } = req.body

  // Check if user exists
  const userExists = await knex('users').where('email', email).first()

  if (userExists) {
    return reply.status(400).send({ message: 'User already exists' })
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const id = randomUUID()

    await knex('users').insert({
      id,
      name,
      email,
      password: hash,
    })

    return reply.status(201).send({ id, email, name })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
