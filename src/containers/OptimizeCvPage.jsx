import React, { useState, useEffect, useCallback  } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Alert,
  AlertTitle,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Chip,
  Checkbox,
  FormControlLabel,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
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
import { createTheme, ThemeProvider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import { styled } from "@mui/material/styles";

// API KEY
const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });
const steps = ['Upload Resume', 'Enter Job Description', 'View Results'];
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
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
}));
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
const OptimizeCvPage = ({ user }) => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [remainingUses, setRemainingUses] = useState(MAX_FREE_USES_PER_DAY);
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);
  // State for controlling the dialog popup
  const [openDialog, setOpenDialog] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const coverLetterPrompt = generateCoverLetter
    ? "Generate a cover letter tailored to the job description based on my resume. Ensure that it is concise and relevant to the position."
    : "";
    return groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "user",
          content: "I need help optimizing my resume for a specific job application. Here is my current resume:" + resume + " and here is the job description: " + jobDescription +
            ` Analyse if the resume matches with the job description. If the resume does not match with the job description do not make any resume. 
            If the resume aligns with the job description do the following: Prioritize highlighting relevant skills, projects, and achievements that align with the job description.
             Additionally, pinpoint key terms from the job description that can be integrated into my resume and are similar to my existing skills. 
             Avoid removing or adding skills that are not already present. Based on this, generate an updated resume tailored to the job description. 
             no need to provide suggestions just generate update cv based on your analysis. create cv using markdown 
              ${coverLetterPrompt}
             `
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

      if (isFreeUser) {
        await incrementUsageCount(userDocRef);
      }
      setActiveStep(2);
    } catch (err) {
      setError(`Error analyzing resume: ${err.message}`);
    } finally {
      setIsLoading(false);
      setActiveStep(2);
    }
  };
  // Check user plan and show popup
  return (
    <>
          <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
        AI-Powered Resume Optimizer
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Enhance your resume with our advanced AI technology
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        {isFreeUser ? <FreeUserBadge /> : isPremiumUser ? <PremiumUserBadge /> : null}
      </Box>

      {isFreeUser && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
          <AlertTitle>Upgrade to Pro</AlertTitle>
          <Typography variant="body2">
            You have {remainingUses} free uses left. For unlimited access and premium features,{' '}
            <RouterLink to="/upgrade" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
              upgrade to Pro
            </RouterLink>
            .
          </Typography>
        </Alert>
      )}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <StyledCard>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={generateCoverLetter}
                  onChange={(e) => setGenerateCoverLetter(e.target.checked)}
                  disabled={isFreeUser}
                />
              }
              label="Generate Cover Letter"
            />
            {isFreeUser && (
              <Typography variant="caption" color="text.secondary" display="block">
                Upgrade to Pro to generate a cover letter.
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Upload Resume (PDF or DOCX)</Typography>
            <StyledButton
              color="primary"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => document.getElementById('resume-upload').click()}
              fullWidth={isMobile}
            >
              Choose File
            </StyledButton>
            <Typography variant="caption" sx={{ ml: 2 }}>{file ? file.name : 'No file chosen'}</Typography>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

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
            sx={{ mb: 3 }}
          />

          <StyledButton
            onClick={handleAnalyze}
            disabled={isLoading || !fileContent}
            variant="contained"
            color="primary"
            fullWidth
            startIcon={isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          >
            {isLoading ? "Analyzing..." : "Optimize Resume"}
          </StyledButton>
        </CardContent>
      </StyledCard>

      {results && (
        <StyledCard sx={{ mt: 4 }}>
          <CardHeader title="Optimization Suggestions" />
          <CardContent>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <ReactMarkdown>{results}</ReactMarkdown>
            </Box>
          </CardContent>
        </StyledCard>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{"Daily Limit Reached"}</DialogTitle>
        <DialogContent>
          <Typography>You have reached the daily limit of free uses. Upgrade to pro for unlimited access.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
          <StyledButton
            onClick={() => { window.location.href = "/upgrade"; }}
            color="primary"
            variant="contained"
          >
            Upgrade to Pro
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
    </>
  );
};

export default OptimizeCvPage;
