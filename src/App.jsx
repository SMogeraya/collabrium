import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
// import Intro from './pages/Intro';
import { Box, CircularProgress, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useUserStore } from './userStore';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#89A8B2',
    },
    secondary: {
      main: '#B3C8CF',
    },
    background: {
      default: '#E5E1DA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#5f5f5f',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#89A8B2',
    },
    secondary: {
      main: '#B3C8CF',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2c2c2c',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
});

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [themeMode, setThemeMode] = useState('light');
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUserInfo]);

  const handleShowLogin = () => {
    setShowIntro(false);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowIntro(false);
    setShowRegister(true);
  };

  const handleGetStarted = () => {
      setShowIntro(false);
      setShowRegister(true);
  }

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
       {currentUser ? (
        <Dashboard />
      ) : showRegister ? (
        <Register 
            setShowRegister={setShowRegister} 
            themeMode={themeMode} 
            toggleTheme={toggleTheme} 
        />
      ) : (
        <Login 
            setShowRegister={setShowRegister} 
            themeMode={themeMode} 
            toggleTheme={toggleTheme} 
        />
      )}
    </ThemeProvider>
  );
}

export default App;
