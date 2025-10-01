import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import './styles.css';

const DocumentQa = () => {
  const [document, setDocument] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = () => {
    if (document.trim() !== '' && question.trim() !== '') {
      setLoading(true);
      // Simulate asking a question about the document
      setTimeout(() => {
        setAnswer('This is a simulated answer to your question about the document.');
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" className="title">AI Document Q&A</Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        variant="outlined"
        placeholder="Paste your document here"
        value={document}
        onChange={(e) => setDocument(e.target.value)}
        className="text-field"
      />
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Ask a question about the document"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="text-field"
      />
      <Button variant="contained" color="primary" onClick={handleAsk} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Ask'}
      </Button>
      {answer && (
        <Box className="answer-container">
          <Typography variant="h6">Answer:</Typography>
          <Typography>{answer}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentQa;
