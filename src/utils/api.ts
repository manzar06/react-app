import axios from 'axios';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
}

interface Weather {
  temperature: number;
  description: string;
}

interface Venue {
  id: number;
  name: string;
  type: 'restaurant' | 'concert' | 'sports' | 'sport event' | 'sports event';
  location: {
    latitude: number;
    longitude: number;
  };
  simulatedHours?: string;
  simulatedRating?: string;
  simulatedVenue?: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region?: string;
  usingDefaultLocation: boolean;
}

// Function to get weather data from Open-Meteo API
export const getWeatherData = async (location: Location): Promise<Weather> => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`
    );
    
    const { current_weather } = response.data;
    
    // Map WMO weather codes to descriptions
    // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    const weatherDescriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };

    const description = weatherDescriptions[current_weather.weathercode] || 'Unknown';
    
    return {
      temperature: current_weather.temperature,
      description
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    // Return a default weather if the API fails
    return {
      temperature: 22,
      description: 'Moderate'
    };
  }
};

// Function to get recommendations from OpenAI API
export const getRecommendations = async (
  location: Location, 
  weather: Weather
): Promise<Venue[]> => {
  // Check if we should force using simulated recommendations
  const useSimulatedRecommendations = import.meta.env.VITE_USE_SIMULATED_RECOMMENDATIONS === 'true';
  
  // Debug logging
  console.log('Environment variable check:');
  console.log('VITE_USE_SIMULATED_RECOMMENDATIONS:', import.meta.env.VITE_USE_SIMULATED_RECOMMENDATIONS);
  console.log('useSimulatedRecommendations:', useSimulatedRecommendations);
  
  if (useSimulatedRecommendations) {
    console.log('Forcing simulated recommendations (as configured in env)');
    return getSimulatedRecommendations(location, weather);
  }

  const makeRequest = async () => {
    try {
      // Create the prompt for OpenAI API
      const prompt = `You are a recommendation assistant. Based on the user's location in ${location.city || 'the area'}, ${location.region || 'the region'}, where the weather is ${weather.temperature}°C and condition is ${weather.description}, suggest EXACTLY 3 restaurants, 3 concerts, and 3 sports events nearby (9 venues total). 

The venues MUST be real venues that exist in ${location.city || 'the current location'} (at coordinates ${location.latitude}, ${location.longitude}).

IMPORTANT: Make sure the venues are well spread out and not clustered in the same location. Find venues in different areas/neighborhoods of ${location.city || 'the area'} so they appear as distinct markers on a map. The latitude/longitude coordinates should be different enough to be visibly separate on a map.

Return ONLY a JSON array with objects containing name, lat, lon, and type properties. The response must be valid JSON with no additional text. Use EXACTLY these types: "restaurant", "concert", "sports". 

Example format (do NOT use these specific values, generate appropriate venues for ${location.city || 'the location'} instead):
[
  {
    "name": "Example Restaurant",
    "lat": 40.7128,
    "lon": -74.0060,
    "type": "restaurant"
  }
]

