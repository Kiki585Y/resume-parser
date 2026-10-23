const NPOINT_URL = 'https://api.npoint.io/7a3e6cd327e64e36fa1b';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (req.method === 'GET') {
      const r = await fetch(NPOINT_URL + '?t=' + Date.now());
      return res.status(200).json(await r.json());
    } else if (req.method === 'POST') {
      await fetch(NPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      return res.status(200).json({ ok: true });
    }
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
