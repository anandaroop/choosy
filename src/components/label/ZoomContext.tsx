import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react"

interface ZoomActions {
  show(src: string): void
  hide(): void
}

const noopActions: ZoomActions = {
  show: () => {},
  hide: () => {},
}

/**
 * Split into two contexts so a hover (which only calls the stable
 * show/hide actions) never re-renders anything but ZoomPanel, the one
 * consumer that reads the current src.
 */
const ZoomActionsContext = createContext<ZoomActions>(noopActions)
const ZoomSrcContext = createContext<string | null>(null)

/**
 * Backs the single page-level zoom panel: holds which image (if any) is
 * currently zoomed, and hands out stable show/hide actions to every
 * hoverable thumbnail.
 */
export function ZoomProvider({ children }: PropsWithChildren) {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)

  const actions = useMemo<ZoomActions>(
    () => ({
      show: (src) => setZoomSrc(src),
      hide: () => setZoomSrc(null),
    }),
    []
  )

  return (
    <ZoomActionsContext.Provider value={actions}>
      <ZoomSrcContext.Provider value={zoomSrc}>
        {children}
      </ZoomSrcContext.Provider>
    </ZoomActionsContext.Provider>
  )
}

/**
 * Show/hide actions for a hoverable thumbnail. Falls back to no-ops outside
 * a ZoomProvider, so components using this can still render standalone (as
 * TargetLotCard/CandidateRow's own specs do) without needing a provider.
 */
export function useZoom(): ZoomActions {
  return useContext(ZoomActionsContext)
}

/** The currently zoomed image's src, or null. Read only by ZoomPanel. */
export function useZoomSrc(): string | null {
  return useContext(ZoomSrcContext)
}
