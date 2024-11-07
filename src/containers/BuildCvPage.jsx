import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Lightbulb ,
  Save,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style.css'
import { motion, AnimatePresence } from 'framer-motion';
import Groq from "groq-sdk";
import { jsPDF } from 'jspdf';
import { firestore } from '../firebase'; // Path to your firebase configuration
import { doc, setDoc, getDoc } from "firebase/firestore";
import RenderCv from '../components/RenderCv';
import htmlDocx from 'html-docx-js/dist/html-docx';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';
import TipsSlider from '../components/TipsSlider'
import CryptoJS from 'crypto-js';
import UploadFileIcon from '@mui/icons-material/UploadFile';
const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });
const secretKey = process.env.REACT_APP_SECRET_KEY ;

const getGroqChatCompletion = async (cvData) => {
    // Extract relevant information from cvData
    const { personalInfo, education, workExperience, skills, certifications, projects, languages, hobbies } = cvData;

    // Format the resume content
    const resume = `
    ## Personal Information
    - Name: ${personalInfo.name}
    - Email: ${personalInfo.email}
    - Phone: ${personalInfo.phone}

    ## Education
    ${education.map(edu => `- **${edu.degree}** from **${edu.school}** (Graduation Year: ${edu.graduationYear})`).join('\n')}

    ## Work Experience
    ${workExperience.map(job => `- **${job.position}** at **${job.company}** (${job.startDate} - ${job.endDate}): ${job.description}`).join('\n')}

    ## Skills
    ${skills.length > 0 ? skills.join(', ') : 'No skills listed.'}

    ## Certifications
    ${certifications.length > 0 ? certifications.join(', ') : 'No certifications listed.'}

    ## Projects
    ${projects.length > 0 ? projects.map(project => `- **${project.name}**: ${project.description} (Link: ${project.link || 'N/A'})`).join('\n') : 'No projects listed.'}

    ## Languages
    ${languages.length > 0 ? languages.map(lang => `- **${lang.language}**: Proficiency - ${lang.proficiency}`).join('\n') : 'No languages listed.'}

    ## Hobbies
    ${hobbies.length > 0 ? hobbies.join(', ') : 'No hobbies listed.'}

    `;

    // Generate a prompt for the AI model
    const prompt = `I need help generating a profile summary based on my resume data. Here is my current resume data:${resume}
    Please generate a concise and impactful profile summary that highlights my strengths, relevant skills, and experiences based on the information provided. 
    The summary should be suitable for a professional context and tailored to showcase my qualifications effectively.`;

    return groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 1,
        max_tokens: 2024,
        top_p: 1,
        stream: false,
        stop: null,
    });
};
// Define custom toolbar options
const toolbarOptions = [
    ['bold', 'italic'],       // Bold and Italic options
    [{ 'list': 'bullet' }],   // Bullet list option
];


const steps = ['Personal', 'Education', 'Experience', 'Skills', 'Additional Info', 'Profile Summary'];

const parseCvData = (text) => {
    // Simple parsing logic based on patterns; customize for your file format
    const personalInfo = {
        name: text.match(/Name:\s*(.*)/i)?.[1] || '',
        email: text.match(/Email:\s*(.*)/i)?.[1] || '',
        phone: text.match(/Phone:\s*(.*)/i)?.[1] || '',
    };

    const education = [
        {
            school: text.match(/School:\s*(.*)/i)?.[1] || '',
            degree: text.match(/Degree:\s*(.*)/i)?.[1] || '',
            graduationYear: text.match(/Graduation Year:\s*(.*)/i)?.[1] || '',
            subjects: text.match(/Subjects:\s*(.*)/i)?.[1] || '',
        }
    ];

    const workExperience = [
        {
            company: text.match(/Company:\s*(.*)/i)?.[1] || '',
            position: text.match(/Position:\s*(.*)/i)?.[1] || '',
            startDate: text.match(/Start Date:\s*(.*)/i)?.[1] || '',
            endDate: text.match(/End Date:\s*(.*)/i)?.[1] || '',
            description: text.match(/Description:\s*(.*)/i)?.[1] || '',
        }
    ];

    // Additional sections (skills, certifications, etc.)
    const skills = text.match(/Skills:\s*(.*)/i)?.[1]?.split(',') || [];
    const certifications = text.match(/Certifications:\s*(.*)/i)?.[1]?.split(',') || [];
    const projects = [{ name: text.match(/Project:\s*(.*)/i)?.[1] || '' }];
    const languages = [{ language: text.match(/Language:\s*(.*)/i)?.[1] || '', proficiency: 'Intermediate' }];

    return {
        personalInfo,
        education,
        workExperience,
        skills,
        certifications,
        projects,
        languages,
        hobbies: [],
        profileSummary: text.match(/Summary:\s*(.*)/i)?.[1] || '',
    };
};

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  }));
  
  const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
    textTransform: 'none',
  }));
  
  const AnimatedTextField = motion(TextField);
  

