import { useState } from 'react';
import { AppBar, Box, Button, CssBaseline, Toolbar, Typography, Stack, Container } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import RecommendedDialog from '../components/RecommendedDialog';

const MainLayout = () => {
  const location = useLocation();
  const [recommendedOpen, setRecommendedOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRecommendedClick = () => {
    setRecommendedOpen(true);
  };

  const handleRecommendedClose = () => {
    setRecommendedOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="sticky" 
        elevation={1} 
        sx={{ 
          width: '100vw',
          left: 0,
          right: 0,
          bgcolor: 'primary.main',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1400px', px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar disableGutters>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/"
              sx={{ 
                flexGrow: 0, 
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                mr: 4,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Blog Platform
            </Typography>
            <Stack 
              direction="row" 
              spacing={{ xs: 1, sm: 2 }} 
              sx={{ 
                flexGrow: 1,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <Button 
                component={Link} 
                to="/" 
                color="inherit"
                sx={{ 
                  fontWeight: isActive('/') ? 700 : 400,
                  opacity: isActive('/') ? 1 : 0.8,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                HOME
              </Button>
              <Button 
                component={Link} 
                to="/topics" 
                color="inherit"
                sx={{ 
                  fontWeight: isActive('/topics') ? 700 : 400,
                  opacity: isActive('/topics') ? 1 : 0.8,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                TOPICS
              </Button>
              <Button 
                component={Link} 
                to="/subscriptions" 
                color="inherit"
                sx={{ 
                  fontWeight: isActive('/subscriptions') ? 700 : 400,
                  opacity: isActive('/subscriptions') ? 1 : 0.8,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                SUBSCRIPTIONS
              </Button>
              <Button 
                component={Link} 
                to="/search" 
                color="inherit"
                startIcon={<SearchIcon />}
                sx={{ 
                  fontWeight: isActive('/search') ? 700 : 400,
                  opacity: isActive('/search') ? 1 : 0.8,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                SEARCH
              </Button>
            </Stack>
            <Button 
              color="inherit" 
              variant="outlined"
              size="small"
              onClick={handleRecommendedClick}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                px: { xs: 1, sm: 2 },
                py: 0.75,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                whiteSpace: 'nowrap'
              }}
            >
              RECOMMENDED FOR YOU
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%', 
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
          pt: 3
        }}
      >
        <Outlet />
      </Box>
      <RecommendedDialog 
        open={recommendedOpen}
        onClose={handleRecommendedClose}
      />
    </Box>
  );
};

export default MainLayout; 