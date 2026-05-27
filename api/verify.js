export default function handler(req, res) {
  const auth   = req.headers['authorization'] ?? ''
  const token  = auth.replace('Bearer ', '').trim()
  const secret = (process.env.ADMIN_SECRET ?? '').trim()

  if (secret && token === secret) {
    return res.status(200).json({ ok: true })
  }

  return res.status(401).json({ ok: false })
}
