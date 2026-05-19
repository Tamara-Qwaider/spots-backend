const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/recommendations", async (req, res) => {
  try {
    const { user, places } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an AI recommendation engine for a travel and meetup app called Kashta.

User:
${JSON.stringify(user)}

Places:
${JSON.stringify(places)}

Return ONLY valid JSON in this format:
{
  "recommendations": [
    {
      "placeId": "place id here",
      "aiReason": "short reason why this place fits the user",
      "matchScore": 0-100
    }
  ]
}

Rules:
- Recommend only from the provided places.
- Prefer places matching interests, saved places, viewed places, category, description, and rating.
- Keep reasons short and natural.
- Sort by matchScore descending.
`,
    });

    const text = response.text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);

    res.json(data);
  } catch (err) {
    console.error("Gemini AI error:", err);
    res.status(500).json({ message: "AI recommendation failed" });
  }
});

router.post("/plan-trip", async (req, res) => {
  try {
    const { user, places } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are a smart AI travel planner for an app called VIBE.

User:
${JSON.stringify(user)}

Places:
${JSON.stringify(places)}

Create a short one-day personalized itinerary using ONLY the provided places.

Return the plan in this exact clean format:

🌅 Morning
Place: [place name]
Why: [one short reason]

☀️ Afternoon
Place: [place name]
Why: [one short reason]

🌙 Evening
Place: [place name]
Why: [one short reason]

Rules:
- Do not write a long introduction.
- Do not write a conclusion.
- Keep each reason under 15 words.
- Use only places from the provided list.
- Make it clean, elegant, and easy to display.
`
    });

    res.json({
      tripPlan: response.text,
    });
  } catch (err) {
  console.error("Gemini Trip error:", err);

  const places = req.body.places || [];

  const sortedPlaces = [...places]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  res.json({
    tripPlan: `
🌅 Morning
Place: ${sortedPlaces[0]?.name || "A recommended place"}
Why: Great place to start your day.

☀️ Afternoon
Place: ${sortedPlaces[1]?.name || "Another nice spot"}
Why: Matches popular travel interests.

🌙 Evening
Place: ${sortedPlaces[2]?.name || "A relaxing evening spot"}
Why: Perfect way to end the day.
`,
  });
}
});

module.exports = router;