require('dotenv').config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();


app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json(
  {verify: (req,res,buf)=>{
    req.rawBody = buf
  }}
))

// Use CORS for all routes
app.use(cors({
  origin: '*', // Allow requests from your frontend
  methods: ['POST', 'GET', 'OPTIONS'],
}));

// Use bodyParser.json for regular endpoints



const createCustomer = async (email) => {
  try {
    const customer = await stripe.customers.create({
      email: email, // Ensure you have an email to create a customer
    });
    return customer.id; // Return the new customer ID
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error; // Re-throw the error to handle it in the main function
  }
};

app.post('/get-customer-id', async (req, res) => {
  const { email } = req.body; // Identify the customer, usually by email or user ID.

  try {
    // Check if a customer already exists
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0]; // Customer found
    } else {
      // Create a new customer if not found
      customer = await stripe.customers.create({
        email,
      });
    }

    res.status(200).json({ customerId: customer.id });
  } catch (error) {
    console.error('Error fetching/creating customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer ID' });
  }
});

// Create Checkout Session Endpoint
app.post("/create-checkout-session", async (req, res) => {
  let { priceId, email , customerId , userid } = req.body; // Pass email to create customer

  console.log("Received request:", req.body);

  if (!priceId) {
    console.error("Missing priceId");
    return res.status(400).json({ error: "Missing priceId" });
  }

  try {

    // Check if the customer exists in Stripe
    if (!customerId) {
      console.log("No customerId provided. Creating a new customer.");
      customerId = await createCustomer(email);
    } else {
      try {
        // Try retrieving the existing customer
        await stripe.customers.retrieve(customerId);
      } catch (err) {
        if (err.code === 'resource_missing') {
          console.log(`Customer not found. Creating a new customer with email: ${email}`);
          customerId = await createCustomer(email); // Create new customer and update customerId
        } else {
          throw err; // Re-throw if it's another type of error
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/home`,
      customer: customerId, // Use the customerId now
      metadata: {
        firebaseUid: userid, // Add Firebase UID to metadata
      },
    });

    //console.log("Session created:", session);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session", details: error.message });
  }
});

// Cancel Subscription Endpoint


// Webhook Endpoint (for Stripe to send events)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  
  console.log('Webhook received');

  const sig = req.headers['stripe-signature'];

  let event;
  
  try {
    console.log('Constructing event');
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Event constructed successfully');
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Processing event:', event.type);
  // Your event handling logic here...
  console.log('Event processed');

  res.json({ received: true });
  console.log('Response sent');

  // Handle the event based on its type
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const customerId = session.customer; // Get customer ID from session
      const subscriptionId = session.subscription; // Get subscription ID
      const firebaseUid = session.metadata.firebaseUid;
      console.log(`Subscription ${subscriptionId} for customer ${customerId} completed.`);

      // Update user subscription status in Firestore
      const userRef = db.collection("users").doc(firebaseUid);
      const planNickname = session?.display_items?.[0]?.plan?.nickname || "default plan";


      // Check if the user document exists
      const userDoc = await userRef.get(); // Get the document to check its existence

      if (!userDoc.exists) {
        console.log(`User document for customer ${customerId} does not exist.`);
        // Optionally, you could create the user document here if needed
        await userRef.set({
          customerId: customerId, // Save customer ID for reference
          subscriptionId: subscriptionId,
          plan: planNickname, // Weekly, Monthly, Yearly plan name
          status: "active", // Set the user's plan as active
        });
        console.log(`User document created for customer ${customerId}`);
      } else {
        try {
          await userRef.set({
            subscriptionId: subscriptionId,
            plan: planNickname, // Weekly, Monthly, Yearly plan name
            status: "active", // Set the user's plan as active
          }, { merge: true });
          console.log(`Firestore updated successfully for customer ${customerId}`);
        } catch (error) {
          console.error("Error updating Firestore:", error);
        }
      }

      break;

    case "invoice.payment_failed":
      const invoice = event.data.object;
      const invoiceCustomerId = invoice.customer; // Get customer ID from invoice

      console.log(`Invoice payment for ${invoiceCustomerId} failed.`);

      // Update user payment status in Firestore
      const invoiceUserRef = db.collection('users').doc(invoiceCustomerId);
      await invoiceUserRef.set({
        status: "payment_failed", // Set payment status to failed
      }, { merge: true });

      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});


app.post('/cancel-subscription', async (req, res) => {
  const { subscriptionId, firebaseUid } = req.rawBody;
  console.log(req.body);
  if (!subscriptionId || !firebaseUid) {
    return res.status(400).json({ error: 'Missing subscriptionId or firebaseUid' });
  }

  try {
    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.del(subscriptionId);

    if (canceledSubscription.status === 'canceled') {
      // Update the user's Firestore document to reflect the canceled status
      const userRef = db.collection('users').doc(firebaseUid);
      await userRef.set(
        {
          status: 'canceled',
          subscriptionEndDate: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
        },
        { merge: true }
      );
      console.log(`Subscription ${subscriptionId} canceled successfully for user ${firebaseUid}`);
      res.status(200).json({ message: 'Subscription canceled successfully' });
    } else {
      throw new Error('Failed to cancel the subscription');
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription', details: error.message });
  }
});
// Start the server
app.listen(4000, () => console.log("Server running on port 4000"));