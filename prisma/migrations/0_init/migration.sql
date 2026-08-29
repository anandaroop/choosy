-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "labelerId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "targetLotId" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "candidateLotId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_labelerId_datasetId_idx" ON "Submission"("labelerId", "datasetId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_datasetId_targetLotId_labelerId_key" ON "Submission"("datasetId", "targetLotId", "labelerId");

-- CreateIndex
CREATE INDEX "Rating_submissionId_idx" ON "Rating"("submissionId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

