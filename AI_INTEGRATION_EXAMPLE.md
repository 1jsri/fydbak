# AI Integration Example

This document provides example code for implementing the AI clarification and summary features.

## Option 1: Using OpenAI GPT-4

### Edge Function: analyze-response

Create: `supabase/functions/analyze-response/index.ts`

```typescript
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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { question, answer, attemptNumber }: RequestBody = await req.json();

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing survey responses. Determine if an answer is vague or lacks detail.
            If it needs clarification, generate a friendly follow-up question to get a specific example or more detail.

            Return JSON: { "needsClarification": boolean, "clarificationPrompt": string | null }

            An answer needs clarification if it:
            - Is very short (< 10 words)
            - Is vague ("good", "fine", "okay")
            - Lacks specific examples
            - Doesn't answer the question

            Max ${2 - attemptNumber} clarification attempts remaining.`
          },
          {
            role: "user",
            content: `Question: ${question}\n\nAnswer: ${answer}\n\nAttempt: ${attemptNumber + 1}/2`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Edge Function: generate-summary

Create: `supabase/functions/generate-summary/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all responses for this session
    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select("*, questions(*)")
      .eq("session_id", sessionId);

    if (responsesError) throw responsesError;

    // Format for AI
    const conversationText = responses
      .map((r: any) => `Q: ${r.questions.question_text}\nA: ${r.answer_text}`)
      .join("\n\n");

    // Call OpenAI for summary
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing employee feedback. Generate:
            1. A concise 2-3 sentence summary
            2. 2-3 specific, actionable recommendations
            3. A honesty score (0-100) based on specificity and detail

            Return JSON: {
              "summary": string,
              "actionPoints": [{ "text": string, "priority": "high" | "medium" | "low" }],
              "honestyScore": number,
              "keyThemes": string[]
            }`
          },
          {
            role: "user",
            content: conversationText
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Save to database
    const { error: insertError } = await supabase
      .from("session_summaries")
      .insert({
        session_id: sessionId,
        ai_summary: analysis.summary,
        action_points: analysis.actionPoints,
        honesty_score: analysis.honestyScore,
        key_themes: analysis.keyThemes,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, ...analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

## Option 2: Using Anthropic Claude

### Similar structure, but use Anthropic API:

```typescript
// Replace OpenAI call with Anthropic:
const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `System: ${systemPrompt}\n\nUser: ${userPrompt}`
      }
    ],
  }),
});
```

## Frontend Integration

### Update SurveyChat.tsx

```typescript
// Add this function:
async function checkForClarification(questionText: string, answer: string, attemptNumber: number) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-response`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        question: questionText,
        answer,
        attemptNumber,
      }),
    }
  );

  return await response.json();
}

// In handleSubmit function:
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  // ... existing code ...

  // After saving initial response:
  const analysis = await checkForClarification(
    currentQuestion.question_text,
    answer,
    clarificationAttempts
  );

  if (analysis.needsClarification && clarificationAttempts < 2) {
    // Save clarification to database
    await supabase.from("clarifications").insert({
      response_id: responseId,
      clarification_prompt: analysis.clarificationPrompt,
      attempt_number: clarificationAttempts + 1,
    });

    // Show clarification in UI
    addMessage({
      type: "clarification",
      content: analysis.clarificationPrompt,
    });

    setClarificationAttempts(prev => prev + 1);
  } else {
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      await completeSession();
    }
  }
}

// In completeSession function:
async function completeSession() {
  // ... existing completion code ...

  // Trigger summary generation
  await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ sessionId: session.id }),
    }
  );
}
```

## Deploy Edge Functions

```bash
# Using the Supabase MCP tools (already available in this environment):

# For analyze-response:
# Use mcp__supabase__deploy_edge_function with:
# - name: "analyze-response"
# - slug: "analyze-response"
# - verify_jwt: false (since reps are anonymous)
# - files: [{ name: "index.ts", content: "..." }]

# For generate-summary:
# Same process with name: "generate-summary"
```

## Testing

1. Create a survey
2. Take the survey as a rep
3. Give a short, vague answer (e.g., "it's okay")
4. AI should ask for clarification
5. Complete survey
6. Check that summary appears in manager view

## Cost Estimates

### OpenAI GPT-4
- ~$0.03 per response with clarifications
- ~$0.05 per summary generation
- Estimated: $0.08 per completed survey

### Anthropic Claude
- ~$0.025 per response with clarifications
- ~$0.04 per summary generation
- Estimated: $0.065 per completed survey

## Best Practices

1. Set rate limits on edge functions
2. Cache common clarification patterns
3. Add retry logic for API failures
4. Log all AI interactions for debugging
5. Monitor costs and usage
6. Implement fallbacks if AI is unavailable

## Alternative: Simpler Rule-Based System

If you want to start without AI:

```typescript
function needsClarification(answer: string): boolean {
  const wordCount = answer.trim().split(/\s+/).length;
  const vaguePhrases = ["okay", "fine", "good", "bad", "yes", "no"];
  const isVague = vaguePhrases.some(phrase =>
    answer.toLowerCase().includes(phrase)
  );

  return wordCount < 10 || isVague;
}

function generateClarificationPrompt(question: string): string {
  return `Can you tell me more about that? A specific example would be helpful.`;
}
```

This provides basic clarification without AI costs while you validate the product.
