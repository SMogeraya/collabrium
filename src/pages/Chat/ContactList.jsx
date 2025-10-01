import React from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

const ContactList = ({ contacts, onSelectContact }) => {
  return (
    <List>
      {contacts.map((contact) => (
        <ListItem button key={contact.id} onClick={() => onSelectContact(contact)}>
          <ListItemAvatar>
            <Avatar src={contact.avatar} />
          </ListItemAvatar>
          <ListItemText primary={contact.name} />
        </ListItem>
      ))}
    </List>
  );
};

export default ContactList;
