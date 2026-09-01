import { Image } from "@artsy/palette"

import { useHoverIntent } from "./useHoverIntent"
import { useZoom } from "./ZoomContext"

interface ZoomableImageProps {
  src: string
  alt: string
  width: number | string
  height: number | string
  /** Rest-on-hover time before the zoom appears. */
  hoverDelayMs?: number
}

/**
 * A thumbnail that, after being hovered for `hoverDelayMs`, shows a larger
 * version of the same image in the page's single ZoomPanel. Drop-in
 * replacement for palette's Image at the same size.
 */
export function ZoomableImage({
  src,
  alt,
  width,
  height,
  hoverDelayMs = 400,
}: ZoomableImageProps) {
  const { show, hide } = useZoom()
  const { onMouseEnter, onMouseLeave } = useHoverIntent(
    hoverDelayMs,
    () => show(src),
    hide
  )

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}
