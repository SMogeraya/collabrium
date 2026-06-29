import React from 'react';
import { Box, Typography, IconButton, Avatar, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';

const ChatHeader = ({ contact, onBack, onToggleProfile, isMobile }) => {

    const displayName = contact.isGroup ? contact.name : contact.participants.find(p => p.uid !== currentUser.uid)?.username || 'Unknown User';
    const displayAvatar = contact.isGroup ? contact.avatar : contact.participants.find(p => p.uid !== currentUser.uid)?.avatar;

  return (
    <Paper elevation={2} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 0, borderBottom: '1px solid #ddd' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
                <IconButton onClick={onBack} sx={{mr: 1}}>
                    <ArrowBackIcon />
                </IconButton>
            )}
            <Avatar src={displayAvatar} sx={{ mr: 2 }} />
            <Box>
                <Typography variant="h6">{displayName}</Typography>
                <Typography variant="body2" color="text.secondary">Online</Typography> {/* Placeholder */}
            </Box>
        </Box>
        <IconButton onClick={onToggleProfile}>
            <InfoIcon />
        </IconButton>
    </Paper>
  );
};

export default ChatHeader;
