import React ,{ useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { StyledButton } from './utils/shareComponent';
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
  background: theme.palette.background.paper,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  borderRadius: '16px',
}));

const PriceTag = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #ef709b 30%, #fa9372 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
}));


const StyledListItemIcon = styled(ListItemIcon)({
  minWidth: '36px',
  '& .MuiSvgIcon-root': {
    color: '#fa9372',
  },
});

const PricingCards = ({plan, email, userid, currentPlan}) => {
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
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box>
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plan.index * 0.2 }}
          >
            <StyledCard>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 4 }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ mb: 3, fontWeight: 600 }}
                >
                  {plan.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 4 }}>
                  <PriceTag variant="h3">{plan.price}</PriceTag>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: 'text.secondary', ml: 1 }}
                  >
                    {plan.period}
                  </Typography>
                </Box>
                <List sx={{ mb: 4 }}>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ px: 0 }}>
                      <StyledListItemIcon>
                        <CheckCircleIcon />
                      </StyledListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{
                          sx: { fontWeight: 500 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                {plan.title!=='Basic' && (
                      <StyledButton
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={switchPlan ? handleConfirmSwitch : handleSubscribe}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : switchPlan ? 'Switch Plan' : 'Subscribe'}
                      </StyledButton>
                )}

              </CardContent>
            </StyledCard>
          </motion.div>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Subscription Switch</DialogTitle>
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
                <DialogContentText sx={{fontSize: '1.1rem', color: 'text.secondary' }}>
                  Are you sure you want to switch your subscription? This action cannot be undone.
                </DialogContentText>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          {message ? (
            <StyledButton
              onClick={() => { handleCloseDialog(); window.location.reload(); }}
              color="primary"
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Okay
            </StyledButton>
          ) : (
            <>
              <Button
                onClick={handleCloseDialog}
                color="primary"
                sx={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <StyledButton
                onClick={handleSubscribe}
                color="secondary"
                variant="contained"
                sx={{ minWidth: 100, ml: 2 }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Switch'}
              </StyledButton>
            </>
          )}
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default PricingCards;