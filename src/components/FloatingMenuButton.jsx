import React from 'react';
import { IconButton, Zoom } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { styled } from '@mui/material/styles';

const FloatingButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  left: theme.spacing(3),
  bottom: theme.spacing(3),
  zIndex: theme.zIndex.drawer + 2,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[8],
  },
}));

const FloatingMenuButton = ({ handleOpenDrawer }) => {
  return (
    <Zoom in={true} style={{ transitionDelay: '500ms' }}>
      <FloatingButton
        aria-label="open menu"
        onClick={() => handleOpenDrawer()}
        size="large"
      >
        <EditTwoToneIcon fontSize="medium" />
      </FloatingButton>
    </Zoom>
  );
};

export default FloatingMenuButton;