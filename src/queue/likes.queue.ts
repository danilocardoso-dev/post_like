import { Queue } from 'bullmq'
import { redisConnectionOptions } from '../cache/redis'

export interface LikeJobPayload {
  postId: string
  userId: string
}

export const likesQueue = new Queue<LikeJobPayload>('likes_queue', {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
})
