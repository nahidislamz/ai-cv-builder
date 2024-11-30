import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Box,
    Drawer,
    Stepper,
    Step,
    StepLabel,
    StepButton,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    Link
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import {
    CloudUpload as CloudUploadIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style.css'
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { firestore } from '../firebase'; // Path to your firebase configuration
import { doc, setDoc, getDoc } from "firebase/firestore";
import RenderCv from '../components/RenderCv';
import mammoth from 'mammoth';
import pdfToText from 'react-pdftotext';
import CryptoJS from 'crypto-js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import SkillsInput from '../components/SkillsInput';
import { getGroqChatCompletion, generateSuggestedContent, parseCvData } from '../components/utils/aiutils'
import { useUser } from '../context/UserContext';
import FloatingMenuButton from '../components/FloatingMenuButton';
import { StyledButton } from '../components/utils/shareComponent';
import { styled } from '@mui/material/styles';
import TemplateSlider from '../components/TemplateSlider';

import cvTemplate from '../components/templates/cv_template.docx';
import ATS_Bold from '../components/templates/ATS_Bold.docx';
import ATS_Classic from '../components/templates/ATS_Classic.docx';
import SALES_Resume from '../components/templates/SALES.docx';

import ats_bold from '../components/templates/images/ats_bold.png'
import ats_classic from '../components/templates/images/ATS_Classic.png'
import sales_bold from '../components/templates/images/Sales_Bold.png';

const secretKey = process.env.REACT_APP_SECRET_KEY;

const getAiResponse = async (cvData) => {
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

    return getGroqChatCompletion(prompt, 1024)
};
// Define custom toolbar options
const toolbarOptions = [
    ['bold', 'italic'],       // Bold and Italic options
    [{ 'list': 'bullet' }],   // Bullet list option
];


const steps = ['Personal', 'Education', 'Experience', 'Skills', 'Additional Info', 'Profile Summary'];

const UpgradeLink = styled(Link)(({ theme }) => ({
    display: 'block',
    marginBottom: theme.spacing(2),
    textAlign: 'center',
}));
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
}));

const LockedOverlay = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: theme.mixins.toolbar.minHeight, // This accounts for the app bar height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.drawer + 1,
    color: 'white',
    textAlign: 'center',
    padding: theme.spacing(2),
}));
const AnimatedTextField = motion(TextField);


