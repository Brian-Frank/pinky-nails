import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // verify admin token
  const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim()
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  // parse body
  let body = {}
  try {
    let raw = ''
    for await (const chunk of req) raw += chunk
    body = JSON.parse(raw)
  } catch {
    return res.status(400).json({ error: 'Bad request' })
  }

  const { base64, folder = 'general', ext = 'jpg' } = body
  if (!base64) return res.status(400).json({ error: 'Falta base64' })

  // decode base64 (strip data URL prefix if present)
  const clean  = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(clean, 'base64')
  const path   = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { error } = await supabase.storage
    .from('pinky-images')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: false })

  if (error) return res.status(500).json({ error: error.message })

  const { data } = supabase.storage.from('pinky-images').getPublicUrl(path)

  return res.status(200).json({ url: data.publicUrl })
}
