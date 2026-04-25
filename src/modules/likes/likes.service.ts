import prisma from '../../db/prisma'
import { Prisma } from '../../generated/prisma/client'
import { invalidateCache } from '../../cache/redis'

export async function processLike(postId: string, userId: string): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const result = await tx.postLike.createMany({
      data: [{ postId, userId }],
      skipDuplicates: true,
    })

    if (result.count > 0) {
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      })
    }
  })

  await invalidateCache(
    'posts:list',
    'posts:top',
    `posts:${postId}`,
    `posts:${postId}:likes`,
  )
}
