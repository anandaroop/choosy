import { Box, Flex, Image, Stack, Text } from "@artsy/palette"

import { Lot } from "labeling/types"

interface TargetLotCardProps {
  target: Lot
}

export function TargetLotCard({ target }: TargetLotCardProps) {
  return (
    // zIndex pins this above later positioned descendants (e.g. TextArea's
    // own position:relative wrapper) that would otherwise paint over it
    // while sticky and mid-scroll, since neither side sets one by default
    // and DOM order alone would let the later element win.
    <Box position="sticky" top={0} zIndex={1} bg="mono0" py={2}>
      <Flex gap={2}>
        <Image
          src={target.imageUrl}
          alt={target.title}
          width={120}
          height={120}
        />
        <Stack gap={0.5}>
          <Text variant="sm-display" color="mono60">
            {target.artistName}
          </Text>
          <Text variant="lg-display">{target.title}</Text>
          {target.details && <Text variant="xs">{target.details}</Text>}
        </Stack>
      </Flex>
    </Box>
  )
}
