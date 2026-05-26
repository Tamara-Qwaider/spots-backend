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
You are a smart AI trip planner for a travel and meetup app called VIBE.

User profile:
${JSON.stringify(user)}

Available places:
${JSON.stringify(places)}

Return ONLY valid JSON in this exact format:
{
  "title": "short personalized trip title",
  "vibe": "Relaxing | Adventure | Foodie | Cultural | Mixed",
  "summary": "one short sentence explaining the plan",
  "schedule": [
    {
      "time": "Morning",
      "emoji": "🌅",
      "placeId": "place id",
      "placeName": "place name",
      "reason": "short personalized reason",
      "tip": "short useful tip"
    },
    {
      "time": "Afternoon",
      "emoji": "☀️",
      "placeId": "place id",
      "placeName": "place name",
      "reason": "short personalized reason",
      "tip": "short useful tip"
    },
    {
      "time": "Evening",
      "emoji": "🌙",
      "placeId": "place id",
      "placeName": "place name",
      "reason": "short personalized reason",
      "tip": "short useful tip"
    }
  ]
}

Rules:
- Use only places from the provided places list.
- Do not invent place names or ids.
- Choose 3 different places.
- Prefer places matching the user's interests, saved places, viewed places, category, description, and rating.
- Avoid choosing 3 places from the exact same category unless the user strongly prefers it.
- Keep reasons under 18 words.
- Keep tips under 14 words.
- Return JSON only. No markdown. No explanation.
- Prefer places that are reasonably close to each other.
- The title should feel modern, catchy, and personalized.
`,
    });

    const text = response.text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);

    res.json(data);
  } catch (err) {
    console.error("Gemini Trip error:", err);

    const places = req.body.places || [];

    const sortedPlaces = [...places]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    res.json({
      title: "Personalized Day Plan",
      vibe: "Mixed",
      summary: "A simple plan based on highly rated places.",
      schedule: [
        {
          time: "Morning",
          emoji: "🌅",
          placeId: sortedPlaces[0]?._id || sortedPlaces[0]?.id || "",
          placeName: sortedPlaces[0]?.name || "A recommended place",
          reason: "Great place to start your day.",
          tip: "Go early for a better experience.",
        },
        {
          time: "Afternoon",
          emoji: "☀️",
          placeId: sortedPlaces[1]?._id || sortedPlaces[1]?.id || "",
          placeName: sortedPlaces[1]?.name || "Another nice spot",
          reason: "Matches popular travel interests.",
          tip: "Check the weather before going.",
        },
        {
          time: "Evening",
          emoji: "🌙",
          placeId: sortedPlaces[2]?._id || sortedPlaces[2]?.id || "",
          placeName: sortedPlaces[2]?.name || "A relaxing evening spot",
          reason: "Perfect way to end the day.",
          tip: "Bring a friend if possible.",
        },
      ],
    });
  }
});

module.exports = router;