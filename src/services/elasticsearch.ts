import axios from 'axios';
import { Post } from '../hooks/usePosts';
import { 
  mockIndexPost, 
  mockSearchExactMatch, 
  mockSearchFuzzyMatch, 
  mockSearchSemantic, 
  mockSearchHybrid 
} from './mockElasticsearch';

// ElasticSearch endpoint - can be replaced with actual endpoint
const ELASTICSEARCH_ENDPOINT = 'http://localhost:9200';
const POST_INDEX = 'blog-posts';

// Flag to determine if we should use mock or real implementation
const useMockAPI = true; // Set to false to use real ElasticSearch

// Function to index a post to ElasticSearch
export const indexPost = async (post: Post): Promise<void> => {
  if (useMockAPI) {
    return mockIndexPost(post);
  }

  try {
    await axios.post(`${ELASTICSEARCH_ENDPOINT}/${POST_INDEX}/_doc/${post.id}`, {
      title: post.title,
      content: post.content,
      author: post.author,
      topic: post.topics.join(', '),
      timestamp: new Date(post.date).toISOString()
    });
    console.log(`Post ${post.id} indexed successfully`);
  } catch (error) {
    console.error('Error indexing post:', error);
    throw error;
  }
};

// Function to search posts with exact match
export const searchExactMatch = async (query: string, field: string = 'title'): Promise<Post[]> => {
  if (useMockAPI) {
    return mockSearchExactMatch(query, field);
  }

  try {
    const response = await axios.post(`${ELASTICSEARCH_ENDPOINT}/${POST_INDEX}/_search`, {
      query: {
        match: {
          [field]: query
        }
      }
    });
    
    return mapResponseToPosts(response.data);
  } catch (error) {
    console.error('Error searching posts (exact):', error);
    return [];
  }
};

// Function to search posts with fuzzy match
export const searchFuzzyMatch = async (query: string, field: string = 'content'): Promise<Post[]> => {
  if (useMockAPI) {
    return mockSearchFuzzyMatch(query, field);
  }

  try {
    const response = await axios.post(`${ELASTICSEARCH_ENDPOINT}/${POST_INDEX}/_search`, {
      query: {
        fuzzy: {
          [field]: {
            value: query,
            fuzziness: "AUTO"
          }
        }
      }
    });
    
    return mapResponseToPosts(response.data);
  } catch (error) {
    console.error('Error searching posts (fuzzy):', error);
    return [];
  }
};

// Function to use OpenAI to expand or enhance a search query
export const expandQueryWithOpenAI = async (query: string): Promise<string> => {
  try {
    // Get the API key from environment variables
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('API key not found');
      return query; // Return original query if no API key
    }
    
    // Make API call to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that expands search queries to improve search results. Given a simple search term, expand it to include related terms and synonyms. Return only the expanded query without additional text.'
          },
          {
            role: 'user',
            content: `Expand this search query for better search results: "${query}"`
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'Blog Search Query Expansion'
        }
      }
    );
    
    // Extract the expanded query
    const expandedQuery = response.data.choices[0].message.content.trim();
    console.log(`Original query: "${query}" expanded to: "${expandedQuery}"`);
    
    return expandedQuery;
  } catch (error) {
    console.error('Error expanding query with OpenAI:', error);
    return query; // Return original query if expansion fails
  }
};

// Function to search posts with semantic/OpenAI assistance
export const searchSemantic = async (query: string): Promise<Post[]> => {
  if (useMockAPI) {
    return mockSearchSemantic(query);
  }

  try {
    // First, expand the query using OpenAI
    const expandedQuery = await expandQueryWithOpenAI(query);
    
    // Use the expanded query to search ElasticSearch
    const response = await axios.post(`${ELASTICSEARCH_ENDPOINT}/${POST_INDEX}/_search`, {
      query: {
        multi_match: {
          query: expandedQuery,
          fields: ["title^3", "content^2", "topic"],
          fuzziness: "AUTO",
          type: "best_fields"
        }
      }
    });
    
    return mapResponseToPosts(response.data);
  } catch (error) {
    console.error('Error searching posts (semantic):', error);
    return [];
  }
};

// Function to search posts with hybrid approach
export const searchHybrid = async (query: string): Promise<Post[]> => {
  if (useMockAPI) {
    return mockSearchHybrid(query);
  }

  try {
    // First, expand the query using OpenAI
    const expandedQuery = await expandQueryWithOpenAI(query);
    
    // Hybrid search combining exact, fuzzy, and semantic relevance
    const response = await axios.post(`${ELASTICSEARCH_ENDPOINT}/${POST_INDEX}/_search`, {
      query: {
        bool: {
          should: [
            // Original query with high boost
            { match: { title: { query: query, boost: 5 } } },
            { match: { content: { query: query, boost: 3 } } },
            { match: { topic: { query: query, boost: 2 } } },
            
            // Expanded query with medium boost
            { match: { title: { query: expandedQuery, boost: 2 } } },
            { match: { content: { query: expandedQuery, boost: 1 } } },
            
            // Fuzzy matching for typo tolerance
            { fuzzy: { content: { value: query, fuzziness: "AUTO", boost: 1 } } }
          ]
        }
      }
    });
    
    return mapResponseToPosts(response.data);
  } catch (error) {
    console.error('Error searching posts (hybrid):', error);
    return [];
  }
};

// Helper function to map ElasticSearch response to Post array
const mapResponseToPosts = (response: any): Post[] => {
  if (!response.hits || !response.hits.hits) {
    return [];
  }
  
  return response.hits.hits.map((hit: any) => {
    const source = hit._source;
    
    // Map ElasticSearch document back to Post object
    return {
      id: parseInt(hit._id),
      title: source.title,
      content: source.content,
      author: source.author,
      topics: source.topic ? source.topic.split(', ') : [],
      date: new Date(source.timestamp).toISOString().split('T')[0],
      excerpt: source.content.substring(0, 120) + '...',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' // Default image
    };
  });
}; 