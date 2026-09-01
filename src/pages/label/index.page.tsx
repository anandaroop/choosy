import { useEffect, useRef, useState } from "react"
import { Box, Button, Spacer, Text, useToasts } from "@artsy/palette"

import { CandidateRow } from "components/label/CandidateRow"
import { TargetLotCard } from "components/label/TargetLotCard"
import { useTaskDuration } from "components/label/useTaskDuration"
import { ZoomPanel } from "components/label/ZoomPanel"
import { ZoomProvider } from "components/label/ZoomContext"
import { CandidateRating, LabelingItem, Rating } from "labeling/types"
import { submitTask } from "utils/api/mutations"
import { useNextTask } from "utils/hooks/useApi"

type RatingsState = Record<
  string,
  { rating: Rating | null; note: string | null }
>

/** Where keyboard-mode focus should land next, consumed exactly once by an effect. */
type FocusRequest = { kind: "rating"; candidateId: string } | { kind: "submit" }

export default function LabelPage() {
  const { data, mutate } = useNextTask()
  const { sendToast } = useToasts()
  const [ratings, setRatings] = useState<RatingsState>({})
  const [submitting, setSubmitting] = useState(false)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)

  const item = data?.item
  const durationMs = useTaskDuration(item?.targetId ?? "")

  // Keyboard-mode focus plumbing. Keyed by candidateId (not index) so a
  // target swap — new candidate ids on mutate() — can never leave a stale
  // node from the previous target sitting at "position 0".
  const ratingRefs = useRef(new Map<string, HTMLButtonElement>())
  // Typed HTMLElement to match palette's Button ref type; it renders a real
  // <button> at runtime, so .disabled/.focus() below are safe.
  const submitRef = useRef<HTMLElement | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)
  const itemRef = useRef<LabelingItem | undefined>(item)
  itemRef.current = item

  function registerRatingRef(candidateId: string) {
    return (node: HTMLButtonElement | null) => {
      if (node) {
        ratingRefs.current.set(candidateId, node)
      } else {
        ratingRefs.current.delete(candidateId)
      }
    }
  }

  // Consume a focus request after commit, when a just-enabled Submit button
  // (or a freshly-registered next row) actually exists in the DOM. Firing
  // only on a fresh FocusRequest identity — never on a derived boolean like
  // "all rated" — is what keeps this immune to the 200ms re-renders from
  // useTaskDuration: once consumed, focusRequest is null and this is a no-op.
  useEffect(() => {
    if (!focusRequest) return

    const node =
      focusRequest.kind === "submit"
        ? submitRef.current
        : ratingRefs.current.get(focusRequest.candidateId)

    // Guards Button's own loading-blur/tabIndex=-1 behavior mid-submit.
    const isDisabled = node instanceof HTMLButtonElement && node.disabled
    if (node && !isDisabled) {
      node.focus()
    }
    setFocusRequest(null)
  }, [focusRequest])

  // Reset the keyboard cursor to the first candidate whenever a new target
  // loads — including the very first paint. Keyed on targetId alone (not on
  // "allRated" or any per-render value) so the 200ms duration ticks and a
  // same-target SWR revalidation never re-fire this.
  const targetId = item?.targetId ?? null
  useEffect(() => {
    if (!targetId || submitting) return

    const firstCandidateId = itemRef.current?.candidates[0]?.id
    if (!firstCandidateId) return

    // Don't yank focus away from a note the labeler is already editing —
    // relevant since revalidateOnFocus is on by default and window refocus
    // can re-run this effect's dependencies unchanged.
    if (formRef.current?.contains(document.activeElement)) return

    ratingRefs.current.get(firstCandidateId)?.focus()
  }, [targetId, submitting])

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

  // Rate this candidate and advance the keyboard cursor to the next row, or
  // to Submit if this was the last one — computed straight from the
  // candidate list, so there's no separate cursor index to drift out of sync.
  function handleRatingChange(
    index: number,
    candidateId: string,
    rating: Rating
  ) {
    updateRating(candidateId, rating)

    const next = item?.candidates[index + 1]
    setFocusRequest(
      next ? { kind: "rating", candidateId: next.id } : { kind: "submit" }
    )
  }

  function focusRatingControl(candidateId: string) {
    setFocusRequest({ kind: "rating", candidateId })
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
    <ZoomProvider>
      <Box ref={formRef}>
        <Text>
          {data.progress.completed} of {data.progress.total} rated
        </Text>
        <TargetLotCard target={item.target} />
        <Spacer y={2} />
        {item.candidates.map((candidate, index) => {
          const r = ratings[candidate.id] ?? { rating: null, note: null }
          return (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              rating={r.rating}
              note={r.note}
              onRatingChange={(rating) =>
                handleRatingChange(index, candidate.id, rating)
              }
              onNoteChange={(note) => updateNote(candidate.id, note)}
              segmentRef={registerRatingRef(candidate.id)}
              onEscapeFromNote={() => focusRatingControl(candidate.id)}
            />
          )
        })}
        <Spacer y={2} />
        <Button
          ref={submitRef}
          onClick={handleSubmit}
          disabled={!allRated || submitting}
          loading={submitting}
        >
          Submit
        </Button>
      </Box>
      <ZoomPanel />
    </ZoomProvider>
  )
}
