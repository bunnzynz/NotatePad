// ARIA live region — announces dynamic score events to screen readers.
// Usage: announce('Quarter note C4, measure 2, beat 1')

let region = null

function getRegion() {
  if (region) return region
  region = document.createElement('div')
  region.setAttribute('role', 'status')
  region.setAttribute('aria-live', 'polite')
  region.setAttribute('aria-atomic', 'true')
  region.className = 'sr-only'
  document.body.appendChild(region)
  return region
}

export function announce(message) {
  const r = getRegion()
  // Clear then set triggers re-announcement even for identical messages
  r.textContent = ''
  requestAnimationFrame(() => {
    r.textContent = message
  })
}
