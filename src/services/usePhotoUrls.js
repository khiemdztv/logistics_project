import { useEffect, useState } from 'react'
import { getPhoto } from './photoStore.js'

// Loads the stored image for each photo id.
export function usePhotoUrls(ids) {
  const [urls, setUrls] = useState({})
  const key = ids.join('|')
  useEffect(() => {
    let active = true
    Promise.all(key ? key.split('|').map(async id => [id, await getPhoto(id)]) : []).then(entries => {
      if (active) setUrls(Object.fromEntries(entries))
    })
    return () => { active = false }
  }, [key])
  return urls
}
