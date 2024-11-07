import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 4),
  borderRadius: theme.shape.borderRadius * 2,
}));

const ContactInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await emailjs.send(
        process.env.REACT_APP_EJS_SERVICE_ID,
        process.env.REACT_APP_EJS_TEMPLATE_ID,
        formData,
        process.env.REACT_APP_EJS_PUBLIC_KEY
      );
      console.log('SUCCESS!', response.status, response.text);
      setSnackbar({
        open: true,
        message: 'Thank you for your message. We\'ll get back to you soon!',
        severity: 'success',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('FAILED...', error);
      setSnackbar({
        open: true,
        message: 'Oops! Something went wrong. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <MotionContainer
      maxWidth="lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ my: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center" fontWeight="bold" sx={{ mb: 6, fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' } }}>
          Get in Touch
        </Typography>
        <MotionGrid container spacing={4} initial="hidden" animate="visible" variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}>
          <MotionGrid item xs={12} md={6} variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
          }}>
            <StyledPaper elevation={3}>
              <Typography variant="h4" gutterBottom color="primary">
                Send us a message
              </Typography>
              <form onSubmit={handleSubmit}>
                <StyledTextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </StyledButton>
              </form>
            </StyledPaper>
          </MotionGrid>
          <MotionGrid item xs={12} md={6} variants={{
            hidden: { opacity: 0, x: 50 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
          }}>
            <StyledPaper elevation={3}>
              <Typography variant="h4" gutterBottom color="primary">
                Contact Information
              </Typography>
              <Box sx={{ mt: 4 }}>
                <ContactInfoItem>
                  <EmailIcon fontSize="large" />
                  <Typography variant="h6">
                    support@aicvbuilder.com
                  </Typography>
                </ContactInfoItem>
                <ContactInfoItem>
                  <PhoneIcon fontSize="large" />
                  <Typography variant="h6">
                    +1 (555) 123-4567
                  </Typography>
                </ContactInfoItem>
                <ContactInfoItem>
                  <LocationIcon fontSize="large" />
                  <Typography variant="h6">
                    123 AI Street, Tech City, TC 12345
                  </Typography>
                </ContactInfoItem>
              </Box>
              <Typography variant="body1" sx={{ mt: 4 }}>
                Our support team is available Monday through Friday, 9am to 5pm EST.
                We strive to respond to all inquiries within 24 hours.
              </Typography>
            </StyledPaper>
          </MotionGrid>
        </MotionGrid>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
}