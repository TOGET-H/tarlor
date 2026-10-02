import { spawn } from 'node:child_process'
import { PrismaClient } from '@prisma/client'

let child
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    if (child) child.kill(signal)
    else process.exit(0)
  })
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    child = spawn(command, args, { stdio: 'inherit', env: process.env })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      child = undefined
      if (signal) process.exit(0)
      else if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
  })
}

await run(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'])
const prisma = new PrismaClient()
let count
try {
  count = await prisma.tarotCard.count()
} finally {
  await prisma.$disconnect()
}
// Existing decks may contain intentional edits. Only initialize an empty deck.
if (count === 0) {
  await run(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'prisma/seed.ts'])
}
await run(process.execPath, ['.output/server/index.mjs'])
