import { useEffect, useRef } from "react"

// Runs `callback` every `intervalMs`, but only while the tab is visible.
// When the tab becomes visible again it refreshes once straight away.
// It does not run on first load: call your loader yourself for that.
export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  const latest = useRef(callback)

  useEffect(() => {
    latest.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (!timer) timer = setInterval(() => latest.current(), intervalMs)
    }
    const stop = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
    const onVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        latest.current()
        start()
      }
    }

    if (!document.hidden) start()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [intervalMs, enabled])
}