import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Link,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
} from 'firebase/auth';
import { auth, firestore } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GradientTypography } from '../components/utils/shareComponent';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(3),
}));

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: '50px',
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  width: '100%',
}));

const MotionBox = motion(Box);

function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await initializeUserPlan(user.uid, user.email);

      const redirectPath = location.state?.from?.pathname || '/home';
      navigate(redirectPath);
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Send the email using your custom API
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Save the email for verification
      window.localStorage.setItem('emailForSignIn', email);
      setSuccessMessage('Check your inbox for a sign-in link!');
    } catch (err) {
      setError('Failed to send sign-in link. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

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
            setError('Failed to sign in with the link. Please try again.');
            console.error(error);
          });
      }
    }
  }, [navigate, location]);

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

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  return (
    <StyledContainer>
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledBox>
          <GradientTypography component="h1" variant="h3" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
            CV Optimizer
          </GradientTypography>
          <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
            Next Gen AI Resume Builder
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 'medium' }}>
            Spark your career
          </Typography>
          <StyledButton
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue with Google'}
          </StyledButton>
          <StyledDivider>OR</StyledDivider>
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
          <StyledButton
            fullWidth
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleEmailLinkSignIn}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Sign-In Link'}
          </StyledButton>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            By continuing, you acknowledge NexaAI's{' '}
            <Link component={RouterLink} to="/privacy-policy" color="primary" underline="hover">
              Privacy Policy
            </Link>
          </Typography>
        </StyledBox>
      </MotionBox>
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccessMessage('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccessMessage('');
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
}

export default LoginPage;