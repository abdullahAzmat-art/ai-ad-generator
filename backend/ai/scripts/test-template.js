import 'dotenv/config';
import { TEMPLATES } from '../lib/templates/index.js';

// Hardcoded test scene
const scene1 = {
  headline: "Get 50% Off Today!",
  body: "",
  durationSec: 4,
  voiceover: "Get 50% Off Today!"
};

const scene2 = {
  headline: "Experience The Difference",
  body: "Crafted with highest quality ingredients.",
  durationSec: 4,
  voiceover: "Experience the difference with premium quality."
};

const scene3 = {
  headline: "Order Now",
  cta: "Shop Now",
  durationSec: 4,
  voiceover: "Shop now while supplies last."
};

// Hardcoded real image URL
const imageUrl = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg';

// Build all scenes
const movie = {
  resolution: "1080x1920",
  quality: "high",
  scenes: [
    TEMPLATES["full-bleed"](scene1, imageUrl),
    TEMPLATES["split"](scene2, imageUrl, "#111111"),
    TEMPLATES["cta-close"](scene3, imageUrl)
  ]
};

console.log("Movie JSON payload:");
console.log(JSON.stringify(movie, null, 2));

async function runTest() {
  const apiKey = process.env.JSON2VIDEO_API_KEY;
  if (!apiKey) {
    console.error("JSON2VIDEO_API_KEY is not set in environment.");
    return;
  }

  try {
    console.log("\nSending to JSON2Video API...");
    const response = await fetch("https://api.json2video.com/v2/movies", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movie)
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

runTest();
