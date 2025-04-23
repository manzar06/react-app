import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';
import posts from '../data/posts.json';
import ReplyBox from '../components/ReplyBox';
import { useEffect, useState } from 'react';

const PostDetail = () => {
  const { id } = useParams();
  const post = posts.posts.find((p) => p.id === Number(id));
  const [formattedContent, setFormattedContent] = useState<string[]>([]);

  // Format the post content to render code blocks properly
  useEffect(() => {
    if (post) {
      // Split by code blocks
      const parts = post.content.split('```');
      const formatted = parts.map((part, index) => {
        // Even indices are regular text, odd indices are code blocks
        if (index % 2 === 0) {
          return part;
        } else {
          // Extract language if specified (e.g., ```tsx)
          let code = part;
          let language = '';
          
          // Check if there's a language specified
          if (part.indexOf('\n') > 0) {
            language = part.substring(0, part.indexOf('\n'));
            code = part.substring(part.indexOf('\n') + 1);
          }
          
          return `<pre><code class="language-${language}">${code}</code></pre>`;
        }
      });
      
      setFormattedContent(formatted);
    }
  }, [post]);

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4">Post not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            By {post.author} • {post.date}
          </Typography>
        </Box>
        <Box
          component="img"
          src={post.image}
          alt={post.title}
          sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', mb: 4 }}
        />
        
        {/* Render the formatted content */}
        <Box sx={{ mb: 4 }}>
          {formattedContent.map((part, index) => {
            if (index % 2 === 0) {
              // Regular text - split by paragraphs and render
              return part.split('\n\n').map((paragraph, pIndex) => (
                <Typography key={`p-${index}-${pIndex}`} variant="body1" paragraph>
                  {paragraph}
                </Typography>
              ));
            } else {
              // Code block
              return (
                <Box
                  key={`code-${index}`}
                  sx={{
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    my: 2,
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre',
                  }}
                  dangerouslySetInnerHTML={{ __html: part }}
                />
              );
            }
          })}
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Topics:
          </Typography>
          {post.topics.map((topic) => (
            <Typography
              key={topic}
              component="span"
              sx={{
                mr: 2,
                p: 1,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 1,
              }}
            >
              {topic}
            </Typography>
          ))}
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <ReplyBox 
          postId={post.id} 
          postTitle={post.title} 
          postContent={post.content}
        />
      </Paper>
    </Container>
  );
};

export default PostDetail; 