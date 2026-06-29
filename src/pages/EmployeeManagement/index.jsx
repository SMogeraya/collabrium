import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from '../../firebase';
import { Box, Typography, List, ListItem, ListItemText, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useUserStore } from '../../userStore';

const EmployeeManagement = () => {
    const { currentUser } = useUserStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            setLoading(false);
            setError("You do not have permission to access this page.");
            return;
        }

        const usersQuery = collection(db, "persons");
        const unsubscribe = onSnapshot(usersQuery, 
            (snapshot) => {
                const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching users:", err);
                setError("Failed to load user data.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleMakeAdmin = async (userId) => {
        setError('');
        setSuccess('');
        const userDocRef = doc(db, "persons", userId);
        try {
            await updateDoc(userDocRef, { role: 'admin' });
            setSuccess(`Successfully promoted user to admin.`);
        } catch (err) {
            console.error("Error updating user role:", err);
            setError("Failed to update user role.");
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Employee Role Management</Typography>
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <List>
                    {users.map(user => (
                        <ListItem key={user.id} divider secondaryAction={
                            user.role !== 'admin' && (
                                <Button 
                                    variant="contained" 
                                    onClick={() => handleMakeAdmin(user.id)}
                                    disabled={user.id === currentUser.uid} // Can't change your own role
                                >
                                    Make Admin
                                </Button>
                            )
                        }>
                            <ListItemText 
                                primary={user.username || 'Unnamed User'}
                                secondary={`Role: ${user.role || 'Not Assigned'}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default EmployeeManagement;
