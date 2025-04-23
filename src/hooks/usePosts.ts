import { useState, useEffect, useCallback } from 'react';
import posts from '../data/posts.json';
import { indexPost } from '../services/elasticsearch';

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  topics: string[];
  image: string;
}

export const usePosts = () => {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = posts.posts;
        setData(postsData);
        
        // Index all posts to ElasticSearch
        try {
          for (const post of postsData) {
            await indexPost(post);
          }
          console.log('All posts indexed to ElasticSearch');
        } catch (indexError) {
          console.error('Error indexing posts to ElasticSearch:', indexError);
          // Don't set the main error state here, as we still have the posts data to display
        }
        
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
    
    loadPosts();
  }, []);

  // Function to create a new post and index it to ElasticSearch
  const createPost = useCallback(async (newPost: Omit<Post, 'id' | 'date'>): Promise<Post> => {
    try {
      // Generate a new ID (in a real app, this would come from the backend)
      const nextId = data.length > 0 ? Math.max(...data.map(post => post.id)) + 1 : 1;
      
      // Create the post with today's date
      const post: Post = {
        ...newPost,
        id: nextId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      };
      
      // Index the post to ElasticSearch
      await indexPost(post);
      
      // Update local state
      setData(prevData => [...prevData, post]);
      
      return post;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, [data]);

  // Function to get a post by ID
  const getPostById = useCallback((id: number): Post | undefined => {
    return data.find(post => post.id === id);
  }, [data]);

  return { 
    data, 
    loading, 
    error,
    createPost,
    getPostById
  };
}; 