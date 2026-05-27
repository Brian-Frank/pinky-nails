export default function handler(req, res) {
  // only POST
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body ?? {}

  const ok =
    username === process.env.ADMIN_USER &&
    password  === process.env.ADMIN_PASS

  if (!ok) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  // return the server-side secret as session token
  return res.status(200).json({ token: process.env.ADMIN_SECRET })
}
