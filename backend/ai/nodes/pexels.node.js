import 'dotenv/config';

export async function pexelsNode(state) {
  const { scraped, aspectRatio } = state;
  const geminiKey = process.env.GEMINI_API_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;
  
  if (!pexelsKey) {
    console.warn("[Pexels Node] PEXELS_API_KEY is missing. Skipping stock image fetch.");
    return { stockImages: [] };
  }

  let category = "business"; // fallback category

  // 1. Identify category using Gemini 2.5 Flash-Lite
  if (geminiKey && scraped) {
    const prompt = `
Based on the following scraped website data, identify the main business category or best single search term for stock images (e.g., "gym", "restaurant", "lawyer", "dentist", "coffee shop"). 
Only output the exact search term, nothing else. Do not use quotes or punctuation.

Title: ${scraped.title || ''}
Description: ${scraped.description || ''}
Text snippet: ${(scraped.pageText || '').substring(0, 500)}
`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 20, temperature: 0.1 }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          category = text.trim().replace(/[^a-zA-Z0-9\s]/g, '');
        }
      } else {
        console.error("[Pexels Node] Gemini API error:", await response.text());
      }
    } catch (error) {
      console.error("[Pexels Node] Error calling Gemini API:", error);
    }
  }

  console.log(`[Pexels Node] Searching Pexels for category: "${category}"`);

  // 2. Search Pexels for images
  const stockImages = [];
  try {
    // Map the requested aspect ratio to a Pexels orientation
    const orientation = aspectRatio === "16:9" ? "landscape" : aspectRatio === "1:1" ? "square" : "portrait";
    
    const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(category)}&per_page=3&orientation=${orientation}`, {
      headers: {
        Authorization: pexelsKey
      }
    });

    if (pexelsRes.ok) {
      const pexelsData = await pexelsRes.json();
      if (pexelsData.photos && pexelsData.photos.length > 0) {
        // Use large2x or large images for better quality
        stockImages.push(...pexelsData.photos.map(p => p.src.large2x || p.src.large || p.src.original));
      }
    } else {
      console.error("[Pexels Node] Pexels API error:", await pexelsRes.text());
    }
  } catch (error) {
    console.error("[Pexels Node] Error calling Pexels API:", error);
  }

  console.log(`[Pexels Node] Found ${stockImages.length} stock images.`);

  return { stockImages };
}
