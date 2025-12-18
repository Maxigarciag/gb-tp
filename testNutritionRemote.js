// Node 22+ incluye fetch nativo

async function test() {
    try {
      const res = await fetch(
        "https://crgjwoafgirtbmwcqmns.supabase.co/functions/v1/search-nutrition",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "1 apple", quantity: "100" })
        }
      );
  
      if (!res.ok) {
        let errorBody;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = await res.text();
        }
        console.error("Error response from function:", res.status, errorBody);
        return;
      }
  
      const data = await res.json();
      console.log("Nutrition data:", JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error calling search-nutrition function:", err);
    }
  }
  
  test();
  
  