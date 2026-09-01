import { Box, Image } from "@artsy/palette"

import { useZoomSrc } from "./ZoomContext"

interface ZoomPanelProps {
  /** The zoom fits within a square of this size, preserving aspect ratio. */
  maxZoomSize?: number
}

/**
 * The single, page-level zoom preview. Pinned to a fixed spot in the
 * viewport rather than anchored to whichever thumbnail is hovered, so
 * scrubbing across a row of candidates keeps the eye in one place — only
 * the image underneath it changes. Renders nothing until a ZoomableImage
 * calls show().
 */
export function ZoomPanel({ maxZoomSize = 500 }: ZoomPanelProps) {
  const zoomSrc = useZoomSrc()

  if (!zoomSrc) {
    return null
  }

  return (
    <Box
      data-testid="image-zoom"
      position="fixed"
      top={16}
      right={16}
      zIndex={100}
      p={0.5}
      bg="mono0"
      border="1px solid"
      borderColor="mono30"
      boxShadow="0 4px 12px #00000033"
      // The panel sits away from the thumbnails, so it's very unlikely to
      // sit under the cursor mid-hover — but this removes that risk
      // entirely (e.g. narrow viewports where it could overlap a row).
      style={{ pointerEvents: "none" }}
    >
      <Image
        data-testid="image-zoom-img"
        src={zoomSrc}
        alt=""
        maxWidth={maxZoomSize}
        maxHeight={maxZoomSize}
        style={{ objectFit: "contain" }}
      />
    </Box>
  )
}
