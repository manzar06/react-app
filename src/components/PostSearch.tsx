import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  ToggleButtonGroup, 
  ToggleButton, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  CircularProgress,
  Paper,
  Container,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExactMatchIcon from '@mui/icons-material/TextFields';
import FuzzyMatchIcon from '@mui/icons-material/Spellcheck';
import SemanticMatchIcon from '@mui/icons-material/Psychology';
import HybridMatchIcon from '@mui/icons-material/Hub';
import { Link } from 'react-router-dom';
import { Post } from '../hooks/usePosts';
import { 
  searchExactMatch, 
  searchFuzzyMatch, 
  searchSemantic, 
  searchHybrid 
} from '../services/elasticsearch';

type SearchType = 'exact' | 'fuzzy' | 'semantic' | 'hybrid';

const PostSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('exact');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSearchType: SearchType,
  ) => {
    if (newSearchType !== null) {
      setSearchType(newSearchType);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      let searchResults: Post[] = [];
      
      switch(searchType) {
        case 'exact':
          searchResults = await searchExactMatch(searchQuery);
          break;
        case 'fuzzy':
          searchResults = await searchFuzzyMatch(searchQuery);
          break;
        case 'semantic':
          searchResults = await searchSemantic(searchQuery);
          break;
        case 'hybrid':
          searchResults = await searchHybrid(searchQuery);
          break;
        default:
          searchResults = await searchExactMatch(searchQuery);
      }
      
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getSearchTypeLabel = () => {
    switch(searchType) {
      case 'exact': return 'Exact Match';
      case 'fuzzy': return 'Fuzzy Match';
      case 'semantic': return 'AI-Powered Semantic';
      case 'hybrid': return 'Hybrid Search';
      default: return 'Search';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Search Blog Posts
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label={`Search for ${getSearchTypeLabel()}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            variant="outlined"
            placeholder="Enter search terms..."
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                >
                  Search
                </Button>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <ToggleButtonGroup
            value={searchType}
            exclusive
            onChange={handleSearchTypeChange}
            aria-label="search type"
            fullWidth
          >
            <ToggleButton value="exact" aria-label="exact match">
              <Tooltip title="Find posts that exactly match your search terms">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ExactMatchIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Exact 🔎</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="fuzzy" aria-label="fuzzy match">
              <Tooltip title="Find posts that approximately match, accounting for typos">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FuzzyMatchIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Fuzzy 🔍</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="semantic" aria-label="semantic match">
              <Tooltip title="Use AI to understand the meaning behind your search">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SemanticMatchIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Semantic 🤖</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="hybrid" aria-label="hybrid match">
              <Tooltip title="Combine different search techniques for best results">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HybridMatchIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Hybrid 🔗</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ my: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!loading && hasSearched && (
        <>
          <Typography variant="h6" gutterBottom>
            {results.length > 0 
              ? `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </Typography>
          
          <Grid container spacing={2}>
            {results.map(post => (
              <Grid item xs={12} key={post.id}>
                <Card sx={{ 
                  mb: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 2,
                  }
                }}>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      component={Link} 
                      to={`/post/${post.id}`}
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      By {post.author} • {post.date}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {post.topics.map(topic => (
                        <Typography
                          key={topic}
                          component="span"
                          variant="caption"
                          sx={{
                            mr: 1,
                            p: 0.5,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            borderRadius: 1,
                            display: 'inline-block',
                          }}
                        >
                          {topic}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default PostSearch; 