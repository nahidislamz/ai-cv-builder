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
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

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
      'ATS frindly CV tips',
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
      'ATS frindly CV tips',
      'Priority email support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'contained',
    isPopular: true,
  },

];

export default function PricingTable() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate= useNavigate();

  const handleBillingCycleChange = (event, newBillingCycle) => {
    if (newBillingCycle !== null) {
      setBillingCycle(newBillingCycle);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary">
          Select the perfect plan for your CV building needs
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={billingCycle}
          exclusive
          onChange={handleBillingCycleChange}
          aria-label="billing cycle"
        >
          <ToggleButton value="weekly" aria-label="weekly">
            Weekly
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly">
            Monthly
          </ToggleButton>
          <ToggleButton value="yearly" aria-label="yearly">
            Yearly
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4} alignItems="flex" justifyContent={'center'}>
        {plans.map((plan) => (
          <Grid
            item
            key={plan.title}
            xs={12}
            sm={plan.title === 'Pro' ? 12 : 6}
            md={4}
          >
            <Card>
              <CardHeader
                title={plan.title}
                titleTypographyProps={{ align: 'center' }}
                action={plan.isPopular ? <Chip color="primary" label="Popular" /> : null}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[200]
                      : theme.palette.grey[700],
                }}
              />
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 2,
                  }}
                >
                  <Typography component="h2" variant="h3" color="text.primary">
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
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}
                    >
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                      {feature}
                    </Typography>
                  ))}
                </ul>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={plan.buttonVariant}
                  color={plan.isPopular ? 'primary' : 'inherit'}
                  onClick={()=>{navigate('/upgrade')}}
                >
                  {plan.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}