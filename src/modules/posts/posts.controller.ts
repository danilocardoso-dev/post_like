import { FastifyRequest, FastifyReply } from 'fastify'
import * as postsService from './posts.service'

interface PostParams {
  id: string
}

export async function getAllPostsController(_req: FastifyRequest, reply: FastifyReply) {
  const posts = await postsService.getAllPosts()
  return reply.send(posts)
}

export async function getPostByIdController(
  request: FastifyRequest<{ Params: PostParams }>,
  reply: FastifyReply,
) {
  const post = await postsService.getPostById(request.params.id)
  if (!post) return reply.status(404).send({ message: 'Post not found' })
  return reply.send(post)
}

export async function getPostLikesController(
  request: FastifyRequest<{ Params: PostParams }>,
  reply: FastifyReply,
) {
  const result = await postsService.getPostLikes(request.params.id)
  if (!result) return reply.status(404).send({ message: 'Post not found' })
  return reply.send(result)
}

export async function getTopPostsController(_req: FastifyRequest, reply: FastifyReply) {
  const posts = await postsService.getTopPosts()
  return reply.send(posts)
}
