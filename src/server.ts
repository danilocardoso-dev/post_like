import { buildApp } from './app'
import { startLikesWorker } from './workers/likes.worker'

async function main() {
  const app = await buildApp()

  startLikesWorker()

  await app.listen({ port: 3000, host: '0.0.0.0' })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
