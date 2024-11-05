import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  Container,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { WarningAmber } from '@mui/icons-material';
import { useTheme } from '@emotion/react';

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
      'Cover letter generator',
      'Build you cv with ai',
      'Priority email support',
    ],
    priceId: 'price_1Q5SYtII1U3Mnymtjf3Hmhmr', // Replace with actual price ID for the plan
  },
  {
    title: 'Monthly',
    price: '£14.99',
    period: '/month',
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Cover letter generator',
      'Build you cv with ai',
      'Priority email support',
    ],
    priceId: 'price_1Q5SXhII1U3MnymtN4KJ1hrL', // Replace with actual price ID for the plan
  },
  {
    title: 'Yearly',
    price: '£109.99',
    period: '/year',
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Cover letter generator',
      'Build you cv with ai',
      'Priority email support',
    ],
    priceId: 'price_1Q5SbsII1U3MnymtvhCIboGJ', // Replace with actual price ID for the plan
  },
];
// Update the component to accept props
function PricingCard({ plan, email, userid, currentPlan, remainingDays }) {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [switchPlan, setSwitchPlan] = useState(false);
  const [dialogLoading,setDialogLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false); // State for dialog
  const [message, setMessage] = useState(false); // State for loading in dialog
  const theme = useTheme();
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

    if (currentPlan) {
      setSwitchPlan(true)
      console.log(currentPlan + "from pricing")

    }
  }, [email, currentPlan]);

  // Call the function with the user's email

  const handleSubscribe = async () => {
    setLoading(true); // Set loading state to true
    if(switchPlan){setDialogLoading(true)}
    const endpoint = switchPlan ? '/switch-subscription' : '/create-checkout-session';
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + endpoint, {
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
        setMessage('Switching has been successfull!')
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false); // Reset loading state
      setDialogLoading(false)
    }
  };
  const handleConfimSwitch = () => {
    setOpenDialog(true); // Open the confirmation dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
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
          backgroundColor: plan.title === 'Yearly' ? theme.palette.primary.main : theme.palette.mode === 'light'
          ? theme.palette.grey[200]
          : theme.palette.grey[700],
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
          <Box key={feature} sx={{ display: 'flex', mb: 1 }}>
            <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1">{feature}</Typography>
          </Box>
        ))}
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant='outlined'
          color="primary"
          size="large"
          onClick={switchPlan ? handleConfimSwitch : handleSubscribe}
          disabled={loading} // Disable button while loading
        >
          {loading
            ? 'Processing...'
            : switchPlan
              ? 'Switch Plan'
              : 'Subscribe'}
        </Button>

      </CardActions>

      <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
        >
          <DialogContent>
            <Box>
              {dialogLoading ? (
                <>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
                      <Typography variant='h5'>Switching your subscriptions... </Typography>
                </>
          
              ) : message ? (
                <DialogContentText variant='h5' padding={3}>
                   <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CheckCircleIcon color="success" sx={{fontSize:60}} />
                   </Box>
                  {message}
                </DialogContentText>
              ) : (
                <DialogContentText>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <WarningAmber color="warning" sx={{fontSize:60}} />
                   </Box>
                  Are you sure you want to switch your subscription? This action cannot be undone.
                </DialogContentText>
              )}
            </Box>
          </DialogContent>
            <DialogActions>
              {message ? (
                <Button onClick={() => {
                  handleCloseDialog(); // Close the dialog
                  window.location.reload(); // Reload the page
                }} color="primary">
                  Okay
                </Button>
              ) : (
                <>
                  <Button onClick={handleCloseDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleSubscribe} color="secondary" disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm'}
                  </Button>
                </>
              )}
            </DialogActions>
        </Dialog>
    </Card>
  );
}

