import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import './styles.css';

const HrAssistant = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (jobDescription.trim() !== '' && resume.trim() !== '') {
      setLoading(true);
      // Simulate analysis
      setTimeout(() => {
        setAnalysis('This is a simulated analysis of the resume against the job description.');
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" className="title">AI HR Assistant</Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        variant="outlined"
        placeholder="Paste job description here"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="text-field"
      />
      <TextField
        fullWidth
        multiline
        rows={10}
        variant="outlined"
        placeholder="Paste resume here"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        className="text-field"
      />
      <Button className="analyze-button" variant="contained" color="primary" onClick={handleAnalyze} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Analyze'}
      </Button>
      {analysis && (
        <Box className="analysis-container">
          <Typography variant="h6">Analysis:</Typography>
          <Typography>{analysis}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default HrAssistant;
