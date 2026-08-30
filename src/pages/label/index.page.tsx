import { useState } from "react"
import { Box, Button, Spacer, Text, useToasts } from "@artsy/palette"

import { CandidateRow } from "components/label/CandidateRow"
import { TargetLotCard } from "components/label/TargetLotCard"
import { useTaskDuration } from "components/label/useTaskDuration"
import { CandidateRating, Rating } from "labeling/types"
import { submitTask } from "utils/api/mutations"
import { useNextTask } from "utils/hooks/useApi"

type RatingsState = Record<
  string,
  { rating: Rating | null; note: string | null }
>

export default function LabelPage() {
  const { data, mutate } = useNextTask()
  const { sendToast } = useToasts()
  const [ratings, setRatings] = useState<RatingsState>({})
  const [submitting, setSubmitting] = useState(false)

  const item = data?.item
  const durationMs = useTaskDuration(item?.targetId ?? "")

  if (!data) {
    return null
  }

  if (!item) {
    return <Text>All caught up — no more items to label.</Text>
  }

  const ratingsForItem = item.candidates.map(
    (candidate) => ratings[candidate.id] ?? { rating: null, note: null }
  )
  const allRated = ratingsForItem.every((r) => r.rating !== null)

  function updateRating(candidateId: string, rating: Rating) {
    setRatings((prev) => ({
      ...prev,
      [candidateId]: { rating, note: prev[candidateId]?.note ?? null },
    }))
  }

  function updateNote(candidateId: string, note: string) {
    setRatings((prev) => ({
      ...prev,
      [candidateId]: { rating: prev[candidateId]?.rating ?? null, note },
    }))
  }

  async function handleSubmit() {
    if (!item) return

    setSubmitting(true)
    const candidateRatings: CandidateRating[] = item.candidates.map(
      (candidate) => {
        const r = ratings[candidate.id] ?? { rating: null, note: null }
        return {
          candidateId: candidate.id,
          rating: r.rating as Rating,
          note: r.note,
        }
      }
    )

    try {
      await submitTask({
        datasetVersion: data.datasetVersion,
        targetId: item.targetId,
        ratings: candidateRatings,
        durationMs,
      })
      setRatings({})
      await mutate()
    } catch (error) {
      sendToast({
        variant: "error",
        message: "Couldn't submit — try again",
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Text>
        {data.progress.completed} of {data.progress.total} rated
      </Text>
      <TargetLotCard target={item.target} />
      <Spacer y={2} />
      {item.candidates.map((candidate) => {
        const r = ratings[candidate.id] ?? { rating: null, note: null }
        return (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            rating={r.rating}
            note={r.note}
            onRatingChange={(rating) => updateRating(candidate.id, rating)}
            onNoteChange={(note) => updateNote(candidate.id, note)}
          />
        )
      })}
      <Spacer y={2} />
      <Button
        onClick={handleSubmit}
        disabled={!allRated || submitting}
        loading={submitting}
      >
        Submit
      </Button>
    </Box>
  )
}
