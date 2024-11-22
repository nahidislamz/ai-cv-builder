import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const LogoContainer = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease-in-out',
}));

const CvoLogo = () => {
  const letterVariants = {
    hover: { y: -5, transition: { duration: 0.3 } },
  };

  return (
    <LogoContainer>
      <motion.div whileHover="hover">
        {['c', 'v', 'o'].map((letter, index) => (
          <motion.span key={index} variants={letterVariants}>
            <LogoText component="span" className="meddon-regular">
              {letter}
            </LogoText>
          </motion.span>
        ))}
      </motion.div>
    </LogoContainer>
  );
};

export default CvoLogo;