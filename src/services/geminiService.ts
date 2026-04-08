import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Opportunity {
  title: string;
  type: "Conference" | "Speaking Engagement" | "Grant" | "Networking" | "Sponsorship" | "Other";
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
    ? "upcoming travel opportunities, conferences, speaking engagements, grants, networking events, and sponsorship opportunities"
    : targetCategory === "AI funds"
    ? "AI grants, AI funding for nonprofits and impact startups, and AI venture funds"
    : `upcoming ${targetCategory.toLowerCase()}`;

  let additionalInstructions = `
CRITICAL: All opportunities MUST be currently active and up-to-date. Do NOT include any expired opportunities or those with a passed deadline. Ensure all deadlines and event dates are in the future.`;

  if (targetCategory === "All" || targetCategory === "Grants") {
    additionalInstructions += `
For Grants and funding opportunities, you MUST specifically search and include active opportunities from the following top AgriTech investors:
- AgFunder (https://agfunder.com)
- Omnivore (https://www.omnivore.vc)
- The Yield Lab (https://www.theyieldlab.com)
- S2G Ventures (https://www.s2gventures.com)
- GROW Accelerator (https://gogrow.co)
- Better Bite Ventures (https://www.betterbite.vc)
- AgriZeroNZ (https://agrizeronz.com)
- Blue Horizon (https://bluehorizon.com)
- Supply Change Capital (https://supplychange.fund)
- Rabo Ventures (https://www.rabobank.com)`;
  }

  if (targetCategory === "All" || targetCategory === "AI funds") {
    additionalInstructions += `
For AI funds, you MUST specifically search for active opportunities from the following sources, as well as many more related relevant available funding sources:
- OpenAI People-First AI Fund
- Google.org AI for Social Good Program
- UNICEF Venture Fund
- Mercy Corps Ventures (AI for Financial Resilience)
- Technovation AI Ventures Accelerator
- AI for Good Impact Awards
- EU Grants & Accelerators (e.g., FFPlus)
- Digital Rights Fund (WANA Region)
- IndiaAI Innovation Challenge 2026
- FundsforNGOs (AI-related grant opportunities)
- Zeffy AI Grant Finder
Also, expand your search to find other relevant AI grants for nonprofits and impact startups.`;
  }

  const prompt = `
You are an expert career and networking assistant for an AgriTech NGO.
The user is a ${role} at ${organization}, working on a product called ${product}.
They are currently based in ${location}.

Your task is to search the web (using Google Search) for ${categoryPrompt} where they can promote ${product}.
Prioritize events in Africa, global virtual events, or major international AgriTech/ICT4D conferences, as well as relevant sponsorship opportunities.
Search across news, event listings, LinkedIn posts (if public), and blogs.
${additionalInstructions}

Extract the top 5-10 most relevant opportunities.
For each opportunity, provide:
- title: The name of the event or opportunity.
- type: "Conference", "Speaking Engagement", "Grant", "Networking", "Sponsorship", or "Other".
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
