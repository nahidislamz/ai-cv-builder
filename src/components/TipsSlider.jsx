import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Container,
} from '@mui/material';
import {
  Lightbulb,
} from '@mui/icons-material';

const tips = [
  {
    title: "Use Standard Section Headings",
    content: "Stick to standard headers like 'Experience,' 'Education,' and 'Skills.' ATS systems look for these keywords to parse your CV correctly."
  },
  {
    title: "Optimize for Keywords",
    content: "Mirror keywords from the job description in your CV, especially for skills and job titles. But keep it natural—avoid keyword stuffing."
  },
  {
    title: "Avoid Fancy Formatting",
    content: "Skip graphics, tables, and complex layouts. Use simple bullet points and consistent formatting to ensure the ATS can read your CV accurately."
  },
  {
    title: "Use Standard Fonts and Sizes",
    content: "Stick with classic fonts (like Arial, Calibri, or Times New Roman) and a font size between 10-12 points."
  },
  {
    title: "Submit as a Word Document",
    content: "If possible, submit your CV as a .docx file rather than PDF, as some ATS software struggles to parse PDFs accurately."
  }
];

export default function TipsSlider() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);


  const goToNextTip = useCallback(() => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  }, []);


  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(goToNextTip, 5000); // Change tip every 5 seconds
    }
    return () => clearInterval(timer);
  }, [isPlaying, goToNextTip]);


  return (
    <Container>
      <Alert 
        severity="success" 
        icon={<Lightbulb fontSize="inherit" />}
        sx={{
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle>ATS-Friendly CV</AlertTitle>
        <Box>
          <Typography variant="h6" gutterBottom>
            {tips[currentTip].title}
          </Typography>
          <Typography variant="body2">
            {tips[currentTip].content}
          </Typography>
        </Box>
      </Alert>
    </Container>
  );
}