import React, { useState } from 'react';
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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

const steps = ['Personal', 'Education', 'Experience', 'Skills', 'Additional Info'];

function BuildCvPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [cvData, setCvData] = useState({
        personalInfo: { name: '', email: '', phone: '' },
        education: [{ school: '', degree: '', graduationYear: '' }],
        workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
        skills: [''],
        certifications: [''],
        projects: [{ name: '', description: '', link: '' }],
        languages: [{ language: '', proficiency: '' }],
        hobbies: [''],
        references: { available: true }
    });
    const [isCvGenerated, setIsCvGenerated] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});


    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Handle next step with validation
    const handleNext = () => {
        const errors = validateStep(activeStep);
    
        // Check if there are any errors before proceeding
        if (Object.keys(errors).length === 0) {
            setValidationErrors({});
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            setValidationErrors(errors);
        }
    };
    

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
                errors.education = cvData.education.map((edu) => {
                    const entryErrors = {};
                    if (!edu.school) entryErrors.school = "School/University is required.";
                    if (!edu.degree) entryErrors.degree = "Degree is required.";
                    if (!edu.graduationYear) entryErrors.graduationYear = "Graduation Year is required.";
                    return entryErrors;
                });
    
                // Filter out any empty error objects
                errors.education = errors.education.filter((e) => Object.keys(e).length > 0);
                if (errors.education.length === 0) delete errors.education; // No errors if array is empty
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
                if (errors.workExperience.length === 0) delete errors.workExperience; // No errors if array is empty
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
                    newArray[index] = { ...newArray[index], [field]: value };
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
            [section]: [...prevData[section],
            section === 'projects' ? { name: '', description: '', link: '' } :
                section === 'languages' ? { language: '', proficiency: '' } :
                    '']
        }));
    };

    const removeListItem = (section, index) => {
        setCvData((prevData) => ({
            ...prevData,
            [section]: prevData[section].filter((_, i) => i !== index),
        }));
    };

    const handleGenerateCv = () => {
        setIsCvGenerated(true);
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
                                        label="Graduation Year"
                                        value={edu.graduationYear}
                                        onChange={(e) => handleInputChange('education', 'graduationYear', e.target.value, index)}
                                        error={!!validationErrors.education?.[index]?.graduationYear}
                                        helperText={validationErrors.education?.[index]?.graduationYear}
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
                                        fullWidth
                                        label="Start Date"
                                        value={exp.startDate}
                                        onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, index)}
                                        error={!!validationErrors.workExperience?.[index]?.startDate}
                                        helperText={validationErrors.workExperience?.[index]?.startDate}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="End Date"
                                        value={exp.endDate}
                                        onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Description"
                                        value={exp.description}
                                        onChange={(e) => handleInputChange('workExperience', 'description', e.target.value, index)}
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
                        <Typography variant="h6" gutterBottom>
                            Skills
                        </Typography>
                        {cvData.skills.map((skill, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label={`Skill ${index + 1}`}
                                        value={skill}
                                        onChange={(e) => handleInputChange('skills', null, e.target.value, index)}
                                    />
                                </Grid>
                                {index > 0 && (
                                    <Grid item xs={12}>
                                        <Button onClick={() => removeListItem('skills', index)} color="secondary">
                                            Remove Skill
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        ))}
                        <Button onClick={() => addListItem('skills')} variant="outlined" fullWidth>
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
                                    <TextField
                                        fullWidth
                                        label="Proficiency"
                                        value={lang.proficiency}
                                        onChange={(e) => handleInputChange('languages', 'proficiency', e.target.value, index)}
                                    />
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
                                        onChange={(e) => handleInputChange('hobbies', index, e.target.value)}
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
            default:
                return 'Unknown step';
        }
    };

    const renderCv = () => (
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                {cvData.personalInfo.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
                Email: {cvData.personalInfo.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
                Phone: {cvData.personalInfo.phone}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Education
            </Typography>
            {cvData.education.map((edu, index) => (
                <Box key={index}>
                    <Typography variant="body1">
                        {edu.degree} from {edu.school} ({edu.graduationYear})
                    </Typography>
                </Box>
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Work Experience
            </Typography>
            {cvData.workExperience?.map((exp, index) => (
                <Box key={index}>
                    <Typography variant="body1">
                        {exp.position} at {exp.company} ({exp.startDate} - {exp.endDate || 'Present'})
                    </Typography>
                    <Typography variant="body2">{exp.description}</Typography>
                </Box>
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Skills
            </Typography>
            <ul>
                {cvData.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                ))}
            </ul>

            {cvData.certifications?.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Certifications
                    </Typography>
                    <ul>
                        {cvData.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
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
                            <li key={index}>{lang.language} - {lang.proficiency}</li>
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
        <ThemeProvider theme={theme}>
            <Container maxWidth="md">
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
                    {isCvGenerated ? renderCv() : renderStepContent(activeStep)}
                    {!isCvGenerated && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={handleBack} sx={{ mr: 1 }} disabled={activeStep === 0}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={activeStep === steps.length - 1 ? handleGenerateCv : handleNext}
                            >
                                {activeStep === steps.length - 1 ? 'Generate CV' : 'Next'}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </ThemeProvider>
    );
}

export default BuildCvPage;