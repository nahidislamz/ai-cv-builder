import React from 'react';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';


const TermsAndConditions = () => {
    const navigate = useNavigate();
    const handleBack = () => {
        // Add navigation logic here
        navigate("/home");
    };
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={handleBack} color="primary" aria-label="back">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Back
                    </Typography>
                </Box>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    Terms and Conditions
                </Typography>
                <Typography variant="body1" paragraph>
                    Welcome to NexaAI. By using our services, you agree to comply with and be bound by the following terms and conditions. Please read these carefully.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    1. Acceptance of Terms
                </Typography>
                <Typography variant="body1" paragraph>
                    By accessing or using NexaAI's services, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    2. Use of Services
                </Typography>
                <Typography variant="body1" paragraph>
                    Our services are intended for personal and non-commercial use. You may not use our services for any illegal or unauthorized purpose.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    3. User Accounts
                </Typography>
                <Typography variant="body1" paragraph>
                    To access certain features of our services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    4. Intellectual Property
                </Typography>
                <Typography variant="body1" paragraph>
                    The content, features, and functionality of our services are owned by NexaAI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    5. Limitation of Liability
                </Typography>
                <Typography variant="body1" paragraph>
                    NexaAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of our services.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    6. Changes to Terms
                </Typography>
                <Typography variant="body1" paragraph>
                    We reserve the right to modify these Terms and Conditions at any time. We will notify users of any significant changes. Your continued use of our services after such modifications constitutes your acceptance of the updated terms.
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body1">
                    If you have any questions about these Terms and Conditions, please contact us at:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Email: support@nexaai.com"
                            secondary="Phone: +1 (555) 123-4567"
                        />
                    </ListItem>
                </List>

                <Typography variant="body2" sx={{ mt: 4, fontStyle: 'italic' }}>
                    Last updated: {new Date().toLocaleDateString()}
                </Typography>
            </Box>
        </Container>

    );
};

export default TermsAndConditions;