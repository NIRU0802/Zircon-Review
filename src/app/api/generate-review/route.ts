import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type GeminiResponse = {
  reviews?: unknown;
};

type GenerateReviewRequest = {
  service?: unknown;
  experiences?: unknown;
  language?: unknown;
};

const PRIMARY_MODEL = "gemini-3.5-flash";
const BACKUP_MODEL = "gemini-3.5-flash-lite";

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    reviews: {
      type: "array",
      description: "Exactly three distinct patient review drafts.",
      items: {
        type: "string",
      },
    },
  },
  required: ["reviews"],
};

function cleanJsonText(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code fences if Gemini returns them.
  cleaned = cleaned.replace(/^`json\s*/i, "");
  cleaned = cleaned.replace(/^`\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  // Remove accidental leading/trailing whitespace again.
  return cleaned.trim();
}

function cleanReviews(parsed: GeminiResponse): string[] {
  if (!parsed || !Array.isArray(parsed.reviews)) {
    throw new Error("Gemini response did not contain a reviews array.");
  }

  const reviews = parsed.reviews
    .filter((review): review is string => typeof review === "string")
    .map((review) => review.trim())
    .filter(Boolean);

  if (reviews.length !== 3) {
    throw new Error(
      `Gemini returned ${reviews.length} valid reviews instead of exactly 3.`,
    );
  }

  return reviews;
}

function isRetryableGeminiError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("503") ||
    message.includes("overloaded") ||
    message.includes("temporarily unavailable") ||
    message.includes("timeout") ||
    message.includes("unavailable") ||
    message.includes("not found") ||
    message.includes("404")
  );
}

async function generateWithModel(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string[]> {
  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.9,
      maxOutputTokens: 900,

      responseMimeType: "application/json",
      responseSchema: REVIEW_SCHEMA,
    },


  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const cleanedText = cleanJsonText(text);

  let parsed: GeminiResponse;

  try {
    parsed = JSON.parse(cleanedText) as GeminiResponse;
  } catch {
    // Some SDK/model responses can contain extra text around the JSON.
    // Try to extract the first complete JSON object.
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("Gemini returned invalid JSON.");
    }

    const extracted = cleanedText.slice(firstBrace, lastBrace + 1);

    try {
      parsed = JSON.parse(extracted) as GeminiResponse;
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }


  }

  return cleanReviews(parsed);
}

