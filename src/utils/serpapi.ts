import axios from 'axios';

// Define the response type for SerpAPI
interface SerpApiResponse {
  knowledge_graph?: {
    hours?: string;
  };
  local_results?: {
    places?: Array<{
      title: string;
      hours?: string;
    }>;
  };
  organic_results?: Array<{
    snippet?: string;
  }>;
  business_results?: {
    hours?: string;
  };
  [key: string]: any; // For any other properties
}

// Cache for venue hours to avoid duplicate API calls
interface HoursCache {
  [key: string]: {
    hours: string;
    timestamp: number;
  };
}

// Cache venue hours for 24 hours
const hoursCache: HoursCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Queue for rate limiting
const requestQueue: (() => Promise<void>)[] = [];
let processingQueue = false;

// Development flag (set this to true to force simulated hours)
// This helps avoid using SerpAPI credits during development
const useDevelopmentMode = false;

// Process the queue with delay between requests to respect rate limits
async function processQueue() {
  if (processingQueue || requestQueue.length === 0) return;
  
  processingQueue = true;
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
      // Add a delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  processingQueue = false;
}

// Helper function to generate simulated hours based on venue type
function getSimulatedHours(venueType: string): string {
  const type = venueType.toLowerCase();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  
  if (type.includes('restaurant')) {
    return isWeekend 
      ? 'Open Hours: 10:00 AM - 11:00 PM (Simulated)' 
      : 'Open Hours: 11:00 AM - 10:00 PM (Simulated)';
  } else if (type.includes('concert') || type.includes('music')) {
    return 'Open Hours: 7:00 PM - 11:00 PM (Simulated)';
  } else if (type.includes('sport') || type.includes('game')) {
    return isWeekend
      ? 'Open Hours: 9:00 AM - 8:00 PM (Simulated)'
      : 'Open Hours: 10:00 AM - 7:00 PM (Simulated)';
  } else {
    return 'Open Hours: 9:00 AM - 6:00 PM (Simulated)';
  }
}

