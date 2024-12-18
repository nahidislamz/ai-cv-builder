import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import {  doc, getDoc } from 'firebase/firestore'; 


function PaymentSuccessPage({ user }) {
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceId = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid); // Reference to the user document
        const userDoc = await getDoc(userDocRef); // Get the document
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setInvoiceId(userData.invoiceId); // Set the invoice ID from Firestore
          console.log('Invoice ID from Firestore:', userData.invoiceId);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user document:', error);
      }
    };

    fetchInvoiceId();
  }, [user.uid]);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (invoiceId) {
        try {
          console.log('Fetching invoice with ID:', invoiceId);
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/invoice/${invoiceId}`);
          if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorMessage}`);
          }
          const data = await response.json();
          console.log('Fetched invoice data:', data);
          setInvoice(data); // Store invoice data
        } catch (error) {
          console.error('Error fetching invoice:', error);
        }
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleDownloadInvoice = () => {
    if (invoice && invoice.pdfUrl) {
      // If download is true, redirect to the PDF URL for download
      window.location.href = invoice.pdfUrl;
    } else {
      // Handle the case where the invoice is not downloadable
      console.log('Invoice details:', invoice);
      alert('The invoice cannot be downloaded as a PDF, but here are the details in the console.');
    }
  };

  return (
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
              Thank you for your purchase. Your payment has been processed successfully.
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4 }}>
              Your subscription is now active. You can start using all the premium features of NexaAI.
            </Typography>

            {invoice && (
              <Box sx={{ mt: 4, width: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Invoice Details
                </Typography>
                <Typography><strong>Invoice ID:</strong> {invoice.invoice.id.toUpperCase()}</Typography>
                <Typography><strong>Amount Due:</strong> £ {invoice.invoice.amount_due / 100} {invoice.currency}</Typography>
                <Typography><strong>Status:</strong> {invoice.invoice.status}</Typography>
                <Typography><strong>Date:</strong> {new Date(invoice.invoice.created * 1000).toLocaleDateString()}</Typography>
                <Typography>
                  <strong>Description:</strong> 
                  {invoice.invoice.description ? invoice.invoice.description : 'No description available.'}
                </Typography>
                <Typography>
                  <strong>Customer Email:</strong> 
                  {invoice.invoice.customer_email || 'No email available.'}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGoHome}
              sx={{ mt: 2 }}
            >
              Go Back to Home
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleDownloadInvoice}
              sx={{ mt: 2 }}
            >
              Download Invoice PDF
            </Button>

          </Box>
        </Paper>
      </Container>
  );
}

export default PaymentSuccessPage;
