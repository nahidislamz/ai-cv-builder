import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Button, Box, Typography, Paper, useTheme, useMediaQuery, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import DocxPreviewer from './DocxPreviewer';

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

const PreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '500px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
}));


const TemplateSlider = ({ templates, onSelectTemplate, cvData }) => {
    const [previews, setPreviews] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState({});
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
    const formatList = (text) =>
        text
            .replace(/<li>/g, '• ')  // Replace opening <li> with bullet and space
            .replace(/<\/li>/g, '\n') // Replace closing </li> with a newline
            .replace(/<\/?[^>]+(>|$)/g, '');
    // Pre-fetch previews for all templates
    useEffect(() => {
      templates.forEach((template) => {
        generatePreview(template);
      });
    }, [templates]);
  
    const generatePreview = async (template) => {
        setLoading((prev) => ({ ...prev, [template.name]: true }));
        setError((prev) => ({ ...prev, [template.name]: null }));
      
        const formattedData = {
          ...cvData,
          education: cvData.education.map((edu) => ({
            ...edu,
            subjects: formatList(edu.subjects),
          })),
          workExperience: cvData.workExperience.map((work) => ({
            ...work,
            description: formatList(work.description),
          })),
          // Split skills into two columns
          skillsLeft: cvData.skills.slice(0, Math.ceil(cvData.skills.length / 2)),
          skillsRight: cvData.skills.slice(Math.ceil(cvData.skills.length / 2)),
        };
      
        try {
          const response = await fetch(template.filePath);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const zip = new PizZip(arrayBuffer);
          const doc = new Docxtemplater().loadZip(zip);
      
          doc.setData(formattedData);
          doc.render();
      
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
      
          console.log(formattedData);
      
          setPreviews((prevPreviews) => ({
            ...prevPreviews,
            [template.name]: out,
          }));
        } catch (err) {
          console.error('Error generating preview:', err);
          setError((prev) => ({
            ...prev,
            [template.name]: 'Failed to generate preview.',
          }));
        } finally {
          setLoading((prev) => ({ ...prev, [template.name]: false }));
        }
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
              <PreviewContainer>
                <DocxPreviewer
                  file={previews[template.name]}
                  loading={loading[template.name]}
                  error={error[template.name]}
                />
              </PreviewContainer>
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
  