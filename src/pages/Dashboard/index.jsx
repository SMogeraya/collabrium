import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { auth } from '../../firebase';
import { useUserStore } from '../../userStore';
import Chat from '../Chat';
import VideoSummarizer from '../VideoSummarizer';
import HrAssistant from '../HrAssistant';
import BulkEmailSender from '../BulkEmailSender';
import DocumentQa from '../DocumentQa';
import Home from '../Home';
import RemNote from '../RemNote';
import KnowledgeCanvas from '../KnowledgeCanvas';
import EmployeeManagement from '../EmployeeManagement';

const allFeatures = [
  { text: 'Chat', icon: <ChatIcon />, component: <Chat />, path: '/chat' },
  {
    text: 'Video Summarizer',
    icon: <OndemandVideoIcon />,
    component: <VideoSummarizer />,
    path: '/video-summarizer',
  },
  { text: 'AI HR Assistant', icon: <WorkIcon />, component: <HrAssistant />, path: '/hr-assistant' },
  {
    text: 'Bulk Email Sender',
    icon: <EmailIcon />,
    component: <BulkEmailSender />,
    path: '/bulk-email-sender',
  },
  {
    text: 'AI Document Q&A',
    icon: <FindInPageIcon />,
    component: <DocumentQa />,
    path: '/document-qa',
  },
  {
    text: 'Rem-Note',
    icon: <FindInPageIcon />,
    component: <RemNote />,
    path: '/rem-note',
  },
  {
    text: 'Knowledge Canvas',
    icon: <BubbleChartIcon />,
    component: <KnowledgeCanvas />,
    path: '/knowledge-canvas',
  },
  {
    text: 'Employee Management',
    icon: <AdminPanelSettingsIcon />,
    component: <EmployeeManagement />,
    path: '/employees',
    role: 'admin'
  },
];

const Dashboard = () => {
  const { currentUser } = useUserStore();
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const features = allFeatures.filter(feature => {
        if (!feature.role) return true; // Public feature
        return feature.role === currentUser?.role;
    });
    setVisibleFeatures(features);

    const currentPath = window.location.pathname;
    const featureFromUrl = features.find(f => f.path === currentPath);
    
    if (featureFromUrl) {
      setSelectedFeature(featureFromUrl);
    } else if (currentPath.startsWith('/knowledge-canvas')) {
        const canvasFeature = features.find(f => f.path === '/knowledge-canvas');
        setSelectedFeature(canvasFeature);
    } else {
        setSelectedFeature(null); // Fallback to Home
    }
  }, [currentUser]);

  const handleLogout = () => {
    auth.signOut();
    window.location.href = '/';
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    window.history.pushState(null, feature.text, feature.path);
  };
  
  const handleGoHome = () => {
      setSelectedFeature(null);
      window.history.pushState(null, 'Home', '/');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <Box
        sx={{
          width: 240,
          bgcolor: 'background.paper',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{p: 2, textAlign: 'center'}}>
            <Typography variant="h6" onClick={handleGoHome} sx={{cursor: 'pointer'}}>Collabrium</Typography>
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {visibleFeatures.map((feature, index) => (
            <ListItem button key={index} onClick={() => handleFeatureSelect(feature)} selected={selectedFeature?.path === feature.path}>
              <ListItemIcon>{feature.icon}</ListItemIcon>
              <ListItemText primary={feature.text} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Button variant="contained" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {selectedFeature ? selectedFeature.component : <Home />}
      </Box>
    </Box>
  );
};

export default Dashboard;
