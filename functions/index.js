require('dotenv').config();
const functions = require("firebase-functions");
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json(
  {
    verify: (req, res, buf) => {
      req.rawBody = buf
    }
  }
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

app.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Check if the invoice has a downloadable PDF
    if (invoice && invoice.invoice_pdf) {
      // If the invoice can be downloaded, send a response to indicate that
      return res.json({ download: true, pdfUrl: invoice.invoice_pdf });
    } else {
      // If the invoice cannot be downloaded, return the invoice details
      return res.json({ download: false, invoice });
    }
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    res.status(500).send('Error retrieving invoice');
  }
});


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
  let { priceId, email, customerId, userid, planName } = req.body; // Pass email to create customer

  console.log("Received request:", req.body);

  if (!priceId) {
    console.error("Missing priceId");
    return res.status(400).json({ error: "Missing priceId" });
  }

  try {
    // Check if the customer exists in Stripe
      try {
        // Try retrieving the existing customer
        if (customerId) {
          await stripe.customers.retrieve(customerId);
          console.log(`Customer ${customerId} found.`);
        }
      } catch (err) {
        if (err.code === 'resource_missing') {
          console.log(`Customer not found. Creating a new customer with email: ${email}`);
          customerId = await createCustomer(email); // Create new customer and update customerId
        } else {
          throw err; // Re-throw if it's another type of error
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
        firebaseUid: userid,
        planName: planName, // Add Firebase UID to metadata
      },
    });

    //console.log("Session created:", session);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session", details: error.message });
  }
});

app.post('/switch-subscription', async (req, res) => {
  const { userid, priceId ,planName} = req.body;

  if (!userid || !priceId) {
    return res.status(400).json({ error: 'Missing userid or priceId' });
  }
  try {
    // Get the user's Firestore document to find the current subscription ID
    const userRef = db.collection('users').doc(userid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { subscriptionId } = userDoc.data();

    if (!subscriptionId) {
      return res.status(400).json({ error: 'User does not have an active subscription' });
    }

    // Retrieve the current subscription in Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription with the new price ID
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId, // New price ID for the plan
      }],
      proration_behavior: 'create_prorations', // Ensures that Stripe prorates the charges
    });

    // Update Firestore with the new plan details
    await userRef.set(
      {
        plan: planName,
        status: "active", // Keep status as active
        subscriptionEndDate: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      },
      { merge: true }
    );

    console.log(`Subscription ${subscriptionId} updated to new plan ${priceId} for user ${userid}`);
    res.status(200).json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Error switching subscription:', error);
    res.status(500).json({ error: 'Failed to switch subscription', details: error.message });
  }
});

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

  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const customerId = session.customer; // Stripe customer ID
      const subscriptionId = session.subscription; // Stripe subscription ID
      const email = session.customer_email; // Customer's email from the session
      const firebaseUid = session.metadata.firebaseUid;
      const planName = session.metadata.planName;
      const invoiceId = session.invoice;
      
      console.log(`Subscription ${subscriptionId} for customer ${customerId} completed for email ${email}.`);
      const userRef = db.collection("users").doc(firebaseUid);
      // Get the plan nickname (optional chaining to avoid undefined errors)
      // Fetch subscription details from Stripe
      let subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log('Subscription details:', subscription);
      } catch (error) {
        console.error("Error fetching subscription details:", error);
        return res.status(500).send("Error fetching subscription details");
      }

      // const subscriptionStartDate = new Date(subscription.current_period_start * 1000).toISOString(); // Convert from Unix timestamp
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString(); // Convert from Unix timestamp
  

      // Step 2: Update the existing user document
      try {
        await userRef.set(
          {
            subscriptionId: subscriptionId,  // Stripe subscription ID from session
            plan: planName,                    // Plan name (e.g., Weekly, Monthly, Yearly)
            status: "active",  // Mark the user's subscription as active
            subscriptionStartDate: new Date(session.created * 1000),  // Start date of the subscription
            subscriptionEndDate: subscriptionEndDate, 
            invoiceId: invoiceId,     
          },
          { merge: true }  // Merge the data to avoid overwriting other user details
        );
        console.log(`Firestore updated successfully for user with UID ${firebaseUid}`);
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }

      break;

    case "invoice.payment_failed":
      const invoice = event.data.object;
      const invoiceCustomerId = invoice.customer;

      console.log(`Invoice payment for ${invoiceCustomerId} failed.`);

      // Update Firestore user document for payment status
      const invoiceUserRef = db.collection('users').doc(invoiceCustomerId);
      await invoiceUserRef.set({
        status: "payment_failed",
      }, { merge: true });

      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Respond to acknowledge receipt of the event
  res.json({ received: true });
});

app.post('/cancel-subscription', async (req, res) => {
  const { subscriptionId, firebaseUid , planName} = req.body;

  if (!subscriptionId || !firebaseUid) {
    return res.status(400).json({ error: 'Missing subscriptionId or firebaseUid' });
  }

  try {
    // Update the subscription to cancel at the end of the billing period
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    if (updatedSubscription.cancel_at_period_end) {
      // Update Firestore with the new cancellation status
      const userRef = db.collection('users').doc(firebaseUid);
      await userRef.set(
        {
          status: 'canceled',
          subscriptionEndDate: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        },
        { merge: true }
      );
      console.log(`Subscription ${subscriptionId} will be canceled at the end of the period for user ${firebaseUid}`);
      res.status(200).json({ message: 'Subscription will be canceled at the end of the billing period' });
    } else {
      throw new Error('Failed to update the subscription to cancel at the end of the period');
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription', details: error.message });
  }
});

// Export the Express app as a Firebase function
exports.app = functions.region('europe-west2').https.onRequest(app);
