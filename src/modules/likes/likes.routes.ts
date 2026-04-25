import { FastifyInstance } from 'fastify'
import { likePostController } from './likes.controller'

export async function likesRoutes(app: FastifyInstance) {
  app.post(
    '/posts/:id/like',
    {
      schema: {
        tags: ['likes'],
        summary: 'Registrar um like em um post',
        description: 'Enfileira um job para registrar o like de forma assíncrona. A operação é idempotente — likes duplicados do mesmo usuário são ignorados. Retorna 202 imediatamente enquanto o processamento ocorre em background.',
        params: {
          type: 'object',
          properties: { id: { type: 'string', format: 'uuid', description: 'ID único do post (UUID)' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: { userId: { type: 'string', format: 'uuid', description: 'ID único do usuário que está curtindo (UUID)' } },
          required: ['userId'],
        },
        response: {
          202: {
            type: 'object',
            properties: { message: { type: 'string', example: 'Like enqueued' } },
          },
          404: {
            type: 'object',
            properties: { message: { type: 'string', example: 'Post not found' } },
          },
        },
      },
    },
    likePostController,
  )
}
