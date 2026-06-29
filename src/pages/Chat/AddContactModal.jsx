import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const AddContactModal = ({ open, onClose, onAddContact }) => {
  const [contactName, setContactName] = useState('');

  const handleAdd = () => {
    if (contactName.trim()) {
      onAddContact(contactName);
      setContactName('');
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
        <Typography variant="h6" sx={{ mb: 2 }}>Add New Contact</Typography>
        <TextField
          fullWidth
          label="Contact Name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleAdd}>Add Contact</Button>
      </Box>
    </Modal>
  );
};

export default AddContactModal;
