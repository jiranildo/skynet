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
    best_drinking_window?: string;
    terroir?: string;
    intensity?: number;
    visual_perception?: string;
    olfactory_perception?: string;
    palate_perception?: string;
    notes?: string;
}

const WINE_ANALYSIS_PROMPT = `
      Extract the following information about this wine in strict JSON format.
      
      Fields required:
      - name: Full name of the wine
      - producer: Winery or producer name
      - vintage: Year (number), 0 if non-vintage
      - type: One of 'red', 'white', 'rose', 'sparkling', 'fortified', 'dessert'.
      - region: Specific region (e.g. Bordeaux, Napa Valley)
      - country: Country of origin
      - grapes: Grape varieties (e.g. Cabernet Sauvignon)
      - alcohol_content: Alcohol percentage (number)
      - description: A brief but professional sommelier description.
      - food_pairing: Recommended food pairings.
      - serving_temp: Recommended serving temperature (e.g. "16-18°C").
      - decant_time: Recommended decanting time.
      - aging_potential: Estimated aging potential.
      - best_drinking_window: Estimated best drinking window (e.g. "2024 - 2030").
      - terroir: Information about the terroir.
      - intensity: A number from 1 to 5 representing body/intensity.
      - visual_perception: Descriptive notes about appearance.
      - olfactory_perception: Descriptive notes about aroma.
      - palate_perception: Descriptive notes about flavor/texture.
      
      CRITICAL INSTRUCTIONS:
      1. Use your broad knowledge of wine to provide accurate professional details.
      2. If you don't have certain information, return null or empty string. DO NOT INVENT DATA.
      3. Return ONLY valid JSON, no markdown formatting.
    `;

export const analyzeWineLabel = async (imageBase66: string): Promise<AIWineAnalysis | null> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
      Analyze this wine label image and extract the following information.
      ${WINE_ANALYSIS_PROMPT}
    `;

        // Detect mime type from the base64 string
        const mimeTypeMatch = imageBase66.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

        // Robust base64 extraction
        const base66Data = imageBase66.includes('base64,') ? imageBase66.split('base64,')[1] : imageBase66;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base66Data,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start === -1 || end === -1) throw new Error('No JSON found in response');

        const jsonString = text.substring(start, end + 1);
        return JSON.parse(jsonString) as AIWineAnalysis;
    } catch (error) {
        console.error('Error analyzing wine label:', error);
        return null;
    }
};

export const searchWineInfo = async (query: string): Promise<AIWineAnalysis | null> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
      Search for professional information about the following wine: "${query}"
      ${WINE_ANALYSIS_PROMPT}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start === -1 || end === -1) throw new Error('No JSON found in response');

        const jsonString = text.substring(start, end + 1);
        return JSON.parse(jsonString) as AIWineAnalysis;
    } catch (error) {
        console.error('Error searching wine info:', error);
        return null;
    }
};

export const generateCheckInCaption = async (location: string, feeling?: string, context?: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
      Crie uma legenda curta e envolvente para um check-in em uma rede social de viagens.
      Localização: ${location}
      ${feeling ? `Sentimento/Emoji: ${feeling}` : ''}
      ${context ? `Contexto adicional: ${context}` : ''}

      Instruções:
      1. Seja criativo e amigável.
      2. Use emojis relacionados ao local.
      3. A legenda deve ser curta (máximo 2 sentenças).
      4. Retorne APENAS o texto da legenda, sem aspas ou explicações.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error generating check-in caption:', error);
        return '';
    }
};
