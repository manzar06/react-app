import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  CircularProgress,
  Typography,
  Paper,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';

interface ReplyBoxProps {
  postId: number;
  postTitle: string;
  postContent: string;
}

interface Reply {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  avatarUrl?: string;
  isAIGenerated?: boolean;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({ postId, postTitle, postContent }) => {
  const [replyText, setReplyText] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  // Show AI generation message
  useEffect(() => {
    if (useAI && !replyText && !isLoading) {
      setSnackbarMessage('Click in the text field or the "Generate AI Reply" button to create an AI-generated reply.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  }, [useAI, replyText, isLoading]);

  const handleToggleAI = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseAI(event.target.checked);
    // Clear any previous error
    setError(null);
  };

  const generateAIReply = async () => {
    if (!useAI) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Create the prompt for OpenAI API
      const prompt = `Write a short reply to this blog post titled '${postTitle}': ${postContent.substring(0, 500)}${postContent.length > 500 ? '...' : ''}`;
      
      console.log('Sending prompt to AI:', prompt);
      
      // Get the API key from environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.error('API key not found');
        setError('API key not found. Please check your environment variables.');
        setIsLoading(false);
        return;
      }
      
      // Make API call to OpenRouter
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that writes thoughtful and concise replies to blog posts. Keep your response under 150 words and conversational in tone.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'Blog Reply Generator'
          }
        }
      );
      
      console.log('OpenRouter response:', response.data);
      
      // Extract the generated reply
      const generatedReply = response.data.choices[0].message.content.trim();
      setReplyText(generatedReply);
      
      // Show success message
      setSnackbarMessage('AI reply generated successfully! You can edit it before submitting.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error: any) {
      console.error('Failed to generate AI reply:', error);
      setError('Failed to generate AI reply. Please try again later.');
      
      // Show error message
      setSnackbarMessage('Failed to generate AI reply. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    
    // Create a new reply
    const newReply: Reply = {
      id: Date.now().toString(),
      content: replyText.trim(),
      author: 'Current User',
      timestamp: new Date().toISOString(),
      avatarUrl: '/images/avatar.jpg',
      isAIGenerated: useAI
    };
    
    // Add to replies list
    setReplies([...replies, newReply]);
    
    // Clear the input
    setReplyText('');
    
    // Reset AI toggle
    setUseAI(false);
    
    // Show success message
    setSnackbarMessage('Reply submitted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Replies
      </Typography>
      
      {/* Display existing replies */}
      {replies.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {replies.map((reply) => (
            <Paper key={reply.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar 
                  src={reply.avatarUrl} 
                  alt={reply.author} 
                  sx={{ mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {reply.author}
                    </Typography>
                    {reply.isAIGenerated && (
                      <Tooltip title="AI-assisted reply">
                        <SmartToyIcon sx={{ ml: 1, fontSize: '0.9rem', color: 'primary.main' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(reply.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1">{reply.content}</Typography>
            </Paper>
          ))}
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Reply input form */}
      <Paper sx={{ p: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useAI}
              onChange={handleToggleAI}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Use AI to generate reply</Typography>
              <Tooltip title="When enabled, we'll generate a thoughtful reply based on the blog post content. You can edit it before submitting.">
                <SmartToyIcon sx={{ ml: 1, color: useAI ? 'primary.main' : 'text.secondary' }} />
              </Tooltip>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Write a reply"
          multiline
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onFocus={() => {
            if (useAI && !replyText && !isLoading) {
              generateAIReply();
            }
          }}
          disabled={isLoading}
          variant="outlined"
          sx={{ mb: 2 }}
          placeholder={useAI ? "Generating AI reply..." : "What are your thoughts on this post?"}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {useAI && !replyText && (
            <Button
              variant="outlined"
              onClick={generateAIReply}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SmartToyIcon />}
            >
              {isLoading ? 'Generating...' : 'Generate AI Reply'}
            </Button>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReply}
            disabled={isLoading || !replyText.trim()}
            sx={{ ml: 'auto' }}
          >
            {isLoading ? 'Please wait...' : 'Submit Reply'}
          </Button>
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReplyBox; 