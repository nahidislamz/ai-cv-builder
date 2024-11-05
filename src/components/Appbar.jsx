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
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { logOut } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

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
        { text: 'BuildCV', link: '/makecv' },
        { text: 'OptimizeCV', link: '/optimize' },
        { text: 'FAQ', link: '/faq' },
        { text: 'Contact', link: '/contact' },
    ];
    const mbMenuItems = [
        { text: 'FAQ', link: '/faq' },
        { text: 'Contact', link: '/contact' },
        { text: 'Terms & Conditions', link: '/t&c' },
        { text: 'Privacy Policy', link: '/privacy-policy' },
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
            <Box sx={{ padding: 1 }}>
                <MenuItem 
                sx={{ borderRadius: 2, background:theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[700], fontWeight: 'bold' }}
                >
                    {currentUser?.email}
                </MenuItem>
            </Box>
            <MenuItem onClick={() => navigate("/upgrade")}>Subscriptions</MenuItem>
            <MenuItem onClick={() => navigate("/t&c")}>Terms & Conditions</MenuItem>
            <MenuItem onClick={() => navigate("/privacy-policy")}>Privacy Policy</MenuItem>
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
                {mbMenuItems.map((item) => (
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
                {currentUser ? (
                    <>
                        <ListItem button onClick={() => navigate("/optimize")}>
                            <ListItemText primary="OptimizeCv" />
                        </ListItem>
                        <ListItem button onClick={() => navigate("/t&c")}>
                            <ListItemText primary="BuildCV" />
                        </ListItem>
                        <ListItem button onClick={() => navigate("/privacy-policy")}>
                            <ListItemText primary="Privacy Policy" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </>
                ) : (
                    <ListItem button onClick={() => navigate("/login")}>
                        <ListItemText primary="Login / SignUp" />
                    </ListItem>
                )}
                <ListItem button onClick={toggleTheme}>
                    <ListItemText primary={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`} />
                </ListItem>
            </List>
        </Drawer>
    );

    return (
        <AppBar position="static" color="default" elevation={0}>
            <Toolbar>
                <Link
                    href="/home"
                    underline="none"
                    sx={{ textAlign: 'left', fontWeight: 'bold', flexGrow: 1, cursor: 'pointer', color: 'inherit' }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'inherit'}}>NexaAi</Typography>
                </Link>

                {!isMobile && currentUser && (
                    <Box sx={{margin:1, display:'flex'}}>
                        {menuItems.map((item) => (
                            <Link 
                                key={item.text}
                                href={item.link} 
                                underline="none" 
                                sx={{ textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', color: 'inherit'}}
                            >
                                <Typography variant="body1" sx={{ marginLeft:2 }}>{item.text}</Typography>
                            </Link>
                        ))}
                    </Box>
                )}

                <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

                {currentUser ? (
                    <>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenuOpen}
                            color="inherit"
                        >
                            {currentUser.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="Profile"
                                    style={{
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                    }}
                                />
                            ) : (
                                <AccountCircle />
                            )}
                        </IconButton>
                        {renderMenu}
                    </>
                ) : (
                    !isMobile && (
                        <Typography 
                            variant="body1" 
                            onClick={() => navigate("/login")}
                            sx={{
                                cursor: 'pointer',
                                color: "#ff7043",
                                fontWeight: 'bold',
                                border: 1.5,
                                padding: 1,
                                borderRadius: 1,
                                borderColor: "#ff7043",
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                }
                            }}
                        >
                            Login / SignUp
                        </Typography>
                    )
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
            </Toolbar>
            {renderMobileMenu}
        </AppBar>
    );
}

export default Appbar;