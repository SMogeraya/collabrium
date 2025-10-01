import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import './styles.css';

const BulkEmailSender = () => {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSend = () => {
    if (recipients.trim() !== '' && subject.trim() !== '' && body.trim() !== '') {
      setLoading(true);
      setFeedback('');
      // Simulate sending emails
      setTimeout(() => {
        setLoading(false);
        setFeedback('Emails sent successfully!');
      }, 2000);
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" className="title">Bulk Email Sender</Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        placeholder="Enter recipient emails, separated by commas"
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        className="text-field"
      />
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="text-field"
      />
      <TextField
        fullWidth
        multiline
        rows={10}
        variant="outlined"
        placeholder="Email body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="text-field"
      />
      <Button className="send-button" variant="contained" color="primary" onClick={handleSend} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Send Emails'}
      </Button>
      {feedback && (
        <Typography className="feedback">{feedback}</Typography>
      )}
    </Box>
  );
};

export default BulkEmailSender;
