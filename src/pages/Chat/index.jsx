import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Avatar } from '@mui/material';
import { contacts as initialContacts } from './data';
import ContactList from './ContactList';
import ChatHistory from './ChatHistory';
import Profile from './Profile';

const Chat = () => {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleSendMessage = (message) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === selectedContact.id
        ? {
            ...contact,
            messages: [...contact.messages, { id: Date.now(), text: message, sender: 'me' }],
          }
        : contact
    );
    setContacts(updatedContacts);
    setSelectedContact(updatedContacts.find(c => c.id === selectedContact.id));
  };

  if (showProfile) {
    return <Profile contact={selectedContact} onBack={() => setShowProfile(false)} />;
  }

  return (
    <Grid container component={Paper} sx={{ height: 'calc(100vh - 48px)' }}>
      <Grid item xs={9} sx={{ display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
              }}
              onClick={() => setShowProfile(true)}
            >
              <Avatar src={selectedContact.avatar} sx={{ mr: 2 }} />
              <Typography variant="h6">{selectedContact.name}</Typography>
            </Box>
            <ChatHistory
              contact={selectedContact}
              messages={selectedContact.messages}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6">Select a contact to start chatting</Typography>
          </Box>
        )}
      </Grid>
      <Grid item xs={3} sx={{ borderLeft: '1px solid #ddd' }}>
        <ContactList contacts={contacts} onSelectContact={setSelectedContact} />
      </Grid>
    </Grid>
  );
};

export default Chat;
