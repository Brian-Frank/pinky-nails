import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** null when env vars are not configured */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ── Image upload via server API (avoids client-side header encoding issues) ──

/** Compress + upload a File via /api/upload-image, return public URL */
export async function uploadImage(file, folder = 'general') {
  const compressed = await compressFile(file)
  const base64     = await blobToBase64(compressed)
  const ext        = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const token      = sessionStorage.getItem('pinky-admin-token') || ''

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ base64, folder, ext }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al subir imagen')
  }

  const { url } = await res.json()
  return url
}

/** Read blob as base64 data URL */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload  = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

/** Canvas compress — max 1200px, quality 0.82 */
function compressFile(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload  = ev => {
      const img = new Image()
      img.onerror = reject
      img.onload  = () => {
        let w = img.width, h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim }
          else       { w = Math.round(w * maxDim / h); h = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}
