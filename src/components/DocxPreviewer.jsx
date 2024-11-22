import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Paper, Typography, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { renderAsync } from 'docx-preview';
import { motion } from 'framer-motion';

const PreviewContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '600px',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const PreviewContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: '16px',
  backgroundColor: 'white',
  '& .docx': {
    background: 'white',
    minHeight: '100%',
    color: 'black',
    '& > section': {
      padding: 0,
      margin: 0,
      width: '100%',
      backgroundColor: 'white',
    },
    '& .document-container': {
      padding: 0,
      margin: 0,
      backgroundColor: 'white',
    },
    // Force text alignment and color for all elements
    '& p, & span, & div, & h1, & h2, & h3, & h4, & h5, & h6': {
      color: 'black !important',
      textAlign: 'justify !important', // Force left alignment
      justifyContent: 'flex-start !important', // For flex containers
    },
    // Ensure tables and cells have proper contrast and alignment
    '& table, & td, & th': {
      borderColor: '#ddd !important',
      color: 'black !important',
      textAlign: 'justify !important',
    },
    // Style links appropriately
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    // Reset any potential flex or grid layouts that might affect alignment
    '& div': {
      display: 'block !important',
      textAlign: 'left !important',
    }
  },
}));

const CenteredBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
});

const DocxPreviewer = ({ file, error, loading }) => {
  const previewRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  
  useEffect(() => {
    const loadPreview = async () => {
      if (file && previewRef.current) {
        try {
          setIsRendered(false);
          previewRef.current.innerHTML = '';
  
          await renderAsync(file, previewRef.current, null, {
            inWrapper: false,
            ignoreWidth: false, // Use actual document width
            ignoreHeight: false, // Use actual document height
            defaultStyleMap: {
              document: {
                marginLeft: '0',
                marginRight: '0',
                padding: '0',
                backgroundColor: 'white',
                color: 'black',
              },
              paragraph: {
                color: 'black',
                backgroundColor: 'transparent',
                margin: '0',
                padding: '0',
              },
              run: {
                color: 'black',
                backgroundColor: 'transparent',
              },
            },
          });
  
          setIsRendered(true);
  
          // Dynamically scale to fit
          const previewElement = previewRef.current.querySelector('.docx');
          if (previewElement) {
            const containerWidth = previewRef.current.offsetWidth;
            const documentWidth = previewElement.scrollWidth;
            const scaleFactor = containerWidth / documentWidth;
  
            previewElement.style.transform = `scale(${scaleFactor})`;
            previewElement.style.transformOrigin = 'top left';
            previewElement.style.width = `${100 / scaleFactor}%`;
          }
        } catch (err) {
          console.error('Error rendering docx preview:', err);
        }
      }
    };
    loadPreview();
  }, [file]);

  return (
    <PreviewContainer elevation={3}>
      {loading && (
        <CenteredBox>
          <CircularProgress />
        </CenteredBox>
      )}
      {error && (
        <CenteredBox>
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        </CenteredBox>
      )}
      {!loading && !error && !file && (
        <CenteredBox>
          <Typography variant="body1" color="text.secondary">
            No document selected for preview
          </Typography>
        </CenteredBox>
      )}
      <Fade in={!loading && !error && !!file}>
        <PreviewContent>
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: isRendered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundColor: 'white',
              minHeight: '100%',
            }}
          />
        </PreviewContent>
      </Fade>
    </PreviewContainer>
  );
};

export default DocxPreviewer;