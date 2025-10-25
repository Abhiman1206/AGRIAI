
import { GoogleGenAI, Type } from "@google/genai";
import { PriceData, ProductDetails } from '../types';
import { mockHistoricalPrices } from '../data/mockData';

// Initialize the GoogleGenAI client according to the new guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// This service now makes live Gemini API calls for the prototype.
// The prompts and expected output structures are designed as per the project requirements.

export const getPriceForecast = async (commodity: string, duration: 30 | 60 | 90): Promise<PriceData[]> => {
    console.log(`Fetching price forecast for ${commodity} for the next ${duration} days...`);
    
    const prompt = `Analyze this historical edible oil price data for ${commodity}: ${JSON.stringify(mockHistoricalPrices)}. 
    Forecast prices for the next ${duration} days. 
    Consider seasonal trends, import data, and monsoon patterns. 
    The price should fluctuate realistically around the last known price.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING },
                            commodity: { type: Type.STRING },
                            price: { type: Type.NUMBER },
                            state: { type: Type.STRING },
                            market_name: { type: Type.STRING },
                            type: { type: Type.STRING },
                        }
                    }
                }
            }
        });
        const text = response.text;
        return JSON.parse(text);
    } catch (error) {
        console.error("Error fetching price forecast:", error);
        // Fallback to mock data on error
        const lastPrice = mockHistoricalPrices.filter(p => p.commodity === commodity).slice(-1)[0]?.price || 200;
        const forecastData: PriceData[] = [];
        const today = new Date();

        for (let i = 1; i <= duration; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const randomFactor = (Math.random() - 0.5) * 5;
            forecastData.push({
                date: futureDate.toISOString().split('T')[0],
                commodity,
                price: parseFloat((lastPrice + randomFactor).toFixed(2)),
                state: "National (Fallback)",
                market_name: "Forecast (Fallback)",
                type: 'forecast'
            });
        }
        return forecastData;
    }
};

export const getWeatherAdvisory = async (location: string, crop: string) => {
    console.log(`Getting weather advisory for ${crop} in ${location}...`);
    
    const prompt = `Given a 7-day weather forecast (mock: Sunny with intermittent clouds, Temp: 28-35°C, Humidity: 60-75%, Chance of rain: 20%) for ${location}, an oilseed farming region, provide: 
    1) Irrigation recommendations for ${crop}, 
    2) Pest/disease alerts, 
    3) Optimal harvesting window, 
    4) Post-harvest handling advice.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        irrigation: { type: Type.STRING },
                        pestAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        harvestWindow: { type: Type.STRING },
                        postHarvest: { type: Type.STRING },
                    }
                }
            }
        });
        const text = response.text;
        return JSON.parse(text);
    } catch (error) {
        console.error("Error fetching weather advisory:", error);
        // Fallback to mock data on error
        return {
            irrigation: `[Fallback] For ${crop}, apply light irrigation every 3-4 days.`,
            pestAlerts: ["Monitor for aphids and whiteflies.", "Check for early signs of powdery mildew."],
            harvestWindow: "The optimal harvest window appears to be in the next 5-7 days.",
            postHarvest: "Ensure proper drying of harvested seeds before storage."
        };
    }
};

