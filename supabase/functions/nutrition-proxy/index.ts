import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

// 🔹 Hardcodear temporalmente la API Key para test
const API_KEY = "FOetXjcgs19gDe+wDN4+Pw==aKqPIU0HKZcm3Spl";
const API_URL = "https://api.api-ninjas.com/v1/nutritionitem?query=";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let foodName: string | undefined;
    let quantity: string | undefined;

    if (req.method === "GET") {
      foodName = url.searchParams.get("foodName") ?? undefined;
      quantity = url.searchParams.get("quantity") ?? undefined;
    } else {
      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({ error: "Método no permitido" }),
          { status: 405, headers: corsHeaders }
        );
      }
      const body = await req.json();
      foodName = body?.foodName;
      quantity = body?.quantity;
    }

    if (!foodName || typeof foodName !== "string") {
      return new Response(
        JSON.stringify({ error: "foodName es requerido" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!API_KEY) {
      console.error("nutrition-proxy: falta API_NINJAS_KEY");
      return new Response(
        JSON.stringify({ error: "missing_api_key" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const upstream = new URL(API_URL);
    upstream.searchParams.set("query", foodName);
    if (quantity) upstream.searchParams.set("quantity", quantity);

    const response = await fetch(upstream.toString(), {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("nutrition-proxy upstream error", response.status, text);
      return new Response(
        JSON.stringify({ error: "upstream_failed", status: response.status }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("nutrition-proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
