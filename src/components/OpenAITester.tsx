import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { getRecommendations } from '../utils/api';

const OpenAITester = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string | null>(null);
  const [location, setLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    region: 'New York',
  });
  const [weather, setWeather] = useState({
    temperature: 22,
    description: 'Clear sky',
  });

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const recommendations = await getRecommendations(location, weather);
      setResults(JSON.stringify(recommendations, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        OpenAI API Tester
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Location
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Latitude"
            type="number"
            value={location.latitude}
            onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Longitude"
            type="number"
            value={location.longitude}
            onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="City"
            value={location.city}
            onChange={(e) => setLocation({ ...location, city: e.target.value })}
            fullWidth
          />
          <TextField
            label="Region"
            value={location.region}
            onChange={(e) => setLocation({ ...location, region: e.target.value })}
            fullWidth
          />
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Weather
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Temperature (°C)"
            type="number"
            value={weather.temperature}
            onChange={(e) => setWeather({ ...weather, temperature: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Description"
            value={weather.description}
            onChange={(e) => setWeather({ ...weather, description: e.target.value })}
            fullWidth
          />
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          Make sure you have set your OpenAI API key in the .env file using the variable VITE_OPENAI_API_KEY
        </Alert>

        <Button 
          variant="contained" 
          onClick={handleTest} 
          disabled={loading} 
          sx={{ mt: 2 }}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Test OpenAI API'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
            }}
          >
            {results}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default OpenAITester; 