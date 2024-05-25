import { FastifyReply, FastifyRequest } from 'fastify'
import bcrypt from 'bcrypt'
import { CreateUserInput, LoginUserInput } from './user.schema'
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

export async function login(
  req: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply,
) {
  const { email, password } = req.body

  const user = await knex('users').where('email', email).first()

  if (!user) {
    // Not informing that the user does not exist to avoid leaking information
    return reply.status(400).send({ message: 'Invalid email or password' })
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    return reply.status(400).send({ message: 'Invalid email or password' })
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  }

  try {
    const token = req.jwt.sign(payload)

    reply.setCookie('access_token', token, {
      path: '/',
      secure: true,
    })

    return reply.status(200).send({ accessToken: token })
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function getUser(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies.access_token

  if (!token) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const decoded = req.jwt.decode(token)

  if (!decoded) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const { id } = decoded as { id: string }

  const user = await knex('users').where('id', id).first()

  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  return reply.send({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  })
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('access_token')

  return reply.status(200).send({ message: 'Logged out' })
}
