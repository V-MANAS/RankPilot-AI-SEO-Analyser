import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

console.log("Key exists:", !!process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const response = await ai.models.generateContent({
   model: "models/gemini-2.0-flash",
    contents: "Reply with only the word Hello.",
  });

  console.log(response.text);
} catch (err) {
  console.dir(err, { depth: null });
}