import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

const CreateGroup = ({ onCreateGroup, onCancel }) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState('');

  const handleCreate = () => {
    if (groupName.trim() && members.trim()) {
      const memberNames = members.split(',').map(name => name.trim()).filter(Boolean);
      onCreateGroup(groupName, memberNames);
    }
  };

  return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
        <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Create New Group</Typography>
        <TextField
            fullWidth
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
        />
        <TextField
            fullWidth
            label="Members (comma-separated)"
            variant="outlined"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            sx={{ mb: 2 }}
        />
        <Box>
            <Button variant="contained" onClick={handleCreate}>Create</Button>
            <Button onClick={onCancel} sx={{ ml: 1 }}>Cancel</Button>
        </Box>
        </Paper>
    </Box>
  );
};

export default CreateGroup;
