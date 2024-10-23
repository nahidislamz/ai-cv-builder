import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem ,Link} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { logOut } from "../firebase";  // Import the logOut function
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Import the AuthContext

function Appbar({ user }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Get the current user from Auth context

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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

    return (
        <AppBar position="static" color="default" elevation={0}>
            <Toolbar>
                <Link
                    href="/home"
                    underline="none" // Remove underline
                    sx={{ textAlign: 'left', fontWeight: 'bold', flexGrow: 1, cursor: 'pointer', color: 'inherit' }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'inherit'}}>NexaAi</Typography>
                </Link>

                {currentUser ? (
                    <>
                        <Box sx={{margin:1, display:'flex'}}>
                            <Link 
                                href="/makecv" 
                                underline="none" 
                                sx={{ textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', color: 'inherit'}}
                            >
                                <Typography variant="body1" sx={{ marginLeft:2 }}>BuildCV</Typography>
                            </Link>
                            <Link 
                                href="/makecv" 
                                underline="none" 
                                sx={{ textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', color: 'inherit'}}
                            >
                                <Typography variant="body1" sx={{ marginLeft:2 }}>Templates</Typography>
                            </Link>
                            <Link 
                                href="/makecv" 
                                underline="none" 
                                sx={{ textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', color: 'inherit'}}
                            >
                                <Typography variant="body1" sx={{ marginLeft:2 }}>FAQ</Typography>
                            </Link>
                        </Box>
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
                                        width: '40px', // Adjust size as needed
                                        height: '40px', // Adjust size as needed
                                    }}
                                />
                            ) : (
                                <AccountCircle />
                            )}
                        </IconButton>
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
                                {/* Display the user's email if available */}
                                <MenuItem sx={{ borderRadius: 2, background: '#f8d1bf', fontWeight: 'bold' }}>
                                    {currentUser.email}
                                </MenuItem>
                            </Box>
                            <MenuItem onClick={() => navigate("/upgrade")}>Subscriptions</MenuItem>
                            <MenuItem onClick={() => navigate("/t&c")}>Terms & Conditions</MenuItem>
                            <MenuItem onClick={() => navigate("/privacy-policy")}>Privacy Policy</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Typography variant="body1" onClick={() => navigate("/login")}
                        sx={{
                            cursor: 'pointer',
                            color: "#ff7043",
                            fontWeight: 'bold',
                            border: 1.5,
                            padding: 1,
                            borderRadius: 1,
                            borderColor: "#ff7043",
                            '&:hover': {
                                backgroundColor: '#f0f0f0',  // Set hover background color
                            }
                        }}>
                        Login / SignUp
                    </Typography>
                )}

                {/* User Menu */}

            </Toolbar>
        </AppBar>
    );
}

export default Appbar;
