import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  Avatar,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Home as HomeIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  Help as HelpIcon,
  Subscriptions as SubscriptionsIcon,
  Gavel as GavelIcon,
  PrivacyTip as PrivacyTipIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UserBadge from './UserBadge'; // Assuming you have this component

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: theme.spacing(0.5, 0),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[900] 
    : theme.palette.grey[100],
}));

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, link: '/' },
  { text: 'Build CV', icon: <DescriptionIcon />, link: '/makecv' },
  { text: 'Optimize CV', icon: <BuildIcon />, link: '/optimize' },
  { text: 'FAQ', icon: <HelpIcon />, link: '/faq' },
];

const MobileDrawer = ({ open, onClose, currentUser, isPremiumUser, handleLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigation = (link) => {
    navigate(link);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DrawerHeader>
        <Button onClick={onClose} sx={{ color: theme.palette.text.primary }}>
          <CloseIcon />
        </Button>
      </DrawerHeader>
      <Divider />
      <Box sx={{ overflow: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {currentUser ? (
          <UserInfo>
            <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: theme.palette.primary.main }}>
              {currentUser.email[0].toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {currentUser.email}
            </Typography>
            <UserBadge isPremiumUser={isPremiumUser} />
          </UserInfo>
        ) : (
          <UserInfo>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Welcome, Guest
            </Typography>
          </UserInfo>
        )}
        <Divider />
        <List>
          {menuItems.map((item) => (
            <StyledListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.link)}
            >
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <List>
          {currentUser ? (
            <>
              <StyledListItem button onClick={() => handleNavigation('/upgrade')}>
                <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                  <SubscriptionsIcon />
                </ListItemIcon>
                <ListItemText primary="Subscriptions" />
              </StyledListItem>
              <StyledListItem button onClick={() => handleNavigation('/t&c')}>
                <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                  <GavelIcon />
                </ListItemIcon>
                <ListItemText primary="Terms & Conditions" />
              </StyledListItem>
              <StyledListItem button onClick={() => handleNavigation('/privacy')}>
                <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                  <PrivacyTipIcon />
                </ListItemIcon>
                <ListItemText primary="Privacy Policy" />
              </StyledListItem>
              <StyledListItem button onClick={handleLogout}>
                <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </StyledListItem>
            </>
          ) : (
            <StyledListItem button onClick={() => handleNavigation('/login')}>
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </StyledListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;