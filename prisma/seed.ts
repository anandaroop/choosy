import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"

/// ts-node doesn't get the .env loading Prisma's own CLI commands do, so
/// load it explicitly here (mirrors Next's own .env.local convention).
config({ path: ".env.local" })
config()

import dataset from "../src/data/loadDataset"

const prisma = new PrismaClient()

/// A dataset has one identity per build: version and id are the same
/// concept (see labeling/types.ts), so submissions are scoped by the
/// dataset's own version rather than a separately-tracked id.
const DATASET_ID = dataset.version

async function main() {
  await prisma.rating.deleteMany({})
  await prisma.submission.deleteMany({})

  // Clean slate: every target in the dataset starts untouched in the queue.
  // Submissions/ratings reference candidate ids by string with no FK to the
  // dataset (see schema.prisma), so any hardcoded seed here would need
  // updating by hand every time the dataset changes — not worth it.

  const submissionCount = await prisma.submission.count()
  const ratingCount = await prisma.rating.count()

  console.log("Seed complete:")
  console.log(`  ${submissionCount} submissions, ${ratingCount} ratings`)
  console.log(
    `  dataset "${DATASET_ID}": ${dataset.items.length} targets, all untouched and in the queue`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
