import React, { useState } from "react";
import { Box, Alert, Typography, Grid, Button, TextField, Chip, Fade } from "@mui/material";
import { Lightbulb, Add } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const SkillsInput = ({ cvData, setCvData, suggestedSkills }) => {
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] =useState('');

  // Add skill function
  const handleAddSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill && 
      !cvData.skills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())
    ) {
      setCvData((prevData) => ({
        ...prevData,
        skills: [...prevData.skills, trimmedSkill],
      }));
    } else {
      setMessage('Skills already exist!');
    }
  };
  

  // Handle adding user-inputted skill
  const handleAddSkillFromInput = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill) {
      // Check if skill already exists
      if (cvData.skills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())) {
        // Set the message if skill exists
        setMessage("Skill already exists!");
      } else {
        // Add the new skill if it doesn't exist
        setCvData((prevData) => ({
          ...prevData,
          skills: [...prevData.skills, trimmedSkill],
        }));
        setSkillInput(""); // Clear the input field after adding
        setMessage(""); // Clear any previous message
      }
    }
  };

  const handleRemoveSkill = (index) => {
    setCvData((prevData) => ({
      ...prevData,
      skills: prevData.skills.filter((_, i) => i !== index),
    }));
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkillFromInput();
    }
  };

  return (
      <Fade in={true} timeout={1000}>
        <Box>
          <Alert
            severity="info"
            icon={<Lightbulb sx={{ color: "warning.main" }} />}
            sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}
          >
            Highlight your expertise by adding at least 3 key skills.
          </Alert>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
            Professional Skills
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="E.g., Project Management, Python, Digital Marketing"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleAddSkillFromInput}
                      variant="contained"
                      color="primary"
                      sx={{ ml: 1 }}
                    >
                      <Add />
                    </Button>
                  ),
                }}
              />
            </Grid>
          </Grid>
          {message && <Alert severity="error" sx={{marginBottom:2}}>{message}</Alert>}
          {/* Display Added Skills */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <AnimatePresence>
              {cvData.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Chip
                    label={skill}
                    onDelete={() => handleRemoveSkill(index)}
                    color="primary"
                    variant="outlined"
                    sx={{
                      m: 0.5,
                      borderRadius: "16px",
                      "&:hover": { boxShadow: 2 },
                      transition: "box-shadow 0.3s ease-in-out",
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {/* Display Suggested Skills with + Button */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            <Typography variant="h6" color="secondary" sx={{ mb: 2 }}>
              Suggested Skills
            </Typography>
            <AnimatePresence> 
              {suggestedSkills.map((suggestedSkill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Chip
                    label={suggestedSkill}
                    color="secondary"
                    variant="contained"
                    sx={{
                      m: 0.5,
                      borderRadius: "16px",
                      "&:hover": { boxShadow: 2 },
                      transition: "box-shadow 0.3s ease-in-out",
                    }}
                    deleteIcon={<Add />}
                    onDelete={() => handleAddSkill(suggestedSkill)} // Add skill when "+" is clicked
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Box>
      </Fade>

  );
};

export default SkillsInput;
