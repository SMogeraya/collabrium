import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Typography, IconButton, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, Alert, Divider, Popover } from '@mui/material';
import { collection, addDoc, onSnapshot, query, where, doc, getDoc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { useUserStore } from '../../userStore';
import ShareIcon from '@mui/icons-material/Share';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';

const throttle = (func, limit) => {
  let inThrottle;
  return function() {functionalit
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};


const CanvasListItem = ({ canvas, onSelectCanvas, onShowHistory, onOpenRename, isOwner }) => (
    <ListItem 
        key={canvas.id} 
        secondaryAction={
            <Box>
                {isOwner && (
                    <IconButton edge="end" aria-label="edit" onClick={() => onOpenRename(canvas)} sx={{mr: 1}}>
                        <EditIcon />
                    </IconButton>
                )}
                <IconButton edge="end" aria-label="history" onClick={(e) => onShowHistory(e, canvas.changeHistory)}>
                    <HistoryIcon />
                </IconButton>
            </Box>
        }
        disablePadding
    >
        <ListItemButton onClick={() => onSelectCanvas(canvas.id)} sx={{ borderRadius: '8px', '&:hover': { backgroundColor: 'action.hover' } }}>
           <ListItemText 
                primary={canvas.name || 'Untitled Canvas'} 
                secondary={
                    canvas.changeHistory && canvas.changeHistory.length > 0
                    ? `Last modified by ${canvas.changeHistory[0].modifiedBy} on ${canvas.changeHistory[0].modifiedAt?.toDate().toLocaleString()}`
                    : `Created on ${canvas.createdAt?.toDate().toLocaleDateString()}`
                }
            />
        </ListItemButton>
    </ListItem>
);


const KnowledgeCanvas = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const canvasId = searchParams.get('canvasId');

  const { currentUser } = useUserStore();
  const appRef = useRef();
  const lastSentSnapshot = useRef();
  const linkInputRef = useRef(null);

  const [userCanvases, setUserCanvases] = useState([]);
  const [sharedCanvases, setSharedCanvases] = useState([]);
  const [lobbyLoading, setLobbyLoading] = useState(true);
  const [canvasLoading, setCanvasLoading] = useState(true);
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareableContacts, setShareableContacts] = useState([]);
  const [shareableGroups, setShareableGroups] = useState([]);
  const [shareSuccess, setShareSuccess] = useState(null);
  const [historyAnchorEl, setHistoryAnchorEl] = useState(null);
  const [selectedCanvasHistory, setSelectedCanvasHistory] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [canvasToRename, setCanvasToRename] = useState(null);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [changeDescription, setChangeDescription] = useState('');

  const cleanShareableLink = `${window.location.origin}/knowledge-canvas?canvasId=${canvasId}`;

  const handleShowHistory = (event, history) => {
    setHistoryAnchorEl(event.currentTarget);
    setSelectedCanvasHistory(history || []);
  };

  const handleCloseHistory = () => {
    setHistoryAnchorEl(null);
  };

  const isHistoryOpen = Boolean(historyAnchorEl);

  const fetchSharingData = useCallback(async () => {
    if (!currentUser?.uid) return;

    const contactsQuery = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
    const contactsSnapshot = await getDocs(contactsQuery);

    const groups = [];
    const individualContacts = [];

    contactsSnapshot.forEach(doc => {
        const contact = { id: doc.id, ...doc.data() };
        if (contact.isGroup) {
            groups.push(contact);
        } else {
            individualContacts.push(contact);
        }
    });

    setShareableGroups(groups);
    setShareableContacts(individualContacts);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (isShareModalOpen) {
      fetchSharingData();
    }
  }, [isShareModalOpen, fetchSharingData]);

  useEffect(() => {
    if (!currentUser?.uid || canvasId) {
      setLobbyLoading(false);
      return;
    };

    const myCanvasesQuery = query(collection(db, "canvases"), where("ownerId", "==", currentUser.uid));
    const myCanvasesUnsubscribe = onSnapshot(myCanvasesQuery, (snapshot) => {
      setUserCanvases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLobbyLoading(false);
    });

    const sharedCanvasesQuery = query(collection(db, "canvases"), where("sharedWith", "array-contains", currentUser.uid));
    const sharedCanvasesUnsubscribe = onSnapshot(sharedCanvasesQuery, (snapshot) => {
        setSharedCanvases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
        myCanvasesUnsubscribe();
        sharedCanvasesUnsubscribe();
    };
  }, [currentUser?.uid, canvasId]);

  useEffect(() => {
    if (!canvasId) {
      setCanvasLoading(false);
      return;
    }
    const canvasDocRef = doc(db, "canvases", canvasId);
    getDoc(canvasDocRef).then(docSnap => {
      if (docSnap.exists() && docSnap.data().snapshot) {
        setInitialSnapshot(docSnap.data().snapshot);
      }
      setCanvasLoading(false);
    });

    const unsubscribe = onSnapshot(canvasDocRef, (doc) => {
      if (doc.exists()) {
        const remoteSnapshot = doc.data().snapshot;
        if (appRef.current && remoteSnapshot && JSON.stringify(remoteSnapshot) !== JSON.stringify(lastSentSnapshot.current)) {
          appRef.current.loadSnapshot(remoteSnapshot);
        }
      }
    });
    return () => unsubscribe();
  }, [canvasId]);

  const handleInitiateNewCanvas = () => {
    setCanvasToRename({ isNew: true }); // Use a flag to signify creation
    setNewCanvasName('Untitled Canvas');
    setIsRenameModalOpen(true);
};

  const handleSelectCanvas = (id) => {
    window.location.href = `/knowledge-canvas?canvasId=${id}`;
  };
  
  const handleReturnToLobby = () => {
      window.location.href = '/knowledge-canvas';
  }

  const handleSelectLinkToCopy = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const updateCanvasWithHistory = async (canvasId, snapshot, user, description = 'Auto-saved') => {
    const canvasDocRef = doc(db, "canvases", canvasId);
    const docSnap = await getDoc(canvasDocRef);

    if (docSnap.exists()) {
        let existingHistory = docSnap.data().changeHistory || [];
        const lastEntry = existingHistory[0];
        const now = new Date();

        if (lastEntry && lastEntry.modifiedBy === user.username && description === 'Auto-saved' && (now - lastEntry.modifiedAt.toDate()) < 60000) {
            lastEntry.modifiedAt = now; // Just update timestamp for recent auto-save
            await updateDoc(canvasDocRef, { changeHistory: existingHistory, snapshot });
        } else {
            const newHistoryEntry = { modifiedBy: user.username, modifiedAt: now, description: description };
            existingHistory.unshift(newHistoryEntry);
            const updatedHistory = existingHistory.slice(0, 20);
            await updateDoc(canvasDocRef, { snapshot, changeHistory: updatedHistory });
        }
    }
  };

  const handleOpenSaveDialog = () => {
      setIsSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!appRef.current || !currentUser?.username) return;
    const snapshot = appRef.current.getSnapshot();
    lastSentSnapshot.current = snapshot;
    updateCanvasWithHistory(canvasId, snapshot, currentUser, changeDescription || 'Manual Save').then(() => {
      setSaveSuccess(true);
      setIsSaveModalOpen(false);
      setChangeDescription('');
      setTimeout(() => setSaveSuccess(false), 2000);
    });
  };

  const handleMount = (app) => {
    appRef.current = app;
    if(canvasId && currentUser?.username){
        const saveToFirestore = throttle(() => {
            if (!appRef.current) return;
            const snapshot = appRef.current.getSnapshot();
            lastSentSnapshot.current = snapshot;
            updateCanvasWithHistory(canvasId, snapshot, currentUser, 'Auto-saved');
        }, 1500);
        app.store.listen(saveToFirestore);
    }
  };
  
  const handleShareWithContact = async (contactData) => {
    if (!contactData?.uid) return;
    const canvasDocRef = doc(db, "canvases", canvasId);
    await updateDoc(canvasDocRef, { sharedWith: arrayUnion(contactData.uid) });
    setShareSuccess(`Shared with ${contactData.name}!`);
    setTimeout(() => setShareSuccess(null), 3000);
}

  const handleShareWithGroup = async (group) => {
      const canvasDocRef = doc(db, "canvases", canvasId);
      const membersToShare = group.participants || [];
      await updateDoc(canvasDocRef, { sharedWith: arrayUnion(...membersToShare) });
      setShareSuccess(`Shared with group: ${group.name}!`);
      setTimeout(() => setShareSuccess(null), 3000);
  }

  const handleOpenRenameModal = (canvas) => {
      setCanvasToRename(canvas);
      setNewCanvasName(canvas.name);
      setIsRenameModalOpen(true);
  }

  const handleCloseRenameModal = () => {
      setIsRenameModalOpen(false);
      setCanvasToRename(null);
      setNewCanvasName('');
  }

  const handleConfirmRename = async () => {
    if (!newCanvasName.trim() || !currentUser) return;

    if (canvasToRename?.isNew) {
        // Create new canvas
        const newCanvasDoc = await addDoc(collection(db, "canvases"), {
            ownerId: currentUser.uid,
            name: newCanvasName.trim(),
            createdAt: new Date(),
            snapshot: null,
            sharedWith: [],
            changeHistory: [],
        });
        window.location.href = `/knowledge-canvas?canvasId=${newCanvasDoc.id}`;
    } else if (canvasToRename) {
        // Rename existing canvas
        const canvasDocRef = doc(db, "canvases", canvasToRename.id);
        await updateDoc(canvasDocRef, { name: newCanvasName.trim() });
    }
    handleCloseRenameModal();
  }

  if (canvasId) {
    if (canvasLoading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }
    return (
      <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
        <Tldraw onMount={handleMount} snapshot={initialSnapshot} />
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleReturnToLobby} sx={{backgroundColor: 'white', '&:hover': { backgroundColor: '#e0e0e0' } }}>Lobby</Button>
          <Button variant="contained" onClick={handleOpenSaveDialog} disabled={saveSuccess} startIcon={<SaveIcon />}>{saveSuccess ? 'Saved!' : 'Save'}</Button>
          <IconButton onClick={() => setIsShareModalOpen(true)} title="Share Canvas" color="primary" sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#e0e0e0' } }}><ShareIcon /></IconButton>
        </Box>
        {/* Share Dialog */}
        <Dialog open={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} fullWidth maxWidth="sm">
           {/* ... share dialog content remains the same ... */}
        </Dialog>
        {/* Save Dialog */}
        <Dialog open={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>Save Changes</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" id="description" label="Describe your changes... (optional)" type="text" fullWidth variant="standard" value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={!!shareSuccess} autoHideDuration={3000} onClose={() => setShareSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={() => setShareSuccess(null)} severity="success" sx={{ width: '100%' }}>{shareSuccess}</Alert></Snackbar>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Canvas Lobby</Typography>
        <Button variant="contained" onClick={handleInitiateNewCanvas} sx={{ my: 2 }}>+ Create New Canvas</Button>
        {lobbyLoading ? <CircularProgress /> : (
            <>
                <Typography variant="h5" sx={{mt: 4, mb: 2}}>My Canvases</Typography>
                <List>
                    {userCanvases.length > 0 ? userCanvases.map((canvas) => (
                        <CanvasListItem key={canvas.id} canvas={canvas} onSelectCanvas={handleSelectCanvas} onShowHistory={handleShowHistory} onOpenRename={handleOpenRenameModal} isOwner={true} />
                    )) : <Typography sx={{ mt: 2, color: 'text.secondary' }}>You haven't created any canvases yet.</Typography>}
                </List>
                <Divider sx={{my: 4}}/>
                <Typography variant="h5" sx={{mt: 4, mb: 2}}>Shared With Me</Typography>
                <List>
                    {sharedCanvases.length > 0 ? sharedCanvases.map((canvas) => (
                        <CanvasListItem key={canvas.id} canvas={canvas} onSelectCanvas={handleSelectCanvas} onShowHistory={handleShowHistory} onOpenRename={handleOpenRenameModal} isOwner={canvas.ownerId === currentUser.uid} />
                    )) : <Typography sx={{ mt: 2, color: 'text.secondary' }}>No canvases have been shared with you yet.</Typography>}
                </List>
            </>
        )}
      </Paper>
      {/* History Popover */}
      <Popover
        open={isHistoryOpen}
        anchorEl={historyAnchorEl}
        onClose={handleCloseHistory}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 350 }}>
            <Typography variant="h6" sx={{mb: 1}}>Change History</Typography>
            {selectedCanvasHistory.length > 0 ? (
                <List dense>
                    {selectedCanvasHistory.map((entry, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={entry.description || 'No description'}
                                secondary={`by ${entry.modifiedBy} on ${entry.modifiedAt?.toDate().toLocaleString()}`}
                                primaryTypographyProps={{fontWeight: '500'}}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body2" color="text.secondary">No modification history found.</Typography>
            )}
        </Box>
      </Popover>
      {/* Create/Rename Dialog */}
      <Dialog open={isRenameModalOpen} onClose={handleCloseRenameModal} fullWidth maxWidth="xs">
            <DialogTitle>{canvasToRename?.isNew ? 'Create New Canvas' : 'Rename Canvas'}</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" id="name" label="Canvas Name" type="text" fullWidth variant="standard" value={newCanvasName} onChange={(e) => setNewCanvasName(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseRenameModal}>Cancel</Button>
                <Button onClick={handleConfirmRename} variant="contained">{canvasToRename?.isNew ? 'Create' : 'Save'}</Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
};

export default KnowledgeCanvas;
