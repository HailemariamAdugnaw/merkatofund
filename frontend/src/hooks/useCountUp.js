import { useEffect, useState } from 'react'

export function useCountUp(target, duration = 1600) {
  const [value, setValue] = useState(0)
  const [node, setNode] = useState(null)

  useEffect(() => {
    if (!node) return undefined
    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.disconnect()
          const start = performance.now()
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(target * eased))
            if (progress < 1) {
              frame = requestAnimationFrame(tick)
            }
          }
          frame = requestAnimationFrame(tick)
        })
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [node, target, duration])

  return [setNode, value]
}
