// Habilita definiciones de la Edge Runtime de Supabase
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

// API externa (API Ninjas)
const API_URL = "https://api.api-ninjas.com/v1/nutrition?query=";
// Lee la key desde secretos de Supabase (no del .env del frontend)
const API_KEY = Deno.env.get("NUTRITION_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { foodName } = await req.json();

    if (!foodName) {
      return new Response(
        JSON.stringify({ error: "foodName es requerido" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    if (!API_KEY) {
      console.error("search-nutrition: falta NUTRITION_API_KEY");
      return new Response(
        JSON.stringify({ error: "missing_api_key" }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Llamada a la API externa
    const response = await fetch(`${API_URL}${encodeURIComponent(foodName)}`, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("search-nutrition upstream error", response.status, text);
      return new Response(
        JSON.stringify({ error: "upstream_failed", status: response.status }),
        { headers: corsHeaders, status: 502 }
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No se encontró información del alimento" }),
        { headers: corsHeaders, status: 404 }
      );
    }

    const item = data[0];

    // Normalización para el frontend
    const result = {
      name: item.name,
      calories_per_100g: item.calories,
      protein_per_100g: item.protein_g,
      carbs_per_100g: item.carbohydrates_total_g,
      fats_per_100g: item.fat_total_g,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("search-nutrition error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
