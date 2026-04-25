import { FastifyRequest, FastifyReply } from 'fastify'
import { likesQueue } from '../../queue/likes.queue'
import prisma from '../../db/prisma'

interface LikeParams {
  id: string
}

interface LikeBody {
  userId: string
}

export async function likePostController(
  request: FastifyRequest<{ Params: LikeParams; Body: LikeBody }>,
  reply: FastifyReply,
) {
  const { id: postId } = request.params
  const { userId } = request.body

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return reply.status(404).send({ message: 'Post not found' })

  await likesQueue.add('like', { postId, userId })

  return reply.status(202).send({ message: 'Like enqueued' })
}
