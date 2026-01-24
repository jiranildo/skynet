import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface AIWineAnalysis {
    name: string;
    producer: string;
    vintage: number;
    type: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';
    region: string;
    country: string;
    grapes: string;
    alcohol_content?: number;
    description?: string;
    food_pairing?: string;
    serving_temp?: string;
    decant_time?: string;
    aging_potential?: string;
    notes?: string;
}

export const analyzeWineLabel = async (imageBase64: string): Promise<AIWineAnalysis | null> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Analyze this wine label image and extract the following information in strict JSON format.
      
      Fields required:
      - name: Full name of the wine
      - producer: Winery or producer name
      - vintage: Year (number), 0 if non-vintage
      - type: One of 'red', 'white', 'rose', 'sparkling', 'fortified', 'dessert'. Infer from color/grapes if not explicit.
      - region: Specific region (e.g. Bordeaux, Napa Valley)
      - country: Country of origin
      - grapes: Grape varieties (e.g. Cabernet Sauvignon)
      - alcohol_content: Alcohol percentage (number)
      - description: A brief but professional sommelier description of what this wine likely tastes like based on its identity.
      - food_pairing: Recommended food pairings.
      - serving_temp: Recommended serving temperature (e.g. "16-18°C").
      - decant_time: Recommended decanting time.
      - aging_potential: Estimated aging potential.
      
      CRITICAL INSTRUCTIONS:
      1. If you can identify the wine, you MAY fill in 'description', 'pairing', 'temp', 'decant', 'aging' based on your knowledge of this specific wine/region/style.
      2. For the LABEL DATA (name, producer, vintage, alcohol), only return what is visible or strongly implied by the specific recognizable label.
      3. If you can't identify the wine or specific fields, return null or empty string for those fields. DO NOT INVENT DATA.
      4. Return ONLY valid JSON, no markdown formatting.
    `;

        // Remove the data URL prefix if present to get just the base64 string
        const base64Data = imageBase64.split(',')[1] || imageBase64;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/jpeg',
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText) as AIWineAnalysis;
    } catch (error) {
        console.error('Error analyzing wine label:', error);
        return null;
    }
};
