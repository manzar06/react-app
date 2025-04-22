export interface OpenAIService {
  generateContent: (prompt: string) => Promise<string>;
  analyzeSentiment: (text: string) => Promise<number>;
}

export interface ElasticSearchService {
  searchPosts: (query: string) => Promise<any[]>;
  indexPost: (post: any) => Promise<void>;
}

export interface SerpAPIService {
  searchTrendingTopics: () => Promise<string[]>;
  getRelatedQueries: (topic: string) => Promise<string[]>;
}

export interface OpenMeteoService {
  getWeather: (latitude: number, longitude: number) => Promise<any>;
} 