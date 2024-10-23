import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AppBar from "../src/components/Appbar";
import LoginPage from "./containers/LoginPage";
import HomePage from "./containers/HomePage";
import SubscriptionPage from "./containers/SubscriptionPage";
import { Box, CssBaseline, ThemeProvider, createTheme, CircularProgress } from "@mui/material";
import TermsAndConditions from "./containers/TermsPage";
import PrivacyPolicy from "./containers/PrivacyPage";
import PaymentSuccessPage from "./containers/PaymentSuccessPage";
import BuildCvPage from "./containers/BuildCvPage";
import Loading from "./components/Loading";

function App() {
  const [user, setUser] = useState(null); // Track the logged-in user
  const [loading, setLoading] = useState(true); // Track loading state
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      primary: {
        main: "#ff7043",
      },
      background: {
        default: "#f5f5f5",
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false); // Set loading to false after the check is done
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    // Show a spinner while loading
    return (

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Loading/>
        </Box>)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>

        <AppBar user={user} /> 
        <Routes>
          {/* Redirect from "/" to either home or login */}
          <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />

          {/* Login Page: Only accessible to unauthenticated users */}
          <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />

          {/* HomePage protected route */}
          <Route
            path="/home"
            element={user ? <HomePage user={user} /> : <Navigate to="/login" />}
          />

          {/* Subscription Page: Accessible to all users */}
          <Route path="/upgrade" element={<SubscriptionPage user={user} />} />
          <Route path="/makecv" element={<BuildCvPage />} />
          <Route path="/t&c" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/success" element={<PaymentSuccessPage />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
