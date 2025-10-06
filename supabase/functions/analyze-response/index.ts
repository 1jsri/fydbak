import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  question: string;
  answer: string;
  attemptNumber: number;
  surveyGoal?: string;
  goalDescription?: string;
}

interface AnalysisResult {
  needsClarification: boolean;
  clarificationPrompt: string | null;
  reason?: string;
  flagged?: boolean;
  flagReason?: string;
}

const VAGUE_PHRASES = [
  "okay", "ok", "fine", "good", "bad", "yes", "no", "maybe",
  "idk", "i don't know", "not sure", "dunno", "whatever",
  "nothing", "none", "n/a", "na"
];

const FOLLOW_UP_PROMPTS = [
  "Could you tell me more about that? A specific example would be really helpful.",
  "Can you share a concrete example or story that illustrates what you mean?",
  "I'd love to hear more details about that. What specifically happened?",
  "That's interesting! Can you elaborate on what you experienced?",
  "Could you walk me through a specific situation where this came up?",
];

const PROFANITY_PATTERNS = [
  /\b(f[u\*]ck|sh[i\*]t|b[i\*]tch|a[s\*]s|d[a\*]mn|cr[a\*]p|hell)\b/gi,
  /\b(idiot|stupid|dumb|moron|hate)\b/gi,
];

const OFF_TOPIC_INDICATORS = [
  "unrelated", "off topic", "random", "not relevant", "whatever"
];

function checkContentModeration(answer: string): { flagged: boolean; flagReason?: string } {
  const trimmedAnswer = answer.trim().toLowerCase();

  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(answer)) {
      return {
        flagged: true,
        flagReason: "Inappropriate language detected. Please keep responses professional."
      };
    }
  }

  if (trimmedAnswer.length < 3) {
    return {
      flagged: true,
      flagReason: "Response too short to be meaningful."
    };
  }

  return { flagged: false };
}

function analyzeResponseQuality(question: string, answer: string): AnalysisResult {
  const trimmedAnswer = answer.trim().toLowerCase();
  const wordCount = trimmedAnswer.split(/\s+/).length;

  if (wordCount < 5) {
    return {
      needsClarification: true,
      clarificationPrompt: FOLLOW_UP_PROMPTS[0],
      reason: "Answer is too short (less than 5 words)"
    };
  }

  const isVague = VAGUE_PHRASES.some(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    return regex.test(trimmedAnswer);
  });

  if (isVague && wordCount < 15) {
    const randomPrompt = FOLLOW_UP_PROMPTS[Math.floor(Math.random() * FOLLOW_UP_PROMPTS.length)];
    return {
      needsClarification: true,
      clarificationPrompt: randomPrompt,
      reason: "Answer contains vague language and is relatively short"
    };
  }

  const hasNoExamples = !trimmedAnswer.includes("example") &&
                        !trimmedAnswer.includes("for instance") &&
                        !trimmedAnswer.includes("like when") &&
                        wordCount < 20;

  if (hasNoExamples) {
    return {
      needsClarification: true,
      clarificationPrompt: "Can you give me a specific example to help me understand better?",
      reason: "Answer lacks specific examples"
    };
  }

  return {
    needsClarification: false,
    clarificationPrompt: null,
    reason: "Answer is detailed and specific"
  };
}

async function analyzeWithAI(question: string, answer: string, attemptNumber: number): Promise<AnalysisResult> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    return analyzeResponseQuality(question, answer);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing survey responses to determine if they need clarification.

An answer needs clarification if it:
- Is very short (less than 10 words)
- Uses vague language like "fine", "okay", "good" without details
- Lacks specific examples or concrete details
- Doesn't actually answer the question asked

Return JSON format: { "needsClarification": boolean, "clarificationPrompt": string | null, "reason": string }

If clarification is needed, generate a friendly, conversational follow-up question that:
- Asks for specific examples
- Encourages storytelling
- Feels natural and supportive

Current attempt: ${attemptNumber + 1} of 2`
          },
          {
            role: "user",
            content: `Question: "${question}"\n\nAnswer: "${answer}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI error:", data.error);
      return analyzeResponseQuality(question, answer);
    }

    const result = JSON.parse(data.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("AI analysis failed, using rule-based fallback:", error);
    return analyzeResponseQuality(question, answer);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { question, answer, attemptNumber, surveyGoal, goalDescription }: RequestBody = await req.json();

    if (!question || !answer) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const moderationCheck = checkContentModeration(answer);
    if (moderationCheck.flagged) {
      return new Response(
        JSON.stringify({
          needsClarification: false,
          clarificationPrompt: null,
          flagged: true,
          flagReason: moderationCheck.flagReason,
          reason: "Content moderation"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (attemptNumber >= 2) {
      return new Response(
        JSON.stringify({
          needsClarification: false,
          clarificationPrompt: null,
          reason: "Maximum clarification attempts reached"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = await analyzeWithAI(question, answer, attemptNumber);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-response:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});