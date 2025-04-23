import React, { createContext, useState, useContext, useEffect } from 'react';
import { Topic, TopicData, createTopic } from '../models/Topic';
import { User, UserData, createUser } from '../models/User';
import { Snackbar, Alert } from '@mui/material';

// Sample topic data
const topicsData: TopicData[] = [
  {
    id: '1',
    name: 'Technology',
    description: 'Latest news and updates on tech innovations and products',
    imageUrl: '/images/technology.jpg'
  },
  {
    id: '2',
    name: 'Sports',
    description: 'Sports news, events, and analyses from around the world',
    imageUrl: '/images/sports.jpg'
  },
  {
    id: '3',
    name: 'Travel',
    description: 'Travel guides, destinations, and tips for your next adventure',
    imageUrl: '/images/travel.jpg'
  },
  {
    id: '4',
    name: 'Culture',
    description: 'Arts, entertainment, and cultural events from around the globe',
    imageUrl: '/images/culture.jpg'
  },
  {
    id: '5',
    name: 'Health',
    description: 'Health news, fitness tips, and wellbeing advice',
    imageUrl: '/images/health.jpg'
  }
];

// Sample current user
const currentUserData: UserData = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '/images/avatar.jpg'
};

// Define the context type
interface TopicContextType {
  topics: Topic[];
  currentUser: User;
  notification: { open: boolean; message: string } | null;
  subscribeToTopic: (topicId: string) => void;
  unsubscribeFromTopic: (topicId: string) => void;
  isSubscribed: (topicId: string) => boolean;
  publishPost: (topicId: string, postTitle: string) => void;
  closeNotification: () => void;
}

// Create the context
const TopicContext = createContext<TopicContextType | undefined>(undefined);

// Provider component
export const TopicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize topics from data
  const [topicInstances, setTopicInstances] = useState<Topic[]>(() => 
    topicsData.map(t => createTopic(t))
  );
  
  // Initialize current user
  const [currentUserInstance] = useState<User>(() => createUser(currentUserData));
  
  // State for notifications
  const [notification, setNotification] = useState<{ open: boolean; message: string } | null>(null);

  // Setup observer pattern connections
  useEffect(() => {
    // Define a custom observer that will show a notification
    const notificationObserver = {
      update: (topic: string, postTitle: string) => {
        setNotification({
          open: true,
          message: `New post in ${topic}: "${postTitle}"`
        });
      }
    };

    // Make the current user act as our notification observer
    const userUpdateOriginal = currentUserInstance.update.bind(currentUserInstance);
    currentUserInstance.update = (topic: string, postTitle: string) => {
      userUpdateOriginal(topic, postTitle);
      notificationObserver.update(topic, postTitle);
    };

    return () => {
      // Clean up any observers if needed
    };
  }, [currentUserInstance]);

  // Subscribe to a topic
  const subscribeToTopic = (topicId: string) => {
    const topic = topicInstances.find(t => t.id === topicId);
    if (topic) {
      topic.subscribe(currentUserInstance);
      currentUserInstance.addSubscription(topicId);
      console.log(`User ${currentUserInstance.name} subscribed to ${topic.name}`);
    }
  };

  // Unsubscribe from a topic
  const unsubscribeFromTopic = (topicId: string) => {
    const topic = topicInstances.find(t => t.id === topicId);
    if (topic) {
      topic.unsubscribe(currentUserInstance);
      currentUserInstance.removeSubscription(topicId);
      console.log(`User ${currentUserInstance.name} unsubscribed from ${topic.name}`);
    }
  };

  // Check if user is subscribed to a topic
  const isSubscribed = (topicId: string) => {
    return currentUserInstance.isSubscribed(topicId);
  };

  // Publish a post to a topic
  const publishPost = (topicId: string, postTitle: string) => {
    const topic = topicInstances.find(t => t.id === topicId);
    if (topic) {
      topic.publishPost(postTitle);
    }
  };

  // Close notification
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <TopicContext.Provider
      value={{
        topics: topicInstances,
        currentUser: currentUserInstance,
        notification,
        subscribeToTopic,
        unsubscribeFromTopic,
        isSubscribed,
        publishPost,
        closeNotification
      }}
    >
      {children}
      {notification && (
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={closeNotification} 
            severity="info" 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </TopicContext.Provider>
  );
};

// Hook for using the topic context
export const useTopicContext = () => {
  const context = useContext(TopicContext);
  if (context === undefined) {
    throw new Error('useTopicContext must be used within a TopicProvider');
  }
  return context;
}; 