export const getPolicyInsights = async () => {
    console.log("Generating policy insights...");
    const prompt = `Analyze the following situation for India's edible oil value chain: "Strong production growth in central states, significant logistical bottlenecks in coastal regions, farmer income up 8% YoY, but post-harvest losses remain high at 12%." Based on this, provide an executive summary and four prioritized policy recommendations.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    text: { type: Type.STRING },
                                    priority: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            }
        });
        const text = response.text;
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating policy insights:", error);
         // Fallback to mock data on error
        return {
            executiveSummary: "[Fallback] Analysis indicates production growth but reveals logistical bottlenecks impacting efficiency. Farmer income has risen, but post-harvest losses remain high.",
            recommendations: [
                { id: 1, text: "Invest in cold storage in port-adjacent districts.", priority: "High" },
                { id: 2, text: "Launch targeted FPO training programs to improve digital adoption.", priority: "Medium" },
                { id: 3, text: "Subsidize drip irrigation systems for key crops.", priority: "High" },
                { id: 4, text: "Develop a unified quality grading standard.", priority: "Low" }
            ]
        };
    }
}

const mockProductDetails: { [key: string]: Omit<ProductDetails, 'commodity'> } = {
  mustard: {
    description: 'Mustard seeds are small round seeds of various mustard plants. The seeds are usually about 1 to 2 millimetres in diameter and may be colored from yellowish white to black. They are a rich source of oil and protein.',
    nutritionalValue: { calories: '508 kcal', protein: '26g', fat: '36g', carbohydrates: '28g' },
    growingConditions: { climate: 'Requires a cool, moist climate (10-20°C).', soil: 'Well-drained, loamy soil with a pH between 6.0 and 7.5.', rainfall: 'Needs about 35-45 cm of rainfall during the growing season.' },
    typicalUses: ['Production of mustard oil', 'Use as a spice in various cuisines', 'Making condiments like mustard paste']
  },
  soybean: {
    description: 'The soybean is a species of legume native to East Asia, widely grown for its edible bean, which has numerous uses. It is a globally important crop, providing oil and protein.',
    nutritionalValue: { calories: '446 kcal', protein: '36g', fat: '20g', carbohydrates: '30g' },
    growingConditions: { climate: 'Warm climates with optimal temperatures between 20°C and 30°C.', soil: 'Prefers deep, fertile, well-drained loamy soils.', rainfall: 'Requires 45-65 cm of well-distributed rainfall.' },
    typicalUses: ['Soybean oil production', 'Making tofu, soy milk, and other soy products', 'High-protein animal feed']
  },
  groundnut: {
    description: 'Also known as the peanut, it is a legume crop grown mainly for its edible seeds. It is widely grown in the tropics and subtropics, being important to both small and large commercial producers.',
    nutritionalValue: { calories: '567 kcal', protein: '26g', fat: '49g', carbohydrates: '16g' },
    growingConditions: { climate: 'Requires a long and warm growing season (25-30°C).', soil: 'Light, sandy loam soil is most suitable.', rainfall: 'Needs 50-70 cm of well-distributed rainfall.' },
    typicalUses: ['Production of groundnut oil', 'Consumed roasted or as peanut butter', 'Used in confectionery']
  },
  sunflower: {
    description: 'Sunflowers are cultivated for their seeds, which can be eaten as a snack or processed into sunflower oil, one of the most common cooking oils.',
    nutritionalValue: { calories: '584 kcal', protein: '21g', fat: '51g', carbohydrates: '20g' },
    growingConditions: { climate: 'Best grown in temperate climates with full sun (21-26°C).', soil: 'Prefers slightly acidic to alkaline, well-drained soils.', rainfall: 'Drought-tolerant but needs water during seed development.' },
    typicalUses: ['Sunflower oil production', 'Snack food (roasted seeds)', 'Bird feed and livestock fodder']
  }
};

export const getProductDetails = async (commodity: string): Promise<ProductDetails> => {
    console.log(`Fetching details for ${commodity}...`);
    
    const details = mockProductDetails[commodity.toLowerCase()];

    if (details) {
      return { commodity, ...details };
    }

    // Generic fallback if no specific mock data exists
    return {
        commodity: commodity,
        description: `Detailed AI-generated description for ${commodity} would appear here, covering its origins, characteristics, and importance in the agricultural sector.`,
        nutritionalValue: { calories: 'N/A', protein: 'N/A', fat: 'N/A', carbohydrates: 'N/A' },
        growingConditions: { climate: 'Generally prefers temperate to warm climates.', soil: 'Requires well-drained soil.', rainfall: 'Varies by specific crop needs.' },
        typicalUses: [`Primary use for ${commodity} oil extraction.`, `Culinary uses in various forms.`, `Industrial applications.`]
    };
};

export const getLogisticsInsightsWithMaps = async (query: string): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {
    console.log(`Fetching logistics insights for query: "${query}"`);

    const userLocation = await new Promise<{ latitude: number; longitude: number }>((resolve) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by your browser. Using default location.");
            resolve({ latitude: 22.5, longitude: 78.5 });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            position => resolve(position.coords),
            error => {
                console.warn("Geolocation permission denied, using default location.", error);
                resolve({ latitude: 22.5, longitude: 78.5 });
            }
        );
    });
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                        },
                    },
                },
            },
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        const sources = groundingChunks
            .filter(chunk => chunk.maps && chunk.maps.uri && chunk.maps.title)
            .map(chunk => ({
                uri: chunk.maps.uri,
                title: chunk.maps.title,
            }));

        return { text, sources };

    } catch (error) {
        console.error("Error calling Gemini API with Maps Grounding:", error);
        throw new Error("Failed to get response from AI model.");
    }
};
