import { KeyboardEvent } from "react"
import { Clickable, Flex, Text } from "@artsy/palette"

import { Rating } from "labeling/types"

interface RatingControlProps {
  value: Rating | null
  onChange: (rating: Rating) => void
  /** Ref to the currently-tabbable segment, for a page-level focus registry. */
  segmentRef?: (node: HTMLButtonElement | null) => void | (() => void)
  /** Accessible name for the radiogroup, e.g. "Rating for Red Coat". */
  label?: string
}

export const SEGMENTS: {
  rating: Rating
  label: string
  key: string
  color: string
}[] = [
  { rating: "strong_match", label: "Good", key: "1", color: "green" },
  { rating: "weak_match", label: "Neutral", key: "2", color: "gray" },
  { rating: "no_match", label: "Bad", key: "3", color: "red" },
]

export function RatingControl({
  value,
  onChange,
  segmentRef,
  label,
}: RatingControlProps) {
  // Roving tabindex: only the checked segment is a tab stop, or the first
  // segment when nothing is checked yet — cuts three tab stops per row down
  // to one, and matches the ARIA-recommended radiogroup pattern.
  const activeIndex = Math.max(
    0,
    SEGMENTS.findIndex((s) => s.rating === value)
  )

  // Hoisted from per-button to the group: the focused button's keydown
  // bubbles here regardless of which segment currently has focus, so one
  // handler replaces three. This is also what lets #1/#2/#3 do nothing once
  // focus has moved off this row (e.g. onto Submit) — there's simply no
  // bubbling event to catch.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const segment = SEGMENTS.find((s) => s.key === event.key)
    if (segment) {
      event.preventDefault()
      onChange(segment.rating)
    }
  }

  return (
    <Flex
      role="radiogroup"
      aria-label={label}
      gap={1}
      onKeyDown={handleKeyDown}
    >
      {SEGMENTS.map((segment, index) => (
        <Clickable
          key={segment.rating}
          ref={index === activeIndex ? segmentRef : undefined}
          role="radio"
          aria-checked={value === segment.rating}
          aria-label={segment.label}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => onChange(segment.rating)}
          bg={value === segment.rating ? "mono10" : "mono0"}
          border="1px solid"
          borderColor="mono30"
          px={1}
          py={0.5}
          width={"5em"}
          textAlign={"center"}
        >
          <Text variant="xs" color={segment.color}>
            {segment.label}
          </Text>
        </Clickable>
      ))}
    </Flex>
  )
}
