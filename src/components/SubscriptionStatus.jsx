import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, AccessTime, Warning, Star } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  width: '100%',
  margin: 'auto',
  backdropFilter: 'blur(10px)',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, rgba(32,32,32,0.8) 0%, rgba(64,64,64,0.8) 100%)'
    : 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.8) 100%)',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[10],
  overflow: 'visible',
}));

const FeatureItem = ({ text, isDarkMode }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}
  >
    <CheckCircle color="primary" fontSize="small" />
    <Typography
      variant="body2"
      sx={{
        marginLeft: '12px',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      }}
    >
      {text}
    </Typography>
  </motion.div>
);

const PlanBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -15,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(0.5, 2),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  letterSpacing: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export default function SubscriptionStatus({ currentPlan, remainingDays, handleConfirmSubscription }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const features = [
    "All Basic features",
    "Unlimited CV optimizations",
    "Cover letter generator",
    "Build your CV with AI",
    "Priority email support"
  ];
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
      }}
    >
      <StyledCard>
        <PlanBadge>
          <Star fontSize="small" />
          {currentPlan.plan}
        </PlanBadge>
        <CardContent sx={{ pt: 4 }}>
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box textAlign="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  Your Current Plan
                </Typography>
              </Box>
              <Box display="flex" justifyContent="center" gap={2} mb={4} flexWrap="wrap">
                <Chip
                  icon={<CheckCircle />}
                  label={currentPlan.status.toUpperCase()}
                  color="success"
                  variant="filled"
                  size="medium"
                />
                <Chip
                  icon={<AccessTime />}
                  label={`${remainingDays} DAYS LEFT`}
                  color="primary"
                  variant="filled"
                  size="medium"
                />
              </Box>
            </motion.div>
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
              Plan Features:
            </Typography>
            {features.map((feature, index) => (
              <FeatureItem key={index} text={feature} isDarkMode={isDarkMode} />
            ))}
          </motion.div>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
          {currentPlan.status === 'active' && (
            <Button
              onClick={handleConfirmSubscription}
              variant="contained"
              color="error"
              fullWidth
              size="large"
              startIcon={<Warning />}
              sx={{
                borderRadius: theme.shape.borderRadius * 2,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
              Cancel Subscription
            </Button>
          )}
        </CardActions>
      </StyledCard>
    </Box>
  );
}