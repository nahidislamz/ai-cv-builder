import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/system';

const slides = [
  {
    title: "Build Your Perfect CV with AI",
    subtitle: "Create an ATS-friendly CV tailored to your dream job in minutes",
    buttonText: "BUILD CV",
    buttonLink: "/makecv"
  },
  {
    title: "Optimize Your CV with AI",
    subtitle: "Enhance your CV to match job descriptions and boost your chances of passing ATS filters. Effortlessly align your CV with industry keywords and make it stand out.",
    buttonText: "OPTIMIZE CV",
    buttonLink: "/optimize"
  }
];

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginTop:'15px',
  fontSize: '1.1rem',
  padding: '12px 32px',
  borderRadius: '50px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
  },
}));

const PatternBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  opacity: 0.1,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  backgroundRepeat: 'repeat',
}));

const SlideContent = ({ slide, isActive }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key={slide.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
              fontWeight: 900,
              mb: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #f3f3f3 30%, #ffffff 90%)'
                : 'linear-gradient(45deg, #1a1a1a 30%, #333333 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {slide.title}
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              mb: 6,
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.5rem' },
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {slide.subtitle}
          </Typography>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <StyledButton
              variant="contained"
              size="large"
              href={slide.buttonLink}
            >
              {slide.buttonText}
            </StyledButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function LandingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <PatternBackground />
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 12 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          {slides.map((slide, index) => (
            <SlideContent key={index} slide={slide} isActive={currentSlide === index} />
          ))}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 4,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              component={motion.div}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? theme.palette.primary.main : theme.palette.grey[300],
                cursor: 'pointer',
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}