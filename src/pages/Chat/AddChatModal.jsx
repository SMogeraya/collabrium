import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, FormControlLabel, Checkbox, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase';

const AddChatModal = ({ open, onClose, onAddChat, currentUser }) => {
    const [isGroup, setIsGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [email, setEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Reset state when group mode is toggled
        if (isGroup && currentUser) {
            setGroupMembers([currentUser]);
        } else {
            setGroupMembers([]);
        }
        setError('');
        setSearchedUser(null);
        setEmail('');
        setGroupName('');
    }, [isGroup, currentUser]);

    const handleSearch = async () => {
        setError('');
        setSearchedUser(null);
        if (!email.trim()) {
            setError('Please enter an email address.');
            return;
        }
        setLoading(true);

        try {
            const q = query(collection(db, "persons"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const user = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                if (groupMembers.find(member => member.uid === user.uid)) {
                    setError('User is already in the group.');
                } else if (user.uid === currentUser.uid) {
                    setError('You cannot add yourself to the group again.');
                } else {
                    setSearchedUser(user);
                }
            } else {
                setError('User not found.');
            }
        } catch (err) {
            console.error("Error searching for user:", err);
            setError('Failed to search for user.');
        }
        setLoading(false);
    };

    const handleAddUser = () => {
        if (searchedUser) {
            if (isGroup) {
                if (!groupMembers.find(member => member.uid === searchedUser.uid)) {
                    setGroupMembers([...groupMembers, searchedUser]);
                }
                setSearchedUser(null);
                setEmail('');
            } else {
                const chatData = {
                    isGroup: false,
                    participants: [currentUser.uid, searchedUser.uid],
                    messages: [],
                    name: searchedUser.username, // Use username
                    avatar: searchedUser.avatar || 'https://via.placeholder.com/150',
                };
                onAddChat(chatData);
                handleClose();
            }
        }
    };

    const handleCreateGroup = () => {
        if (groupMembers.length < 2) {
            setError('A group must have at least two members.');
            return;
        }
        const chatData = {
            isGroup: true,
            name: groupName || groupMembers.map(m => m.username).join(', '), // Use username
            participants: groupMembers.map(member => member.uid),
            members: groupMembers.map(member => ({ 
                uid: member.uid, 
                username: member.username, // Use username
                avatar: member.avatar || 'https://via.placeholder.com/150' 
            })),
            messages: [],
            avatar: 'https://via.placeholder.com/150/0000FF/808080?Text=Group' // Generic group avatar
        };
        onAddChat(chatData);
        handleClose();
    };
    
    const handleClose = () => {
        setIsGroup(false);
        setGroupName('');
        setEmail('');
        setSearchedUser(null);
        setGroupMembers([]);
        setError('');
        setLoading(false);
        onClose();
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 450,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography variant="h6">{isGroup ? 'Create a New Group' : 'Start a New Chat'}</Typography>
                <FormControlLabel
                    control={<Checkbox checked={isGroup} onChange={(e) => setIsGroup(e.target.checked)} />}
                    label="Create a group chat"
                />
                
                {isGroup && (
                    <>
                        <TextField
                            fullWidth
                            label="Group Name (Optional)"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Box>
                            <Typography sx={{fontWeight: 'bold'}}>Group Members:</Typography>
                            <List dense>
                                {groupMembers.map((member) => (
                                    <ListItem key={member.uid} disableGutters>
                                        <ListItemText primary={member.username} secondary={member.uid === currentUser.uid ? '(You)' : ''} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        fullWidth
                        label={isGroup ? "Add member by email" : "Search user by email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <Button onClick={handleSearch} variant="outlined" disabled={loading} sx={{minWidth: '100px'}}>
                        {loading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                </Box>

                {error && <Typography color="error" variant="body2">{error}</Typography>}

                {searchedUser && (
                    <Box sx={{ mt: 1, p: 1.5, border: '1px solid #ddd', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>{searchedUser.username} ({searchedUser.email})</Typography>
                        <Button onClick={handleAddUser} size="small" variant="contained">
                            {isGroup ? 'Add to Group' : 'Add Chat'}
                        </Button>
                    </Box>
                )}

                {isGroup && (
                    <Button onClick={handleCreateGroup} variant="contained" fullWidth sx={{ mt: 'auto' }} disabled={groupMembers.length < 2}>
                        Create Group Chat
                    </Button>
                )}
            </Box>
        </Modal>
    );
};

export default AddChatModal;
