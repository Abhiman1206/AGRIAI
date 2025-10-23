
import { GoogleGenAI } from "@google/genai";
import { PriceData, ProductDetails } from '../types';
import { mockHistoricalPrices } from '../data/mockData';

// This is a placeholder for the actual API key which should be handled securely in a backend environment.
const API_KEY = process.env.API_KEY || "YOUR_API_KEY_HERE";

// Note: In a real application, you would initialize this in your backend.
// const ai = new GoogleGenAI({ apiKey: API_KEY });

const MOCK_LATENCY = 1500;

// This service mocks the Gemini API calls for the prototype.
// The prompts and expected output structures are designed as per the project requirements.

export const getPriceForecast = async (commodity: string, duration: 30 | 60 | 90): Promise<PriceData[]> => {
    console.log(`Fetching price forecast for ${commodity} for the next ${duration} days...`);
    
    // const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    /*
    const prompt = `Analyze this historical edible oil price data for ${commodity}: ${JSON.stringify(mockHistoricalPrices)}. 
    Forecast prices for the next ${duration} days. 
    Consider seasonal trends, import data, and monsoon patterns. 
    Return a JSON array of objects with keys: "date" (YYYY-MM-DD), "commodity", "price", "state", "market_name", and "type" ('forecast').
    The price should fluctuate realistically around the last known price.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
    */

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY));
    
    const lastPrice = mockHistoricalPrices.filter(p => p.commodity === commodity).slice(-1)[0]?.price || 200;
    const forecastData: PriceData[] = [];
    const today = new Date();

    for (let i = 1; i <= duration; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const randomFactor = (Math.random() - 0.5) * 5; // Fluctuation
        const trend = i / duration * 10; // Slight upward trend
        forecastData.push({
            date: futureDate.toISOString().split('T')[0],
            commodity,
            price: parseFloat((lastPrice + randomFactor + trend).toFixed(2)),
            state: "National",
            market_name: "Forecast",
            type: 'forecast'
        });
    }
    return forecastData;
};

export const getWeatherAdvisory = async (location: string, crop: string) => {
    console.log(`Getting weather advisory for ${crop} in ${location}...`);
    /*
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Given a 7-day weather forecast (mock: Sunny with intermittent clouds, Temp: 28-35°C, Humidity: 60-75%, Chance of rain: 20%) for ${location}, an oilseed farming region, provide: 
    1) Irrigation recommendations for ${crop}, 
    2) Pest/disease alerts, 
    3) Optimal harvesting window, 
    4) Post-harvest handling advice. 
    Format as a single JSON object with keys: "irrigation", "pestAlerts" (array of strings), "harvestWindow", "postHarvest".`;
    // ... call API
    */
    
    await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY));
    return {
        irrigation: `For ${crop}, with temperatures between 28-35°C, apply light irrigation every 3-4 days to maintain soil moisture without causing waterlogging. Early morning is the best time.`,
        pestAlerts: ["Monitor for aphids and whiteflies due to warm conditions.", "Check for early signs of powdery mildew on leaves."],
        harvestWindow: "The optimal harvest window appears to be in the next 5-7 days before any potential increase in humidity.",
        postHarvest: "Ensure proper drying of harvested seeds to below 8% moisture content before storage. Store in a cool, dry place away from direct sunlight."
    };
};

export const getPolicyInsights = async () => {
    console.log("Generating policy insights...");
    await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY + 1000));
    return {
        executiveSummary: "Analysis of the current value chain data indicates strong production growth in central states but reveals significant logistical bottlenecks in coastal regions, impacting import-export efficiency. Farmer income has risen by an average of 8% YoY, but post-harvest losses remain high at 12%.",
        recommendations: [
            { id: 1, text: "Invest in cold storage and warehouse infrastructure in key port-adjacent districts to reduce spoilage and transportation delays.", priority: "High" },
            { id: 2, text: "Launch targeted FPO training programs in North-Eastern states to improve digital marketplace adoption and price realization.", priority: "Medium" },
            { id: 3, text: "Subsidize drip irrigation systems for mustard and soybean farmers in arid regions to mitigate climate risks and boost yield.", priority: "High" },
            { id: 4, text: "Develop a unified quality grading standard and incentivize its adoption at the farm-gate level to improve traceability and export value.", priority: "Low" }
        ]
    };
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
    await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY - 500));
    
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
