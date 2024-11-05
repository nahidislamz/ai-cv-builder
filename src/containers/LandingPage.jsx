import React from 'react';
import { useNavigate } from "react-router-dom";
import {
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Box,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Description,
    Speed,
    Mail,
    CheckCircle,
    Timer,
} from '@mui/icons-material';
import PricingTable from '../components/PricingTable';
import LandingSlider from '../components/LandingSlider';
import ContactPage from './ContactPage';

const Feature = ({ icon, title, description }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {icon}
            </Box>
            <Typography variant="h5" component="div" gutterBottom align="center">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
                {description}
            </Typography>
        </CardContent>
        <CardActions sx={{ mt: 'auto' }}>
            <Button size="small" fullWidth>Learn More</Button>
        </CardActions>
    </Card>
);

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <LandingSlider/>
            <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Description fontSize="large" color="primary" />}
                            title="AI-Optimized CV"
                            description="Our AI analyzes job descriptions to optimize your CV for maximum impact and relevance."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Speed fontSize="large" color="primary" />}
                            title="Efficient CV Building"
                            description="Build a professional CV quickly with our AI-powered tools and templates."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Mail fontSize="large" color="primary" />}
                            title="Tailored Cover Letters"
                            description="Generate customized cover letters for each job application with ease."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<CheckCircle fontSize="large" color="primary" />}
                            title="ATS-Friendly Format"
                            description="Ensure your CV passes Applicant Tracking Systems with our ATS-optimized formats."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Timer fontSize="large" color="primary" />}
                            title="Quick Creation"
                            description="Create a stunning CV in just a few minutes with our intuitive interface."
                        />
                    </Grid>
                </Grid>

                <PricingTable/>

                <Box sx={{ mt: 8, textAlign: 'center' }}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Ready to land your dream job?
                    </Typography>
                    <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={() => navigate('/makecv')}>
                        Create Your CV Now
                    </Button>
                </Box>
            </Container>
            <ContactPage/>
            <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} AI CV Builder. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}