export default async function handler(req, res) {
  // CRITICAL: Use your NEW Personal Web App URL (the one that works in Incognito)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpBlVgt1TXWreJ6Ue-Xw08VzEq7KK8XebNNr7-YYifeEf6r8vDt6OuiQ7Ru9vq2pJT/exec";

  // 1. Handle GET requests (When Dashboard asks for data)
  if (req.method === 'GET') {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // This ensures the Vercel server follows the Google redirect
        redirect: 'follow'
      });

      // Check if we actually got JSON
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Google returned non-JSON response:", text.substring(0, 100));
        return res.status(500).json({ error: "Google Script did not return JSON. Check deployment permissions." });
      }

      const data = await response.json();

      // Normalize the data keys to ensure they match what your React components expect
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
      console.error("API Route Error:", error.message);
      return res.status(500).json({ error: "Server failed to fetch data", details: error.message });
    }
  }

  // 2. Handle POST requests (When Google Script sends new data via onFormSubmit)
  if (req.method === 'POST') {
    const incomingData = req.body;
    console.log("New Data Received from Google:", incomingData);
    return res.status(200).json({ status: "success", received: incomingData });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}