function buildPrompt(
  service: string,
  experiences: string[],
  language: string,
): string {
  const uniquenessSeed =
    `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
      .toString(36)
      .slice(2)}`;

  return `
You are helping a dental patient express their own genuine experience.

Create exactly THREE different review drafts for a patient who visited:
SERVICE:
${service}

The patient selected ONLY these experiences:
${experiences.map((item) => `- ${item}`).join("\n")}

LANGUAGE:
${language}

IMPORTANT PURPOSE:
These drafts must help the patient express what they selected.
Do not manufacture a promotional review.
Do not add facts that the patient did not select.

STRICT FACT RULES:

* Use ONLY the selected experiences listed above.
* Do not invent treatment results.
* Do not invent pain levels or say there was no pain.
* Do not invent waiting times.
* Do not invent prices or affordability.
* Do not invent doctor names.
* Do not invent staff names.
* Do not invent specific equipment or technology.
* Do not invent cleanliness unless it was selected.
* Do not invent friendliness unless it was selected.
* Do not invent outcomes or guarantees.
* Do not mention awards, expertise, facilities, or marketing claims.
* Do not say "best", "number one", "highly recommended", or similar promotional claims unless they are genuinely expressed by the patient through the selected experiences. Prefer avoiding these claims entirely.

STYLE:

* Natural and believable.
* Written like a real patient, not an advertisement.
* Appropriate for a Google review.
* 45 to 80 words per draft.
* Use natural Indian English when English is selected.
* Use natural Hindi when Hindi is selected.
* Use natural Marathi when Marathi is selected.
* Do not translate awkwardly word-for-word.
* Keep the language conversational.
* Avoid excessive adjectives.
* Do not use emojis.
* Do not use star ratings.
* Do not mention that AI generated the review.
* Do not mention this instruction.

UNIQUENESS:
All three drafts must be meaningfully different.

Use different:

* opening structures
* sentence lengths
* ordering of the selected experiences
* transitions
* wording
* closing style

Do NOT repeatedly begin with:

* "I recently visited..."
* "I had a great experience..."
* "I am very happy..."
* "The staff was very friendly..."
* "I highly recommend..."

Even if another patient selects exactly the same service and experiences, produce fresh wording and a different structure.

UNIQUENESS SEED:
${uniquenessSeed}

OUTPUT:
Return ONLY valid JSON matching this exact structure:

{
"reviews": [
"review one",
"review two",
"review three"
]
}

There must be exactly 3 review strings.
`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateReviewRequest;

    const service =
      typeof body.service === "string" ? body.service.trim() : "";

    const experiences = Array.isArray(body.experiences)
      ? body.experiences.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
      : [];

    const language =
      typeof body.language === "string" ? body.language.trim() : "";

    if (!service) {
      return NextResponse.json(
        { error: "Please select a service." },
        { status: 400 },
      );
    }

    if (experiences.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one experience." },
        { status: 400 },
      );
    }

    if (experiences.length > 6) {
      return NextResponse.json(
        { error: "You can select up to 6 experiences." },
        { status: 400 },
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: "Please select a language." },
        { status: 400 },
      );
    }

    const primaryKey = process.env.GEMINI_API_KEY;
    const backupKey = process.env.GEMINI_API_KEY_BACKUP;

    if (!primaryKey && !backupKey) {
      console.error(
        "[Review Generator] No Gemini API keys configured.",
      );

      return NextResponse.json(
        {
          error:
            "Gemini API keys are not configured on the server.",
        },
        { status: 500 },
      );
    }

    const prompt = buildPrompt(service, experiences, language);

    let reviews: string[] | null = null;
    let primaryError: unknown = null;

    // ------------------------------------------------------------
    // PRIMARY KEY
    // ------------------------------------------------------------

    if (primaryKey) {
      try {
        reviews = await generateWithModel(
          primaryKey,
          PRIMARY_MODEL,
          prompt,
        );

        console.log(
          "[Review Generator] Primary Gemini request succeeded.",
        );
      } catch (error) {
        primaryError = error;

        console.error(
          "[Review Generator] Primary request failed:",
          error,
        );
      }
    }

    // ------------------------------------------------------------
    // BACKUP KEY
    // ------------------------------------------------------------

    if (!reviews && backupKey) {
      const shouldUseBackup =
        !primaryKey ||
        primaryError === null ||
        isRetryableGeminiError(primaryError) ||
        (primaryError instanceof Error &&
          primaryError.message.includes("invalid JSON"));

      if (shouldUseBackup) {
        try {
          reviews = await generateWithModel(
            backupKey,
            BACKUP_MODEL,
            prompt,
          );

          console.log(
            "[Review Generator] Backup Gemini request succeeded.",
          );
        } catch (backupError) {
          console.error(
            "[Review Generator] Backup request failed:",
            backupError,
          );

          if (primaryError) {
            console.error(
              "[Review Generator] Primary error:",
              primaryError,
            );
          }

          return NextResponse.json(
            {
              error:
                "Gemini could not generate the review drafts.",
            },
            { status: 500 },
          );
        }
      }
    }

    if (!reviews) {
      console.error(
        "[Review Generator] No review drafts were generated.",
      );

      return NextResponse.json(
        {
          error:
            "Gemini could not generate the review drafts.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      reviews,
    });


  } catch (error) {
    console.error(
      "[Review Generator] Unexpected server error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Could not create the review drafts.",
      },
      { status: 500 },
    );

  }
}
