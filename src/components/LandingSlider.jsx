import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Fade,
} from '@mui/material';

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

const patterns = [
  {
    id: 'pattern1',
    svg: (
      <svg width="100%" height="100%">
        <defs>
          <pattern id="pattern1" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="#ff7043" fillOpacity="0.2" />
            <path d="M0 20h40M20 0v40" stroke="#ff7043" strokeWidth="0.5" strokeOpacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern1)" />
      </svg>
    )
  },
  {
    id: 'pattern2',
    svg: (
      <svg width="100%" height="100%">
        <defs>
          <pattern id="pattern2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M0 0l30 30M0 30l30-30M30 30l30 30M30 60l30-30" stroke="#ff7043" strokeWidth="0.5" strokeOpacity="0.1" />
            <circle cx="30" cy="30" r="2" fill="#ff7043" fillOpacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern2)" />
      </svg>
    )
  }
];

export default function LandingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showing, setShowing] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setShowing(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setShowing(true);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      >
        {patterns[currentSlide].svg}
      </Box>
      <Container maxWidth="lg">
        <Fade in={showing} timeout={500}>
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
                fontWeight: 'bold',
                mb: 4,
                background: isDarkMode
                  ? 'none'
                  : 'linear-gradient(45deg, #1a1a1a 30%, #333333 90%)',
                backgroundClip: isDarkMode ? 'none' : 'text',
                WebkitBackgroundClip: isDarkMode ? 'none' : 'text',
                color: isDarkMode ? 'white' : 'transparent',
              }}
            >
              {slides[currentSlide].title}
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{
                mb: 6,
                color: 'text.secondary',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.5rem' },
                lineHeight: 1.5,
              }}
            >
              {slides[currentSlide].subtitle}
            </Typography>
            <Button
              variant="contained"
              size="large"
              href={slides[currentSlide].buttonLink}
              sx={{
                backgroundColor: theme.palette.primary.main,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                py: { xs: 1, sm: 1.5 },
                px: { xs: 3, sm: 4 },
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {slides[currentSlide].buttonText}
            </Button>
          </Box>
        </Fade>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 4,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? theme.palette.primary.main : theme.palette.grey[300],
                transition: 'background-color 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                setShowing(false);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setShowing(true);
                }, 500);
              }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}