import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AppBar from "../src/components/Appbar";
import LoginPage from "./containers/LoginPage";
import OptimizeCvPage from "./containers/OptimizeCvPage";
import LandingPage from "./containers/LandingPage";
import SubscriptionPage from "./containers/SubscriptionPage";
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import TermsAndConditions from "./containers/TermsPage";
import PrivacyPolicy from "./containers/PrivacyPage";
import PaymentSuccessPage from "./containers/PaymentSuccessPage";
import BuildCvPage from "./containers/BuildCvPage";
import Loading from "./components/Loading";
import FAQPage from "./containers/FAQPage";
import ContactPage from "./containers/ContactPage";

// ProtectedRoute Component
const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load the saved theme mode from localStorage or default to system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const savedMode = localStorage.getItem('themeMode');
  const initialMode = savedMode || (prefersDarkMode ? 'dark' : 'light');
  const [mode, setMode] = useState(initialMode);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? "#ff7043" : "#ff9100",
      },
      background: {
        default: mode === 'light' ? "#f5f5f5" : "#121212",
        paper: mode === 'light' ? "#ffffff" : "#1e1e1e",
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Save the new mode to localStorage
      return newMode;
    });

    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {

    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
  

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();

  }, [navigate,isDarkMode]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <Loading/>
          </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar toggleTheme={toggleTheme} mode={mode} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
            <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route
              path="/optimize"
              element={
                <ProtectedRoute user={user}>
                  <OptimizeCvPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upgrade"
              element={
                <ProtectedRoute user={user}>
                  <SubscriptionPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/makecv"
              element={
                <ProtectedRoute user={user}>
                  <BuildCvPage user={user} theme={theme}/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/success"
              element={
                <ProtectedRoute user={user}>
                  <PaymentSuccessPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/t&c" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;