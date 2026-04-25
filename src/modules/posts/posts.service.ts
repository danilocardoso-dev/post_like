import prisma from '../../db/prisma'
import { getCache, setCache } from '../../cache/redis'

export async function getAllPosts() {
  const cached = await getCache('posts:list')
  if (cached) return cached

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })

  await setCache('posts:list', posts)
  return posts
}

export async function getPostById(id: string) {
  const cached = await getCache(`posts:${id}`)
  if (cached) return cached

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return null

  await setCache(`posts:${id}`, post)
  return post
}

export async function getPostLikes(id: string) {
  const cached = await getCache<{ likesCount: number }>(`posts:${id}:likes`)
  if (cached) return cached

  const post = await prisma.post.findUnique({
    where: { id },
    select: { likesCount: true },
  })

  if (!post) return null

  await setCache(`posts:${id}:likes`, post)
  return post
}

export async function getTopPosts() {
  const cached = await getCache('posts:top')
  if (cached) return cached

  const posts = await prisma.post.findMany({
    orderBy: { likesCount: 'desc' },
    take: 10,
  })

  await setCache('posts:top', posts)
  return posts
}
