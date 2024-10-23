const admin = require('firebase-admin');
// Firebase Admin SDK setup
const serviceAccount = require("./config.json"); // Use env variables in production

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;