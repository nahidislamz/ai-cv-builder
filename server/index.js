require('dotenv').config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const nodemailer = require('nodemailer');
const app = express();
const serviceAccount = require("./config.json"); // Use env variables in production

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
const actionCodeSettings = {
  url: 'https://www.cvoptimizer.com/login', // Replace with your actual domain and path
  handleCodeInApp: true,
};

const generateSignInLink = async (email) => {
  try {
    const link = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);
    if (!link) {
      throw new Error('Sign-in link is null or undefined.');
    }
    return link;
  } catch (error) {
    console.error('Error generating sign-in li nk:', error.code, error.message);
    throw new Error(`Failed to generate sign-in link: ${error.message}`);
  }  
};

app.post('/send-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: 'Email are required' });
  } 
  const link = await generateSignInLink(email);
  console.log(link)

  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: true
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CV Optimizer</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    </style>
</head>
<body style="font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="min-width: 100%; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                    <tr>
                        <td style="padding: 0;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #ef709b  30%, #fa9372 90%); padding: 40px 0; text-align: center;">
                                        <h1 style="color: #ffffff; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to CV Optimizer</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">We're excited to have you on board! To get started with optimizing your CV, please sign in to your account.</p>
                                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                            <tr>
                                                <td align="center" style="padding: 30px 0; text-align="center">
                                                    <a href="${link}" 
                                                       style="background: linear-gradient(135deg, #ef709b  30%, #fa9372 90%);
                                                              color: white; 
                                                              padding: 14px 30px; 
                                                              text-decoration: none; 
                                                              border-radius: 50px;
                                                              font-weight: 600;
                                                              font-size: 16px;
                                                              display: inline-block;
                                                              transition: all 0.3s ease;
                                                              box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
                                                        Sign In
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">If you did not request this email, you can safely ignore it.</p>
                                        <p style="color: #718096; font-size: 12px; line-height: 1.6; margin: 10px 0 0;">Alternatively, you can copy and paste this link into your browser:</p>
                                        <p style="color: #4a5568; font-size: 12px; line-height: 1.6; margin: 5px 0 0; word-break: break-all;">${link}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                        <p style="color: #718096; font-size: 12px; margin: 0;">© 2024 CV Optimizer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;

  const mailOptions = {
    from: {
      name: 'CV Optimizer',
      address: 'support@cvoptimizer.com'
    },
    to: email,
    subject: 'Sign in to CV Optimizer',
    html: emailTemplate,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    res.status(200).send({ 
      message: 'Email sent successfully',
      link: link // Return the formatted link for verification
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});


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

// Switch Subscription
app.post('/switch-subscription', async (req, res) => {
  const { userid, priceId } = req.body;

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
    const newPlanNickname = updatedSubscription.items.data[0].plan.nickname || "new plan";
    await userRef.set(
      {
        plan: newPlanNickname,
        status: "active", // Keep status as active
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



// Cancel Subscription Endpoint
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