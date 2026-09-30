import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const PRIMARY_MODEL = "gemini-3.5-flash";
const BACKUP_MODEL = "gemini-3.5-flash-lite";

const MAX_REGENERATION_ATTEMPTS = 1;
const MAX_REVIEW_SIMILARITY = 0.72;

const EXPERIENCE_MEANINGS: Record<string, string> = {
  Clarity: "The treatment or advice was easy to understand.",
  Comfort: "The patient felt comfortable during the visit.",
  Care: "The patient felt personally cared for.",
  Expertise: "The patient felt confident in the dentist's knowledge.",
  Communication: "The staff or dentist explained things well.",
  Organisation: "The visit was well managed and organised.",
  Confidence: "The patient felt confident about the treatment.",
  Support: "Help was available when the patient needed it.",
  Hygiene: "The clinic felt clean and hygienic.",
  Professionalism: "The staff behaved professionally.",
  Transparency: "Treatment details and costs were clear.",
  "Follow-up":
    "After-treatment support or follow-up was explained clearly.",
  Convenience: "Booking or the overall visit was easy.",
  Experience: "The overall visit experience was positive.",
  Results: "The patient was happy with the treatment outcome.",
};

const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    reviews: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "string",
      },
    },
  },
  required: ["reviews"],
};

function isRetryableError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");

  const lower = message.toLowerCase();

  return [
    "429",
    "quota",
    "rate limit",
    "resource exhausted",
    "503",
    "overloaded",
    "timeout",
    "timed out",
    "unavailable",
    "internal server error",
  ].some((term) => lower.includes(term));
}

/**
 * Extract JSON safely from Gemini's response.
 *
 * Handles:
 * - normal JSON
 * - ```json ... ```
 * - ``` ... ```
 * - accidental text before/after JSON
 */
function extractJson(text: string): string {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

function parseReviews(text: string): string[] {
  const cleaned = extractJson(text);

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("reviews" in parsed)
  ) {
    throw new Error("Gemini response did not contain reviews.");
  }

  const reviewsValue = (parsed as { reviews?: unknown }).reviews;

  if (!Array.isArray(reviewsValue)) {
    throw new Error("Gemini reviews field is not an array.");
  }

  const reviews = reviewsValue
    .filter((review): review is string => typeof review === "string")
    .map((review) => review.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (reviews.length !== 3) {
    throw new Error("Gemini must return exactly 3 reviews.");
  }

  return reviews;
}

function normalizeWords(text: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "but",
    "by",
    "for",
    "from",
    "had",
    "has",
    "have",
    "i",
    "in",
    "is",
    "it",
    "my",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "was",
    "were",
    "with",
  ]);

  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !stopWords.has(word));
}

function similarity(a: string, b: string): number {
  const wordsA = new Set(normalizeWords(a));
  const wordsB = new Set(normalizeWords(b));

  if (!wordsA.size || !wordsB.size) {
    return 0;
  }

  let intersection = 0;

  for (const word of wordsA) {
    if (wordsB.has(word)) {
      intersection++;
    }
  }

  const union = new Set([...wordsA, ...wordsB]).size;

  return union === 0 ? 0 : intersection / union;
}

function areReviewsTooSimilar(reviews: string[]): boolean {
  if (reviews.length !== 3) {
    return true;
  }

  const similarity12 = similarity(reviews[0], reviews[1]);
  const similarity13 = similarity(reviews[0], reviews[2]);
  const similarity23 = similarity(reviews[1], reviews[2]);

  return (
    similarity12 > MAX_REVIEW_SIMILARITY ||
    similarity13 > MAX_REVIEW_SIMILARITY ||
    similarity23 > MAX_REVIEW_SIMILARITY
  );
}

