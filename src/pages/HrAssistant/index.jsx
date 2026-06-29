import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, List, ListItem, ListItemText, IconButton, Paper, Card, CardContent, Divider, Slide, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import './styles.css';
import FAQ from './FAQ';
import { useUserStore } from '../../userStore';
// import axios from 'axios'; // Restoring axios for the handleAsk function

// Panel for Adding a new Policy
const AddPolicyPanel = ({ handleAddPolicy, handleFileChange, policyFile, policyTitle, setPolicyTitle, policyContent, setPolicyContent, error, loading }) => (
    <Card sx={{ height: '100%', display:'flex', flexDirection:'column', borderRadius: '16px' }}>
        <CardContent sx={{flexGrow: 1, overflowY: 'auto'}}>
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: '600', color: '#000000ff' }}>
                Add a New HR Policy
            </Typography>
            <TextField margin="dense" fullWidth id="policyTitle" label="Policy Title" name="policyTitle" autoFocus value={policyTitle} onChange={(e) => setPolicyTitle(e.target.value)} />
            <TextField margin="dense" fullWidth name="policyContent" label="Policy Content" id="policyContent" multiline rows={4} value={policyContent} onChange={(e) => setPolicyContent(e.target.value)} />
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Button variant="outlined" component="label" fullWidth style={{color:'black',border:'2px solid grey'}}>
                Upload Policy File
                <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {policyFile && <Typography variant="body2" sx={{ mt: 1 }}>Selected file: {policyFile.name}</Typography>}
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            <Button type="submit" fullWidth variant="contained" className="analyze-button" sx={{ mt: 3 }} onClick={handleAddPolicy} disabled={loading || !((policyTitle && policyContent) || policyFile)}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Policy'}
            </Button>
        </CardContent>
    </Card>
);

// Panel for Listing Uploaded Documents
const DocumentsPanel = ({ documents, loading, handleDelete, error }) => (
    <Card sx={{ height: '100%', display:'flex', flexDirection:'column', borderRadius: '16px' }}>
        <CardContent sx={{flexGrow: 1, overflowY: 'auto'}}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: '600' }}>Uploaded Documents</Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <List dense>
                    {documents.length > 0 ? documents.map((doc, index) => (
                        <ListItem
                            key={doc.doc_id || index} // Using doc_id or index as a fallback key
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(doc.doc_id)} className="delete-icon">
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={doc.doc_name} />
                        </ListItem>
                    )) : (
                        <Typography variant="body2" color="text.secondary">No documents uploaded yet.</Typography>
                    )}
                </List>
            )}
        </CardContent>
    </Card>
);

