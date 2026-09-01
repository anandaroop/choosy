import { useState } from "react"
import {
  Clickable,
  Flex,
  Image,
  StackableBorderBox,
  Stack,
  Text,
  TextArea,
  Spacer,
} from "@artsy/palette"

import { Lot, Rating } from "labeling/types"

import { RatingControl } from "./RatingControl"

interface CandidateRowProps {
  candidate: Lot
  rating: Rating | null
  note: string | null
  onRatingChange: (rating: Rating) => void
  onNoteChange: (note: string) => void
  /** Ref to this row's currently-tabbable rating segment, for a page-level focus registry. */
  segmentRef?: (node: HTMLButtonElement | null) => void | (() => void)
  /** Escape pressed while the note is focused — return focus to this row's rating control. */
  onEscapeFromNote?: () => void
}

export function CandidateRow({
  candidate,
  rating,
  note,
  onRatingChange,
  onNoteChange,
  segmentRef,
  onEscapeFromNote,
}: CandidateRowProps) {
  const [noteExpanded, setNoteExpanded] = useState(note !== null)

  return (
    <StackableBorderBox p={1} data-testid={`candidate-row-${candidate.id}`}>
      <Flex gap={1}>
        <RatingControl
          value={rating}
          onChange={onRatingChange}
          segmentRef={segmentRef}
          label={`Rating for ${candidate.title}`}
        />
        <Spacer x={1} />
        <Image
          src={candidate.imageUrl}
          alt={candidate.title}
          width={60}
          height={60}
        />
        <Stack gap={0.5}>
          <Text variant="xs" color="mono60">
            {candidate.artistName}
          </Text>
          <Text variant="sm">{candidate.title}</Text>
          <Text variant="xs" color="mono60">
            {candidate.details}
          </Text>
        </Stack>
      </Flex>
      <Spacer y={1} />
      {noteExpanded ? (
        // TextArea manages its own internal state from defaultValue and
        // ignores a `value` prop — passing one collides with its own
        // rendered defaultValue and triggers React's controlled/uncontrolled
        // warning (a palette@46 quirk). Read the note back out via onChange.
        <TextArea
          defaultValue={note ?? ""}
          onChange={({ value }) => onNoteChange(value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              event.stopPropagation()
              onEscapeFromNote?.()
            }
          }}
          width={"40em"}
          placeholder="Add a note (optional)"
        />
      ) : (
        <Clickable onClick={() => setNoteExpanded(true)}>
          <Text variant="xs">Add note</Text>
        </Clickable>
      )}
    </StackableBorderBox>
  )
}
