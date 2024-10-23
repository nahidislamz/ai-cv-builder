import React, { useState, useEffect, useCallback  } from "react";
import { Link, Button, Card, CardContent, CardHeader, CardActions, TextField, Alert, AlertTitle, Typography, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Container } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import ErrorIcon from '@mui/icons-material/Error';
import Groq from "groq-sdk";
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';  // Import the pdfToText function
import ReactMarkdown from "react-markdown";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Warning } from "@mui/icons-material";
import { Link as RouterLink } from 'react-router-dom';
import { Chip, createTheme, ThemeProvider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
// API KEY
const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });

const MAX_FREE_USES_PER_DAY = 3;
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff7043', // You can adjust this to your preferred primary color
    },
    secondary: {
      main: '#f50057', // You can adjust this for the premium badge color
    },
  },
});

const FreeUserBadge = () => {
  return (
    <ThemeProvider theme={theme}>
      <Chip
        icon={<PersonIcon />}
        label="Free User"
        color="primary"
        variant="outlined"
        size="small"
      />
    </ThemeProvider>
  );
};

const PremiumUserBadge = () => {
  return (
    <ThemeProvider theme={theme}>
      <Chip
        icon={<StarIcon />}
        label="Premium User"
        color="secondary"
        variant="filled"
        size="small"
        sx={{mb:1}}
      />
    </ThemeProvider>
  );
};
const HomePage = ({ user }) => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [remainingUses, setRemainingUses] = useState(MAX_FREE_USES_PER_DAY);

  // State for controlling the dialog popup
  const [openDialog, setOpenDialog] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Check daily usage from localStorage

  const checkUserPlan = useCallback(async (uid) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userPlan = userData.plan || 'free';

        if (userPlan === 'free') {
          setIsFreeUser(true);
          await checkDailyUsage(userDocRef); // Make sure this is defined and imported
        }
        else if (userPlan === 'Yearly' || 'Monthly' || 'Weekly') {
          setIsPremiumUser(true);
          // Logic for premium users can go here, if needed
        }
      }
      
    } catch (error) {
      console.error("Error fetching or creating user plan: ", error);
    }
  }, []);

  useEffect(() => {
    // Only check user plan if user information is available
    if (user?.uid) {
      checkUserPlan(user.uid);
    }
  }, [checkUserPlan,user]);

  const checkDailyUsage = async (userDocRef) => {
    try {
      const userDoc = await getDoc(userDocRef);
      const usageData = userDoc.data().usage;

      if (usageData.date !== new Date().toDateString()) {
        // Reset usage count for a new day
        await updateDoc(userDocRef, { usage: { date: new Date().toDateString(), count: 0 } });
        setRemainingUses(MAX_FREE_USES_PER_DAY);
      } else {
        setRemainingUses(MAX_FREE_USES_PER_DAY - usageData.count);
      }
    } catch (error) {
      console.error("Error checking daily usage: ", error);
    }
  };

  const incrementUsageCount = async (userDocRef) => {
    try {
      const userDoc = await getDoc(userDocRef);
      const usageData = userDoc.data().usage;

      usageData.count += 1;
      await updateDoc(userDocRef, { usage: usageData });
      setRemainingUses(MAX_FREE_USES_PER_DAY - usageData.count);
    } catch (error) {
      console.error("Error incrementing usage count: ", error);
    }
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const fileType = uploadedFile.type;

    try {
      let text = '';
      if (fileType === 'application/pdf') {
        text = await extractTextFromPDF(uploadedFile);  // Use the new extractTextFromPDF function
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await extractTextFromDOCX(uploadedFile);  // Await DOCX text extraction
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }
      setFileContent(text);
      setError(null);
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
      setFileContent("");
    }
  };

  // Use react-pdftotext to extract text from PDF
  const extractTextFromPDF = async (file) => {
    try {
      const text = await pdfToText(file);
      return text;
    } catch (error) {
      throw new Error("Failed to extract text from PDF: " + error.message);
    }
  };

  // DOCX text extraction using mammoth
  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  // Send the resume and job description to Groq for analysis
  const getGroqChatCompletion = async (resume, jobDescription) => {
    return groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "user",
          content: "I need help optimizing my resume for a specific job application. Here is my current resume:" + resume + " and here is the job description: " + jobDescription +
            " Analyse if the resume matches with the job description. If the resume does not match with the job description do not make any resume. If the resume aligns with the job description do the following: Prioritize highlighting relevant skills, projects, and achievements that align with the job description. Additionally, pinpoint key terms from the job description that can be integrated into my resume and are similar to my existing skills. Avoid removing or adding skills that are not already present. Based on this, generate an updated resume tailored to the job description. no need to provide suggestions just generate update cv based on your analysis. create cv using markdown"
        }
      ],
      temperature: 1,
      max_tokens: 2024,
      top_p: 1,
      stream: false,
      stop: null,
    });
  };

  // Analyze the resume with the job description
  const handleAnalyze = async () => {
    if (remainingUses <= 0) {
      setError("You have reached the daily limit of free uses. Please try again tomorrow.");
      setOpenDialog(true);
      return;
    }

    if (!fileContent || !jobDescription) {
      setError("Please upload a resume and provide a job description.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const chatCompletion = await getGroqChatCompletion(fileContent, jobDescription);
      const resultText = chatCompletion.choices[0]?.message?.content || "No results from model.";
      setResults(resultText);

      await incrementUsageCount(userDocRef);
    } catch (err) {
      setError(`Error analyzing resume: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // Check user plan and show popup
  return (
    <>
      <Container sx={{ my: 4 }}>
        <div>
          {isFreeUser ? <FreeUserBadge />
            : isPremiumUser ? <PremiumUserBadge /> : null}
        </div>
        {
          isFreeUser && (
            <Alert severity="warning" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }} icon={<Warning />}>
              <AlertTitle>Upgrade to Pro</AlertTitle>
              {/* Use Link for internal routing or an anchor tag for external link */}
              <Typography variant="body2">
                You are currently on the free plan. you have {remainingUses} uses. To enjoy unlimited access and premium features, please{'  '}
                <Link to="/upgrade" component={RouterLink} color="primary" underline="hover">
                  upgrade to Pro
                </Link>
                .
              </Typography>
            </Alert>
          )
        }
        <Card>
          <CardHeader
            title={<Typography variant="h6">Resume Optimizer</Typography>}
            subheader={<Typography variant="body2">Upload your resume and enter a job description to get personalized optimization suggestions.</Typography>}
          />
          <CardContent>
            <div style={{ marginBottom: '1rem' }}>
              <Typography variant="body1" gutterBottom>Upload Resume (PDF or DOCX)</Typography>
              <Button
                color="primary"
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => document.getElementById('resume-upload').click()}
              >
                Choose File
              </Button>
              <Typography variant="caption" style={{ marginLeft: '1rem' }}>{file ? file.name : 'No file chosen'}</Typography>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            {error && (
              <Alert severity="error" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }} icon={<ErrorIcon />}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <TextField
                id="job-description"
                label="Job Description"
                placeholder="Enter the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                multiline
                rows={5}
                fullWidth
                variant="outlined"
              />
            </div>
          </CardContent>
          <CardActions>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !fileContent}
              variant="contained"
              color="primary"
              fullWidth
              startIcon={isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            >
              {isLoading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </CardActions>
        </Card>

        {results && (
          <Card style={{ marginTop: '1rem' }}>
            <CardHeader
              title={<Typography variant="h6">Optimization Suggestions</Typography>}
            />
            <CardContent>
              <ReactMarkdown>
                {results}
              </ReactMarkdown>
            </CardContent>
          </Card>
        )}


        {/* Dialog for daily limit reached */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{"Daily Limit Reached"}</DialogTitle>
          <DialogContent>
            <Typography>You have reached the daily limit of free uses. Upgrade to pro for unlimited access.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle the upgrade action here
              window.location.href = "/upgrade";  // Example: redirect to upgrade page
            }} color="primary" variant="contained">
              Upgrade to Pro
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default HomePage;
