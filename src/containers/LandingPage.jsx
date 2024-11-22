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
    Avatar,
    Divider,
} from '@mui/material';
import {
    Description,
    Speed,
    Mail,
    CheckCircle,
    Timer,
    Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PricingTable from '../components/PricingTable';
import LandingSlider from '../components/LandingSlider';
import ContactPage from './ContactPage';
import AboutUsPage from './AboutUsPage'
import { GradientAvatar } from '../components/utils/shareComponent';
const MotionCard = motion(Card);
const MotionBox = motion(Box);

const Feature = ({ icon, title, description }) => (
    <MotionCard
        whileHover={{ scale: 1.05 }}
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
                boxShadow: '0 6px 30px 0 rgba(0,0,0,0.2)',
            },
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <GradientAvatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                    {icon}
                </GradientAvatar>
            </Box>
            <Typography variant="h5" component="div" gutterBottom align="center" fontWeight="bold">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
                {description}
            </Typography>
        </CardContent>
        <CardActions sx={{ mt: 'auto', justifyContent: 'center' }}>
            <Button size="small" color="primary" variant="text">Learn More</Button>
        </CardActions>
    </MotionCard>
);

const Testimonial = ({ name, role, content }) => (
    <Card sx={{ height: '100%', borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)' }}>
        <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{content}"
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{name[0]}</Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
                    <Typography variant="body2" color="text.secondary">{role}</Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export default function LandingPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ flexGrow: 1 }}>
            <LandingSlider />
            <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
                <Typography variant="h3" component="h2" gutterBottom align="center" fontWeight="bold" sx={{ mb: 6 , fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                    Our Services
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Description fontSize="large" />}
                            title="AI-Optimized CV"
                            description="Our AI analyzes job descriptions to optimize your CV for maximum impact and relevance."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Speed fontSize="large" />}
                            title="Efficient CV Building"
                            description="Build a professional CV quickly with our AI-powered tools and templates."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Mail fontSize="large" />}
                            title="Tailored Cover Letters"
                            description="Generate customized cover letters for each job application with ease."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<CheckCircle fontSize="large" />}
                            title="ATS-Friendly Format"
                            description="Ensure your CV passes Applicant Tracking Systems with our ATS-optimized formats."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Timer fontSize="large" />}
                            title="Quick Creation"
                            description="Create a stunning CV in just a few minutes with our intuitive interface."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Feature
                            icon={<Star fontSize="large" />}
                            title="Expert Guidance"
                            description="Receive AI-powered suggestions and tips to enhance your CV's impact."
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 12, mb: 12 }}>
                    <Typography variant="h3" component="h2" gutterBottom align="center" fontWeight="bold" sx={{ mb: 6 ,fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }}}>
                        What Our Users Say
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Testimonial
                                name="Sarah Johnson"
                                role="Software Engineer"
                                content="This AI CV builder transformed my job search. I landed interviews at top tech companies within weeks!"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Testimonial
                                name="Michael Chen"
                                role="Marketing Manager"
                                content="The tailored cover letter feature is a game-changer. It saved me hours of work for each application."
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Testimonial
                                name="Emily Rodriguez"
                                role="Recent Graduate"
                                content="As a new grad, I was struggling to create a compelling CV. This tool made it so easy and professional!"
                            />
                        </Grid>
                    </Grid>
                </Box>

                <PricingTable />

                <MotionBox
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{
                        mt: 12,
                        textAlign: 'center',
                        p: 6,
                        borderRadius: '16px',
                        background: 'linear-gradient(45deg, #ef709b 30%, #fa9372 90%)',
                        color: 'white',
                    }}
                >
                    <Typography variant="h3" component="h2" gutterBottom fontWeight="bold" sx={{fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }}}>
                        Ready to land your dream job?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4 }}>
                        Join thousands of successful job seekers who've boosted their careers with our AI CV Builder.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/makecv')}
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)',
                            },
                        }}
                    >
                        Create Your CV Now
                    </Button>
                </MotionBox>
            </Container>
            <AboutUsPage/>
            <ContactPage />

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