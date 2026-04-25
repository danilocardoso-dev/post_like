import { FastifyInstance } from 'fastify'
import {
  getAllPostsController,
  getPostByIdController,
  getPostLikesController,
  getTopPostsController,
} from './posts.controller'

const postSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    content: { type: 'string' },
    likesCount: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
  },
}

export async function postsRoutes(app: FastifyInstance) {
  app.get(
    '/posts',
    {
      schema: {
        tags: ['posts'],
        summary: 'Listar todos os posts',
        description: 'Retorna a lista completa de posts ordenada por data de criação.',
        response: {
          200: { type: 'array', items: postSchema },
        },
      },
    },
    getAllPostsController,
  )

  app.get(
    '/posts/top',
    {
      schema: {
        tags: ['posts'],
        summary: 'Ranking de posts por likes',
        description: 'Retorna os 10 posts com maior número de likes em ordem decrescente.',
        response: {
          200: { type: 'array', items: postSchema },
        },
      },
    },
    getTopPostsController,
  )

  app.get(
    '/posts/:id',
    {
      schema: {
        tags: ['posts'],
        summary: 'Buscar post por ID',
        description: 'Retorna os dados de um post específico. Responde 404 se o post não existir.',
        params: {
          type: 'object',
          properties: { id: { type: 'string', format: 'uuid', description: 'ID único do post (UUID)' } },
          required: ['id'],
        },
        response: {
          200: postSchema,
          404: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    getPostByIdController,
  )

  app.get(
    '/posts/:id/likes',
    {
      schema: {
        tags: ['posts'],
        summary: 'Consultar quantidade de likes de um post',
        description: 'Retorna o contador de likes atual de um post específico.',
        params: {
          type: 'object',
          properties: { id: { type: 'string', format: 'uuid', description: 'ID único do post (UUID)' } },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: { likesCount: { type: 'integer', description: 'Quantidade de likes do post' } },
          },
          404: {
            type: 'object',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    getPostLikesController,
  )
}
