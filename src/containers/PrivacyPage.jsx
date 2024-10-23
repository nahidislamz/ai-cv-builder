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

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const handleBack = () => {
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
                    Privacy Policy
                </Typography>
                <Typography variant="body1" paragraph>
                    Welcome to NexaAI. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your information when you use our services.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    1. Information We Collect
                </Typography>
                <Typography variant="body1" paragraph>
                    We collect personal information that you provide to us such as name, email address, and resume data. We also automatically collect certain information when you use our services, including usage data and device information.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    2. How We Use Your Information
                </Typography>
                <Typography variant="body1" paragraph>
                    We use your information to provide and improve our services, communicate with you, and comply with legal obligations. We may use your data to personalize your experience and for analytics purposes to enhance our services.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    3. Information Sharing and Disclosure
                </Typography>
                <Typography variant="body1" paragraph>
                    We may share your information with third-party service providers that perform services for us. We do not sell your personal information. We may disclose your information if required by law or to protect our rights.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    4. Data Security
                </Typography>
                <Typography variant="body1" paragraph>
                    We have implemented appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, so we cannot guarantee absolute security.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    5. Your Data Protection Rights
                </Typography>
                <Typography variant="body1" paragraph>
                    Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. Please contact us to exercise these rights.
                </Typography>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    6. Changes to This Privacy Policy
                </Typography>
                <Typography variant="body1" paragraph>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body1">
                    If you have any questions about this Privacy Policy, please contact us at:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Email: privacy@nexaai.com"
                            secondary="Phone: +1 (555) 987-6543"
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

export default PrivacyPolicy;