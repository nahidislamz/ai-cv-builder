import React, { useState, useEffect } from 'react';
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
    FormControl, InputLabel, Select, MenuItem,
    Alert
} from '@mui/material';
import TipsSlider from '../components/TipsSlider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Lightbulb } from '@mui/icons-material';
import Groq from "groq-sdk";
import { firestore } from '../firebase'; // Path to your firebase configuration
import { doc, setDoc, getDoc } from "firebase/firestore";
import { CircularProgress } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style.css'

const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });

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

function BuildCvPage({ user , theme}) {
    const [activeStep, setActiveStep] = useState(0);
    const [cvData, setCvData] = useState({
        personalInfo: { name: '', email: '', phone: '' },
        education: [{ school: '', degree: '', graduationYear: '', subjects: '' }],
        workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
        skills: [''],
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
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [resumeExists, setResumeExist] = useState(false);


    const saveCvData = async (userId) => {
        try {
            const cvRef = doc(firestore, "users", userId); // Adjust to your collection structure
            await setDoc(cvRef, { resume: cvData }, { merge: true });
            console.log("CV data saved successfully!");
        } catch (error) {
            console.error("Error saving CV data:", error);
        }
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
                    :section === 'skills' || section === 'hobbies' ? '' 
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
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={cvData.personalInfo.name}
                                    onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                                    error={!!validationErrors.name}
                                    helperText={validationErrors.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={cvData.personalInfo.email}
                                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                    error={!!validationErrors.email}
                                    helperText={validationErrors.email}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Phone"
                                    value={cvData.personalInfo.phone}
                                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                                    error={!!validationErrors.phone}
                                    helperText={validationErrors.phone}
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
                                    <TextField
                                        required
                                        fullWidth
                                        label="School/University"
                                        value={edu.school}
                                        onChange={(e) => handleInputChange('education', 'school', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.school}
                                        helperText={validationErrors.education?.[index]?.school}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Degree"
                                        value={edu.degree}
                                        onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.degree}
                                        helperText={validationErrors.education?.[index]?.degree}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        type="number"
                                        label="Graduation Year"
                                        value={edu.graduationYear}
                                        onChange={(e) => handleInputChange('education', 'graduationYear', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.graduationYear}
                                        helperText={validationErrors.education?.[index]?.graduationYear}
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
                                    <TextField
                                        required
                                        fullWidth
                                        label="Company"
                                        value={exp.company}
                                        onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, index)}
                                        error={!!validationErrors.workExperience?.[index]?.company}
                                        helperText={validationErrors.workExperience?.[index]?.company}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Position"
                                        value={exp.position}
                                        onChange={(e) => handleInputChange('workExperience', 'position', e.target.value, index)}
                                        error={!!validationErrors.workExperience?.[index]?.position}
                                        helperText={validationErrors.workExperience?.[index]?.position}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
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
                                        placeholder="DD/MM/YYYY" // Placeholder to indicate the format
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        label="End Date"
                                        value={exp.endDate}
                                        onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, index)}
                                        InputLabelProps={{
                                            shrink: true, // Ensures the label does not overlap
                                        }}
                                        placeholder="DD/MM/YYYY" // Placeholder to indicate the format
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
                                        <TextField
                                            required
                                            fullWidth
                                            label={`Skill ${index + 1}`}
                                            value={skill} // If it's an object, use `name` (or the appropriate field), otherwise use the skill itself
                                            onChange={(e) => handleInputChange('skills', 'name', e.target.value, index)} // Set the field to 'name'
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
                                    <TextField
                                        fullWidth
                                        label={`Certification ${index + 1}`}
                                        value={cert}
                                        onChange={(e) => handleInputChange('certifications', null, e.target.value, index)}
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
                                    <TextField
                                        fullWidth
                                        label="Project Name"
                                        value={project.name}
                                        onChange={(e) => handleInputChange('projects', 'name', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Project Description"
                                        value={project.description}
                                        onChange={(e) => handleInputChange('projects', 'description', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Project Link"
                                        value={project.link}
                                        onChange={(e) => handleInputChange('projects', 'link', e.target.value, index)}
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
                                    <TextField
                                        fullWidth
                                        label="Language"
                                        value={lang.language}
                                        onChange={(e) => handleInputChange('languages', 'language', e.target.value, index)}
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
                                    <TextField
                                        fullWidth
                                        label={`Hobby/Interest ${index + 1}`}
                                        value={hobby}
                                        onChange={(e) => handleInputChange('hobbies', null, e.target.value, index)}
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
                                    <CircularProgress/>
                                    <Typography>Generating summary, please wait...</Typography>
                                </Box>
                        ) : (
                            <TextField
                                sx={{mt:2}}
                                fullWidth
                                multiline
                                rows={10}
                                label="Profile Summary"
                                value={cvData.profileSummary}
                                onChange={(e) => setCvData((prevData) => ({
                                    ...prevData,
                                    profileSummary: e.target.value
                                }))}
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

    const renderCv = () => (
        <Paper elevation={0} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                {cvData.personalInfo.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
                Email: {cvData.personalInfo.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
                Phone: {cvData.personalInfo.phone}
            </Typography>
    
            {cvData.profileSummary && (
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Profile Summary
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'justify' }}>
                        {cvData.profileSummary}
                    </Typography>
                </Box>
            )}
    
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Education
            </Typography>
            {cvData.education.map((edu, index) => (
                <Box key={index}>
                    <Typography variant="h5" component="span" sx={{ mr: 1 }}>
                        {edu.degree}
                    </Typography>
                    <Typography variant="body1" component="span">
                        from {edu.school} ({edu.graduationYear})
                    </Typography>
                    {/* Make sure that edu.subjects is a string before rendering */}
                    <Typography variant="body2">
                        {typeof edu.subjects === 'string' ? edu.subjects : ''}
                    </Typography>
                </Box>
            ))}
    
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Work Experience
            </Typography>
            {cvData.workExperience?.map((exp, index) => (
                <Box key={index}>
                    <Typography variant="h5" component="span" sx={{ mr: 1 }}>
                        {exp.position}
                    </Typography>
                    <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                        at {exp.company}
                    </Typography>
                    <Typography variant="body2" component="span" color="textSecondary">
                        (
                        {new Date(exp.startDate).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric'
                        })}
                        -
                        {exp.endDate
                            ? new Date(exp.endDate).toLocaleDateString('en-GB', {
                                month: 'short',
                                year: 'numeric'
                            })
                            : 'Present'}
                        )
                    </Typography>
    
                    {/* Ensure description is a string */}
                    <Typography variant="body2">
                        {typeof exp.description === 'string' ? exp.description : ''}
                    </Typography>
                </Box>
            ))}
    
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Skills
            </Typography>
            <ul>
                {cvData.skills.map((skill, index) => (
                    <li key={index}>{typeof skill === 'string' ? skill : ''}</li>
                ))}
            </ul>
    
            {cvData.certifications?.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Certifications
                    </Typography>
                    <ul>
                        {cvData.certifications.map((cert, index) => (
                            <li key={index}>{typeof cert === 'string' ? cert : ''}</li>
                        ))}
                    </ul>
                </>
            )}
    
            {cvData.projects?.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Projects
                    </Typography>
                    {cvData.projects.map((project, index) => (
                        <Box key={index}>
                            <Typography variant="body1">{project.name}</Typography>
                            <Typography variant="body2">{project.description}</Typography>
                            {project.link && (
                                <Typography variant="body2">
                                    Link: <a href={project.link} target="_blank" rel="noopener noreferrer">{project.link}</a>
                                </Typography>
                            )}
                        </Box>
                    ))}
                </>
            )}
    
            {cvData.languages?.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Languages
                    </Typography>
                    <ul>
                        {cvData.languages.map((lang, index) => (
                            <li key={index}>{`${lang.language} - ${lang.proficiency}`}</li>
                        ))}
                    </ul>
                </>
            )}
    
            {cvData.hobbies.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Hobbies and Interests
                    </Typography>
                    <ul>
                        {cvData.hobbies.map((hobby, index) => (
                            <li key={index}>{hobby}</li>
                        ))}
                    </ul>
                </>
            )}
    
            {cvData.references.available && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    References available upon request.
                </Typography>
            )}
        </Paper>
    );
    
    return (
            <Container maxWidth="md" sx={{ mb: 4 }}>
                <Box marginTop={2}>
                <TipsSlider />
                </Box>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Build Your CV
                    </Typography>
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }} orientation={isMobile ? "vertical" : "horizontal"}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {!loading && isCvGenerated ? renderCv() : renderStepContent(activeStep)}
                    {!isCvGenerated && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={handleBack} sx={{ mr: 1 }} disabled={activeStep === 0}>
                                Back
                            </Button>
                            <Button
                                disabled={loading}
                                variant="contained"
                                color="primary"
                                onClick={activeStep === steps.length - 1 ? handleGenerateCv : handleNext}
                            >
                                {activeStep === steps.length - 1
                                    ? (resumeExists ? 'Update CV' : 'Generate CV')
                                    : 'Next'}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
    );
}

export default BuildCvPage;