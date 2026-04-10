import { Router } from "express";
import OpenAI from "openai";

const router: Router = Router();

function getClient(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

// POST /api/ai/tag-recipe
// Body: { title, ingredients, steps }
router.post("/tag-recipe", async (req, res) => {
  const { title, ingredients, steps } = req.body as {
    title?: string;
    ingredients?: string;
    steps?: string;
  };

  if (!title || !ingredients || !steps) {
    res.status(400).json({ error: "title, ingredients, and steps are required" });
    return;
  }

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are a recipe analyzer. Given a recipe title, ingredients and steps, return ONLY a JSON object (no markdown, no explanation) with these exact keys:
- cuisine_tag: one of Indian/Italian/Mexican/Chinese/American/Thai/Japanese/Mediterranean/Other
- difficulty_tag: one of Easy/Medium/Hard
- time_tag: one of "Under 15 min"/"15-30 min"/"30-60 min"/"Over 1 hour"
- diet_tag: one of Vegetarian/Vegan/Non-Vegetarian/Eggetarian

Title: ${title}
Ingredients:
${ingredients}
Steps:
${steps}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const tags = JSON.parse(cleaned);
    res.json(tags);
  } catch (err) {
    console.error("[ai/tag-recipe]", err);
    res.status(500).json({ error: "Tagging failed" });
  }
});

// POST /api/ai/extract-image
// Body: { imageBase64, mimeType }
router.post("/extract-image", async (req, res) => {
  const { imageBase64, mimeType } = req.body as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: "imageBase64 and mimeType are required" });
    return;
  }

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: `Look at this screenshot of a recipe. Extract: title, description (1-2 sentences), ingredients (one per line), steps (one per line). Return ONLY a JSON object with keys: title, description, ingredients, steps. If no recipe is visible, return {"error":"No recipe found"}. No markdown, no explanation — just raw JSON.`,
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const data = JSON.parse(cleaned);
    res.json(data);
  } catch (err) {
    console.error("[ai/extract-image]", err);
    res.status(500).json({ error: "Extraction failed" });
  }
});

export default router;
