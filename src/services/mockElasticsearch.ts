import posts from '../data/posts.json';
import { Post } from '../hooks/usePosts';

// In-memory storage for indexed posts
let indexedPosts: Post[] = [...posts.posts];

// Function to check if a post contains a given search term in a specific field
const postMatchesQuery = (post: Post, query: string, field: string, fuzzy: boolean = false): boolean => {
  const normalizedQuery = query.toLowerCase();
  
  if (field === 'title') {
    return fuzzy 
      ? post.title.toLowerCase().includes(normalizedQuery) 
      : post.title.toLowerCase() === normalizedQuery;
  }
  
  if (field === 'content') {
    return post.content.toLowerCase().includes(normalizedQuery);
  }
  
  if (field === 'topic') {
    return post.topics.some(topic => 
      fuzzy 
        ? topic.toLowerCase().includes(normalizedQuery)
        : topic.toLowerCase() === normalizedQuery
    );
  }
  
  if (field === 'all') {
    return post.title.toLowerCase().includes(normalizedQuery) || 
           post.content.toLowerCase().includes(normalizedQuery) || 
           post.topics.some(topic => topic.toLowerCase().includes(normalizedQuery));
  }
  
  return false;
};

// Mock indexPost function
export const mockIndexPost = async (post: Post): Promise<void> => {
  console.log(`[MOCK] Indexing post ${post.id} to ElasticSearch`);
  
  // Check if post already exists
  const existingPostIndex = indexedPosts.findIndex(p => p.id === post.id);
  
  if (existingPostIndex !== -1) {
    // Update existing post
    indexedPosts[existingPostIndex] = post;
  } else {
    // Add new post
    indexedPosts.push(post);
  }
  
  console.log(`[MOCK] Post ${post.id} indexed successfully`);
};

// Mock exact match search
export const mockSearchExactMatch = async (query: string, field: string = 'title'): Promise<Post[]> => {
  console.log(`[MOCK] Performing exact match search for "${query}" in field "${field}"`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return indexedPosts.filter(post => postMatchesQuery(post, query, field, false));
};

// Mock fuzzy match search
export const mockSearchFuzzyMatch = async (query: string, field: string = 'content'): Promise<Post[]> => {
  console.log(`[MOCK] Performing fuzzy match search for "${query}" in field "${field}"`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return indexedPosts.filter(post => postMatchesQuery(post, query, field, true));
};

// Mock semantic search
export const mockSearchSemantic = async (query: string): Promise<Post[]> => {
  console.log(`[MOCK] Performing semantic search for "${query}"`);
  
  // Simulate query expansion
  const expandedQuery = `${query} ${getRelatedTerms(query)}`;
  console.log(`[MOCK] Expanded query: "${expandedQuery}"`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Search in all fields with expanded query
  return indexedPosts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) || 
    post.content.toLowerCase().includes(query.toLowerCase()) ||
    post.content.toLowerCase().includes(expandedQuery.toLowerCase()) ||
    post.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase()))
  );
};

// Mock hybrid search
export const mockSearchHybrid = async (query: string): Promise<Post[]> => {
  console.log(`[MOCK] Performing hybrid search for "${query}"`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simple implementation - get all posts that match any field
  return indexedPosts.filter(post => postMatchesQuery(post, query, 'all', true));
};

// Helper function to get related terms for query expansion
// This is a very simplified version of what AI would do
const getRelatedTerms = (query: string): string => {
  const termMap: Record<string, string> = {
    'react': 'javascript frontend component hooks jsx',
    'typescript': 'static typing javascript ts type interface',
    'material': 'ui design component mui theme',
    'scalable': 'architecture large scale performance',
    'web': 'development frontend html css javascript',
    'app': 'application software program mobile',
    'blog': 'article post content writing',
  };
  
  const words = query.toLowerCase().split(' ');
  
  return words
    .map(word => termMap[word] || '')
    .filter(Boolean)
    .join(' ');
}; 