import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { StyledButton } from './utils/shareComponent';

const slides = [
  {
    title: "Build Your Perfect CV with AI",
    subtitle: "Create an ATS-friendly CV tailored to your dream job in minutes",
    buttonText: "BUILD CV",
    buttonLink: "/makecv"
  },
  {
    title: "Optimize Your CV with AI",
    subtitle: "Enhance your CV to match job descriptions and boost your chances of passing ATS filters.",
    buttonText: "OPTIMIZE CV",
    buttonLink: "/optimize"
  }
];

// Create a canvas-based animated background
const AnimatedBackground = ({ theme }) => {
  const canvasRef = React.useRef(null);
  const isDark = theme.palette.mode === 'dark';

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw function
    const draw = () => {
      ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      const gridSize = 50;
      const lineWidth = 1;
      
      ctx.strokeStyle = isDark 
        ? `rgba(255, 255, 255, 0.1)` 
        : `rgba(0, 0, 0, 0.1)`;
      ctx.lineWidth = lineWidth;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        const offset = Math.sin(time + x * 0.01) * 5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        const offset = Math.sin(time + y * 0.01) * 5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Draw accent circles
      const circleCount = 5;
      for (let i = 0; i < circleCount; i++) {
        const x = canvas.width * (0.2 + Math.sin(time * 0.5 + i) * 0.1);
        const y = canvas.height * (0.2 + Math.cos(time * 0.5 + i) * 0.1);
        const radius = 50 + Math.sin(time + i) * 20;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${theme.palette.primary.main}40`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 0.01;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [theme.palette.mode, theme.palette.primary.main]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

const SlideContent = ({ slide, isActive }) => {
  const theme = useTheme();

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
      <AnimatedBackground theme={theme} />
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
            position: 'relative',
            zIndex: 1,
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