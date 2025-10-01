import React from 'react';
import { Box, Typography } from '@mui/material';
import './styles.css';

const Home = () => {
  return (
    <Box className="container">
      <Typography variant="h2" className="title">Welcome to the AI Toolbox</Typography>
      <Typography variant="h5" className="subtitle">Select a feature from the left to get started</Typography>
    </Box>
  );
};

export default Home;
