import { Flex, Text } from "@artsy/palette"
import CheckmarkFillIcon from "@artsy/icons/CheckmarkFillIcon"
import EmptyCheckCircleIcon from "@artsy/icons/EmptyCheckCircleIcon"

interface ProgressIndicatorProps {
  completed: number
  total: number
}

/**
 * A row of one icon per target — filled for each completed one, outlined for
 * each remaining — followed by the "N of M rated" text. The icon row has a
 * fixed size per glyph, so it never shifts width as `completed`/`total`
 * change; only the text after it (which nothing else is laid out against)
 * varies in length.
 */
export function ProgressIndicator({
  completed,
  total,
}: ProgressIndicatorProps) {
  return (
    <Flex alignItems="center" gap={0.5}>
      {Array.from({ length: total }, (_, index) =>
        index < completed ? (
          <CheckmarkFillIcon
            key={index}
            data-testid="progress-completed"
            width={16}
            height={16}
            color="green100"
          />
        ) : (
          <EmptyCheckCircleIcon
            key={index}
            data-testid="progress-remaining"
            width={16}
            height={16}
            color="mono30"
          />
        )
      )}
      <Text ml={0.5}>
        {completed} of {total} rated
      </Text>
    </Flex>
  )
}