// Add a function to extract better error messages from SerpAPI responses
function getSerpApiErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  
  if (error.response) {
    // Server responded with a non-2xx status code
    const status = error.response.status;
    if (status === 401) {
      return 'Invalid API key or unauthorized access';
    } else if (status === 429) {
      return 'Rate limit exceeded (free plan has 100 searches per month)';
    } else if (status === 404) {
      return 'API endpoint not found';
    } else if (status >= 500) {
      return `Server error (${status})`;
    }
    
    // Try to extract an error message from the response
    try {
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          return error.response.data.substring(0, 100);
        } else if (error.response.data.error) {
          return error.response.data.error;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return `HTTP error ${status}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response received from server (network issue)';
  } else {
    // Something else caused the error
    return error.message || 'Unknown error';
  }
}

/**
 * Fetches business hours for a venue using SerpAPI
 * @param venueName The name of the venue
 * @param city The city where the venue is located
 * @param venueType The type of venue (restaurant, concert, sports)
 * @returns A promise that resolves to the business hours or an error message
 */
export async function getVenueHours(venueName: string, city: string, venueType: string): Promise<string> {
  // Normalize inputs for consistency
  const normalizedVenueName = venueName.trim();
  const normalizedCity = city.trim();
  const normalizedType = venueType.trim();
  
  // Create a cache key
  const cacheKey = `${normalizedVenueName}-${normalizedCity}-${normalizedType}`.toLowerCase();
  
  // Check cache first
  if (hoursCache[cacheKey] && (Date.now() - hoursCache[cacheKey].timestamp) < CACHE_TTL) {
    console.log(`Using cached hours for "${normalizedVenueName}"`);
    return hoursCache[cacheKey].hours;
  }
  
  // If in development mode, use simulated hours directly
  if (useDevelopmentMode) {
    const simulatedHours = getSimulatedHours(normalizedType);
    console.log(`[DEV MODE] Using simulated hours for "${normalizedVenueName}": ${simulatedHours}`);
    
    // Cache the simulated result
    hoursCache[cacheKey] = {
      hours: simulatedHours,
      timestamp: Date.now()
    };
    
    return simulatedHours;
  }
  
  // Create a promise that will resolve when the API call is complete
  return new Promise((resolve) => {
    // Add the request to the queue
    requestQueue.push(async () => {
      try {
        // Create a simple search query for finding venue hours
        const query = `${normalizedVenueName} ${normalizedCity} ${normalizedType} hours`;
        console.log(`Making SerpAPI request for "${normalizedVenueName}" in ${normalizedCity}`);
        
        // Get the API key from environment variables
        const apiKey = import.meta.env.VITE_SERPAPI_API_KEY;
        
        if (!apiKey || apiKey === 'your_serpapi_key_here') {
          console.error('SerpAPI key not found or not set properly in environment variables');
          resolve('Hours not available');
          return;
        }
        
        // Try both direct and proxy approaches - direct first which is better for production
        let response;
        try {
          console.log('Attempting direct SerpAPI call...');
          // Direct call to SerpAPI - works in production but may have CORS issues in development
          response = await axios.get<SerpApiResponse>('https://serpapi.com/search', {
            params: {
              api_key: apiKey,
              q: query,
              engine: 'google',
              hl: 'en'
            }
          });
          console.log('Direct SerpAPI call successful:', response.status);
        } catch (directError) {
          console.warn('Direct SerpAPI call failed, trying proxy:', directError);
          // Fallback to proxy - better for development with CORS issues
          response = await axios.get<SerpApiResponse>('/api/serpapi/search', {
            params: {
              api_key: apiKey,
              q: query,
              engine: 'google',
              hl: 'en'
            }
          });
          console.log('Proxy SerpAPI call successful:', response.status);
        }
        
        console.log('SerpAPI response status:', response.status);
        
        // Extract hours information from response
        let hours = 'Hours not available';
        
        // Check knowledge graph
        if (response.data.knowledge_graph && response.data.knowledge_graph.hours) {
          hours = response.data.knowledge_graph.hours;
        } 
        // Check local results
        else if (response.data.local_results && response.data.local_results.places) {
          for (const place of response.data.local_results.places) {
            if (place.title.toLowerCase().includes(normalizedVenueName.toLowerCase()) && place.hours) {
              hours = place.hours;
              break;
            }
          }
        }
        // Check organic results
        else if (response.data.organic_results && response.data.organic_results.length > 0) {
          for (const result of response.data.organic_results) {
            if (result.snippet && 
               (result.snippet.toLowerCase().includes('hour') || 
                result.snippet.toLowerCase().includes('open'))) {
              hours = result.snippet;
              break;
            }
          }
        }
        // Check business results
        else if (response.data.business_results && response.data.business_results.hours) {
          hours = response.data.business_results.hours;
        }
        
        // Ensure hours is a string
        if (typeof hours === 'object') {
          console.warn('Hours returned as an object, converting to string:', hours);
          try {
            hours = JSON.stringify(hours);
          } catch (e) {
            hours = 'Hours information available but in an unsupported format';
          }
        }
        
        // Extract time pattern if found
        const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s*(?:-|to|–)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i;
        const timeMatch = hours.match(timeRegex);
        
        // Save the result in cache
        let result = hours;
        if (timeMatch) {
          result = `${timeMatch[1]} - ${timeMatch[2]}`;
        }
        
        hoursCache[cacheKey] = {
          hours: result,
          timestamp: Date.now()
        };
        
        resolve(result);
      } catch (error: any) {
        console.error(`Error fetching hours for ${normalizedVenueName}:`, error);
        resolve('Hours not available');
      }
    });
    
    // Start processing the queue if not already processing
    if (!processingQueue) {
      processQueue();
    }
  });
} 