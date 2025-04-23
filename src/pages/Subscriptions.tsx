import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  CardMedia,
  TextField,
  Alert,
  Divider
} from '@mui/material';
import { useTopicContext } from '../contexts/TopicContext';

const Subscriptions: React.FC = () => {
  const { topics, currentUser, isSubscribed, publishPost } = useTopicContext();
  const [newPostTitle, setNewPostTitle] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [error, setError] = useState('');

  // Get subscribed topics
  const subscribedTopics = topics.filter(topic => isSubscribed(topic.id));

  // Add fallback images for topic cards
  const fallbackImages = {
    Technology: 'https://via.placeholder.com/300x200?text=Technology',
    Sports: 'https://via.placeholder.com/300x200?text=Sports',
    Travel: 'https://via.placeholder.com/300x200?text=Travel',
    Culture: 'https://via.placeholder.com/300x200?text=Culture',
    Health: 'https://via.placeholder.com/300x200?text=Health',
    default: 'https://via.placeholder.com/300x200?text=Topic'
  };

  // Function to get fallback image based on topic name
  const getFallbackImage = (topicName: string) => {
    const key = topicName as keyof typeof fallbackImages;
    return fallbackImages[key] || fallbackImages.default;
  };

  // Handle publishing a new post
  const handlePublishPost = () => {
    if (!selectedTopicId) {
      setError('Please select a topic');
      return;
    }
    
    if (!newPostTitle.trim()) {
      setError('Please enter a post title');
      return;
    }

    publishPost(selectedTopicId, newPostTitle);
    setNewPostTitle('');
    setError('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Subscriptions
        </Typography>
        <Typography variant="body1">
          Manage your topic subscriptions and simulate new posts to see notifications.
        </Typography>
      </Paper>

      {subscribedTopics.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You haven't subscribed to any topics yet. Visit the Topics page to subscribe.
        </Alert>
      ) : (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Your Subscribed Topics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {subscribedTopics.map((topic) => (
              <Grid item key={topic.id} xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={topic.imageUrl}
                    alt={topic.name}
                    onError={(e) => {
                      // Replace with fallback image on error
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src = getFallbackImage(topic.name);
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="div">
                      {topic.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flexGrow: 1 }}>
                      {topic.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setNewPostTitle(`New update about ${topic.name}`);
                      }}
                      fullWidth
                    >
                      Simulate New Post
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Simulate a New Post
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Test the observer pattern by publishing a post to one of your subscribed topics.
              This will trigger a notification via the observer pattern.
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Select Topic"
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  helperText="Select a topic to publish to"
                  margin="normal"
                >
                  <option value="">Select a topic</option>
                  {subscribedTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Post Title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  helperText="Enter the title of your post"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePublishPost}
                  disabled={!selectedTopicId || !newPostTitle.trim()}
                >
                  Publish Post
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Subscriptions; 