import React, { useState, useEffect, useRef } from 'react';
import {ListItemAvatar,ListItem ,Box, TextField, Button, Paper, Typography, Chip, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Modal, Fade, Backdrop, List } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EmojiPicker from 'emoji-picker-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TranslateIcon from '@mui/icons-material/Translate';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useUserStore } from '../../userStore';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase';
import { processMessageForReminder } from '../../utils/ReminderProcessor';

const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

const ChatHistory = ({ contact, messages, onSendMessage, onToggleProfile }) => {
  const [newMessage, setNewMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageMenuAnchorEl, setMessageMenuAnchorEl] = useState(null);
  const [translateMenuAnchorEl, setTranslateMenuAnchorEl] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { currentUser, addReminder } = useUserStore();
  const theme = useTheme();

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


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const handleEmojiClick = (e) => {
    setNewMessage(newMessage + e.emoji);
    setShowEmojiPicker(false);
  }

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage({ 
          id: Date.now().toString(),
          text: newMessage, 
          tag: newTag,
          senderId: currentUser.uid, 
          sentAt: new Date()
      });
      setNewMessage('');
      setNewTag('');
    }
  };

  const getSenderAvatar = (senderId) => {
      if (senderId === currentUser.uid) return currentUser.avatar;
      if (contact.isGroup) {
        const member = contact.members.find(m => m.uid === senderId);
        return member ? member.avatar : 'https://via.placeholder.com/150';
      } else {
        return otherUser ? otherUser.avatar : 'https://via.placeholder.com/150';
      }
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMessageMenuClick = (event, message) => {
    setMessageMenuAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
      setMessageMenuAnchorEl(null);
      setSelectedMessage(null);
  };

  const handleUploadClick = () => {
    handleMenuClose();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`File selected: ${file.name}. File uploaded`);
    }
  };

  const handleTranslateMenuClick = (event) => {
      setTranslateMenuAnchorEl(event.currentTarget);
  }

  const handleTranslateMenuClose = () => {
      setTranslateMenuAnchorEl(null);
  }

  const handleTranslate = async (targetLanguage) => {
    handleTranslateMenuClose();
    if (newMessage.trim()) {
        setNewMessage("Translating...");
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(newMessage)}`;
            const response = await fetch(url);
            const data = await response.json();
            const translatedText = data[0].map(item => item[0]).join('');
            setNewMessage(translatedText);
        } catch (error) {
            console.error("Translation error:", error);
            setNewMessage("Translation failed. Please try again.");
        }
    }
  }

  const handleFormalize = () => {
      setNewMessage(`Regarding our previous discussion, it would be beneficial to consider the following points: ${newMessage}`);
  }

  const handleAddReminder = () => {
    if (selectedMessage) {
        const reminderData = processMessageForReminder(selectedMessage);
        if (reminderData) {
            addReminder({
                text: reminderData.text,
                date: reminderData.date,
                group: contact.isGroup ? contact.groupName : (otherUser ? otherUser.username : null),
            });
        }
    }
    handleMessageMenuClose();
  }

  const handleCloseSummaryModal = () => {
    setShowSummaryModal(false);
    setSummaryText('');
  }

  const displayName = contact.isGroup ? contact.groupName : (otherUser ? otherUser.username : "");
  const displayAvatar = contact.isGroup ? contact.groupAvatar : (otherUser ? otherUser.avatar : "");

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%',weight:'70%' }}>
        <List sx={{borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer'}} onClick={onToggleProfile}>
            <ListItem>
                <ListItemAvatar>
                    <Avatar src={displayAvatar} />
                </ListItemAvatar>
                <ListItemText primary={displayName} />
            </ListItem>
        </List>
      <Box className="custom-scrollbar" sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
        {messages.map((message) => {
            const isSender = message.senderId === currentUser.uid;
            const userBgColor = theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light;
            const otherBgColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200];

            return (
                <Box key={message.id} sx={{ mb: 2, alignSelf: isSender ? 'flex-end' : 'flex-start'}} onClick={(e) => handleMessageMenuClick(e, message)}>
                    <Paper 
                        sx={{ 
                            p: 1.5, 
                            maxWidth: '80%',
                            bgcolor: selectedMessage?.id === message.id ? '#cce5ff' : (isSender ? userBgColor : otherBgColor),
                            color: theme.palette.getContrastText(selectedMessage?.id === message.id ? '#cce5ff' : (isSender ? userBgColor : otherBgColor)),
                            cursor: 'pointer',
                            borderRadius: '12px',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center'}}>
                            <Avatar src={getSenderAvatar(message.senderId)} sx={{ width: 40, height: 40, mr:1.5 }}/>
                            <Box>
                                <Typography variant="body1">{message.text}</Typography>
                                {message.tag && <Chip label={message.tag} size="small" sx={{ mt: 1 }} />}
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            )
        })}
        <div ref={messagesEndRef} />
      </Box>
      <Menu
        anchorEl={messageMenuAnchorEl}
        open={Boolean(messageMenuAnchorEl)}
        onClose={handleMessageMenuClose}
      >
        {selectedMessage && processMessageForReminder(selectedMessage) && (
            <MenuItem onClick={handleAddReminder}>
                <ListItemText>Add to Reminder</ListItemText>
            </MenuItem>
        )}
      </Menu>
       {showEmojiPicker && (
        <Box sx={{position: 'absolute', bottom: '80px', right: '20px', zIndex: 1000}}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </Box>
      )}
      <Box sx={{ p: 2, display: 'flex', alignItems:'center', borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          multiline
          maxRows={3}
        />
        <IconButton onClick={handleFormalize} title="Formalize Text">
            <AutoFixHighIcon />
        </IconButton>
        <TextField
          variant="outlined"
          placeholder="Tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{ mx: 1, width: '100px' }}
        />
        <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={() => { setShowEmojiPicker(p => !p); handleMenuClose(); }}>
                <ListItemIcon><InsertEmoticonIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Emoji</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUploadClick}>
                <ListItemIcon><AttachFileIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Upload File</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleTranslateMenuClick}>
                <ListItemIcon><TranslateIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Translate</ListItemText>
            </MenuItem>
        </Menu>
         <Menu
            anchorEl={translateMenuAnchorEl}
            open={Boolean(translateMenuAnchorEl)}
            onClose={handleTranslateMenuClose}
        >
            {languageOptions.map(lang => (
                <MenuItem key={lang.code} onClick={() => handleTranslate(lang.code)}>
                    {lang.name}
                </MenuItem>
            ))}
        </Menu>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
      <Modal
        open={showSummaryModal}
        onClose={handleCloseSummaryModal}
        aria-labelledby="summary-modal-title"
        aria-describedby="summary-modal-description"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showSummaryModal}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: '8px',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="summary-modal-title" variant="h6" component="h2">
                    Conversation Summary
                </Typography>
                <Typography id="summary-modal-description" sx={{ mt: 2 }}>
                    {summaryText}
                </Typography>
            </Box>
        </Fade>
    </Modal>
    </Box>
  );
};

export default ChatHistory;
