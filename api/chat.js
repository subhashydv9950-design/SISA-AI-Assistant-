
/* =====================================================
   SISA AI ASSISTANT — PART 1
   SECURE AI BACKEND
===================================================== */

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI backend key is not configured."
    });
  }

  try {
    const body = req.body || {};
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter a prompt."
      });
    }

    if (prompt.length > 8000) {
      return res.status(400).json({
        error: "Prompt is too long."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content:
                "You are SISA AI Assistant, a helpful social media content and writing assistant. Give clear, useful answers in the language the user uses. Never claim a post was published or an action was completed unless the application actually did it."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1200
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "The AI provider returned an error."
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: "The AI returned an empty response."
      });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({
      error: "Unable to contact the AI service."
    });
  }
};

/* =============== PART 1 END =============== */