const HrAssistant = () => {
    const { currentUser } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [policyTitle, setPolicyTitle] = useState('');
    const [policyContent, setPolicyContent] = useState('');
    const [policyFile, setPolicyFile] = useState(null);
    const [error, setError] = useState("");
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [answer, setAnswer] = useState('');
    const [question, setQuestion] = useState('');
    const [activePanel, setActivePanel] = useState(currentUser?.role === 'admin' ? 'list' : null);

    const togglePanel = (panel) => {
        setActivePanel(prev => (prev === panel ? null : panel));
    };

    const fetchRecords = async () => {
        if (currentUser?.role !== 'admin') return;
        setRecordsLoading(true);
        try {
            const resp = await fetch('http://localhost:8000/get_records', { method: "POST" });
            if (!resp.ok) throw new Error(`Server error (${resp.status})`);
            const data = await resp.json();
            setUploadedDocuments(data.records.data || []); // Adjusted to match the new data structure
        } catch (err) {
            console.error("Error fetching records:", err);
            setError("Failed to fetch documents.");
        } finally {
            setRecordsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [currentUser]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.size > 5 * 1024 * 1024) {
            setError("File size must be under 5MB.");
            return;
        }
        setPolicyFile(selected || null);
    };

    const handleAddPolicy = async (e) => {
        e.preventDefault();
        setError("");
        if (!policyFile && !(policyTitle && policyContent)) {
            setError("Please fill out the form or upload a file.");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            if (policyFile) {
                formData.append("file", policyFile);
                formData.append("policyname", policyFile.name);
            } else if (policyTitle && policyContent) {
                const policyBlob = new Blob([policyContent], { type: 'text/plain' });
                const policyName = policyTitle.includes('.') ? policyTitle : `${policyTitle}.txt`;
                formData.append("file", policyBlob, policyName);
                formData.append("policyname", policyName);
            }
            
            const resp = await fetch('http://localhost:8000/upload', {
                method: "POST",
                body: formData,
            });
            if (!resp.ok) throw new Error(`Server error (${await resp.text()})`);
            
            setPolicyFile(null);
            setPolicyTitle('');
            setPolicyContent('');
            fetchRecords(); // Refresh the list after adding
            setActivePanel('list'); // Switch to list view on success
        } catch (err) {
            console.error("Policy submission error:", err);
            setError(String(err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const handleAsk = async () => {
        if (!question.trim()) return;
        setLoading(true);
        setAnswer('');
        setError('');
        try {
            const resp = await fetch('http://localhost:8000/ask', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: question }),
            });
            if (!resp.ok) throw new Error(`Server error (${await resp.text()})`);
            const data = await resp.json();
            setAnswer(data.answer);
        } catch (err) {
            console.error('Ask error:', err);
            setError('Failed to get an answer. ' + String(err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecord = (recordId) => {
        // This is a placeholder. Backend implementation is needed for permanent deletion.
        setUploadedDocuments(prevDocs => prevDocs.filter(doc => doc.doc_id !== recordId));
        console.log(`Frontend delete for record ID: ${recordId}. Implement backend deletion.`);
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2 }}>
            <Box sx={{ flexGrow: 1, transition: 'all 0.3s ease-in-out', p: 1, overflowY:'auto' }}>
                <Paper elevation={0} className="container" sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography variant="h4" className="title">AI HR Assistant</Typography>
                    <Box sx={{ mt: 4 }}>
                        <TextField fullWidth multiline rows={3} variant="outlined" placeholder="Ask all your queries here..." value={question} onChange={(e) => setQuestion(e.target.value)} className="text-field" onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()} />
                        <Button fullWidth className="analyze-button" variant="contained" onClick={handleAsk} disabled={loading} sx={{ mt: 2, py: 1.5 }} endIcon={<SendIcon />}>
                            {loading && !answer ? <CircularProgress size={24} color="inherit" /> : 'Ask'}
                        </Button>
                    </Box>
                    {loading && !answer && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
                    {answer && (
                        <Box className="analysis-container">
                            <Typography variant="h6">Answer:</Typography>
                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{answer}</Typography>
                        </Box>
                    )}
                    <FAQ />
                </Paper>
            </Box>

            <Slide direction="left" in={activePanel !== null} mountOnEnter unmountOnExit>
                <Box sx={{ width: '400px', minWidth: '350px', height: '100%', p:1 }}>
                    {activePanel === 'add' && 
                        <AddPolicyPanel handleAddPolicy={handleAddPolicy} handleFileChange={handleFileChange} policyFile={policyFile} policyTitle={policyTitle} setPolicyTitle={setPolicyTitle} policyContent={policyContent} setPolicyContent={setPolicyContent} error={error} loading={loading} />
                    }
                    {activePanel === 'list' && 
                        <DocumentsPanel documents={uploadedDocuments} loading={recordsLoading} handleDelete={handleDeleteRecord} error={error} />
                    }
                </Box>
            </Slide>

            {currentUser?.role === 'admin' && (
                <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1, my:1, borderRadius: '16px', height:'fit-content' }}>
                    <Tooltip title={activePanel === 'add' ? "Close Panel" : "Add New Policy"} placement="left">
                        <IconButton onClick={() => togglePanel('add')} color={activePanel === 'add' ? "primary" : "default"}>
                           {activePanel === 'add' ? <CloseIcon /> : <AddIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={activePanel === 'list' ? "Close Panel" : "View Documents"} placement="left">
                        <IconButton onClick={() => togglePanel('list')} color={activePanel === 'list' ? "primary" : "default"}>
                            {activePanel === 'list' ? <CloseIcon /> : <ListAltIcon />}
                        </IconButton>
                    </Tooltip>
                </Paper>
            )}
        </Box>
    );
};

export default HrAssistant;
