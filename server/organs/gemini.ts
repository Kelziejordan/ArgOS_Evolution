import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here') {
    try {
      geminiClient = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      return geminiClient;
    } catch {
      return null;
    }
  }
  return null;
}
