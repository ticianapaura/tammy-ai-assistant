import { useSyncExternalStore } from 'react'

// Minimal hash "routing" so every flow is reachable without a router library.
function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHash() {
  return useSyncExternalStore(subscribe, () => window.location.hash.slice(1))
}
