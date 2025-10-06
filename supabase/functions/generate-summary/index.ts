import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ActionPoint {
  text: string;
  priority: "high" | "medium" | "low";
}

function generateRuleBasedSummary(responses: any[]): {
  summary: string;
  actionPoints: ActionPoint[];
  honestyScore: number;
  keyThemes: string[];
} {
  const totalWords = responses.reduce((sum, r) => {
    const words = r.answer_text?.split(/\s+/).length || 0;
    return sum + words;
  }, 0);

  const avgWordsPerAnswer = Math.round(totalWords / responses.length);

  const hasSpecifics = responses.some(r => {
    const text = r.answer_text?.toLowerCase() || "";
    return text.includes("example") || text.includes("specifically") || text.includes("when");
  });

  const honestyScore = Math.min(100, Math.round(
    (avgWordsPerAnswer * 2) + (hasSpecifics ? 20 : 0)
  ));

  const positiveWords = ["good", "great", "excellent", "happy", "well", "better"];
  const negativeWords = ["bad", "poor", "difficult", "challenge", "problem", "issue"];
  const needWords = ["need", "want", "require", "would like", "should", "could"];

  let sentiment = "neutral";
  responses.forEach(r => {
    const text = r.answer_text?.toLowerCase() || "";
    const hasPositive = positiveWords.some(w => text.includes(w));
    const hasNegative = negativeWords.some(w => text.includes(w));
    if (hasPositive && !hasNegative) sentiment = "positive";
    else if (hasNegative && !hasPositive) sentiment = "negative";
  });

  const hasNeeds = responses.some(r => {
    const text = r.answer_text?.toLowerCase() || "";
    return needWords.some(w => text.includes(w));
  });

  const keywords: string[] = [];
  responses.forEach(r => {
    const text = r.answer_text?.toLowerCase() || "";
    if (text.includes("customer")) keywords.push("customer experience");
    if (text.includes("team")) keywords.push("team dynamics");
    if (text.includes("process") || text.includes("system")) keywords.push("process improvement");
    if (text.includes("support") || text.includes("help")) keywords.push("support needs");
    if (text.includes("time") || text.includes("schedule")) keywords.push("time management");
  });

  const uniqueKeywords = [...new Set(keywords)];

  let summary = `This team member provided ${avgWordsPerAnswer > 20 ? "detailed" : "brief"} feedback across ${responses.length} questions`;

  if (sentiment === "positive") {
    summary += ", highlighting positive experiences and what's working well";
  } else if (sentiment === "negative") {
    summary += ", identifying challenges and areas needing attention";
  } else {
    summary += ", offering a balanced perspective on their experience";
  }

  if (hasSpecifics) {
    summary += ". They shared specific examples and concrete situations";
  }

  if (hasNeeds) {
    summary += ", and clearly expressed needs for additional support or resources";
  }

  summary += ".";

  const actionPoints: ActionPoint[] = [];

  if (sentiment === "negative" || hasNeeds) {
    actionPoints.push({
      text: "Schedule a follow-up conversation to address the concerns and support needs mentioned",
      priority: "high"
    });
  }

  if (uniqueKeywords.length > 0) {
    actionPoints.push({
      text: `Focus on ${uniqueKeywords[0]} based on the themes identified in the responses`,
      priority: "medium"
    });
  }

  if (avgWordsPerAnswer < 15) {
    actionPoints.push({
      text: "Consider using different question formats or one-on-one conversations for deeper feedback",
      priority: "low"
    });
  } else {
    actionPoints.push({
      text: "Share positive feedback patterns with the team to reinforce what's working",
      priority: "medium"
    });
  }

  return {
    summary,
    actionPoints: actionPoints.slice(0, 3),
    honestyScore,
    keyThemes: uniqueKeywords.slice(0, 5),
  };
}

async function generateAISummary(responses: any[]): Promise<{
  summary: string;
  actionPoints: ActionPoint[];
  honestyScore: number;
  keyThemes: string[];
}> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    return generateRuleBasedSummary(responses);
  }

  try {
    const conversationText = responses
      .map(r => `Q: ${r.questions.question_text}\nA: ${r.answer_text || "(skipped)"}` )
      .join("\n\n");

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
            content: `You are analyzing employee feedback from a conversational survey.\n\nGenerate a comprehensive analysis in JSON format:\n{\n  \"summary\": \"2-3 sentence summary of key takeaways\",\n  \"actionPoints\": [\n    { \"text\": \"specific actionable recommendation\", \"priority\": \"high|medium|low\" }\n  ],\n  \"honestyScore\": 0-100 (based on detail, specificity, and authenticity of responses),\n  \"keyThemes\": [\"theme1\", \"theme2\", \"theme3\"]\n}\n\nGuidelines:\n- Summary should be insightful and actionable\n- Provide 2-3 specific action points prioritized by impact\n- Honesty score considers response length, specificity, examples, and authenticity\n- Key themes should capture main topics or concerns mentioned`
          },
          {
            role: "user",
            content: conversationText
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI error:", data.error);
      return generateRuleBasedSummary(responses);
    }

    const result = JSON.parse(data.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("AI summary generation failed, using rule-based fallback:", error);
    return generateRuleBasedSummary(responses);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingSummary } = await supabase
      .from("session_summaries")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (existingSummary) {
      return new Response(
        JSON.stringify({ message: "Summary already exists", id: existingSummary.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: responses, error: responsesError } = await supabase
      .from("responses")
      .select("*, questions(*)")
      .eq("session_id", sessionId)
      .order("created_at");

    if (responsesError) throw responsesError;

    if (!responses || responses.length === 0) {
      throw new Error("No responses found for this session");
    }

    const analysis = await generateAISummary(responses);

    const { data: summary, error: insertError } = await supabase
      .from("session_summaries")
      .insert({
        session_id: sessionId,
        ai_summary: analysis.summary,
        action_points: analysis.actionPoints,
        honesty_score: analysis.honestyScore,
        key_themes: analysis.keyThemes,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});