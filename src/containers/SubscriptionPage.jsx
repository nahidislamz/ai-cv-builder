import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  createTheme, ThemeProvider,
  Container,
  Grid,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import dayjs from 'dayjs';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff7043', // You can adjust this to your preferred primary color
    },
  },
});

const plans = [
  {
    title: 'Basic',
    price: 'free',
    period: '',
    features: [
      'Access to basic resume templates',
      'Limited CV optimizations',
      'Email support',
    ],
    buttonText: '',
    buttonVariant: '',
    priceId: '', // Replace with actual price ID for the plan
  },
  {
    title: 'Weekly',
    price: '£4.99',
    period: '/week',
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Access to premium templates',
      'Priority email support',
    ],
    buttonText: 'Subscribe',
    buttonVariant: 'outlined',
    priceId: 'price_1Q5SYtII1U3Mnymtjf3Hmhmr', // Replace with actual price ID for the plan
  },
  {
    title: 'Monthly',
    price: '£14.99',
    period: '/month',
    features: [
      'All Weekly features',
      'Cover letter generator',
      'LinkedIn profile optimization',
      'Phone support',
    ],
    buttonText: 'Subscribe',
    buttonVariant: 'outlined',
    priceId: 'price_1Q5SXhII1U3MnymtN4KJ1hrL', // Replace with actual price ID for the plan
  },
  {
    title: 'Yearly',
    price: '£109.99',
    period: '/year',
    features: [
      'All Monthly features',
      'Personal career coach',
      'Job interview preparation',
      '24/7 priority support',
    ],
    buttonText: 'Subscribe',
    buttonVariant: 'outlined',
    priceId: 'price_1Q5SbsII1U3MnymtvhCIboGJ', // Replace with actual price ID for the plan
  },
];
// Update the component to accept props
function PricingCard({ plan, email, userid }) {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  // Function to fetch customer ID
  const getCustomerId = async (email) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/get-customer-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching customer ID: ${response.statusText}`);
      }

      const data = await response.json();
      const fetchedCustomerId = data.customerId;
      setCustomerId(fetchedCustomerId); // Store the customer ID in state
      console.log('Customer ID:', fetchedCustomerId);
    } catch (error) {
      console.error('Error fetching customer ID:', error);
    }
  };

  // Fetch customer ID when component mounts
  useEffect(() => {
    getCustomerId(email);
  }, [email]);

  // Call the function with the user's email

  const handleSubscribe = async () => {
    setLoading(true); // Set loading state to true

    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          email: email,
          customerId: customerId,
          userid: userid,
          planName: plan.title
        }), // Replace with actual customer ID
      });

      const session = await response.json();
      console.log(session)

      // Redirect the user to the Stripe checkout page
      if (session.url) {
        window.location.href = session.url; // Redirect to the Stripe checkout URL
      } else {
        console.error("No URL returned from server");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: plan.title === 'Yearly' ? `2px solid ${theme.palette.primary.main}` : 'none',
        boxShadow: plan.title === 'Yearly' ? 3 : 1,
      }}
    >
      <CardHeader
        title={plan.title}
        titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
        sx={{
          backgroundColor: plan.title === 'Yearly' ? theme.palette.primary.main : theme.palette.grey[200],
          color: plan.title === 'Yearly' ? theme.palette.common.white : theme.palette.text.primary,
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography component="h2" variant="h3" color="text.primary">
            {plan.price}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {plan.period}
          </Typography>
        </Box>
        {plan.features.map((feature) => (
          <Box key={feature} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1">{feature}</Typography>
          </Box>
        ))}
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant={plan.buttonVariant}
          color="primary"
          size="large"
          onClick={handleSubscribe}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Processing...' : plan.buttonText}
        </Button>
      </CardActions>
    </Card>
  );
}

function SubscriptionPlans({ user }) {
  const [remainingDays, setRemainingDays] = useState();
  const [currentPlan, setCurrentPlan] = useState();

  const fetchPlanDetails = async () => {
    try {
      // Assuming user.uid is available for fetching user-specific plan details
      const planRef = doc(firestore, "users", user?.uid); // Firestore collection 'users' and document 'uid'

      const planSnap = await getDoc(planRef);

      if (planSnap.exists()) {
        const planData = planSnap.data();
        setCurrentPlan(planData); // Assuming 'plan' is part of the Firestore document
        //calculateRemainingDays(planData.planEndDate); // Assuming 'planEndDate' exists in Firestore data
        console.log(currentPlan)
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
    }
  };
  const calculateRemainingDays = (endDate) => {
    const now = dayjs();
    const subscriptionEnd = dayjs(endDate);
    const remaining = subscriptionEnd.diff(now, "days");
    setRemainingDays(remaining);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchPlanDetails(); // Ensure this function does not update 'user' or 'currentPlan'
      }
    };

    fetchData();
  }, [user]); // Run fetchPlanDetails only when 'user' changes

  useEffect(() => {
    if (currentPlan) {
      calculateRemainingDays(currentPlan.subscriptionEndDate); // Ensure this function does not update 'currentPlan'
    }
  }, [currentPlan]);


  const handleCancelSubscription = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentPlan.subscriptionId, // Pass the Stripe subscription ID
          firebaseUid: user?.uid,                    // Pass the Firebase user ID
        }),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok) {
        alert('Subscription canceled successfully');
        // Optionally, refresh the plan details or redirect the user
      } else {
        alert(`Failed to cancel subscription: ${data.error}`);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred while canceling the subscription.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {currentPlan && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {currentPlan.plan === "free" ? (
              <>
                <Typography variant="h2" color="primary">
                  You are not subscribed!
                </Typography>
                <Typography variant="h4" align="center" color="text.primary" gutterBottom>
                  Choose Your Plan
                </Typography>
                <Typography variant="h5" align="center" color="text.secondary" paragraph>
                  Select the plan that best fits your needs and take your career to the next level with NexaAI.
                </Typography>
                <Grid container spacing={4} alignItems="flex-end">
                  {plans.map((plan) => (
                    <Grid item key={plan.title} xs={12} sm={6} md={3}>
                      <PricingCard plan={plan} email={user?.email} userid={user?.uid} />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <>
                <Typography variant="h4" color="primary">
                  Your Current Plan: {currentPlan.plan}
                </Typography>
                  <Box sx={{ m: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">All Basic features</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">Unlimited CV optimizations</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">Access to premium templates</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                      <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">Priority email support</Typography>
                    </Box>
                </Box>


                <Typography variant="h6" color="text.secondary">
                  Subscription Status: {currentPlan.status}
                </Typography>
                {remainingDays !== null && (
                  <Typography variant="h6" color="text.secondary">
                    {remainingDays > 0
                      ? `Days Remaining: ${remainingDays} days`
                      : 'Your subscription has expired'}
                  </Typography>
                )}
                {
                  currentPlan.status === 'active' ? (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancelSubscription}
                      sx={{ mt: 2 }}
                    >
                      Cancel Subscription
                    </Button>
                  ) : null
                }


                {
                  currentPlan.status === 'canceled' ? (
                    <>
                      <Typography variant="h4" marginTop={4} align="center" color="text.primary" gutterBottom>
                        Please Subscribe Again
                      </Typography>
                      <Typography variant="h5" align="center" color="text.secondary" paragraph>
                        Select the plan that best fits your needs and take your career to the next level with NexaAI.
                      </Typography>
                      <Grid container spacing={4} alignItems="flex-end">
                        {plans.map((plan) => (
                          <Grid item key={plan.title} xs={12} sm={6} md={3}>
                            <PricingCard plan={plan} email={user?.email} userid={user?.uid} />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  ) : null
                }

              </>
            )}
          </Box>
        )}

      </Container>
    </ThemeProvider>
  );
}

export default SubscriptionPlans;