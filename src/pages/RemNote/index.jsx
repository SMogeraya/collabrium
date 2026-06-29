import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, ListItemText, IconButton, Modal, Fade, Backdrop } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useUserStore } from '../../userStore';

const RemNote = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { currentUser, notes, addNote, updateNote, deleteNote, reminders, deleteReminder, updateReminder, fetchNotes, fetchReminders } = useUserStore();
    const [showEditNoteModal, setShowEditNoteModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [showEditReminderModal, setShowEditReminderModal] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [editedDate, setEditedDate] = useState('');

    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const notesUnsubscribe = fetchNotes(currentUser.uid);
            const remindersUnsubscribe = fetchReminders(currentUser.uid);

            return () => {
                notesUnsubscribe();
                remindersUnsubscribe();
            };
        }
    }, [currentUser, fetchNotes, fetchReminders]);

    const handleAddNote = () => {
        if (title.trim() && description.trim()) {
            addNote({ title, description });
            setTitle('');
            setDescription('');
        }
    };

    const handleOpenEditNoteModal = (note) => {
        setSelectedNote(note);
        setEditedTitle(note.title);
        setEditedDescription(note.description);
        setShowEditNoteModal(true);
    };

    const handleCloseEditNoteModal = () => {
        setShowEditNoteModal(false);
        setSelectedNote(null);
        setEditedTitle('');
        setEditedDescription('');
    };

    const handleUpdateNote = () => {
        if (selectedNote && editedTitle.trim() && editedDescription.trim()) {
            updateNote({ 
                ...selectedNote, 
                title: editedTitle, 
                description: editedDescription 
            });
            handleCloseEditNoteModal();
        }
    };

    const handleOpenEditReminderModal = (reminder) => {
        setSelectedReminder(reminder);
        setEditedText(reminder.text);
        setEditedDate(new Date(reminder.date).toISOString().slice(0, 16));
        setShowEditReminderModal(true);
    };

    const handleCloseEditReminderModal = () => {
        setShowEditReminderModal(false);
        setSelectedReminder(null);
        setEditedText('');
        setEditedDate('');
    };

    const handleUpdateReminder = () => {
        if (selectedReminder && editedText.trim()) {
            updateReminder({ 
                ...selectedReminder, 
                text: editedText, 
                date: new Date(editedDate) 
            });
            handleCloseEditReminderModal();
        }
    };

    return (
        <Box sx={{ p: 3, display: 'flex', gap: 3, height: 'calc(100vh - 48px)' }}>
            <Paper elevation={3} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom>
                    Note Keeper
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                        sx={{ mb: 1 }}
                    />
                    <Button variant="contained" onClick={handleAddNote} fullWidth>
                        Add Note
                    </Button>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {notes.map((n) => (
                        <ListItem key={n.id}>
                            <ListItemText primary={n.title} secondary={n.description} />
                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditNoteModal(n)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => deleteNote(n.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Paper elevation={3} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom>
                    Reminders
                </Typography>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {reminders.map((r) => (
                        <ListItem key={r.id}>
                            <ListItemText 
                                primary={r.text} 
                                secondary={`${r.group ? `(${r.group}) ` : ''}${r.date ? new Date(r.date).toLocaleString() : ''}`} 
                            />
                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditReminderModal(r)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => deleteReminder(r.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Edit Note Modal */}
            <Modal
                open={showEditNoteModal}
                onClose={handleCloseEditNoteModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
            >
                <Fade in={showEditNoteModal}>
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
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}>
                        <Typography variant="h6">Edit Note</Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Title"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Description"
                            multiline
                            rows={4}
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                            <Button onClick={handleCloseEditNoteModal}>Cancel</Button>
                            <Button variant="contained" onClick={handleUpdateNote}>Save</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* Edit Reminder Modal */}
            <Modal
                open={showEditReminderModal}
                onClose={handleCloseEditReminderModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
            >
                <Fade in={showEditReminderModal}>
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
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}>
                        <Typography variant="h6">Edit Reminder</Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Reminder Text"
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Reminder Date"
                            type="datetime-local"
                            value={editedDate}
                            onChange={(e) => setEditedDate(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                            <Button onClick={handleCloseEditReminderModal}>Cancel</Button>
                            <Button variant="contained" onClick={handleUpdateReminder}>Save</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default RemNote;
