import { Card, CardContent, CardMedia, Grid, Typography, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import posts from '../data/posts.json';

const Home = () => {
  return (
    <Container maxWidth={false} sx={{ maxWidth: '1400px', py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Latest Posts
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover the latest articles and insights about React development
        </Typography>
      </Box>
      <Grid container spacing={2.5}>
        {posts.posts.map((post) => (
          <Grid item key={post.id} xs={12} sm={6} lg={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '56%' }}>
                <CardMedia
                  component="img"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  image={post.image}
                  alt={post.title}
                />
              </Box>
              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component={Link}
                  to={`/post/${post.id}`}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    fontWeight: 600,
                    display: 'block',
                    mb: 1,
                    fontSize: '1.1rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {post.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 'auto',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.excerpt}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    By {post.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.date}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 