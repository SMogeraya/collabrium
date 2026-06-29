import React from 'react';
import { Box, Paper, IconButton, Typography, Container } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import './styles.css';

const AuthLayout = ({ children, title, themeMode, toggleTheme }) => {
  return (
    <Container component="main" maxWidth="xs" className="auth-container">
      <Paper elevation={6} className="auth-paper">
        <Box className="auth-header">
            <Typography component="h1" variant="h5">
                {title}
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
        </Box>
        {children}
      </Paper>
    </Container>
  );
};

export default AuthLayout;
