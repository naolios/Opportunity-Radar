import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Opportunity {
  title: string;
  type: "Conference" | "Speaking Engagement" | "Grant" | "Networking" | "Job" | "Other";
  date: string;
  location: string;
  description: string;
  url: string;
  relevanceScore: number; // 1-10
}

export async function scanOpportunities(
  role: string,
  organization: string,
  product: string,
  location: string,
  targetCategory: string
): Promise<Opportunity[]> {
  const categoryPrompt = targetCategory === "All" 
    ? "upcoming travel opportunities, conferences, speaking engagements, grants, networking events, and job opportunities"
    : `upcoming ${targetCategory.toLowerCase()}`;

  const prompt = `
You are an expert career and networking assistant for an AgriTech NGO.
The user is a ${role} at ${organization}, working on a product called ${product}.
They are currently based in ${location}.

Your task is to search the web (using Google Search) for ${categoryPrompt} where they can promote ${product} or advance their career.
Prioritize events in Africa, global virtual events, or major international AgriTech/ICT4D conferences, as well as relevant job openings in the AgriTech sector.
Search across news, event listings, LinkedIn posts (if public), job boards, and blogs.

Extract the top 5-10 most relevant opportunities.
For each opportunity, provide:
- title: The name of the event or opportunity (e.g., job title).
- type: "Conference", "Speaking Engagement", "Grant", "Networking", "Job", or "Other".
- date: When it happens (e.g., "October 12-14, 2026" or "TBD").
- location: Where it is (e.g., "Nairobi, Kenya", "Virtual", "Addis Ababa, Ethiopia").
- description: A short description of why it's relevant for promoting ${product}.
- url: A link to the event or opportunity (must be a real URL found in the search).
- relevanceScore: A score from 1 to 10 on how relevant this is for the user.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              date: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              url: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER },
            },
            required: ["title", "type", "date", "location", "description", "url", "relevanceScore"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Opportunity[];
  } catch (error) {
    console.error("Error scanning opportunities:", error);
    throw error;
  }
}
