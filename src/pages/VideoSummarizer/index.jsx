import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import './styles.css';

const VideoSummarizer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = () => {
    if (videoUrl.trim() !== '') {
      setLoading(true);
      // Here you would typically send the video URL to a summarization service.
      // For now, we'll just simulate a delay and a dummy summary.
      setTimeout(() => {
        setSummary('This is a simulated summary of the video.');
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" className="title">Video Summarizer</Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="text-field"
      />
      <Button className='summary_button' variant="contained" color="primary" onClick={handleSummarize} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Summarize'}
      </Button>
      {summary && (
        <Box className="summary-container">
          <Typography variant="h6">Summary:</Typography>
          <Typography>{summary}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoSummarizer;
