import React, { useState } from 'react';
import { Button, TextField, Avatar, Typography, Box, Link } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import AuthLayout from '../../components/AuthLayout';

const Register = ({ setShowRegister, themeMode, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    setError('');

    if (!username) {
      setError("Username is required.");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const avatar = avatarUrl || `https://i.pravatar.cc/150?u=${cred.user.uid}`;
      await setDoc(doc(db, "persons", cred.user.uid), {
        uid: cred.user.uid,
        username: username,
        email: email,
        avatar: avatar,
        role: 'user' // Set default role for new users
      });
    } catch (error) {
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign Up" themeMode={themeMode} toggleTheme={toggleTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
        <Avatar src={avatarUrl} sx={{ width: 80, height: 80, mb: 2 }} />
      </Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
        >
            Sign Up
        </Button>
        <Link href="#" variant="body2" onClick={() => setShowRegister(false)}>
            {"Already have an account? Sign In"}
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default Register;