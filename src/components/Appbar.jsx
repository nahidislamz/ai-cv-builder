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
  Divider,
  ListItemIcon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import GavelIcon from '@mui/icons-material/Gavel';
import { logOut } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext'
import { motion } from 'framer-motion';
import UserBadge from './UserBadge';
import { GradientTypography } from './utils/shareComponent';
import MobileDrawer from './MobileDrawer';
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
  const { isPremiumUser } = useUser()
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
      <Box sx={{ paddingLeft: 1.5 }}>
        {<UserBadge isPremiumUser={isPremiumUser} />}
      </Box>
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
      sx={{ zIndex: 2000 }}
    >
      <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
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
        </List>

        <Divider />
        <List>
          {currentUser ? (
            <>
              <ListItem>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <UserBadge isPremiumUser={isPremiumUser} />
                </Box>
              </ListItem>
              <ListItem>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ width: '100%' }}>
                  {currentUser.email}
                </Typography>
              </ListItem>
              <ListItem button onClick={() => { navigate("/upgrade"); handleMobileMenuToggle(); }}>
                <ListItemIcon>
                  <SubscriptionsIcon />
                </ListItemIcon>
                <ListItemText primary="Subscriptions" />
              </ListItem>
              <ListItem button onClick={() => { navigate("/t&c"); handleMobileMenuToggle(); }}>
                <ListItemIcon>
                  <GavelIcon />
                </ListItemIcon>
                <ListItemText primary="Terms & Conditions" />
              </ListItem>
              <ListItem button onClick={() => { navigate("/privacy-policy"); handleMobileMenuToggle(); }}>
                <ListItemIcon>
                  <PrivacyTipIcon />
                </ListItemIcon>
                <ListItemText primary="Privacy Policy" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ):
          (
            <List>
              <ListItem button onClick={()=>{navigate('/login')}}>
                Login
              </ListItem>
          </List>
          )
          }
        </List>
      </Box>
    </Drawer>
  );

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LogoLink href="/home" component={motion.a} whileHover={{ scale: 1.05 }}>
        <GradientTypography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            fontFamily: '"Meddon", cursive', // Apply the Meddon font
          }}
        >
          cvo
        </GradientTypography>

        </LogoLink>

        {!isMobile && (<>
          <Box sx={{ display: 'flex', alignItems: 'center', ml:'auto'}}>
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

          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            {currentUser ? (
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
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
        </>
        )}
        <Box>
          <MotionIconButton
            sx={{ ml: 2 }}
            onClick={toggleTheme}
            color="inherit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </MotionIconButton>

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
        </Box>
      </StyledToolbar>
      {renderMenu}
      <MobileDrawer open={mobileMenuOpen} onClose={handleMobileMenuToggle} currentUser={currentUser} isPremiumUser={isPremiumUser} handleLogout={handleLogout} />
    </StyledAppBar>
  );
}

export default Appbar;