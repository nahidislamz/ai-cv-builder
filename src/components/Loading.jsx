import React from 'react';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

const MakeCvLogo = ({ width = 200, height = 200 }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: width,
        height: height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SvgIcon
        viewBox="0 0 100 100"
        sx={{
          width: '100%',
          height: '100%',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop offset="100%" stopColor={theme.palette.primary.light} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="url(#gradient)" />
        
        {/* Document shape */}
        <rect x="30" y="20" width="40" height="60" fill="white" rx="4" ry="4" />
        
        {/* Lines representing text on the document */}
        <line x1="35" y1="30" x2="65" y2="30" stroke={theme.palette.primary.main} strokeWidth="2" />
        <line x1="35" y1="40" x2="65" y2="40" stroke={theme.palette.primary.main} strokeWidth="2" />
        <line x1="35" y1="50" x2="55" y2="50" stroke={theme.palette.primary.main} strokeWidth="2" />
        
        {/* Pencil shape */}
        <polygon points="70,70 75,65 80,70 75,75" fill={theme.palette.secondary.main} />
        <rect x="65" y="70" width="10" height="5" fill={theme.palette.secondary.main} transform="rotate(-45 70 72.5)" />
        <polygon points="62,78 65,75 67,77 64,80" fill={theme.palette.grey[800]} />
      </SvgIcon>
      <Typography
        variant="h6"
        component="h1"
        sx={{
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          marginTop: 1,
        }}
      >
        cvoptimizer
      </Typography>
    </Box>
  );
};

MakeCvLogo.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default MakeCvLogo;