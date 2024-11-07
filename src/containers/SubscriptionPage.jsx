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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber,
  Star as StarIcon,
} from '@mui/icons-material';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import SubscriptionStatus from '../components/SubscriptionStatus'

const StyledCard = styled(Card)(({ theme, isPopular }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
  border: isPopular ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxShadow: isPopular ? theme.shadows[10] : theme.shadows[1],
  position: 'relative',
}));

const PopularBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 'bold',
  fontSize: '0.6rem',
  zIndex: 1,
}));

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
    priceId: '',
  },
  {
    title: 'Weekly',
    price: '£4.99',
    period: '/week',
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Cover letter generator',
      'Build your CV with AI',
      'Priority email support',
    ],
    priceId: 'price_1Q5SYtII1U3Mnymtjf3Hmhmr',
  },
  {
    title: 'Monthly',
    price: '£14.99',
    period: '/month',
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Cover letter generator',
      'Build your CV with AI',
      'Priority email support',
    ],
    priceId: 'price_1Q5SXhII1U3MnymtN4KJ1hrL',
  },
  {
    title: 'Yearly',
    price: '£109.99',
    period: '/year',
    features: [
      'All Basic features',
      'Unlimited CV optimizations',
      'Cover letter generator',
      'Build your CV with AI',
      'Priority email support',
      '2 months free',
    ],
    priceId: 'price_1Q5SbsII1U3MnymtvhCIboGJ',
    isPopular: true,
  },
];

function PricingCard({ plan, email, userid, currentPlan, remainingDays }) {
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [switchPlan, setSwitchPlan] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const getCustomerId = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-customer-id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error(`Error fetching customer ID: ${response.statusText}`);
        const data = await response.json();
        setCustomerId(data.customerId);
      } catch (error) {
        console.error('Error fetching customer ID:', error);
      }
    };

    getCustomerId();
    if (currentPlan) setSwitchPlan(true);
  }, [email, currentPlan]);

  const handleSubscribe = async () => {
    setLoading(true);
    if (switchPlan) setDialogLoading(true);
    const endpoint = switchPlan ? '/switch-subscription' : '/create-checkout-session';
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId, email, customerId, userid, planName: plan.title }),
      });
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        setMessage('Switching has been successful!');
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
      setDialogLoading(false);
    }
  };

  const handleConfirmSwitch = () => setOpenDialog(true);
        const handleCloseDialog = () => setOpenDialog(false);

  return (
    <StyledCard isPopular={plan.isPopular}>
      {plan.isPopular && <PopularBadge>Most Popular</PopularBadge>}
      <CardHeader
        title={plan.title}
        titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
        sx={{
          backgroundColor: plan.isPopular 
            ? (theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main)
            : (theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]),
          color: plan.isPopular 
            ? theme.palette.common.white 
            : (theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.text.primary),
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
        {plan.title !== 'Basic' && (
          <Button
            fullWidth
            variant={plan.isPopular ? 'contained' : 'outlined'}
            color="primary"
            size="large"
            onClick={switchPlan ? handleConfirmSwitch : handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Processing...' : switchPlan ? 'Switch Plan' : 'Subscribe'}
          </Button>
        )}
      </CardActions>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {dialogLoading ? (
              <>
                <CircularProgress size={50} />
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Switching your subscription...
                </Typography>
              </>
            ) : message ? (
              <>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
                <DialogContentText variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {message}
                </DialogContentText>
              </>
            ) : (
              <>
                <WarningAmber sx={{ fontSize: 60, mb: 1,color:'red' }} />
                <DialogContentText sx={{ mt: 2, fontSize: '1.1rem', color: 'text.secondary' }}>
                  Are you sure you want to switch your subscription? This action cannot be undone.
                </DialogContentText>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          {message ? (
            <Button
              onClick={() => { handleCloseDialog(); window.location.reload(); }}
              color="primary"
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Okay
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCloseDialog}
                color="primary"
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubscribe}
                color="secondary"
                variant="contained"
                sx={{ minWidth: 100, ml: 2 }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

    </StyledCard>
  );
}

function SubscriptionPlans({ user }) {
  const [remainingDays, setRemainingDays] = useState();
  const [currentPlan, setCurrentPlan] = useState();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (user?.uid) {
        try {
          const planRef = doc(firestore, "users", user.uid);
          const planSnap = await getDoc(planRef);
          if (planSnap.exists()) {
            const planData = planSnap.data();
            setCurrentPlan(planData);
            if (planData.subscriptionEndDate) {
              const now = dayjs();
              const subscriptionEnd = dayjs(planData.subscriptionEndDate);
              setRemainingDays(subscriptionEnd.diff(now, "days"));
            }
          }
        } catch (error) {
          console.error("Error fetching plan details:", error);
        }
      }
    };
    fetchPlanDetails();
  }, [user]);

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentPlan.subscriptionId,
          firebaseUid: user?.uid,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Your subscription has been canceled successfully');
      } else {
        setMessage(`Failed to cancel subscription: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error canceling subscription: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubscription = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <AnimatePresence>
        {currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {currentPlan.plan === "free" ? (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  Choose Your Plan
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Select the plan that best fits your needs and take your career to the next level with NexaAI.
                </Typography>
                <Grid container spacing={4} justifyContent="center">
                  {plans.map((plan) => (
                    <Grid item key={plan.title} xs={12} sm={6} md={3}>
                      <PricingCard plan={plan} email={user?.email} userid={user?.uid} currentPlan={null} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <>
                <SubscriptionStatus currentPlan={currentPlan} remainingDays={remainingDays} handleConfirmSubscription={handleConfirmSubscription} />
                {currentPlan.status === 'active' && (
                  <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                      Switch Your Subscription
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                      Upgrade or change your plan to better suit your needs.
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                      {plans
                        .filter(plan => plan.title !== 'Basic')
                        .map(plan => (
                          <Grid item key={plan.title} xs={12} sm={6} md={3}>
                            <PricingCard plan={plan} email={user?.email} userid={user?.uid} currentPlan={currentPlan} />
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}
                {currentPlan.status === 'canceled' && (
                  <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                      Reactivate Your Subscription
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                      Choose a plan to continue enjoying our premium features.
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                      {plans
                        .filter(plan => plan.title !== 'Basic')
                        .map(plan => (
                          <Grid item key={plan.title} xs={12} sm={6} md={3}>
                            <PricingCard plan={plan} email={user?.email} userid={user?.uid} currentPlan={currentPlan} remainingDays={remainingDays} />
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {loading ? (
              <CircularProgress size={50} />
            ) : message ? (
              <>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
                <DialogContentText variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {message}
                </DialogContentText>
              </>
            ) : (
              <>
                <WarningAmber sx={{ fontSize: 60, mb: 1 ,color:'red'}} />
                <DialogContentText sx={{ mt: 2, fontSize: '1.1rem' }}>
                  Are you sure you want to cancel your subscription? This action cannot be undone.
                </DialogContentText>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          {message ? (
            <Button
              onClick={() => { handleCloseDialog(); window.location.reload(); }}
              color="primary"
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Okay
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCloseDialog}
                color="primary"
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCancelSubscription}
                color="secondary"
                variant="contained"
                sx={{ minWidth: 100, ml: 2 }}
                disabled={loading}
              >
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