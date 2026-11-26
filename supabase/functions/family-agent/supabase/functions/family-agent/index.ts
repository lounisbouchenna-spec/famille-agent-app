const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

interface AgentRequestBody {
  prompt?: string;
  householdMembers?: { id: string; display_name: string; role: string }[];
  timezone?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY manquante dans les secrets Supabase" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const body = (await req.json()) as AgentRequestBody;
    const prompt = (body.prompt ?? "").trim();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Le champ prompt est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const membersText = (body.householdMembers ?? [])
      .map((m) => `${m.display_name} (${m.role}, id=${m.id})`)
      .join(", ");
    const timezone = body.timezone || "Europe/Paris";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              `Tu es l'assistant familial du foyer. Fuseau horaire : ${timezone}. ` +
              `Membres du foyer : ${membersText || "non précisés"}. ` +
              "Réponds en français de façon claire, brève et pratique pour l'agenda et le suivi santé."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(
        JSON.stringify({ error: `Erreur OpenAI (${openaiRes.status}): ${errText}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const completion = await openaiRes.json();
    const reply: string =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Demande traitée par l'assistant familial.";

    return new Response(
      JSON.stringify({
        reply,
        tool_calls: []
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
