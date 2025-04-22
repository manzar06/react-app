import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Helper function to make API calls with CORS protection
 * Uses a proxy for external API calls to avoid CORS issues
 */
export async function apiCall<T>(
  url: string, 
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
  // Check if this is an external URL
  const isExternalUrl = url.startsWith('http') || url.startsWith('https');
  
  // If external URL, try to use our proxy
  if (isExternalUrl) {
    try {
      // Extract the base domain
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Build the proxy path
      // This assumes we have a proxy configured in vite.config.ts for `/api/proxy/{domain}`
      const proxyPath = `/api/${domain}${urlObj.pathname}${urlObj.search}`;
      
      console.log(`Using proxy for external URL: ${url} -> ${proxyPath}`);
      
      return await axios.request<T>({
        ...options,
        url: proxyPath
      });
    } catch (error) {
      console.error('Error using proxy for external URL:', error);
      console.log('Falling back to direct request (may cause CORS issues)');
      
      // Fall back to direct request
      return await axios.request<T>({
        ...options,
        url
      });
    }
  }
  
  // For internal URLs, just make the request directly
  return await axios.request<T>({
    ...options,
    url
  });
}

/**
 * Creates a version of the API helper specifically for a particular domain
 */
export function createApiHelper(baseDomain: string) {
  return {
    get: async <T>(path: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> => {
      const url = `https://${baseDomain}${path.startsWith('/') ? path : `/${path}`}`;
      return apiCall<T>(url, { ...options, method: 'GET' });
    },
    
    post: async <T>(path: string, data?: any, options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> => {
      const url = `https://${baseDomain}${path.startsWith('/') ? path : `/${path}`}`;
      return apiCall<T>(url, { ...options, method: 'POST', data });
    }
  };
} 