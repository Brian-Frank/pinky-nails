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

  const { section, data } = body
  if (!section || data === undefined) {
    return res.status(400).json({ error: 'Faltan section y data' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { error } = await supabase
    .from('pinky_content')
    .upsert({ section, data, updated_at: new Date().toISOString() })

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ ok: true })
}
