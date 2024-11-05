import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Container, Link, CircularProgress } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link as RouterLink } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // Get previous location if redirected

    // Google Sign-In Handler
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            await initializeUserPlan(user.uid, user.email);

            const redirectPath = location.state?.from?.pathname || '/home'; // Redirect to previous page or home
            navigate(redirectPath);
        } catch (err) {
            setError('Failed to sign in with Google');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Email Link Sign-In Handler with validation
    const handleEmailLinkSignIn = async () => {
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setLoading(true);
        setError(null);

        const actionCodeSettings = {
            url: 'https://ai-resume-opt.web.app/login',
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            alert('Check your inbox for a sign-in link!');
        } catch (err) {
            setError('Failed to send sign-in link to email');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Email link sign-in checker
    useEffect(() => {
        const emailLink = window.location.href;
        if (isSignInWithEmailLink(auth, emailLink)) {
            const savedEmail = window.localStorage.getItem('emailForSignIn');
            if (savedEmail) {
                signInWithEmailLink(auth, savedEmail, emailLink)
                    .then(async (userCredential) => {
                        const user = userCredential.user;
                        window.localStorage.removeItem('emailForSignIn');
                        await initializeUserPlan(user.uid, user.email);

                        const redirectPath = location.state?.from?.pathname || '/home';
                        navigate(redirectPath);
                    })
                    .catch((error) => {
                        setError('Failed to sign in with the link');
                        console.error(error);
                    });
            }
        }
    }, [navigate, location]);

    // Utility function for plan initialization
    const initializeUserPlan = async (uid, email) => {
        try {
            const userDocRef = doc(firestore, 'users', uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email,
                    uid,
                    subscriptionId: 'N/A',
                    plan: 'free',
                    status: 'inactive',
                    usage: { date: new Date().toDateString(), count: 0 },
                });
            }
        } catch (error) {
            console.error('Error initializing user plan: ', error);
        }
    };

    // Email validation function
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                    NexaAI
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 4 }}>
                    Next Gen AI Resume Builder
                </Typography>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'medium' }}>
                    Spark your career
                </Typography>
                <Box sx={{ mt: 1, width: '100%' }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        sx={{ mb: 2, height: '50px' }}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Continue with Google'}
                    </Button>
                    {error && (
                        <Typography color="error" align="center" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Typography align="center" sx={{ mb: 2 }}>
                        OR
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        sx={{ mb: 2 }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, mb: 2, height: '50px' }}
                        onClick={handleEmailLinkSignIn}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Send Sign-In Link'}
                    </Button>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        By continuing, you acknowledge NexaAI's{' '}
                        <Link component={RouterLink} to="/privacy-policy" color="primary" underline="hover">
                            Privacy Policy
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;
