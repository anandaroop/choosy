import { Box, Flex, Stack, Text } from "@artsy/palette"

import { Lot } from "labeling/types"

import { ZoomableImage } from "./ZoomableImage"

interface TargetLotCardProps {
  target: Lot
}

export function TargetLotCard({ target }: TargetLotCardProps) {
  return (
    <Box
      position="sticky"
      zIndex={1} // pin above note TextAreas that get inserted in the dom
      top={0}
      py={2}
      bg="mono0"
      boxShadow={"0 4px 4px #00000011"}
    >
      <Flex gap={2}>
        <ZoomableImage
          src={target.imageUrl}
          alt={target.title}
          width={200}
          height={200}
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
