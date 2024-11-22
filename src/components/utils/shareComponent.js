// src/components/common/sharedComponents.js
import { styled } from '@mui/material/styles';
import { Typography, Button ,Paper ,Avatar} from '@mui/material';

export const GradientTypography = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ef709b 30%, #fa9372 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  fontSize: '2rem',
  [theme.breakpoints.up('md')]: {
    fontSize: '2.5rem',
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ef709b 30%, #fa9372 90%)',
  borderRadius: '8px',
  border: 0,
  color: 'white',
  padding: '12px 24px',
  boxShadow: '0 3px 5px 2px rgba(60, 60, 60, .3)',
  marginTop: 'auto',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(45deg, #ff0f7b 30%, #f89b29 90%)',
  },
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: theme.palette.background.paper,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
  },
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },}));


  export const GradientAvatar = styled(Avatar)(({ theme }) => ({
    background: 'linear-gradient(45deg, #ef709b 30%, #fa9372 90%)',
    color: theme.palette.common.white,
  }));