import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Checkbox, ListItemText, OutlinedInput, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const CreateGroupModal = ({ open, onClose, onCreateGroup, contacts }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName, selectedMembers);
      setGroupName('');
      setSelectedMembers([]);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Create New Group</Typography>
        <TextField
          fullWidth
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Members</InputLabel>
          <Select
            multiple
            value={selectedMembers}
            onChange={(e) => setSelectedMembers(e.target.value)}
            input={<OutlinedInput label="Members" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {contacts.filter(c => !c.isGroup).map((contact) => (
              <MenuItem key={contact.id} value={contact.name}>
                <Checkbox checked={selectedMembers.indexOf(contact.name) > -1} />
                <ListItemText primary={contact.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleCreate}>Create</Button>
      </Box>
    </Modal>
  );
};

export default CreateGroupModal;
