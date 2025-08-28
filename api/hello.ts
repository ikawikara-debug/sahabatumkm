// GET: /api/hello  → health check
export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, msg: 'API up ✅' });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
