import { Worker, Job } from 'bullmq'
import { redisConnectionOptions } from '../cache/redis'
import { processLike } from '../modules/likes/likes.service'
import { LikeJobPayload } from '../queue/likes.queue'

export function startLikesWorker() {
  const worker = new Worker<LikeJobPayload>(
    'likes_queue',
    async (job: Job<LikeJobPayload>) => {
      const { postId, userId } = job.data
      await processLike(postId, userId)
    },
    {
      connection: redisConnectionOptions,
    },
  )

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed: ${err.message}`)
  })

  process.on('SIGTERM', async () => {
    await worker.close()
  })

  return worker
}
