import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Security, Support } from '@mui/icons-material';
import AnimatedCv3D from '../components/AnimatedCv3D';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
}));

const FeatureIcon = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const features = [
  { icon: <Lightbulb />, title: 'Innovative AI', description: 'Cutting-edge AI technology to create and optimize your CV' },
  { icon: <TrendingUp />, title: 'Career Growth', description: 'Tools and insights to propel your career forward' },
  { icon: <Security />, title: 'Data Security', description: 'Your information is always safe and secure with us' },
  { icon: <Support />, title: '24/7 Support', description: 'Round-the-clock assistance for all your CV needs' },
];

export default function AboutUs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box textAlign="center" mb={isMobile ? 4 : 8}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            About Us
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Revolutionizing CV Creation and Optimization with AI
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={4} mb={isMobile ? 4 : 8} alignItems="center">
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Our Mission
            </Typography>
            <Typography variant="body1" textAlign="justify">
              At NexaAI, we're on a mission to empower job seekers with cutting-edge AI technology. We believe that everyone deserves a chance to showcase their best self to potential employers, and we're here to make that process easier, faster, and more effective than ever before.
            </Typography>
            <Typography variant="body1" textAlign="justify">
              Our AI-powered platform is designed to help you create a standout CV that not only highlights your unique skills and experiences but also aligns perfectly with job descriptions and ATS requirements. We're not just building CVs; we're building careers.
            </Typography>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <Box sx={{ width: '100%', height: { xs: 250, sm: 350, md: 400 } }}>
              <AnimatedCv3D />
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      <Box mb={isMobile ? 4 : 8}>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          textAlign="center"
          marginBottom={4}
          sx={{ mt: 6 , fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        >
          Why Choose NexaAI?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <StyledCard>
                  <CardContent
                    sx={{ textAlign: 'center', justifyContent: 'center', minHeight: isMobile ? 200 : 250 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <FeatureIcon>{feature.icon}</FeatureIcon>
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
