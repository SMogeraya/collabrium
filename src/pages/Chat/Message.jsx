import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useUserStore } from '../../userStore';

const Message = ({ msg }) => {
  const { currentUser } = useUserStore();
  const isSender = msg.senderId === currentUser.uid;

  // Fallback for timestamp
  const timestamp = msg.sentTime?.toDate ? msg.sentTime.toDate() : new Date();

  return (
    <Box sx={{ 
        display: 'flex', 
        justifyContent: isSender ? 'flex-end' : 'flex-start',
        mb: 2, 
      }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 1.5, 
          maxWidth: '70%', 
          bgcolor: isSender ? 'primary.main' : 'grey.200', 
          color: isSender ? 'primary.contrastText' : 'text.primary',
          borderRadius: isSender ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        }}
      >
        <Typography variant="body1">{msg.text}</Typography>
        <Typography 
            variant="caption" 
            sx={{ 
                display: 'block', 
                textAlign: 'right', 
                mt: 0.5,
                color: isSender ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            }}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Message;
