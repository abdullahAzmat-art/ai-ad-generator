import 'dotenv/config';
import { pexelsNode } from '../nodes/pexels.node.js';

// Simulate a state where only 1 image was scraped (not enough → pexels node runs)
const mockState = {
  aspectRatio: "9:16",
  scraped: {
    title: "The best pizza in New York City",
    description: "Award-winning brick oven pizza, fresh ingredients, dine-in or takeout.",
    pageText: "We serve the finest pizza in NYC. Our menu includes margherita, pepperoni, and BBQ chicken pizzas. Visit us today!",
    images: ["https://example.com/one-image.jpg"], // only 1 image → would trigger pexels
    logo: null,
    brandColor: "#FF0000",
  },
};

console.log("Running Pexels Node test...\n");

const result = await pexelsNode(mockState);

console.log("\nPexels Node Result:");
console.log("Stock Images:", result.stockImages);
console.log(`\nTotal images fetched: ${result.stockImages.length}`);
