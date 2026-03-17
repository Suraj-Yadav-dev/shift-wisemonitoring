export default async function handler(req, res) {
  // Allow your Vercel URL to access this API
  res.setHeader('Access-Control-Allow-Origin', 'https://shift-wisemonitoring-kprt.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpBlVgt1TXWreJ6Ue-Xw08VzEq7KK8XebNNr7-YYifeEf6r8vDt6OuiQ7Ru9vq2pJT/exec";

  if (req.method === 'GET') {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        return res.status(500).json({ error: "Google Script did not return JSON." });
      }

      const data = await response.json();

      const formattedData = data.map(item => ({
        timestamp: item.timestamp,
        email: item.email,
        project: item.project,
        shift: item.shift,
        target: Number(item.target) || 0,
        achievement: Number(item.achievement) || 0
      }));

      return res.status(200).json(formattedData);

    } catch (error) {
      return res.status(500).json({ error: "Fetch failed", details: error.message });
    }
  }

  if (req.method === 'POST') {
    return res.status(200).json({ status: "success", received: req.body });
  }

  return res.status(405).end(`Method ${req.method} Not Allowed`);
}