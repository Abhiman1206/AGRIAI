// In a real application, this key would be managed securely, likely in an environment variable.
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Decodes Google's encoded polyline format into an array of [lat, lng] coordinates.
const decodePolyline = (encoded: string): [number, number][] => {
    let points: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
};

export const getDirections = async (origin: { lat: number; lon: number }, destination: { lat: number; lon: number }): Promise<{ path: [number, number][]; duration: string } | null> => {
    if (!API_KEY) {
        console.warn("Google Maps API key is not configured. Falling back to mock data.");
        // Fallback to a straight line if API key is missing
        const path: [number, number][] = [[origin.lat, origin.lon], [destination.lat, destination.lon]];
        return { path, duration: 'N/A' };
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lon}&destination=${destination.lat},${destination.lon}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
            console.error('Directions API error:', data.status, data.error_message);
            return null;
        }

        const route = data.routes[0];
        const leg = route.legs[0];
        
        const path = decodePolyline(route.overview_polyline.points);
        const duration = leg.duration.text;
        
        return { path, duration };
    } catch (error) {
        console.error('Failed to fetch directions:', error);
        return null;
    }
};

export const findPlaceDetails = async (query: string): Promise<{name: string, address: string, rating?: number, totalRatings?: number} | null> => {
     if (!API_KEY) {
        console.warn("Google Maps API key is not configured.");
        return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            console.error('Places API error:', data.status, data.error_message);
            return null;
        }

        const place = data.results[0];
        return {
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            totalRatings: place.user_ratings_total,
        };

    } catch (error) {
        console.error('Failed to fetch place details:', error);
        return null;
    }
}
