## Integración proxies API Ninjas (nutrition y dictionary)

- Se agregaron funciones Edge en `supabase/functions/nutrition-proxy` y `supabase/functions/dictionary-proxy` para usar la API de Nutrition y Dictionary de API Ninjas desde Supabase.
- Ambas funciones exponen CORS abierto, esperan POST con JSON (`query` o `word`) y reenvían la respuesta cruda de la API externa.
- Las claves se leen desde variables de entorno (`API_NINJAS_KEY`, con respaldo a `NUTRITION_API_KEY` o `DICTIONARY_API_KEY`), evitando hardcodear secretos.
- Manejo de errores: valida parámetros requeridos, responde 400 cuando faltan, 405 en métodos no permitidos, 502 en fallas upstream y 500 en errores internos o falta de clave.