function buildPrompt(
  service: string,
  experiences: string[],
  language: string,
  regeneration = false
): string {
  const selectedExperiences = experiences
    .map((experience) => {
      const meaning = EXPERIENCE_MEANINGS[experience];

      return `${experience}: ${meaning}`;
    })
    .join("\n");

  return `
Create 3 completely independent patient review drafts for a dental clinic.

SERVICE:
${service}

LANGUAGE:
${language}

PATIENT'S SELECTED EXPERIENCES:
${selectedExperiences}

${regeneration ? `
IMPORTANT:
The previous three drafts were too similar.

Write all three again from scratch.
Use completely different sentence structures, openings, vocabulary, flow and endings.
Do not paraphrase the previous style.
` : ""}

RULES:

1. Write in first person.

2. Make each review sound like a real person naturally describing their own experience.

3. The three reviews must feel like they were written by THREE DIFFERENT PEOPLE.

4. Do not write one review and then rewrite it twice.

5. Every review must have a different:
- opening
- sentence structure
- flow
- experience order
- vocabulary
- closing

6. Keep the wording natural and conversational.

7. Do not make the reviews sound like advertisements.

8. Do not use exaggerated phrases such as:
- best dental clinic
- number one
- world-class
- highly recommended
- top clinic
- amazing technology
- perfect treatment
- outstanding service

9. Do not invent facts.

10. Only use information supported by the selected experiences.

11. Do not invent:
- doctor names
- staff names
- prices
- discounts
- waiting times
- equipment
- technology
- medicines
- procedures
- qualifications
- awards
- certifications
- guarantees
- medical outcomes
- pain-free claims

12. The service name only tells you what the patient visited for. It does not give permission to invent treatment details.

13. "Comfort" means the patient felt comfortable.
Do not automatically turn it into "the treatment was painless."

14. "Expertise" means the patient felt confident in the dentist's knowledge.
Do not turn it into "the dentist is the best."

15. "Results" means the patient was happy with the treatment outcome.
Do not invent a specific medical result.

16. Do not repeatedly use:
"I had a great experience"
"I am very happy"
"Overall"
"Highly recommended"

17. Avoid identical phrases between the three reviews.

18. Each review should normally be around 45–75 words.

19. Do not mention AI or review generation.

20. Do not use emojis.

21. Do not use hashtags.

22. Do not use bullet points inside reviews.

IMPORTANT HUMAN STYLE:

The reviews should be natural rather than artificially perfect.

Use different sentence lengths.

Some reviews can begin directly with what the patient appreciated.

Another can begin with why they visited.

Another can begin with what stood out during the appointment.

Do not force the same structure on all three.

Return ONLY this JSON:

{
  "reviews": [
    "Review 1",
    "Review 2",
    "Review 3"
  ]
}
`;
}

async function generateReviews(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string[]> {
  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 1.05,
      maxOutputTokens: 1000,
      responseMimeType: "application/json",
      responseSchema: REVIEW_SCHEMA,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseReviews(text);
}

async function generateUsingAvailableKey(
  prompt: string
): Promise<string[]> {
  const primaryKey = process.env.GEMINI_API_KEY;
  const backupKey = process.env.GEMINI_API_KEY_BACKUP;

  if (!primaryKey && !backupKey) {
    throw new Error(
      "Gemini API key is not configured."
    );
  }

  if (primaryKey) {
    try {
      return await generateReviews(
        primaryKey,
        PRIMARY_MODEL,
        prompt
      );
    } catch (error) {
      console.error(
        "Primary Gemini generation failed:",
        error
      );

      if (!isRetryableError(error) && !backupKey) {
        throw error;
      }
    }
  }

  if (backupKey) {
    try {
      return await generateReviews(
        backupKey,
        BACKUP_MODEL,
        prompt
      );
    } catch (error) {
      console.error(
        "Backup Gemini generation failed:",
        error
      );

      throw error;
    }
  }

  throw new Error("Unable to generate reviews.");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const service =
      typeof body?.service === "string"
        ? body.service.trim()
        : "";

    const experiences = Array.isArray(body?.experiences)
      ? body.experiences
          .filter(
            (experience: unknown): experience is string =>
              typeof experience === "string"
          )
          .map((experience: string) => experience.trim())
          .filter(Boolean)
      : [];

    const language =
      typeof body?.language === "string"
        ? body.language.trim()
        : "";

    if (!service) {
      return NextResponse.json(
        {
          error: "Please select a service.",
        },
        { status: 400 }
      );
    }

    if (
      experiences.length < 1 ||
      experiences.length > 6
    ) {
      return NextResponse.json(
        {
          error: "Please select between 1 and 6 experiences.",
        },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        {
          error: "Please select a language.",
        },
        { status: 400 }
      );
    }

    const invalidExperience = experiences.find(
      (experience: string) =>
        !Object.prototype.hasOwnProperty.call(
          EXPERIENCE_MEANINGS,
          experience
        )
    );

    if (invalidExperience) {
      return NextResponse.json(
        {
          error: "One or more selected experiences are invalid.",
        },
        { status: 400 }
      );
    }

    // First generation.
    let reviews = await generateUsingAvailableKey(
      buildPrompt(
        service,
        experiences,
        language,
        false
      )
    );

    // Only regenerate once if the reviews are obviously too similar.
    if (
      areReviewsTooSimilar(reviews) &&
      MAX_REGENERATION_ATTEMPTS > 0
    ) {
      console.log(
        "Generated reviews were too similar. Regenerating once."
      );

      reviews = await generateUsingAvailableKey(
        buildPrompt(
          service,
          experiences,
          language,
          true
        )
      );
    }

    // If the second set is still too similar, return it rather
    // than repeatedly calling Gemini and making the user wait.
    return NextResponse.json({
      reviews,
    });
  } catch (error) {
    console.error(
      "Generate review API error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate reviews.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}