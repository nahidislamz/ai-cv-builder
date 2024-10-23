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
    Card,
    CardContent,
    CardMedia,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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

const steps = ['Personal Information', 'Education', 'Work Experience', 'Skills', 'Choose Template'];

const templates = [
    { id: 1, name: 'Professional', image: '/placeholder.svg?height=150&width=200' },
    { id: 2, name: 'Creative', image: '/placeholder.svg?height=150&width=200' },
    { id: 3, name: 'Simple', image: '/placeholder.svg?height=150&width=200' },
];

function BuildCvPage() {
    const [activeStep, setActiveStep] = useState(0);

    const [cvData, setCvData] = useState({
        personalInfo: { name: '', email: '', phone: '' },
        education: [{ school: '', degree: '', graduationYear: '' }],
        workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
        skills: [''],
        selectedTemplate: '',
    });

    const handleNext = () => {
        // Example validation for the personal info step
        if (activeStep === 0) {
            const { name, email, phone } = cvData.personalInfo;
            if (!name || !email || !phone) {
                alert("Please fill in all personal information.");
                return;
            }
        }
        // Add additional validation for other steps as needed
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleInputChange = (section, field, value, index = 0) => {
        if (section === 'skills') {
            // Update the skills array
            setCvData((prevData) => {
                const newSkills = [...prevData.skills];
                newSkills[index] = value;  // Update the skill at the specific index
                return { ...prevData, skills: newSkills };
            });
        } else {
            setCvData((prevData) => ({
                ...prevData,
                [section]: Array.isArray(prevData[section])
                    ? prevData[section].map((item, i) => (i === index ? { ...item, [field]: value } : item))
                    : { ...prevData[section], [field]: value },
            }));
        }
    };


    const addListItem = (section) => {
        setCvData((prevData) => ({
            ...prevData,
            [section]: [...prevData[section], section === 'skills' ? '' : {}],
        }));
    };

    const removeListItem = (section, index) => {
        setCvData((prevData) => ({
            ...prevData,
            [section]: prevData[section].filter((_, i) => i !== index),
        }));
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
                                <TextField
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={cvData.personalInfo.name}
                                    onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={cvData.personalInfo.email}
                                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Phone"
                                    value={cvData.personalInfo.phone}
                                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
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
                            <Grid container spacing={3} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="School/University"
                                        value={edu.school}
                                        onChange={(e) => handleInputChange('education', 'school', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Degree"
                                        value={edu.degree}
                                        onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Graduation Year"
                                        value={edu.graduationYear}
                                        onChange={(e) => handleInputChange('education', 'graduationYear', e.target.value, index)}
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
                        <Button onClick={() => addListItem('education')} variant="outlined">
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
                            <Grid container spacing={3} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Company"
                                        value={exp.company}
                                        onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Position"
                                        value={exp.position}
                                        onChange={(e) => handleInputChange('workExperience', 'position', e.target.value, index)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Start Date"
                                        value={exp.startDate}
                                        onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, index)}
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
                        <Button onClick={() => addListItem('workExperience')} variant="outlined">
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
                            <Grid container spacing={3} key={index} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label={`Skill ${index + 1}`}
                                        value={skill}
                                        onChange={(e) => handleInputChange('skills', index, e.target.value)}
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
                        <Button onClick={() => addListItem('skills')} variant="outlined">
                            Add Skill
                        </Button>
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Choose Template
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="template-select-label">Template</InputLabel>
                            <Select
                                labelId="template-select-label"
                                value={cvData.selectedTemplate}
                                onChange={(e) => handleInputChange('selectedTemplate', '', e.target.value)}
                                label="Template"
                            >
                                {templates.map((template) => (
                                    <MenuItem key={template.id} value={template.id}>
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Grid container spacing={2}>
                            {templates.map((template) => (
                                <Grid item xs={12} sm={4} key={template.id}>
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={template.image}
                                            alt={template.name}
                                        />
                                        <CardContent>
                                            <Typography variant="h6">{template.name}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Build Your CV
                    </Typography>
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {renderStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} sx={{ mr: 1 }}>
                                Back
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={activeStep === steps.length - 1 ? () => console.log('Generate CV', cvData) : handleNext}
                        >
                            {activeStep === steps.length - 1 ? 'Generate CV' : 'Next'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </ThemeProvider>
    );
}

export default BuildCvPage;
