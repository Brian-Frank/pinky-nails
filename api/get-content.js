import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { data, error } = await supabase
    .from('pinky_content')
    .select('section, data')

  if (error) return res.status(500).json({ error: error.message })

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate')
  return res.status(200).json({ data: data || [] })
}
