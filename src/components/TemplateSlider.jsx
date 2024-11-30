import React, { useState } from 'react';
import Slider from 'react-slick';
import { Button, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  background: theme.palette.background.paper,
  overflow: 'hidden',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .slick-slide': {
    padding: theme.spacing(2),
  },
  '& .slick-dots': {
    bottom: -40,
    '& li button:before': {
      fontSize: 12,
      color: theme.palette.primary.main,
    },
    '& li.slick-active button:before': {
      color: theme.palette.primary.dark,
    },
  },
  '& .slick-prev, & .slick-next': {
    zIndex: 1,
    '&:before': {
      fontSize: 30,
      color: theme.palette.primary.main,
    },
  },
  '& .slick-prev': {
    left: -35,
  },
  '& .slick-next': {
    right: -35,
  },
}));

const AnimatedButton = styled(motion(Button))(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: 30,
    padding: theme.spacing(1, 4),
  }));

  const PreviewWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    paddingTop: '141.42%', // A4 aspect ratio (1:1.4142)
    position: 'relative',
    margin: '0 auto',
    maxWidth: '595px', // A4 width in pixels at 72 DPI
  }));
  
  const PreviewContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  }));

const TemplateImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const TemplateSlider = ({ templates, onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: isMobile ? '0' : '100px',
    responsive: [
      {
        breakpoint: 600,
        settings: {
          centerPadding: '0',
        },
      },
    ],
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template.filePath);
    setSelectedTemplate(template);
  };

  return (
    <StyledPaper elevation={1}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Select Your Perfect CV Template
      </Typography>
      <StyledSlider {...settings}>
        {templates.map((template, index) => (
          <Box key={index} textAlign="center" p={1}>
            <PreviewWrapper>
            <PreviewContainer>
              <TemplateImage src={template.imageUrl} alt={template.name} />
            </PreviewContainer>
            </PreviewWrapper>
              <AnimatedButton
                variant={selectedTemplate && selectedTemplate.name === template.name ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleSelectTemplate(template)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {template.name}
              </AnimatedButton>
          </Box>
        ))}
      </StyledSlider>

      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box mt={4} textAlign="center">
              <Typography variant="h6" color="primary">Selected Template:</Typography>
              <Typography variant="h5" fontWeight="bold">{selectedTemplate.name}</Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </StyledPaper>
  );
};

export default TemplateSlider;