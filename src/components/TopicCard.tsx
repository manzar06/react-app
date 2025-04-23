import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button,
  Box,
  Chip
} from '@mui/material';
import { useTopicContext } from '../contexts/TopicContext';
import { Topic } from '../models/Topic';

// Fallback images for each topic type
const fallbackImages = {
  Technology: 'https://via.placeholder.com/300x200?text=Technology',
  Sports: 'https://via.placeholder.com/300x200?text=Sports',
  Travel: 'https://via.placeholder.com/300x200?text=Travel',
  Culture: 'https://via.placeholder.com/300x200?text=Culture',
  Health: 'https://via.placeholder.com/300x200?text=Health',
  default: 'https://via.placeholder.com/300x200?text=Topic'
};

interface TopicCardProps {
  topic: Topic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const { subscribeToTopic, unsubscribeFromTopic, isSubscribed } = useTopicContext();
  const [imageError, setImageError] = useState(false);
  
  const subscribed = isSubscribed(topic.id);

  const handleSubscriptionToggle = () => {
    if (subscribed) {
      unsubscribeFromTopic(topic.id);
    } else {
      subscribeToTopic(topic.id);
    }
  };

  // Handle image error and use fallback
  const handleImageError = () => {
    setImageError(true);
  };

  // Get appropriate fallback image based on topic name
  const getFallbackImage = () => {
    const key = topic.name as keyof typeof fallbackImages;
    return fallbackImages[key] || fallbackImages.default;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={imageError ? getFallbackImage() : topic.imageUrl}
        alt={topic.name}
        onError={handleImageError}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {topic.name}
          </Typography>
          <Chip 
            label={subscribed ? 'Subscribed' : 'Not Subscribed'} 
            color={subscribed ? 'primary' : 'default'}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {topic.description}
        </Typography>
        <Button
          variant={subscribed ? 'outlined' : 'contained'}
          color={subscribed ? 'error' : 'primary'}
          onClick={handleSubscriptionToggle}
          fullWidth
          sx={{ mt: 'auto' }}
        >
          {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TopicCard; 