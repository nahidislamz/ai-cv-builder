import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff7043', // You can adjust this to your preferred primary color
    },
  },
});

function PaymentSuccessPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
              Thank you for your purchase. Your payment has been processed successfully.
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Your subscription is now active. You can start using all the premium features of NexaAI.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGoHome}
              sx={{ mt: 2 }}
            >
              Go Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default PaymentSuccessPage;