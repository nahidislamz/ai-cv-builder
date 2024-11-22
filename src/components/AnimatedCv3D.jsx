import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
const AnimatedCvImage = ({ width = 400, height = 400 }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Adjust dimensions for mobile view
  const svgWidth = isMobile ? width * 0.8 : width;
  const svgHeight = isMobile ? 350 * 0.8 : height;
  const bgColor = isDarkMode ? '#333' : '#fff';
  const lineColor = isDarkMode ? '#555' : '#e0e0e0';
  const accentColor = theme.palette.primary.main;

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => {
      const delay = i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: 'spring', duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };

  return (
    <motion.svg
      width={svgWidth}
      height={svgHeight}
      viewBox="0 0 400 600"
      initial="hidden"
      animate="visible"
    >
      {/* Background */}
      <motion.rect width="400" height="600" fill={bgColor} rx="20" ry="20" />

      {/* Header */}
      <motion.rect
        x="20"
        y="20"
        width="360"
        height={isMobile ? 80 : 100}
        fill={accentColor}
        rx="10"
        ry="10"
        variants={draw}
        custom={0}
      />

      {/* Name */}
      <motion.rect
        x="40"
        y="40"
        width={isMobile ? 160 : 200}
        height="20"
        fill={bgColor}
        rx="5"
        ry="5"
        variants={draw}
        custom={1}
      />
      <motion.rect
        x="40"
        y="70"
        width={isMobile ? 120 : 150}
        height="15"
        fill={bgColor}
        rx="5"
        ry="5"
        variants={draw}
        custom={1.5}
      />

      {/* Content Lines */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <React.Fragment key={i}>
          <motion.rect
            x="20"
            y={140 + i * 60}
            width="360"
            height={isMobile ? 30 : 40}
            fill={lineColor}
            rx="5"
            ry="5"
            variants={draw}
            custom={2 + i * 0.2}
          />
          <motion.rect
            x="30"
            y={150 + i * 60}
            width={isMobile ? 300 : 340}
            height="20"
            fill={bgColor}
            rx="5"
            ry="5"
            variants={draw}
            custom={2.1 + i * 0.2}
          />
        </React.Fragment>
      ))}

      {/* Skills Section */}
      <motion.rect
        x="20"
        y="520"
        width="360"
        height={isMobile ? 50 : 60}
        fill={accentColor}
        rx="10"
        ry="10"
        variants={draw}
        custom={4}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={i}
          cx={60 + i * 80}
          cy="550"
          r={isMobile ? 10 : 15}
          fill={bgColor}
          variants={draw}
          custom={4.5 + i * 0.1}
        />
      ))}
    </motion.svg>
  );
};

export default AnimatedCvImage;
