import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface AgentRequest {
  prompt: string;
  householdMembers: { id: string; display_name: string; role: string }[];
  timezone: string;
}

const tools = [
  {
    type: "function",
    function: {
      name: "create_schedule_event",
      description: "Ajoute un RDV, entraînement sportif ou événement familial",
      parameters: {
        type: "object",
        properties: {
          member_name: { type: "string" },
          title: { type: "string" },
          category: { type: "string", enum: ["rdv", "sport", "ecole", "perso", "autre"] },
          start_at: { type: "string" },
          end_at: { type: "string" },
          location: { type: "string" },
          rrule: { type: "string" }
        },
        required: ["member_name", "title", "category", "start_at", "end_at"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_medication_plan",
      description: "Planifie un rappel de prise de médicament",
      parameters: {
        type: "object",
        properties: {
          member_name: { type: "string" },
          med_name: { type: "string" },
          dosage: { type: "string" },
          schedule_times: { type: "array", items: { type: "string" } },
          meal_instruction: { type: "string" },
          duration_days: { type: "number" }
        },
        required: ["member_name", "med_name", "dosage", "schedule_times"]
      }
    }
  }
];

serve(async (req) => {
  try {
    const body = (await req.json()) as AgentRequest;
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY manquante" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const systemPrompt = [
      "Tu es l'assistant familial chargé d'organiser l'agenda, les sports, les RDV et les médicaments.",
      `Fuseau horaire : ${body.timezone}.`,
      `Membres de la famille : ${JSON.stringify(body.householdMembers)}.`,
      "Utilise toujours les outils fournis pour créer un événement ou un plan de médicament."
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: body.prompt }
        ],
        tools,
        tool_choice: "auto"
      })
    });

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    return new Response(
      JSON.stringify({
        reply: message?.content ?? "",
        tool_calls: message?.tool_calls ?? []
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});
