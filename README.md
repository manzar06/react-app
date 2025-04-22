# Weather-Based Recommendations App

This application shows personalized venue recommendations based on your location and current weather conditions.

## Features
- Interactive map with location markers
- Weather-based recommendations for restaurants, concerts, and sports events
- AI-powered recommendations via OpenRouter or OpenAI
- Fallback to simulated recommendations when API is unavailable

## Configuration

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```
VITE_OPENAI_API_KEY=your_api_key_here
VITE_USE_SIMULATED_RECOMMENDATIONS=false
```

- `VITE_OPENAI_API_KEY`: Your API key for generating recommendations (supports both OpenRouter and OpenAI keys)
- `VITE_USE_SIMULATED_RECOMMENDATIONS`: Set to `true` to use simulated recommendations instead of calling the API

### API Provider Options

This application supports two API providers for AI-generated recommendations:

1. **OpenRouter** (recommended): Use an OpenRouter API key (starts with `sk-or-`) for better cost-effectiveness and rate limits
2. **OpenAI**: Use a standard OpenAI API key if you prefer direct access

### API Rate Limits

If you encounter rate limit errors (429) with the API, you can:

1. Set `VITE_USE_SIMULATED_RECOMMENDATIONS=true` in your `.env` file to use simulated data
2. Wait for the rate limit to reset (usually several hours)
3. Try using a different API key with higher quotas
4. Switch between OpenRouter and OpenAI depending on which has available quota

The application automatically falls back to simulated recommendations if the API is unavailable or returns errors.

## Development

To start the development server:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` (or the port shown in your terminal) to view the app.

## Building for Production

```bash
npm run build
```

The built assets will be in the `dist` directory.

---

## Original Vite Documentation

This project was created with Vite. See below for the original Vite documentation.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
