export default function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (token && token === process.env.ADMIN_SECRET) {
    return res.status(200).json({ ok: true })
  }

  return res.status(401).json({ ok: false })
}