function SubscriptionPlans({ user }) {
  const [remainingDays, setRemainingDays] = useState();
  const [currentPlan, setCurrentPlan] = useState();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog
  const [message, setMessage] = useState(false); // State for loading in dialog
  


  const calculateRemainingDays = (endDate) => {
    const now = dayjs();
    const subscriptionEnd = dayjs(endDate);
    const remaining = subscriptionEnd.diff(now, "days");
    setRemainingDays(remaining);
  };

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        // Assuming user.uid is available for fetching user-specific plan details
        const planRef = doc(firestore, "users", user?.uid); // Firestore collection 'users' and document 'uid'

        const planSnap = await getDoc(planRef);

        if (planSnap.exists()) {
          const planData = planSnap.data();
          console.log("Plan data retrieved:", planData); // Log the plan data
          setCurrentPlan(planData); // Assuming 'plan' is part of the Firestore document
          //calculateRemainingDays(planData.planEndDate); // Assuming 'planEndDate' exists in Firestore data
          
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching plan details:", error);
      }
    };
    const fetchData = async () => {
      if (user) {
        console.log("Fetching plan details for user:", user.uid); 
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
    setLoading(true)
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
        setMessage('Your Subscription has been canceled successfully');
      } else {
        setMessage(`Failed to cancel subscription: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error canceling subscription:', error);
    }
    finally {
      setLoading(false)
    }
  };
  const handleConfimSubscription = () => {
    setOpenDialog(true); // Open the confirmation dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
  };

  return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {currentPlan && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {currentPlan.plan === "free" ? (
              <>
                <Typography variant="h3" color="primary">
                  You are not subscribed!
                </Typography>
                <Typography variant="h4" align="center" color="text.primary" gutterBottom>
                  Choose Your Plan
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Select the plan that best fits your needs and take your career to the next level with NexaAI.
                </Typography>
                <Grid container spacing={4} alignItems="flex-end">
                  {plans.map((plan) => (
                    <Grid item key={plan.title} xs={12} sm={6} md={3}>
                      <PricingCard plan={plan} email={user?.email} userid={user?.uid} currentPlan={null} />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <>
                <Box>
                  <Typography variant="h4" color="primary">
                    Your Current Plan: {currentPlan.plan}
                  </Typography>
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
                </Box>
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
                    <Typography variant="body1">Cover letter generator</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                    <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">Build you cv with ai</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                    <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">Priority email support</Typography>
                  </Box>
                </Box>



                {currentPlan && currentPlan.status === 'active' ? (
                  <>
                    <Button
                      disabled={loading}
                      variant="outlined"
                      color="secondary"
                      onClick={handleConfimSubscription}
                      sx={{ mt: 2 }}
                    >
                      Cancel Subscription
                    </Button>
                    <Typography variant="h4" marginTop={4} align="center" color="text.primary" gutterBottom>
                      Switch your subscription
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary">
                      Select the plan that best fits your needs and take your career to the next level with NexaAI.
                    </Typography>
                    <Grid container spacing={4} alignItems="center" justifyContent="center">
                      {plans
                        .filter(plan => !(currentPlan?.status === 'active' && plan.title === 'Basic'))
                        .map(plan => (
                          <Grid item key={plan.title} xs={12} sm={6} md={3}>
                            <PricingCard plan={plan} email={user?.email} userid={user?.uid} currentPlan={currentPlan} />
                          </Grid>
                        ))}
                    </Grid>
                  </>
                ) : null}



                {
                  currentPlan.status === 'canceled' ? (
                    <>

                      <Typography variant="h4" marginTop={4} align="center" color="text.primary" gutterBottom>
                        Please Subscribe Again
                      </Typography>
                      <Typography variant="body1" align="center" color="text.secondary" marginBottom={2}>
                        Select the plan that best fits your needs and take your career to the next level with NexaAI.
                      </Typography>
                      <Grid container spacing={4} alignItems="center" justifyContent='center'>
                        {plans.filter(plan => !(currentPlan?.status === 'canceled' && plan.title === 'Basic')).map((plan) => (
                          <Grid item key={plan.title} xs={12} sm={6} md={3}>
                            <PricingCard plan={plan} email={user?.email} userid={user?.uid} currentPlan={currentPlan} remainingDays={remainingDays}/>
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
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
        >
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              {loading ? (
                <CircularProgress />
              ) : message ? (
                <DialogContentText variant='h5' padding={1} sx={{textAlign:'center'}}>
                   <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CheckCircleIcon color="success" sx={{fontSize:60}} />
                   </Box>
                  {message}
                </DialogContentText>
              ) : (
                <DialogContentText sx={{textAlign:'center'}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <WarningAmber color="warning" sx={{fontSize:60}} />
                 </Box>
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </DialogContentText>
              )}
            </Box>
          </DialogContent>
            <DialogActions>
              {message ? (
                <Button onClick={() => {
                  handleCloseDialog(); // Close the dialog
                  window.location.reload(); // Reload the page
                }} color="primary">
                  Okay
                </Button>
              ) : (
                <>
                  <Button onClick={handleCloseDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleCancelSubscription} color="secondary" disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm'}
                  </Button>
                </>
              )}
            </DialogActions>
        </Dialog>
      </Container>
  );
}

export default SubscriptionPlans;