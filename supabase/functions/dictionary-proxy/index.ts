import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

// 🔹 Modo hardcodeado temporal
const API_KEY = "FOetXjcgs19gDe+wDN4+Pw==aKqPIU0HKZcm3Spl";
const API_URL = "https://api.api-ninjas.com/v1/dictionary?word=";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const { word } = await req.json();

    if (!word || typeof word !== "string") {
      return new Response(
        JSON.stringify({ error: "word es requerido" }),
        { status: 400, headers: corsHeaders },
      );
    }

    if (!API_KEY) {
      console.error("dictionary-proxy: falta API_NINJAS_KEY");
      return new Response(
        JSON.stringify({ error: "missing_api_key" }),
        { status: 500, headers: corsHeaders },
      );
    }

    const response = await fetch(
      `${API_URL}${encodeURIComponent(word)}`,
      { headers: { "X-Api-Key": API_KEY } },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("dictionary-proxy upstream error", response.status, text);
      return new Response(
        JSON.stringify({ error: "upstream_failed", status: response.status }),
        { status: 502, headers: corsHeaders },
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("dictionary-proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: corsHeaders },
    );
  }
});

