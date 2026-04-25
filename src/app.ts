import Fastify from 'fastify'
import { swaggerPlugin } from './plugins/swagger'
import { postsRoutes } from './modules/posts/posts.routes'
import { likesRoutes } from './modules/likes/likes.routes'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await swaggerPlugin(app)

  await app.register(postsRoutes)
  await app.register(likesRoutes)

  return app
}
