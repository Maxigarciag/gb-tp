// Habilita definiciones de la Edge Runtime de Supabase
/* global Deno */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
declare const Deno: typeof globalThis extends { Deno: infer T } ? T : any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

// 🔹 Modo hardcodeado temporal: sin llamadas externas, datos mock
const MOCK_FOODS = [
  { name: "pechuga de pollo", calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fats_per_100g: 3.6 },
  { name: "arroz blanco cocido", calories_per_100g: 130, protein_per_100g: 2.4, carbs_per_100g: 28, fats_per_100g: 0.2 },
  { name: "avena", calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fats_per_100g: 6.9 },
  { name: "banana", calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fats_per_100g: 0.3 },
  { name: "manzana", calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fats_per_100g: 0.2 },
];

function findMockFood(term: string) {
  const lower = term.trim().toLowerCase();
  const exact = MOCK_FOODS.find((f) => f.name === lower);
  if (exact) return exact;
  return MOCK_FOODS.find((f) => lower.includes(f.name.split(" ")[0])) ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Log básico para depuración
    console.log("search-nutrition: request", {
      method: req.method,
      url: req.url,
    });
    let foodName: string | undefined;

    if (req.method === "GET") {
      const url = new URL(req.url);
      foodName = url.searchParams.get("foodName") ?? undefined;
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        foodName = body?.foodName;
      } catch (parseError) {
        console.error("search-nutrition: error parseando JSON", parseError);
        return new Response(
          JSON.stringify({ error: "body_invalido" }),
          { headers: corsHeaders, status: 400 },
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "method_not_allowed" }),
        { headers: corsHeaders, status: 405 },
      );
    }

    if (!foodName) {
      return new Response(
        JSON.stringify({ error: "foodName es requerido" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const mock = findMockFood(foodName);
    if (!mock) {
      return new Response(
        JSON.stringify({ error: "No se encontró información del alimento (mock)" }),
        { headers: corsHeaders, status: 404 }
      );
    }

    return new Response(JSON.stringify(mock), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("search-nutrition error:", error);
    // Respuesta de fallback para no cortar el flujo en modo dev
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : String(error),
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
