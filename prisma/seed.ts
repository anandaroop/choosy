import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"

/// ts-node doesn't get the .env loading Prisma's own CLI commands do, so
/// load it explicitly here (mirrors Next's own .env.local convention).
config({ path: ".env.local" })
config()

const prisma = new PrismaClient()

const DATASET_ID = "seed-dataset-v1"

/// Fixed so re-running the seed produces byte-identical rows (idempotent).
const SEEDED_AT = new Date("2026-01-01T00:00:00.000Z")

const LABELER_A = "seed-labeler-a"
const LABELER_B = "seed-labeler-b"

async function main() {
  await prisma.rating.deleteMany({})
  await prisma.submission.deleteMany({})

  // Target 1: completed by both labelers, with different ratings, to
  // exercise the overlap-across-labelers behavior.
  const submissionA = await prisma.submission.create({
    data: {
      labelerId: LABELER_A,
      datasetId: DATASET_ID,
      targetLotId: "target-1",
      durationMs: 42_000,
      createdAt: SEEDED_AT,
      ratings: {
        create: [
          {
            candidateLotId: "target-1-candidate-1",
            rating: "strong_match",
            note: null,
          },
          {
            candidateLotId: "target-1-candidate-2",
            rating: "weak_match",
            note: "similar palette",
          },
          {
            candidateLotId: "target-1-candidate-3",
            rating: "no_match",
            note: null,
          },
        ],
      },
    },
  })

  const submissionB = await prisma.submission.create({
    data: {
      labelerId: LABELER_B,
      datasetId: DATASET_ID,
      targetLotId: "target-1",
      durationMs: 58_000,
      createdAt: SEEDED_AT,
      ratings: {
        create: [
          {
            candidateLotId: "target-1-candidate-1",
            rating: "weak_match",
            note: null,
          },
          {
            candidateLotId: "target-1-candidate-2",
            rating: "weak_match",
            note: null,
          },
          {
            candidateLotId: "target-1-candidate-3",
            rating: "strong_match",
            note: "closer than it looks",
          },
        ],
      },
    },
  })

  // Targets 2 and 3 are left untouched so the queue still has work for both
  // labelers.

  const submissionCount = await prisma.submission.count()
  const ratingCount = await prisma.rating.count()

  console.log("Seed complete:")
  console.log(`  ${submissionCount} submissions, ${ratingCount} ratings`)
  console.log(
    `  target-1: completed by ${LABELER_A} (submission ${submissionA.id}) and ${LABELER_B} (submission ${submissionB.id})`
  )
  console.log(`  target-2, target-3: untouched, still in the queue`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
