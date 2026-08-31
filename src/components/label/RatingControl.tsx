import { KeyboardEvent } from "react"
import { Clickable, Flex, Text } from "@artsy/palette"

import { Rating } from "labeling/types"

interface RatingControlProps {
  value: Rating | null
  onChange: (rating: Rating) => void
}

const SEGMENTS: { rating: Rating; label: string; key: string }[] = [
  { rating: "strong_match", label: "Good", key: "1" },
  { rating: "weak_match", label: "Neutral", key: "2" },
  { rating: "no_match", label: "Bad", key: "3" },
]

export function RatingControl({ value, onChange }: RatingControlProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const segment = SEGMENTS.find((s) => s.key === event.key)
    if (segment) {
      onChange(segment.rating)
    }
  }

  return (
    <Flex gap={1}>
      {SEGMENTS.map((segment) => (
        <Clickable
          key={segment.rating}
          role="radio"
          aria-checked={value === segment.rating}
          aria-label={segment.label}
          onClick={() => onChange(segment.rating)}
          onKeyDown={handleKeyDown}
          bg={value === segment.rating ? "mono10" : "mono0"}
          border="1px solid"
          borderColor="mono30"
          px={1}
          py={0.5}
          width={"4em"}
          textAlign={"center"}
        >
          <Text variant="xs">{segment.label}</Text>
        </Clickable>
      ))}
    </Flex>
  )
}