function BuildCvPage({ user, theme }) {
    const [activeStep, setActiveStep] = useState(0);
    const [cvData, setCvData] = useState({
        personalInfo: { name: '', email: '', phone: '' },
        education: [{ school: '', degree: '', startDate: '', endDate: '', location: '', subjects: '' }],
        workExperience: [{ company: '', position: '', startDate: '', endDate: '', location: '', description: '' }],
        skills: [],
        certifications: [],
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
    const [suggestedSkills, setSuggestedSkills] = useState([]);
    const [file, setFile] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const pdfRef = useRef(null);
    const { isFreeUser } = useUser();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
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
                        setIsCvGenerated(true);
                        setActiveStep(5);
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
        console.log("Validating step:", step);
        console.log("Current cvData:", cvData);
        switch (step) {
            case 0: // Personal Info
                if (!cvData.personalInfo.name) errors.name = "Full Name is required.";
                if (!cvData.personalInfo.email) errors.email = "Email is required.";
                if (!cvData.personalInfo.phone) errors.phone = "Phone number is required.";
                break;

            case 1: // Education
                // Start with an empty array for education errors
                const educationErrors = cvData.education.map((edu) => {
                    const entryErrors = {};
                    if (!edu.school) entryErrors.school = "School/University is required.";
                    if (!edu.degree) entryErrors.degree = "Degree is required.";
                    if (!edu.startDate) entryErrors.startDate = "Start Date Year is required.";
                    return entryErrors;
                });

                // Filter out entries with no errors
                const nonEmptyEducationErrors = educationErrors.filter((entryErrors) => Object.keys(entryErrors).length > 0);

                // Only add to errors if there are actually issues in education
                if (nonEmptyEducationErrors.length > 0) {
                    errors.education = nonEmptyEducationErrors;
                }
                break;

            case 2: // Work Experience
                const workExperienceErrors = cvData.workExperience.map((exp) => {
                    const entryErrors = {};
                    if (!exp.company) entryErrors.company = "Company is required.";
                    if (!exp.position) entryErrors.position = "Position is required.";
                    if (!exp.startDate) entryErrors.startDate = "Start Date is required.";
                    return entryErrors;
                });

                const nonEmptyWorkExperienceErrors = workExperienceErrors.filter((entryErrors) => Object.keys(entryErrors).length > 0);

                if (nonEmptyWorkExperienceErrors.length > 0) {
                    errors.workExperience = nonEmptyWorkExperienceErrors;
                }
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

    const addListItem = (section, value = null) => {
        setCvData((prevData) => ({
            ...prevData,
            [section]: [
                ...prevData[section],
                section === 'projects'
                    ? { name: '', description: '', link: '' }
                    : section === 'languages'
                        ? { language: '', proficiency: '' }
                        : section === 'education'
                            ? { school: '', degree: '', graduationYear: '', subjects: '' }
                            : section === 'skills' || section === 'hobbies' || section === 'certifications'
                                ? (value !== null ? value : '') // Append the provided value or empty string
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
        setValidationErrors(errors);
        console.log(errors);

        // If no errors, clear validationErrors and move to the next step
        if (Object.keys(errors).length === 0) {
            setValidationErrors({});
            setActiveStep((prevActiveStep) => prevActiveStep + 1);

            if (activeStep === 2) { await handleSkillsSuggestion(); }

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
                const summaryResponse = await getAiResponse(cvData); // Replace with your actual function for AI completion
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
            const summaryResponse = await getAiResponse(cvData); // Replace with your actual function for AI completion
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

    const extractListItemsAsHtml = (generatedContent) => {
        const listItems = []; // Initialize as an array
        const lines = generatedContent.split('\n');
        let isOrderedList = true;
        lines.forEach(line => {
            if (line.trim().match(/^(\d+\.\s)/)) { // Ordered item
                listItems.push(`<li>${line.trim().substring(2)}</li>`);
            } else if (line.trim().match(/^(•|-|\*)\s/)) { // Unordered item
                isOrderedList = false;
                listItems.push(`<li>${line.trim().substring(2)}</li>`);
            }
        });

        // Join listItems if it's populated, or return an empty list string
        const htmlList = listItems.length
            ? (isOrderedList ? `<ol>${listItems.join('')}</ol>` : `<ul>${listItems.join('')}</ul>`)
            : (isOrderedList ? "<ol></ol>" : "<ul></ul>");

        return htmlList; // Ensure the return type is always a string
    };
    const handleGenerateContent = async (field, index) => {
        try {
            const input = field === 'subjects' ? cvData.education[index] : cvData.workExperience[index];
            const type = field === 'subjects' ? 'subjects' : 'description';
            const prompt = type === 'subjects'
                ? `Suggest subjects for a degree in ${input.degree} at ${input.school}. provide only list of subject as output. maximum 5`
                : `Provide a brief work experience description for a ${input.position} role at ${input.company}. provide only list of Key Responsibilities max 6`;

            const generatedContent = await generateSuggestedContent(prompt);

            console.log("Generated Content:", generatedContent); // Log generated content

            // Extract and convert list items to HTML
            const htmlList = extractListItemsAsHtml(generatedContent);

            console.log("Extracted HTML List:", htmlList); // Log extracted HTML list

            // Update the appropriate field in the cvData state
            setCvData((prevData) => {
                const updatedData = [...prevData[field === 'subjects' ? 'education' : 'workExperience']];
                updatedData[index][field] = htmlList;
                return {
                    ...prevData,
                    [field === 'subjects' ? 'education' : 'workExperience']: updatedData,
                };
            });
        } catch (error) {
            console.error('Error generating content:', error);
        }
    };

    const handleSkillsSuggestion = async () => {
        try {
            const skillPrompt = `
                Based on my work experience and project descriptions, suggest relevant skills that I may want to list on my CV.
                Here is my experience data: ${JSON.stringify(cvData.workExperience)}
                And here are my projects: ${JSON.stringify(cvData.projects)}.
                Only suggest skills in a list format.
            `;

            const generatedContent = await generateSuggestedContent(skillPrompt);
            console.log("API Response for Skills Suggestion:", generatedContent);

            // Adjust for nested structure or direct string response
            let suggestedSkillsText = generatedContent?.choices?.[0]?.message?.content?.trim() || generatedContent?.trim();

            if (suggestedSkillsText) {
                console.log("Suggested Skills Text:", suggestedSkillsText);

                // Convert response text into an array by removing bullet points and trimming whitespace
                const skillsArray = suggestedSkillsText
                    .split('\n') // Split the text into lines.
                    .map(skill =>
                        skill
                            .replace(/^\d+\.\s*/, '') // Remove numbers followed by a period (e.g., "1. ", "2. ", etc.)
                            .replace(/^[-•*]\s*/, '') // Remove bullet characters (e.g., "-", "•", "*")
                            .trim() // Trim extra spaces
                    )
                    .filter(skill =>
                        skill.length > 0 && // Filter out empty entries.
                        skill.length < 30 && // Exclude lines that are too long to be skills (e.g., descriptions).
                        !skill.includes(':') // Exclude lines that may have colons, which are often descriptions.
                    );

                setSuggestedSkills(skillsArray);  // Update the suggestedSkills state
                console.log("Parsed Skills Array:", skillsArray);
            } else {
                console.warn("No skills suggested. Check the response format.");
            }
        } catch (error) {
            console.error("Error generating skills suggestion:", error);
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
                                    <AnimatedTextField
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
                                <Grid item xs={12} sm={6}>
                                    <AnimatedTextField
                                        required
                                        type="date"
                                        fullWidth
                                        label="Start Date"
                                        value={edu.startDate}
                                        onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.startDate}
                                        helperText={validationErrors.education?.[index]?.startDate}
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
                                    <FormControl fullWidth>
                                        <AnimatedTextField
                                            type="date"
                                            fullWidth
                                            label="End Date"
                                            value={edu.endDate}
                                            onChange={(e) =>
                                                handleInputChange('education', 'endDate', e.target.value, index)
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.1 }}
                                            placeholder="DD/MM/YYYY"
                                            sx={{
                                                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                                },
                                                '& .MuiInputLabel-root': {
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: theme.palette.text.secondary,
                                                },
                                                marginBottom: 1,
                                            }}
                                        />
                                        <FormHelperText>Leave blank if currently working</FormHelperText>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        label="Location"
                                        value={edu.location}
                                        onChange={(e) => handleInputChange('education', 'location', e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        placeholder="e.g., London, UK"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <ReactQuill
                                        value={edu.subjects} // Holds subjects
                                        onChange={(value) => handleInputChange('education', 'subjects', value, index)} // Use the value directly
                                        placeholder="Add your subjects here"
                                        modules={{ toolbar: toolbarOptions }} // Assuming toolbarOptions are defined
                                    />
                                    <Button sx={{ marginTop: 1, alignItems: 'right' }} variant='outlined' size='small'
                                        onClick={() => handleGenerateContent('subjects', index)}>
                                        Generate
                                    </Button>
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
                                    <FormControl fullWidth>
                                        <AnimatedTextField
                                            type="date"
                                            fullWidth
                                            label="End Date"
                                            value={exp.endDate}
                                            onChange={(e) =>
                                                handleInputChange('workExperience', 'endDate', e.target.value, index)
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.1 }}
                                            placeholder="DD/MM/YYYY"
                                            sx={{
                                                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                                                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                                                },
                                                '& .MuiInputLabel-root': {
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: theme.palette.text.secondary,
                                                },
                                                marginBottom: 1,
                                            }}
                                        />
                                        <FormHelperText>Leave blank if currently working</FormHelperText>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimatedTextField
                                        fullWidth
                                        label="Location"
                                        value={exp.location}
                                        onChange={(e) => handleInputChange('workExperience', 'location', e.target.value, index)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        placeholder="e.g., London, UK"
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
                                    <Button sx={{ marginTop: 1, alignItems: 'right' }} variant='outlined'
                                        size='small'
                                        onClick={() => handleGenerateContent('description', index)}
                                    >
                                        Generate
                                    </Button>
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
                    <SkillsInput cvData={cvData} setCvData={setCvData} suggestedSkills={suggestedSkills} />
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

    const formatList = (text) =>
        text
            .replace(/<li>/g, '• ')  // Replace opening <li> with bullet and space
            .replace(/<\/li>/g, '\n') // Replace closing </li> with a newline
            .replace(/<\/?[^>]+(>|$)/g, ''); // Remove any other HTML tags

    const handleStepClick = (index) => {
        if (index <= activeStep) {
            setActiveStep(index);
            setIsDrawerOpen(false);
            setIsCvGenerated(false);
        }
    };
    const handleOpenDrawer = () => {
        setIsDrawerOpen(true);
    };

    const generateDocument = async (cvData, cvTemplate) => {
        // Format data before generating the document
        const formattedData = {
            ...cvData,
            education: cvData.education.map((edu) => ({
                ...edu,
                subjects: formatList(edu.subjects),
                // Format startDate and endDate
                duration: formatDateRange(edu.startDate, edu.endDate),
            })),
            workExperience: cvData.workExperience.map((work) => ({
                ...work,
                description: formatList(work.description),
                // Format startDate and endDate
                duration: formatDateRange(work.startDate, work.endDate),
            })),
            // Split skills into two columns
            skillsLeft: cvData.skills.slice(0, Math.ceil(cvData.skills.length / 2)),
            skillsRight: cvData.skills.slice(Math.ceil(cvData.skills.length / 2)),
        };
        
        // Helper function to format date range
        function formatDateRange(startDate, endDate) {
            const formatDate = (date) => {
                if (!date) return ""; // Handle empty string or undefined
                const options = { year: "numeric", month: "short" }; // Format to "Jan 2023"
                return new Date(date).toLocaleDateString("en-US", options);
            };
        
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = endDate ? formatDate(endDate) : "Present"; // Default to "Present" if endDate is empty
            return `${formattedStartDate} - ${formattedEndDate}`;
        }
        

        try {
            // Fetch and process template here, then set data with `formattedData`
            const response = await fetch(cvTemplate);
            const content = await response.arrayBuffer();

            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            doc.setData(formattedData);

            try {
                doc.render();
                const output = doc.getZip().generate({
                    type: 'blob',
                    mimeType:
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });
                saveAs(output, `${cvData.personalInfo.name}_CV.docx`);
            } catch (error) {
                console.error('Error rendering document:', error);
            }
        } catch (error) {
            console.error('Error loading document template:', error);
        }
    };

    const handleGenerate = () => {
        if (selectedTemplate) {
            generateDocument(cvData, selectedTemplate); // Pass data and template
            console.log(selectedTemplate);
        } else {
            alert('Please select a template.');
        }
    };

    const generatePdfFromDocx = async (cvData, cvTemplate) => {
        const formattedData = {
            ...cvData,
            education: cvData.education.map((edu) => ({
                ...edu,
                subjects: formatList(edu.subjects),
            })),
            workExperience: cvData.workExperience.map((work) => ({
                ...work,
                description: formatList(work.description),
            })),
        };

        try {
            const response = await fetch(cvTemplate);
            const content = await response.arrayBuffer();

            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            doc.setData(formattedData);
            doc.render();

            // Generate the .docx as a blob
            const output = doc.getZip().generate({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            // Convert to PDF using jsPDF
            const pdf = new jsPDF();
            const docText = doc.getFullText(); // Getting the full text to add to PDF
            pdf.text(docText, 10, 10);  // Add text at specific coordinates in the PDF

            // Save the PDF
            pdf.save(`${cvData.personalInfo.name}_CV.pdf`);
        } catch (error) {
            console.error('Error loading or converting template:', error);
        }
    };

    const templates = [
        { name: 'ATS Bold', filePath: ATS_Bold, imageUrl: ats_bold },
        { name: 'ATS Classic', filePath: ATS_Classic, imageUrl: ats_classic },
        { name: 'Sales Resume Bold', filePath: SALES_Resume, imageUrl: sales_bold },
    ];
    return (
        <Container maxWidth="md" sx={{
            py: isMobile ? 0 : { xs: 4, md: 8 }, // Remove padding on mobile
            px: isMobile ? 0 : 2, // Optionally remove horizontal padding on mobile
        }}>
            {isMobile && (
                <>
                    <FloatingMenuButton handleOpenDrawer={handleOpenDrawer} />
                    <Drawer
                        anchor="left"
                        open={isDrawerOpen}
                        onClose={() => setIsDrawerOpen(false)}
                        sx={{ width: 200, zIndex: 2000 }}
                        PaperProps={{
                            sx: {
                                width: 240, // Adjust the drawer width as needed
                                padding: 2,
                                backgroundColor: theme.palette.background.default,
                            },
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                            Navigation
                        </Typography>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((label, index) => (
                                <Step key={label} completed={index < activeStep}>
                                    <StepButton onClick={() => handleStepClick(index)} disabled={index > activeStep}>
                                        <StepLabel>{label}</StepLabel>
                                    </StepButton>
                                </Step>
                            ))}
                        </Stepper>
                    </Drawer>
                </>
            )}

            <StyledPaper sx={{
                boxShadow: isMobile ? "none" : undefined, // Remove shadow on mobile
                padding: isMobile ? 2 : 3, // Adjust padding for mobile
                margin: isMobile ? 0 : "auto", // Remove margin on mobile
            }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                    Build Your CV
                </Typography>
                {/*
                <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="center" mt={3} mb={4}>
                    <StyledButton
                        color="primary"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => document.getElementById('resume-upload').click()}
                        fullWidth={isMobile}
                        sx={{ mb: isMobile ? 2 : 0 }}
                    >
                        Extract From CV
                    </StyledButton>
                    <Typography variant="caption" sx={{ ml: isMobile ? 0 : 2, mt: isMobile ? 1 : 0, textAlign: 'center' }}>
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
                */}

                {!isMobile && (
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((label, index) => (
                            <Step key={label} completed={index < activeStep}>
                                <StepButton onClick={() => handleStepClick(index)} disabled={index > activeStep}>
                                    <StepLabel>{label}</StepLabel>
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>
                )}
                {/*isFreeUser && (
                    <LockedOverlay>
                        <LockIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Premium Feature
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Upgrade to Pro to access advanced CV building features.
                        </Typography>
                        <StyledButton
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenDialog(true)}
                        >
                            Upgrade to Pro
                        </StyledButton>
                    </LockedOverlay>
                )*/}
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
                                    {/*<RenderCv cvData={cvData} />*/}
                                    <TemplateSlider templates={templates} onSelectTemplate={(template) => setSelectedTemplate(template)} cvData={cvData} />
                                </div>
                                <Box sx={{ mt: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 2 }}>
                                    {/*
                                    <StyledButton variant="contained" onClick={generatePdfFromDocx(cvData,selectedTemplate)} startIcon={<DownloadIcon />} fullWidth={isMobile} disabled={isFreeUser}>
                                        Download PDF
                                    </StyledButton>
                                        */}

                                    {isFreeUser ? (
                                        <Link href={'/upgrade'} underline="none">
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<LockIcon />}
                                                fullWidth={isMobile}
                                            >
                                                Upgrade To Pro
                                            </Button>
                                        </Link>
                                    ) : (
                                        <StyledButton
                                            variant="contained"
                                            onClick={handleGenerate}
                                            hidden={isFreeUser}
                                            disabled={isFreeUser}
                                            startIcon={<DownloadIcon />}
                                            fullWidth={isMobile}
                                        >
                                            Download DOCX
                                        </StyledButton>
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            renderStepContent(activeStep)
                        )}
                    </motion.div>
                </AnimatePresence>
                {!isCvGenerated && (
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', mt: 4, gap: 2 }}>
                        <StyledButton onClick={handleBack} disabled={activeStep === 0} fullWidth={isMobile}>
                            Back
                        </StyledButton>
                        <StyledButton
                            variant="contained"
                            color="primary"
                            onClick={activeStep === steps.length - 1 ? handleGenerateCv : handleNext}
                            disabled={loading || isFreeUser}
                            fullWidth={isMobile}
                        >
                            {activeStep === steps.length - 1 ? 'Generate CV' : 'Next'}
                        </StyledButton>
                    </Box>
                )}
            </StyledPaper>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>{"Upgrade to Pro"}</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Upgrade to pro for unlimited access to all features, including:
                    </Typography>
                    <Typography component="ul" sx={{ pl: 2 }}>
                        <li>Advanced CV building tools</li>
                        <li>Premium templates</li>
                        <li>AI-powered content suggestions</li>
                        <li>Unlimited CV downloads</li>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <StyledButton
                        onClick={() => { window.location.href = "/upgrade"; }}
                        color="primary"
                        variant="contained"
                    >
                        Upgrade Now
                    </StyledButton>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default BuildCvPage;