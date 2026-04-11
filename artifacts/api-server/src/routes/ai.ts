import { Router } from "express";
import OpenAI from "openai";

const router: Router = Router();

function getClient(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey, timeout: 30_000 });
}

function cleanAndParseJson(raw: string): Record<string, unknown> {
  console.log("[ai] raw response:", raw.slice(0, 500));

  // Strip markdown code fences
  let cleaned = raw.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  // Extract JSON object between first { and last }
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Regex fallback: try to extract key-value pairs
    console.warn("[ai] JSON.parse failed, attempting regex extraction");
    const obj: Record<string, string> = {};
    const pattern = /"(\w+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(cleaned)) !== null) {
      obj[match[1]] = match[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
    if (Object.keys(obj).length > 0) return obj;
    throw new Error("Could not parse AI response as JSON");
  }
}

async function callWithRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.warn("[ai] Retrying after error:", err);
      return callWithRetry(fn, retries - 1);
    }
    throw err;
  }
}

// POST /api/ai/tag-recipe
router.post("/tag-recipe", async (req, res) => {
  const { title, ingredients, steps } = req.body as {
    title?: string; ingredients?: string; steps?: string;
  };

  if (!title || !ingredients || !steps) {
    res.status(400).json({ error: "title, ingredients, and steps are required" });
    return;
  }

  try {
    const client = getClient();
    const completion = await callWithRetry(() =>
      client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `You are a recipe analyzer. Given a recipe title, ingredients and steps, return ONLY a JSON object (no markdown, no explanation) with these exact keys:
- cuisine_tag: one of Indian/Italian/Mexican/Chinese/American/Thai/Japanese/Other
- difficulty_tag: one of Easy/Medium/Hard
- time_tag: one of "Under 15 min"/"15-30 min"/"30-60 min"/"Over 1 hour"
- diet_tag: one of Vegetarian/Vegan/Non-Vegetarian/Eggetarian

Title: ${title}
Ingredients:
${ingredients}
Steps:
${steps}`,
        }],
      })
    );

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const tags = cleanAndParseJson(raw);
    res.json(tags);
  } catch (err) {
    console.error("[ai/tag-recipe]", err);
    res.status(500).json({ error: "Tagging failed" });
  }
});

// POST /api/ai/extract-image
router.post("/extract-image", async (req, res) => {
  const { imageBase64, mimeType } = req.body as {
    imageBase64?: string; mimeType?: string;
  };

  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: "imageBase64 and mimeType are required" });
    return;
  }

  try {
    const client = getClient();

    const completion = await callWithRetry(() =>
      client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: `Look at this image. It may be a recipe photo, a screenshot from social media, a cookbook page, or a photo of cooked food.
Extract any recipe information you can find. If it is just a food photo with no written recipe visible, identify the dish and create a reasonable recipe for it.
Return ONLY a valid JSON object with these fields:
- title (string): the recipe name
- description (string): 1-2 sentence description of the dish
- ingredients (string): one ingredient per line, separated by newlines
- steps (string): one step per line, starting with step number, separated by newlines
- servings (string, optional): e.g. "4 servings"

No markdown, no explanation — return raw JSON only. Never return an error field; always attempt to generate a recipe.`,
            },
          ],
        }],
      })
    );

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = cleanAndParseJson(raw);
    res.json(data);
  } catch (err: unknown) {
    console.error("[ai/extract-image]", err);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      res.status(504).json({ error: "timeout" });
    } else {
      res.status(500).json({ error: "extraction_failed" });
    }
  }
});

export default router;
