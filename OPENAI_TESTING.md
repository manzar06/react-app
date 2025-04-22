# Testing OpenAI Integration for RecommendedDialog

This document outlines how to test the OpenAI integration for the RecommendedDialog component, which uses the OpenAI API to generate venue recommendations based on location and weather.

## Prerequisites

1. An OpenAI API key (get one from [platform.openai.com](https://platform.openai.com))

## Setup

1. Create a `.env` file in the project root with your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

## Testing Methods

### Method 1: Using the OpenAI Tester Component

1. Start the development server
   ```
   npm run dev
   ```

2. Navigate to `/openai-test` in your browser
   - This route provides a dedicated testing interface for the OpenAI integration
   - You can customize location and weather data
   - Click "Test OpenAI API" to send a request

3. Examine the results
   - The response will be displayed in JSON format
   - Check that the venues include restaurants, concerts, and sports events
   - Verify that the locations are reasonable

### Method 2: Using the RecommendedDialog in the UI

1. Start the development server
   ```
   npm run dev
   ```

2. Click the "Recommended For You" button in the navigation bar
   - This will open the RecommendedDialog
   - The component will automatically:
     - Fetch your location using ipapi.co
     - Fetch weather data from Open-Meteo
     - Request recommendations from OpenAI

3. Observe the console logs
   - Open browser developer tools
   - Check for OpenAI-related logs in the console
   - Any errors will be displayed here

## Fallback Behavior

If the OpenAI API call fails for any reason (invalid API key, parse error, network issue), the component will automatically fall back to simulated recommendations. This ensures the user experience is not disrupted.

## Troubleshooting

- **Invalid API Key**: Ensure your API key is correctly set in the `.env` file
- **Format Issues**: If OpenAI returns data in an unexpected format, the error will be logged and fallback data will be used
- **Network Issues**: Check your internet connection and verify you can reach the OpenAI API endpoint
- **Rate Limiting**: OpenAI has rate limits; if exceeded, the API will return an error

## Expected OpenAI Response Format

The OpenAI API should return an array of venues in the following format:

```json
[
  {
    "name": "Restaurant Name",
    "lat": 40.7128,
    "lon": -74.0060,
    "type": "restaurant"
  },
  ...more venues
]
``` 