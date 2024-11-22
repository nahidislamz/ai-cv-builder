import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  CircularProgress,
  useTheme,
  DialogTitle,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import SubscriptionStatus from '../components/SubscriptionStatus'
import PricingCards from '../components/PricingCards';
import { GradientTypography, StyledButton,StyledPaper } from '../components/utils/shareComponent';
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
];

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
        setLoading(true);
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
        } finally {
          setLoading(false);
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
      setOpenDialog(false);
    }
  };

  const handleConfirmSubscription = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <AnimatePresence>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : currentPlan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <StyledPaper elevation={1}>
              {currentPlan.plan === "free" ? (
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <GradientTypography variant="h3" gutterBottom>
                    Choose Your Plan
                  </GradientTypography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Select the plan that best fits your needs and take your career to the next level with NexaAI.
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                      gap: { xs: 2, md: 4 },
                      alignItems: 'stretch',
                    }}
                  >
                    {plans.map((plan) => (
                      <PricingCards key={plan.title} plan={plan} email={user?.email} userid={user?.uid} currentPlan={null} />
                    ))}
                  </Box>
                </Box>
              ) : (
                <>
                  <SubscriptionStatus currentPlan={currentPlan} remainingDays={remainingDays} handleConfirmSubscription={handleConfirmSubscription} />
                  {currentPlan.status === 'active' && (
                    <Box sx={{ mt: { xs: 4, md: 6 }, textAlign: 'center' }}>
                      <GradientTypography variant="h4" gutterBottom>
                        Switch Your Subscription
                      </GradientTypography>
                      <Typography variant="body1" sx={{ mb: 4, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        Upgrade or change your plan to better suit your needs.
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: { xs: 2, md: 4 },
                          alignItems: 'stretch',
                        }}
                      >
                        {plans.filter(plan => plan.title !== 'Basic').map(plan => (
                          <PricingCards key={plan.title} plan={plan} email={user?.email} userid={user?.uid} currentPlan={currentPlan} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {currentPlan.status === 'canceled' && (
                    <Box sx={{ mt: { xs: 4, md: 6 }, textAlign: 'center' }}>
                      <GradientTypography variant="h4" gutterBottom>
                        Reactivate Your Subscription
                      </GradientTypography>
                      <Typography variant="body1" sx={{ mb: 4, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        Choose a plan to continue enjoying our premium features.
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: { xs: 2, md: 4 },
                          alignItems: 'stretch',
                        }}
                      >
                        {plans.filter(plan => plan.title !== 'Basic').map(plan => (
                          <PricingCards key={plan.title} plan={plan} email={user?.email} userid={user?.uid} currentPlan={currentPlan} remainingDays={remainingDays} />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </StyledPaper>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Subscription Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No, Keep My Subscription
          </Button>
          <StyledButton onClick={handleCancelSubscription} color="primary" autoFocus>
            Yes, Cancel Subscription
          </StyledButton>
        </DialogActions>
      </Dialog>

      {message && (
        <Snackbar
          open={!!message}
          autoHideDuration={6000}
          onClose={() => setMessage('')}
          message={message}
        />
      )}
    </Container>
  );
}

export default SubscriptionPlans;