function BuildCvPage({ user, theme }) {
    const [activeStep, setActiveStep] = useState(0);
    const [cvData, setCvData] = useState({
        personalInfo: { name: '', email: '', phone: '' },
        education: [{ school: '', degree: '', graduationYear: '', subjects: '' }],
        workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
        skills: [''],
        certifications: [''],
        projects: [],
        languages: [{ language: '', proficiency: '' }],
        hobbies: [],
        references: { available: true },
        profileSummary: '',
    });
    const [isCvGenerated, setIsCvGenerated] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [resumeExists, setResumeExist] = useState(false);
    const [file, setFile] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const pdfRef = useRef(null);

    const saveCvData = async (userId) => {
        try {
            const cvRef = doc(firestore, "users", userId); // Adjust to your collection structure
            await setDoc(cvRef, { resume: cvData }, { merge: true });
            console.log("CV data saved successfully!");
        } catch (error) {
            console.error("Error saving CV data:", error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setFile(file);
        try {
            let text = "";
            if (file.type === "application/pdf") {
                text = await extractTextFromPDF(file);
                console.log(text);
            } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                text = await extractTextFromDOCX(file);
                console.log(text);
            } else {
                throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
            }
    
            const parsedData = parseCvData(text);  // Function to parse text into structured data
            setCvData(parsedData);
            console.log(parsedData)
    
        } catch (error) {
            console.error("Error extracting CV data:", error);
        }
    };
    const extractTextFromPDF = async (file) => {
        try {
            return await pdfToText(file);
        } catch (error) {
            throw new Error("Failed to extract text from PDF: " + error.message);
        }
    };
    
    // Extract text from DOCX using mammoth
    const extractTextFromDOCX = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        return value;
    };
    
    useEffect(() => {
        const fetchCvData = async () => {
            try {
                // Reference to the user's document in Firestore
                const userRef = doc(firestore, "users", user.uid);

                // Get the document data
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();


                    // Check if the 'resume' field exists and set cvData accordingly
                    if (data.resume) {
                        setCvData(data.resume); // Set cvData with the fetched resume data
                        setResumeExist(true)
                    } else {
                        console.log("No CV data found for user.");
                    }
                } else {
                    console.log("No user found with this ID.");
                }
            } catch (error) {
                console.error("Error fetching CV data:", error);
            }
        };

        fetchCvData();
    }, [user.uid]);

    // Validation function for each step
    const validateStep = (step) => {
        const errors = {};

        switch (step) {
            case 0: // Personal Info
                if (!cvData.personalInfo.name) errors.name = "Full Name is required.";
                if (!cvData.personalInfo.email) errors.email = "Email is required.";
                if (!cvData.personalInfo.phone) errors.phone = "Phone number is required.";
                break;

            case 1: // Education
                errors.education = cvData.education.map((edu, index) => {
                    const entryErrors = {};
                    if (!edu.school) entryErrors.school = "School/University is required.";
                    if (!edu.degree) entryErrors.degree = "Degree is required.";
                    if (!edu.graduationYear) entryErrors.graduationYear = "Graduation Year is required.";
                    return entryErrors;
                });

                // Only keep entries that have at least one error
                errors.education = errors.education.filter((e) => Object.keys(e).length > 0);
                if (errors.education.length === 0) delete errors.education;
                break;

            case 2: // Work Experience
                errors.workExperience = cvData.workExperience.map((exp) => {
                    const entryErrors = {};
                    if (!exp.company) entryErrors.company = "Company is required.";
                    if (!exp.position) entryErrors.position = "Position is required.";
                    if (!exp.startDate) entryErrors.startDate = "Start Date is required.";
                    return entryErrors;
                });

                // Filter out any empty error objects
                errors.workExperience = errors.workExperience.filter((e) => Object.keys(e).length > 0);
                if (errors.workExperience.length === 0) delete errors.workExperience;
                break;

            default:
                break;
        }

        return errors;
    };


    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleInputChange = (section, field, value, index = 0) => {
        setCvData((prevData) => {
            if (Array.isArray(prevData[section])) {
                const newArray = [...prevData[section]];
                if (typeof newArray[index] === 'object') {
                    // Assuming each skill is an object with a 'name' property
                    newArray[index] = { ...newArray[index], [field || 'name']: value }; // Default field is 'name'
                } else {
                    newArray[index] = value;
                }
                return { ...prevData, [section]: newArray };
            } else if (typeof prevData[section] === 'object') {
                return { ...prevData, [section]: { ...prevData[section], [field]: value } };
            } else {
                return { ...prevData, [section]: value };
            }
        });

        setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors[section]?.[index]?.[field]) {
                delete newErrors[section][index][field];
            }
            return newErrors;
        });
    };


    const addListItem = (section) => {

        setCvData((prevData) => ({
            ...prevData,
            [section]: [
                ...prevData[section],
                section === 'projects'
                    ? { name: '', description: '', link: '' }
                    : section === 'languages'
                        ? { language: '', proficiency: '' }
                        : section === 'education'
                            ? { school: '', degree: '', graduationYear: '', subjects: '' } // Initialize education fields
                            : section === 'skills' || section === 'hobbies' || section === 'certifications' ? ''
                                : {}

            ]
        }));
        if (section === 'education') {
            setValidationErrors((prevErrors) => ({
                ...prevErrors,
                education: [...(prevErrors.education || []), { school: '', degree: '', graduationYear: '' }]
            }));
        }

    };


    const removeListItem = (section, index) => {
        setCvData((prevData) => ({
            ...prevData,
            [section]: prevData[section].filter((_, i) => i !== index),
        }));
    };

    // Handle next step with validation
    const handleNext = async () => {
        const errors = validateStep(activeStep);

        // If no errors, clear validationErrors and move to the next step
        if (Object.keys(errors).length === 0) {
            setValidationErrors({});
            setActiveStep((prevActiveStep) => prevActiveStep + 1);

            if (activeStep === 4) { // Profile Summary step
                await handleGenerateSummary();
            }
        } else {
            // If there are errors, update validationErrors
            setValidationErrors(errors);
        }
    };

    const handleGenerateSummary = async () => {
        try {
            setLoading(true);
            // Only trigger AI generation if profileSummary is empty
            if (!cvData.profileSummary.trim()) {
                const summaryResponse = await getGroqChatCompletion(cvData); // Replace with your actual function for AI completion
                console.log("AI Summary Response:", summaryResponse);

                // Check if response has valid content
                if (summaryResponse?.choices?.[0]?.message?.content?.trim()) {
                    const generatedSummary = summaryResponse.choices[0].message.content.trim();
                    const summaryMatch = generatedSummary.match(/"([^"]+)"/);
                    const summary = summaryMatch ? summaryMatch[1] : 'Summary not found.';
                    setCvData((prevData) => ({
                        ...prevData,
                        profileSummary: summary
                    }));
                } else {
                    console.warn("AI response was empty. Using fallback summary.");
                    setCvData((prevData) => ({
                        ...prevData,
                        profileSummary: "Professional with experience in various fields."
                    }));
                }

            } else {
                console.log("Profile Summary already exists, skipping AI generation.");
            }
        } catch (error) {
            console.error("Error generating CV:", error);
        } finally {
            setLoading(false); // Ensure loading stops in all cases
        }
    };

    const handleRegenerateSummary = async () => {
        try {
            setLoading(true);
            // Only trigger AI generation if profileSummary is empty
            const summaryResponse = await getGroqChatCompletion(cvData); // Replace with your actual function for AI completion
            console.log("AI Summary Response:", summaryResponse);
            // Check if response has valid content
            if (summaryResponse?.choices?.[0]?.message?.content?.trim()) {
                const generatedSummary = summaryResponse.choices[0].message.content.trim();
                const summaryMatch = generatedSummary.match(/"([^"]+)"/);
                const summary = summaryMatch ? summaryMatch[1] : 'Summary not found.';
                setCvData((prevData) => ({
                    ...prevData,
                    profileSummary: summary
                }));
            } else {
                console.warn("AI response was empty. Using fallback summary.");
                setCvData((prevData) => ({
                    ...prevData,
                    profileSummary: "Professional with experience in various fields."
                }));
            }

        } catch (error) {
            console.error("Error generating CV:", error);
        } finally {
            setLoading(false); // Ensure loading stops in all cases
        }
    };

    const handleGenerateCv = async () => {
        try {
            await saveCvData(user.uid);
            setIsCvGenerated(true)
        } catch (error) {
            console.error("Error generating CV:", error);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                        Personal Information
                        </Typography>
                        <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <AnimatedTextField
                            required
                            fullWidth
                            label="Full Name"
                            value={cvData.personalInfo.name}
                            onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                            error={!!validationErrors.name}
                            helperText={validationErrors.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <AnimatedTextField
                            required
                            fullWidth
                            label="Email"
                            type="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <AnimatedTextField
                            required
                            fullWidth
                            label="Phone"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                            error={!!validationErrors.phone}
                            helperText={validationErrors.phone}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        </Grid>
                        </Grid>
                    </Box>

                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Education
                        </Typography>
                        {cvData.education.map((edu, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <AnimatePresence
                                        required
                                        fullWidth
                                        label="School/University"
                                        value={edu.school}
                                        onChange={(e) => handleInputChange('education', 'school', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.school}
                                        helperText={validationErrors.education?.[index]?.school}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        required
                                        fullWidth
                                        label="Degree"
                                        value={edu.degree}
                                        onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.degree}
                                        helperText={validationErrors.education?.[index]?.degree}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        required
                                        fullWidth
                                        type="number"
                                        label="Graduation Year"
                                        value={edu.graduationYear}
                                        onChange={(e) => handleInputChange('education', 'graduationYear', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.graduationYear}
                                        helperText={validationErrors.education?.[index]?.graduationYear}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />

                                </Grid>
                                <Grid item xs={12}>
                                    <ReactQuill
                                        value={edu.subjects} // Holds subjects
                                        onChange={(value) => handleInputChange('education', 'subjects', value, index)} // Use the value directly
                                        placeholder="Add your subjects here"
                                        modules={{ toolbar: toolbarOptions }} // Assuming toolbarOptions are defined
                                    />
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('education', index)} color="secondary">
                                            Remove Education
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('education')} variant="outlined" fullWidth>
                            Add Education
                        </Button>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Work Experience
                        </Typography>
                        {cvData.workExperience.map((exp, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        required
                                        fullWidth
                                        label="Company"
                                        value={exp.company}
                                        onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, index)}
                                        error={!!validationErrors.workExperience?.[index]?.company}
                                        helperText={validationErrors.workExperience?.[index]?.company}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        required
                                        fullWidth
                                        label="Position"
                                        value={exp.position}
                                        onChange={(e) => handleInputChange('workExperience', 'position', e.target.value, index)}
                                        error={!!validationErrors.workExperience?.[index]?.position}
                                        helperText={validationErrors.workExperience?.[index]?.position}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <AnimatedTextField
                                        required
                                        type="date"
                                        fullWidth
                                        label="Start Date"
                                        value={exp.startDate}
                                        onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, index)}
                                        error={!!validationErrors.workExperience?.[index]?.startDate}
                                        helperText={validationErrors.workExperience?.[index]?.startDate}
                                        InputLabelProps={{
                                            shrink: true, // Ensures the label does not overlap
                                        }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        placeholder="DD/MM/YYYY" // Placeholder to indicate the format
                                        sx={{
                                            '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <AnimatedTextField
                                        type="date"
                                        fullWidth
                                        label="End Date"
                                        value={exp.endDate}
                                        onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, index)}
                                        InputLabelProps={{
                                            shrink: true, // Ensures the label does not overlap
                                        }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        placeholder="DD/MM/YYYY" // Placeholder to indicate the format
                                        sx={{
                                            '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <ReactQuill
                                        theme="snow"
                                        value={exp.description}
                                        onChange={(value) => handleInputChange('workExperience', 'description', value, index)}
                                        placeholder="Describe your work experience"
                                        modules={{ toolbar: toolbarOptions }} // Apply custom toolbar
                                    />
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('workExperience', index)} color="secondary">
                                            Remove Experience
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('workExperience')} variant="outlined" fullWidth>
                            Add Work Experience
                        </Button>
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Alert severity="success" icon={<Lightbulb fontSize="inherit" />} sx={{ mb: 2 }}>
                            Please add at least 3 skills.
                        </Alert>
                        <Typography variant="h6" gutterBottom>
                            Skills
                        </Typography>
                        {cvData.skills.map((skill, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={11}>
                                    <AnimatedTextField
                                        required
                                        fullWidth
                                        label={`Skill ${index + 1}`}
                                        value={skill} // If it's an object, use `name` (or the appropriate field), otherwise use the skill itself
                                        onChange={(e) => handleInputChange('skills', 'name', e.target.value, index)} // Set the field to 'name'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                {index > 0 && ( // Show the remove button only if it's not the first skill
                                    <Grid item xs={1}>
                                        <IconButton
                                            onClick={() => removeListItem('skills', index)}
                                            sx={{ color: 'red' }}
                                            aria-label="remove skill"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('skills')} variant="outlined" fullWidth size='sm'>
                            Add Skill
                        </Button>
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Certifications
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Please leave blank if you do not want to add certifications
                        </Alert>
                        {cvData.certifications.map((cert, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        label={`Certification ${index + 1}`}
                                        value={cert}
                                        onChange={(e) => handleInputChange('certifications', null, e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('certifications', index)} color="secondary">
                                            Remove Certification
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('certifications')} variant="outlined" fullWidth>
                            Add Certification
                        </Button>

                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            Projects
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Please leave blank if you do not want to add projects
                        </Alert>
                        {cvData.projects.map((project, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        label="Project Name"
                                        value={project.name}
                                        onChange={(e) => handleInputChange('projects', 'name', e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Project Description"
                                        value={project.description}
                                        onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        label="Project Link"
                                        value={project.link}
                                        onChange={(e) => handleInputChange('projects', 'link', e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('projects', index)} color="secondary">
                                            Remove Project
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('projects')} variant="outlined" fullWidth>
                            Add Project
                        </Button>

                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            Languages
                        </Typography>
                        {cvData.languages.map((lang, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <AnimatedTextField
                                        fullWidth
                                        label="Language"
                                        value={lang.language}
                                        onChange={(e) => handleInputChange('languages', 'language', e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Proficiency</InputLabel>
                                        <Select
                                            value={lang.proficiency}
                                            label="Proficiency"
                                            onChange={(e) => handleInputChange('languages', 'proficiency', e.target.value, index)}
                                        >
                                            <MenuItem value="Beginner">Beginner</MenuItem>
                                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                                            <MenuItem value="Advanced">Advanced</MenuItem>
                                            <MenuItem value="Native">Native</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('languages', index)} color="secondary">
                                            Remove Language
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('languages')} variant="outlined" fullWidth>
                            Add Language
                        </Button>

                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            Hobbies and Interests
                        </Typography>
                        {cvData.hobbies.map((hobby, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        label={`Hobby/Interest ${index + 1}`}
                                        value={hobby}
                                        onChange={(e) => handleInputChange('hobbies', null, e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('hobbies', index)} color="secondary">
                                            Remove Hobby/Interest
                                        </Button>
                                    </Grid>
                                )}

                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('hobbies')} variant="outlined" fullWidth>
                            Add Hobby/Interest
                        </Button>

                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            References
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button
                                    variant={cvData.references.available ? "contained" : "outlined"}
                                    onClick={() => handleInputChange('references', 'available', !cvData.references.available)}
                                    fullWidth
                                >
                                    {cvData.references.available ? "References Available Upon Request" : "No References"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 5:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Your Profile Summary
                        </Typography>
                        {loading ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center', // Center horizontally
                                    alignItems: 'center',     // Center vertically
                                    height: '100%',           // Full height of the container
                                    mt: 2                      // Optional margin for spacing
                                }}
                            >
                                <CircularProgress />
                                <Typography>Generating summary, please wait...</Typography>
                            </Box>
                        ) : (
                            <AnimatedTextField
                                sx={{ mt: 2 }}
                                fullWidth
                                multiline
                                rows={10}
                                label="Profile Summary"
                                value={cvData.profileSummary}
                                onChange={(e) => setCvData((prevData) => ({
                                    ...prevData,
                                    profileSummary: e.target.value
                                }))}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            />
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={handleRegenerateSummary} // Trigger the regenerate function
                            disabled={loading} // Disable button if loading
                        >
                            Regenerate Summary
                        </Button>
                    </Box>
                )
            default:
                return 'Unknown step';
        }
    };


    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            format: 'a4',
            unit: 'px',
            orientation: 'portrait', // Default orientation for A4
        });
    
        // Set font and prepare for content
        doc.setFont('helvetica', 'normal');
    
        // Capture the width of the document and set scaling
        const contentWidth = pdfRef.current.scrollWidth;
        const pdfWidth = doc.internal.pageSize.getWidth();

    
        // Use doc.html with scaling for full-width fit
        doc.html(pdfRef.current, {
            callback: (pdf) => {
                pdf.save(`${cvData.personalInfo.name}_CV.pdf`);
            },
            x: 10, // Left margin
            y: 10, // Top margin
            width: pdfWidth - 20, // Fit content within margins
            windowWidth: contentWidth, // Ensure full width is captured
            html2canvas: {
                scale: 0.5, // Adjust scale for better quality or performance
                margin: { top: 10, bottom: 10, left: 10, right: 10 }, // Apply margins to every page
                scrollX: 0,
                scrollY: 0,
            },
            autoPaging: 'text', // Automatically handle paging
        });
    };
    

    const handleDownloadDocx = () => {
        // Get the HTML content from your reference (e.g., pdfRef.current.innerHTML)
        const content = pdfRef.current.innerHTML; // Ensure this is valid HTML content
    
        // Convert the HTML content to a DOCX file
        const converted = htmlDocx.asBlob(content);
    
        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(converted);
        link.download = `${cvData.personalInfo.name}_CV.docx`;
        link.click();
    };


    return (
        <Container maxWidth="md">
        <Box marginTop={4} marginBottom={4}>
          <TipsSlider />
        </Box>
        <StyledPaper>
          <Typography variant="h4" align="center" gutterBottom>
            Build Your Professional CV
          </Typography>
          <Box display="flex" justifyContent="center" mt={3} mb={4}>
            <StyledButton
              color="primary"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              Extract From Existing CV
            </StyledButton>
            <Typography variant="caption" sx={{ ml: 2, alignSelf: 'center' }}>
              {file ? file.name : 'No file chosen'}
            </Typography>
            <input
              id="resume-upload"
              type="file"
              hidden
              accept=".pdf, .docx"
              onChange={(e) => handleFileUpload(e, setFile, setCvData, setValidationErrors)}
            />
          </Box>
          <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? "vertical" : "horizontal"} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {!loading && isCvGenerated ? (
                <Box>
                  <div ref={pdfRef}>
                    <RenderCv cvData={cvData} />
                  </div>
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <StyledButton variant="contained" onClick={handleDownloadPDF} startIcon={<DownloadIcon />}>
                      Download PDF
                    </StyledButton>
                    <StyledButton variant="contained" onClick={handleDownloadDocx} startIcon={<DownloadIcon />}>
                      Download DOCX
                    </StyledButton>
                  </Box>
                </Box>
              ) : (
                renderStepContent(activeStep)
              )}
            </motion.div>
          </AnimatePresence>
          {!isCvGenerated && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <StyledButton onClick={handleBack} disabled={activeStep === 0}>
                Back
              </StyledButton>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleGenerateCv : handleNext}
                disabled={loading}
              >
                {activeStep === steps.length - 1 ? 'Generate CV' : 'Next'}
              </StyledButton>
            </Box>
          )}
        </StyledPaper>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{"Daily Limit Reached"}</DialogTitle>
          <DialogContent>
            <Typography>
              You have reached the daily limit of free uses. Upgrade to pro for unlimited access.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
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
    );
}

export default BuildCvPage;