import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import posts from '../data/posts.json';

const PostDetail = () => {
  const { id } = useParams();
  const post = posts.posts.find((p) => p.id === Number(id));

  if (!post) {
    return <Typography>Post not found</Typography>;
  }

  return (
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
      <Typography variant="body1" paragraph>
        {post.content}
      </Typography>
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
    </Paper>
  );
};

export default PostDetail; 