import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

const API_KEY = Deno.env.get('TRANSLATE_API_KEY') || ''

async function translateWord(word: string): Promise<string> {
  if (!API_KEY) {
    console.warn('TRANSLATE_API_KEY no configurada; devolviendo palabra original')
    return word
  }

  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/dictionary?word=${encodeURIComponent(word)}`,
      {
        headers: {
          'X-Api-Key': API_KEY,
        },
      }
    )

    if (!response.ok) {
      console.log(`Dictionary API error for "${word}": ${response.status}`)
      return word
    }

    const data = await response.json()
    console.log(`Dictionary response for "${word}":`, data)

    // La API devuelve "definition" si encuentra el término. Si no, devolvemos el original.
    if (data?.definition) {
      return word
    }

    return word
  } catch (error) {
    console.error(`Error translating "${word}":`, error)
    return word
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { foodName } = await req.json()

    if (!foodName) {
      return new Response(
        JSON.stringify({ error: 'Food name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const translatedFood = await translateWord(foodName)
    console.log(`Translated "${foodName}" to "${translatedFood}"`)

    return new Response(JSON.stringify({ translated: translatedFood }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