Important: You must return EXACTLY 3 venues of each type (3 restaurants, 3 concerts, 3 sports) for a total of 9 venues, all with REAL venues at REAL locations around ${location.latitude}, ${location.longitude}. Only suggest venues that actually exist and are open to the public.`;
      
      console.log('Sending prompt to OpenRouter:', prompt);
      
      // Get the API key from environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.error('API key not found');
        throw new Error('Valid API key required');
      }
      
      // Make API call to OpenRouter
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo', // Use OpenAI's model through OpenRouter
          messages: [
            {
              role: 'system',
              content: 'You are a recommendation assistant. Respond with valid JSON only. Do not include any explanations, markdown formatting, or additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href, // Required by OpenRouter
            'X-Title': 'Weather Recommendations App' // Optional but recommended
          }
        }
      );
      
      console.log('OpenRouter response:', response.data);
      
      // Extract and parse the JSON response
      let recommendations;
      try {
        const content = response.data.choices[0].message.content;
        console.log('Raw API response content:', content);
        
        // Try to extract JSON if it's wrapped in code blocks or has extra text
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                          content.match(/```\s*([\s\S]*?)\s*```/) || 
                          content.match(/(\[[\s\S]*\])/);
        
        const jsonText = jsonMatch ? jsonMatch[1] : content;
        console.log('Extracted JSON text:', jsonText);
        
        recommendations = JSON.parse(jsonText.trim());
        console.log('Parsed recommendations:', recommendations);
        console.log('Number of recommendations parsed:', recommendations.length);
      } catch (error) {
        console.error('Error parsing API response:', error);
        console.log('Response content:', response.data.choices[0].message.content);
        throw new Error('Failed to parse API response');
      }
      
      // Check if recommendations has the expected format
      if (!Array.isArray(recommendations)) {
        console.error('API response is not an array:', recommendations);
        throw new Error('Invalid API response format');
      }
      
      // Convert to our Venue format
      return recommendations.map((rec: any, index: number) => ({
        id: index + 1,
        name: rec.name || `Venue ${index + 1}`,
        type: (rec.type as 'restaurant' | 'concert' | 'sports' | 'sport event' | 'sports event') || 'restaurant',
        location: {
          latitude: rec.lat || location.latitude,
          longitude: rec.lon || location.longitude
        }
      }));
    } catch (error: any) {
      console.error('Failed to get recommendations from API:', error);
      throw error;
    }
  };

  return makeRequest();
};

// Simulated recommendations as a fallback
function getSimulatedRecommendations(location: Location, weather: Weather): Venue[] {
  console.log('Using simulated recommendations');
  
  // Create larger random offsets for better visual spreading on the map
  const randomOffset = () => (Math.random() - 0.5) * 0.05; // Increased from 0.02 to 0.05
  
  // Create directional offsets to ensure venues are spread in different directions
  const createPositions = () => {
    // Create 9 distinct positions in different directions around the center
    return [
      { lat: location.latitude + randomOffset() * 0.5, lon: location.longitude + randomOffset() * 0.5 }, // Near center
      { lat: location.latitude + 0.02, lon: location.longitude + 0.02 },  // Northeast
      { lat: location.latitude - 0.02, lon: location.longitude - 0.02 },  // Southwest
      { lat: location.latitude + 0.02, lon: location.longitude - 0.02 },  // Southeast
      { lat: location.latitude - 0.02, lon: location.longitude + 0.02 },  // Northwest
      { lat: location.latitude + 0.03, lon: location.longitude },         // East
      { lat: location.latitude - 0.03, lon: location.longitude },         // West
      { lat: location.latitude, lon: location.longitude + 0.03 },         // North
      { lat: location.latitude, lon: location.longitude - 0.03 }          // South
    ];
  };
  
  const positions = createPositions();
  
  // Helper to get simulated hours based on venue type
  const getSimulatedHours = (type: string, name: string) => {
    // Add metadata to help identify simulated venues
    // This will be useful for the SerpAPI fallback
    if (type === 'restaurant') {
      return {
        simulatedHours: weather.temperature > 25 
          ? '11:00 AM - 10:00 PM' 
          : '10:00 AM - 9:00 PM',
        simulatedRating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0-5.0
        simulatedVenue: true  // Flag to identify simulated venues
      };
    } else if (type === 'concert') {
      return {
        simulatedHours: '7:00 PM - 11:00 PM',
        simulatedRating: (Math.random() * 1 + 4).toFixed(1), // Random rating between 4.0-5.0
        simulatedVenue: true
      };
    } else {
      return {
        simulatedHours: '9:00 AM - 6:00 PM',
        simulatedRating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5-5.0
        simulatedVenue: true
      };
    }
  };
  
  // Adjusted venues with more spread positions
  const simulatedRecommendations = [
    // Restaurants (exactly 3)
    {
      name: weather.description.includes('rain') ? "Cozy Comfort Cafe" : "Sunny Side Bistro",
      lat: positions[0].lat,
      lon: positions[0].lon,
      type: "restaurant",
      ...getSimulatedHours("restaurant", "Cozy Comfort Cafe")
    },
    {
      name: "Local Flavors Restaurant",
      lat: positions[1].lat,
      lon: positions[1].lon,
      type: "restaurant",
      ...getSimulatedHours("restaurant", "Local Flavors Restaurant")
    },
    {
      name: weather.temperature > 25 ? "Cool Breeze Ice Cream Parlor" : "Warm Hearth Steakhouse",
      lat: positions[2].lat,
      lon: positions[2].lon,
      type: "restaurant",
      ...getSimulatedHours("restaurant", "Cool Breeze Ice Cream Parlor")
    },
    
    // Concerts (exactly 3)
    {
      name: weather.description.includes('Clear') ? "Outdoor Symphony" : "Indoor Jazz Festival",
      lat: positions[3].lat,
      lon: positions[3].lon,
      type: "concert",
      ...getSimulatedHours("concert", "Outdoor Symphony")
    },
    {
      name: "Local Bands Night",
      lat: positions[4].lat,
      lon: positions[4].lon,
      type: "concert",
      ...getSimulatedHours("concert", "Local Bands Night")
    },
    {
      name: "Classical Music Evening",
      lat: positions[5].lat,
      lon: positions[5].lon,
      type: "concert",
      ...getSimulatedHours("concert", "Classical Music Evening")
    },
    
    // Sports events (exactly 3)
    {
      name: weather.temperature < 15 ? "Indoor Basketball Tournament" : "Beach Volleyball Championship",
      lat: positions[6].lat,
      lon: positions[6].lon,
      type: "sports",
      ...getSimulatedHours("sports", "Beach Volleyball Championship")
    },
    {
      name: "Local Football Match",
      lat: positions[7].lat,
      lon: positions[7].lon,
      type: "sports",
      ...getSimulatedHours("sports", "Local Football Match")
    },
    {
      name: weather.description.includes('rain') ? "Indoor Tennis Tournament" : "Marathon Race",
      lat: positions[8].lat,
      lon: positions[8].lon,
      type: "sports",
      ...getSimulatedHours("sports", "Marathon Race")
    }
  ];
  
  // Verify we have exactly 9 venues (3 of each type)
  console.log(`Simulated recommendations: ${simulatedRecommendations.length} total venues`);
  
  const restaurantCount = simulatedRecommendations.filter(v => v.type === 'restaurant').length;
  const concertCount = simulatedRecommendations.filter(v => v.type === 'concert').length;
  const sportsCount = simulatedRecommendations.filter(v => v.type === 'sports').length;
  
  console.log(`Venue breakdown - Restaurants: ${restaurantCount}, Concerts: ${concertCount}, Sports: ${sportsCount}`);
  
  // Convert to our Venue format
  const simulatedVenues = simulatedRecommendations.map((rec, index) => ({
    id: index + 1,
    name: rec.name,
    type: rec.type as 'restaurant' | 'concert' | 'sports' | 'sport event' | 'sports event',
    location: {
      latitude: rec.lat,
      longitude: rec.lon
    },
    simulatedHours: rec.simulatedHours,
    simulatedRating: rec.simulatedRating,
    simulatedVenue: rec.simulatedVenue
  }));
  
  console.log(`Created ${simulatedVenues.length} simulated venues:`, simulatedVenues);
  return simulatedVenues;
}

// Function to get location data
export const getUserLocation = async (): Promise<UserLocation> => {
  // First try browser geolocation API
  try {
    // Check if browser geolocation is available
    if (navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.log('Browser geolocation error:', error.message);
            reject(error);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
        );
      });
      
      console.log('Browser geolocation successful:', position.coords);
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: 'Current Location', // Will be updated if we fetch city details later
        country: '',
        usingDefaultLocation: false
      };
    }
  } catch (error) {
    console.log('Browser geolocation failed, falling back to IP-based location');
  }

  // Fall back to IP-based location
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    console.log('Attempting to fetch IP location from ipapi.co/json');
    
    const response = await fetch('https://ipapi.co/json', { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`IP location fetch failed with status: ${response.status}`);
      throw new Error(`Failed to fetch location: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('IP location data received:', data);
    
    // Validate the response contains the required fields
    if (!data.latitude || !data.longitude) {
      console.error('IP location data missing coordinates:', data);
      throw new Error('Location data is incomplete');
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || 'Unknown',
      country: data.country_name || '',
      usingDefaultLocation: false
    };
  } catch (error) {
    console.error('Failed to get user location:', error);
    
    // Default to New York
    console.log('Using default location (New York)');
    return {
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      country: 'United States',
      usingDefaultLocation: true
    };
  }
}; 