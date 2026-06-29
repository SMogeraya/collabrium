import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Box, TextField, IconButton, InputAdornment, Menu, MenuItem, ListItemIcon, ListItemButton, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { auth, db } from '../../firebase'; 
import { doc, getDoc } from "firebase/firestore";

const ContactItem = ({ contact, onSelectContact, currentUser }) => {
  const [displayData, setDisplayData] = useState({ name: '', avatar: '' });

  useEffect(() => {
    const getDisplayData = async () => {
      if (contact.isGroup) {
        setDisplayData({ name: contact.name, avatar: contact.avatar });
      } else {
        const otherUserId = contact.participants.find(uid => uid !== currentUser.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, "persons", otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayData({ name: userData.username, avatar: userData.avatar });
          }
        }
      }
    };

    getDisplayData();
  }, [contact, currentUser.uid]);

  return (
    <ListItemButton onClick={() => onSelectContact(contact)}>
      <ListItemAvatar>
        <Avatar src={displayData.avatar} />
      </ListItemAvatar>
      <ListItemText primary={displayData.name} />
    </ListItemButton>
  );
}

const ContactList = ({ contacts, onSelectContact, onAddChatClick, currentUser }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    auth.signOut();
    handleMenuClose();
  };

  const filteredContacts = contacts.filter(contact => {
      if (searchQuery!='') {
          return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      // This part is tricky as we need to fetch user data for one-on-one chats
      // For now, we'll just search by the internal data which might not be user-facing
      // A better implementation would fetch and cache user data for searching
      return true;
  })

  if (!currentUser) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
       

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <List component="nav">
                {/* User Info with Logout */}
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={currentUser.avatar} />
                    </ListItemAvatar>
                    <ListItemText primary={currentUser.username} />
                    <IconButton onClick={handleMenuOpen}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </ListItem>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search"
                size="small"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <IconButton onClick={onAddChatClick}>
                <AddIcon />
            </IconButton>
        </Box>
                {/* Contact List */}
                {filteredContacts!=null?
                (filteredContacts.map((contact) => (
                  <ContactItem 
                      key={contact.id}
                      contact={contact}
                      onSelectContact={onSelectContact}
                      currentUser={currentUser}
                  />
              ))):
              (contacts.map((contact) => (
                <ContactItem 
                    key={contact.id}
                    contact={contact}
                    onSelectContact={onSelectContact}
                    currentUser={currentUser}
                />
            )))}
                
            </List>
        </Box>
    </Box>
  );
};

export default ContactList;
