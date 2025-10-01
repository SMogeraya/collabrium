import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { auth } from '../../firebase';
import Chat from '../Chat';
import VideoSummarizer from '../VideoSummarizer';
import HrAssistant from '../HrAssistant';
import BulkEmailSender from '../BulkEmailSender';
import DocumentQa from '../DocumentQa';
import Home from '../Home';

const features = [
  { text: 'Chat', icon: <ChatIcon />, component: <Chat /> },
  {
    text: 'Video Summarizer',
    icon: <OndemandVideoIcon />,
    component: <VideoSummarizer />,
  },
  { text: 'AI HR Assistant', icon: <WorkIcon />, component: <HrAssistant /> },
  {
    text: 'Bulk Email Sender',
    icon: <EmailIcon />,
    component: <BulkEmailSender />,
  },
  {
    text: 'AI Document Q&A',
    icon: <FindInPageIcon />,
    component: <DocumentQa />,
  },
];

const Dashboard = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh',width: '100vw'}}>
      <Box
        sx={{
          width: 240,
          bgcolor: 'background.paper',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List sx={{ flexGrow: 1 }}>
          {features.map((feature, index) => (
            <ListItem button key={index} onClick={() => setSelectedFeature(feature)}>
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
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        {selectedFeature ? selectedFeature.component : <Home />}
      </Box>
    </Box>
  );
};

export default Dashboard;
