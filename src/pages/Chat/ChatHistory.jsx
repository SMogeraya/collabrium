import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

const ChatHistory = ({ contact, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Paper
            key={message.id}
            sx={{
              p: 1.5,
              mb: 1,
              maxWidth: '70%',
              alignSelf: message.sender === 'me' ? 'flex-end' : 'flex-start',
              bgcolor: message.sender === 'me' ? 'primary.main' : 'grey.300',
              color: message.sender === 'me' ? 'primary.contrastText' : 'inherit',
            }}
          >
            <Typography variant="body1">{message.text}</Typography>
          </Paper>
        ))}
      </Box>
      <Box sx={{ p: 2, display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button variant="contained" onClick={handleSend} sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatHistory;
