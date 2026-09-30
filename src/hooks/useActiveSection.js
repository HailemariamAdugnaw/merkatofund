import { useEffect } from 'react'

export function useActiveSection(ids, onActiveChange) {
  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (elements.length === 0) {
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          onActiveChange(visible.target.id)
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5] }
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids, onActiveChange])
}
