import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Container, Link } from '@mui/material';
import { signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, firestore } from '../firebase'; // Firestore must be correctly configured
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore methods // Import Firestore methods
import { Link as RouterLink } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Google Sign-In Handler
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        const provider = new GoogleAuthProvider();

        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            // Check if the user exists and their plan
            await checkUserPlan(user.uid, user.email);

            // Redirect to the homepage
            navigate('/home');
        } catch (err) {
            setError('Failed to sign in with Google');
            console.error(err); // Log the error for debugging
        } finally {
            setLoading(false);
        }
    };


    // Check if the user is on a free or pro plan
    const checkUserPlan = async (uid, email) => {
        try {
            const userDocRef = doc(firestore, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: email,
                    uid: uid,
                    subscriptionId: 'N/A',
                    plan: 'free', // Default plan is 'free'
                    status: 'inactive',
                    usage: { date: new Date().toDateString(), count: 0 },
                });

            }
        } catch (error) {
            console.error("Error fetching or creating user plan: ", error);
        }
    };

    // Email/Password Sign-In Handler
    const handleEmailLinkSignIn = async () => {
        setLoading(true);
        setError(null);

        const actionCodeSettings = {
            url: 'https://ai-resume-opt.web.app/login', // Change to your desired URL
            handleCodeInApp: true, // Must be true for email link sign-in
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            // Save the email locally to complete sign-in later
            window.localStorage.setItem('emailForSignIn', email);
            alert(`Check your inbox for a sign-in link!`);
        } catch (err) {
            setError('Failed to send sign-in link to email');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Check for Email Link and Sign-In
    useEffect(() => {
        const emailLink = window.location.href;
        if (isSignInWithEmailLink(auth, emailLink)) {
            const email = window.localStorage.getItem('emailForSignIn');
            if (email) {
                signInWithEmailLink(auth, email, emailLink)
                    .then((userCredential) => {
                        const user = userCredential.user;

                        // Clear the email from local storage
                        window.localStorage.removeItem('emailForSignIn');

                        // Check if the user exists and their plan
                        checkUserPlan(user.uid, user.email);

                        // Successfully signed in, redirect to home
                        navigate('/home');
                    })
                    .catch((error) => {
                        setError('Failed to sign in with the link');
                        console.error(error);
                    });
            }
        }
    }, [navigate]);;

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
                <Box sx={{ mt: 1 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        sx={{ mb: 2, height: '50px' }}
                        onClick={handleGoogleSignIn}
                        disabled={loading} // Disable the button while loading
                    >
                        {loading ? 'Signing in...' : 'Continue with Google'}
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
                        {loading ? 'Sending link...' : 'Send Sign-In Link'}
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
