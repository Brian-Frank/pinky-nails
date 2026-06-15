export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // parse body (algunos runtimes ya lo parsean en req.body; sino leer el stream)
  let body = req.body
  if (!body || typeof body !== 'object') {
    try {
      let raw = ''
      for await (const chunk of req) raw += chunk
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return res.status(400).json({ error: 'Bad request' })
    }
  }

  const { username, password } = body
  const ok = username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS

  if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' })

  return res.status(200).json({ token: process.env.ADMIN_SECRET })
}
