import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Link,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Button,
  Avatar,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { logOut } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? '#292929'
    : '#ffffff',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const LogoLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const NavLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  marginLeft: theme.spacing(3),
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 'bold',
}));

const MotionIconButton = motion(IconButton);

function Appbar({ toggleTheme, mode }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout Error: ", error);
    }
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Build CV', link: '/makecv' },
    { text: 'Optimize CV', link: '/optimize' },
    { text: 'FAQ', link: '/faq' },
    { text: 'Contact', link: '/contact' },
  ];

  const mobileMenuItems = [
    ...menuItems,
    { text: 'Privacy Policy', link: '/privacy-policy' },
    { text: 'Terms & Conditions', link: '/t&c' },
  ];

  const renderMenu = (
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem sx={{ opacity: 0.7 }}>{currentUser?.email}</MenuItem>
      <MenuItem onClick={() => { navigate("/upgrade"); handleMenuClose(); }}>Subscriptions</MenuItem>
      <MenuItem onClick={() => { navigate("/t&c"); handleMenuClose(); }}>Terms & Conditions</MenuItem>
      <MenuItem onClick={() => { navigate("/privacy-policy"); handleMenuClose(); }}>Privacy Policy</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
    >
      <List>
        {mobileMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.link);
              handleMobileMenuToggle();
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {currentUser && (
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LogoLink href="/home" component={motion.a} whileHover={{ scale: 1.05 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            NexaAI
          </Typography>
        </LogoLink>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {currentUser && menuItems.map((item) => (
              <NavLink 
                key={item.text}
                href={item.link} 
                component={motion.a}
                whileHover={{ scale: 1.05 }}
              >
                {item.text}
              </NavLink>
            ))}
            <MotionIconButton 
              sx={{ ml: 2 }} 
              onClick={toggleTheme} 
              color="inherit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </MotionIconButton>
            {currentUser ? (
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="large"
                  sx={{ ml: 2 }}
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  {currentUser.photoURL ? (
                    <Avatar src={currentUser.photoURL} alt="Profile" />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>
            ) : (
              <LoginButton
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
              >
                Login / Sign Up
              </LoginButton>
            )}
          </Box>
        )}

        {isMobile && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuToggle}
          >
            <MenuIcon />
          </IconButton>
        )}
      </StyledToolbar>
      {renderMenu}
      {renderMobileMenu}
    </StyledAppBar>
  );
}

export default Appbar;