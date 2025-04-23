import React from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Grid,
  Paper
} from '@mui/material';
import TopicCard from '../components/TopicCard';
import { useTopicContext } from '../contexts/TopicContext';

const Topics: React.FC = () => {
  const { topics } = useTopicContext();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Topics
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Browse and subscribe to topics that interest you. You'll be notified when new content is published.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {topics.map((topic) => (
          <Grid item key={topic.id} xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
            <TopicCard topic={topic} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Topics; 