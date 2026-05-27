export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // parse body manually
  let body = {}
  try {
    let raw = ''
    for await (const chunk of req) raw += chunk
    body = JSON.parse(raw)
  } catch {
    return res.status(400).json({ error: 'Bad request' })
  }

  const { username, password } = body

  const expectedUser = process.env.ADMIN_USER   ?? ''
  const expectedPass = process.env.ADMIN_PASS   ?? ''
  const secret       = process.env.ADMIN_SECRET ?? ''

  // temporary debug — remove after confirming login works
  if (username === 'debug') {
    return res.status(200).json({
      userLen:   expectedUser.length,
      passLen:   expectedPass.length,
      secretLen: secret.length,
      userMatch: username === expectedUser,
      passMatch: password === expectedPass,
    })
  }

  const ok = username === expectedUser && password === expectedPass

  if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' })

  return res.status(200).json({ token: secret })
}
