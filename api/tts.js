// Vercel serverless function: meneruskan teks ke ElevenLabs tanpa membuka API key ke browser.
// Environment variables yang dibutuhkan (diatur di dashboard Vercel):
//   ELEVENLABS_API_KEY  = API key dari akun ElevenLabs
//   ELEVENLABS_VOICE_ID = ID suara yang dipakai

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Gunakan POST' });
    return;
  }

  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voiceId) {
    res.status(500).json({ error: 'ELEVENLABS_API_KEY atau ELEVENLABS_VOICE_ID belum diatur di Vercel' });
    return;
  }

  const text = req.body && req.body.text;
  if (typeof text !== 'string' || !text.trim() || text.length > 400) {
    res.status(400).json({ error: 'Teks kosong atau lebih dari 400 karakter' });
    return;
  }

  try {
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '/with-timestamps', {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_flash_v2_5' })
    });
    if (!r.ok) {
      res.status(r.status).json({ error: (await r.text()).slice(0, 300) });
      return;
    }
    res.status(200).json(await r.json());
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};
