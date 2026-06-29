import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, IconButton, List, ListItem, ListItemAvatar, ListItemText, Chip, TextField, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useUserStore } from '../../userStore';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase';
import './styles.css';

const Profile = ({ contact, messages, onClose, onTagSelect, selectedTag }) => {
  const { currentUser } = useUserStore();
  const [otherUser, setOtherUser] = useState(null);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  useEffect(() => {
    if (!contact || contact.isGroup || !currentUser) {
      setOtherUser(null);
      return;
    }

    const otherUserId = contact.participants.find(uid => uid !== currentUser.uid);

    if (otherUserId) {
      const fetchOtherUser = async () => {
        const userDocRef = doc(db, "persons", otherUserId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setOtherUser(userDocSnap.data());
        }
      };
      fetchOtherUser();
    } else {
        setOtherUser(null);
    }
  }, [contact, currentUser]);

  if (!contact) return null;

  const allTags = messages.reduce((acc, msg) => {
    if (msg.tag) {
      acc.add(msg.tag);
    }
    return acc;
  }, new Set());

  const filteredTags = [...allTags].filter(tag => 
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );
  
  const displayName = contact.isGroup ? contact.groupName : (otherUser ? otherUser.username : "");
  const displayAvatar = contact.isGroup ? contact.groupAvatar : (otherUser ? otherUser.avatar : "");

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <IconButton onClick={onClose} sx={{ alignSelf: 'flex-start' }}>
        <CloseIcon />
      </IconButton>

      <Box sx={{ textAlign: 'center', mt: 2,p:5 }}>
        <Avatar 
          sx={{ width: 80, height: 80, margin: '0 auto' }} 
          src={displayAvatar}
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {displayName}
        </Typography>
      </Box>
      
      {contact.isGroup && contact.members && (
        <Box className="custom-scrollbar" sx={{ mt: 4,p:4, flexShrink: 0 ,height:'150px'}}>
            <Typography variant="subtitle1">Group Members</Typography>
            <List className="custom-scrollbar" sx={{maxHeight: 200, overflowY: 'auto'}}>
                {contact.members.map(member => (
                    <ListItem key={member.uid}>
                        <ListItemAvatar>
                            <Avatar src={member.avatar} />
                        </ListItemAvatar>
                        <ListItemText primary={member.username} />
                    </ListItem>
                ))}
            </List>
        </Box>
      )}

      {(filteredTags.length > 0 || tagSearchQuery) && (
        <Box sx={{ mt: 5,p:2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1">Tags</Typography>
            <TextField 
              variant="standard"
              placeholder="Search tags..."
              value={tagSearchQuery}
              onChange={e => setTagSearchQuery(e.target.value)}
              sx={{ mb: 2, mt: 1}}      
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <Box className="custom-scrollbar" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, overflowY: 'auto', maxHeight: '150px',width:'200px' }}>
                {filteredTags.map(tag => (
                    <Chip 
                        key={tag} 
                        label={tag} 
                        onClick={() => onTagSelect(tag)}
                        color={selectedTag === tag ? 'primary' : 'default'}
                    />
                ))}
            </Box>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
