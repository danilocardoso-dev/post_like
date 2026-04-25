import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Backend Likes API',
        description: 'API para gerenciar likes em posts com processamento assíncrono via fila, cache de leitura e controle de concorrência.',
        version: '1.0.0',
      },
      tags: [
        { name: 'posts', description: 'Operações relacionadas a posts' },
        { name: 'likes', description: 'Operações relacionadas a likes' },
      ],
    },
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
    },
  })
}
