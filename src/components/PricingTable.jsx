import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const MotionCard = motion(Card);

const plans = [
  {
    title: 'Basic',
    price: {
      weekly: 0,
      monthly: 0,
      yearly: 0,
    },
    features: [
      'All Basic features',
      '3 CV optimizations per day',
      'Build your CV with AI',
      'ATS friendly CV tips',
      'Email support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    price: {
      weekly: 2.99,
      monthly: 9.99,
      yearly: 49.99,
    },
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Cover letter generator',
      'Build your CV with AI',
      'ATS friendly CV tips',
      'Priority email support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'contained',
    isPopular: true,
  },
];

const featureComparison = [
  { feature: 'CV optimizations', basic: '3 per day', pro: 'Unlimited' },
  { feature: 'Build CV with AI', basic: true, pro: true },
  { feature: 'ATS friendly CV tips', basic: true, pro: true },
  { feature: 'Cover letter generator', basic: false, pro: true },
  { feature: 'Email support', basic: 'Standard', pro: 'Priority' },
];

export default function PricingTable() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();

  const handleBillingCycleChange = (event, newBillingCycle) => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h2" gutterBottom fontWeight="bold" sx={{fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }}}>
          Choose Your Plan
        </Typography>
        <Typography variant="body1" component="p" color="text.secondary" sx={{ mb: 4 }}>
          Select the perfect plan for your CV building needs
        </Typography>
        <StyledToggleButtonGroup
          value={billingCycle}
          exclusive
          onChange={handleBillingCycleChange}
          aria-label="billing cycle"
        >
          <StyledToggleButton value="weekly" aria-label="weekly">
            Weekly
          </StyledToggleButton>
          <StyledToggleButton value="monthly" aria-label="monthly">
            Monthly
          </StyledToggleButton>
          <StyledToggleButton value="yearly" aria-label="yearly">
            Yearly
          </StyledToggleButton>
        </StyledToggleButtonGroup>
      </Box>

      <Grid container spacing={4} alignItems="flex-start" justifyContent="center">
        {plans.map((plan, index) => (
          <Grid
            item
            key={plan.title}
            xs={12}
            sm={plan.title === 'Pro' ? 12 : 6}
            md={6}
          >
            <MotionCard
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.isPopular ? '0 8px 40px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h4" component="h3" fontWeight="bold">
                    {plan.title}
                  </Typography>
                }
                subheader={
                  <Typography variant="subtitle1" color="text.secondary">
                    {plan.isPopular ? 'Most Popular Choice' : 'Great for Starters'}
                  </Typography>
                }
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
                action={plan.isPopular ? <Chip icon={<StarIcon />} color="primary" label="POPULAR" /> : null}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[50]
                      : theme.palette.grey[900],
                  pb: 0,
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 4,
                  }}
                >
                  <Typography component="h2" variant="h3" color="text.primary" fontWeight="bold">
                    ${plan.price[billingCycle]}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    /{billingCycle.slice(0, -2)}
                  </Typography>
                </Box>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                  {plan.features.map((feature) => (
                    <Typography
                      component="li"
                      variant="subtitle1"
                      align="center"
                      key={feature}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}
                    >
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                      {feature}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button
                  size="large"
                  variant={plan.buttonVariant}
                  color={plan.isPopular ? 'primary' : 'inherit'}
                  onClick={() => { navigate('/upgrade') }}
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: '50px',
                    boxShadow: plan.isPopular ? '0 4px 20px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {plan.buttonText}
                </Button>
              </CardActions>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

     {/*
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h3" gutterBottom fontWeight="bold" sx={{fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }}}>
          Feature Comparison
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          See how our plans stack up
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="feature comparison table">
          <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Feature</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Basic</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Pro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {featureComparison.map((row) => (
              <TableRow
                key={row.feature}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.feature}
                </TableCell>
                <TableCell align="center">
                  {typeof row.basic === 'boolean' ? (
                    row.basic ? <CheckIcon color="primary" /> : <CloseIcon color="error" />
                  ) : (
                    row.basic
                  )}
                </TableCell>
                <TableCell align="center">
                  {typeof row.pro === 'boolean' ? (
                    row.pro ? <CheckIcon color="primary" /> : <CloseIcon color="error" />
                  ) : (
                    row.pro
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
     */}

      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h3" gutterBottom fontWeight="bold">
          Ready to boost your career?
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Choose the plan that's right for you and start building your professional CV today!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => { navigate('/upgrade') }}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: '50px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
}