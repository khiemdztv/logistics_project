import { createPhotoRecord, hasEvidence, makeDemoPhoto } from '../data/evidence.js'
import { putPhoto } from './photoStore.js'

// Quick demo buttons fill results instantly; give each judged item a placeholder
// photo so the "photo before verdict" rule and the report still hold.
export async function addDemoEvidence(dispatch, currentPhotos, items) {
  for (const item of items) {
    if (hasEvidence(currentPhotos, item.target)) continue
    const id = await putPhoto(makeDemoPhoto(item.label, item.verdict))
    dispatch({ type: 'ADD_PHOTO', photo: createPhotoRecord({ id, target: item.target, source: 'demo', name: 'Ảnh mẫu' }) })
  }
}
