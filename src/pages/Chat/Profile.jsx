import React from 'react';
import { Box, Typography, IconButton, Paper, Slide } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const Profile = ({ contact, onBack }) => {
  return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <Paper sx={{ p: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h5">{contact.name}</Typography>
          <Typography variant="body1">{contact.details.email}</Typography>
          <Typography variant="body1">{contact.details.phone}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{contact.details.bio}</Typography>
        </Box>
      </Paper>
    </Slide>
  );
};

export default Profile;
