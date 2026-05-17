import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { description, event_name, event_type } = await req.json();
    if (!description) {
      return new Response(JSON.stringify({ error: "Description is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      console.error("OPENAI_API_KEY is not configured.");
      return new Response(JSON.stringify({ error: "A server configuration error occurred. Please try again later." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const openAiBaseUrl = (Deno.env.get("OPENAI_BASE_URL") || "https://api.openai.com/v1").replace(/\/$/, "");
    const openAiModel = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

    const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiModel,
        messages: [
          {
            role: "system",
            content: "You are a professional event copywriter. Enhance the given event description to be more compelling, professional, and engaging. Keep the same core message but improve the writing quality, add excitement, and make it more persuasive. Return ONLY the enhanced description text, no extra commentary.",
          },
          {
            role: "user",
            content: `Event name: ${event_name || "Untitled Event"}\nEvent type: ${event_type || "event"}\n\nOriginal description:\n${description}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please update billing." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim() || description;

    return new Response(JSON.stringify({ enhanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enhance-description error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
