import React ,{ useEffect, useRef } from 'react';
import {
  Typography,
  Paper,
  Box,
  Chip,
  Grid,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Email,
  Phone,
  School,
  Work,
  Code,
  Language,
  EmojiEvents,
  Assignment,
  SportsEsports,
  ContactPage,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
}));
const NonSelectableText = styled(Typography)`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  paddingBottom: theme.spacing(0.5),
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
  '& > svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(1),
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));


const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function RenderCv({ cvData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef(null);
  useEffect(() => {
    const preventCopy = (e) => e.preventDefault();

    const preventScreenshot = (e) => {
      if (e.key === 'PrintScreen') {
        alert('Screenshots are not allowed.');
        navigator.clipboard.writeText('Screenshots are disabled on this page.');
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('copy', preventCopy);
      container.addEventListener('cut', preventCopy);
      container.addEventListener('paste', preventCopy);
      document.addEventListener('keydown', preventScreenshot);
    }
    console.log(cvData);
    return () => {
      if (container) {
        container.removeEventListener('copy', preventCopy);
        container.removeEventListener('cut', preventCopy);
        container.removeEventListener('paste', preventCopy);
      }
      document.removeEventListener('keydown', preventScreenshot);
    };
   
  }, []);

  return (
    <StyledPaper elevation={0} component={motion.div} variants={fadeInUp} initial="initial" animate="animate" ref={containerRef}>
      <NonSelectableText user-select={'none'} variant={isMobile ? "h4" : "h3"} gutterBottom component={motion.div} {...fadeInUp}>
        {cvData.personalInfo.name}
      </NonSelectableText>
      <Box mb={2}>
        <IconWrapper>
          <Email fontSize="small" />
          <Link href={`mailto:${cvData.personalInfo.email}`} color="inherit" sx={{ wordBreak: 'break-all' }}>
            {cvData.personalInfo.email}
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Phone fontSize="small" />
          <Link href={`tel:${cvData.personalInfo.phone}`} color="inherit">
            {cvData.personalInfo.phone}
          </Link>
        </IconWrapper>
      </Box>

      {cvData.profileSummary && (
        <Box mb={3} component={motion.div} {...fadeInUp}>
          <SectionTitle variant="h5" gutterBottom>
            Profile Summary
          </SectionTitle>
          <NonSelectableText variant="body1" sx={{ textAlign: 'justify' }}>
            {cvData.profileSummary}
          </NonSelectableText>
        </Box>
      )}

      <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
        <IconWrapper>
          <School />
          Education
        </IconWrapper>
      </SectionTitle>
      <Grid container spacing={2}>
        {cvData.education.map((edu, index) => (
          <Grid item xs={12} key={index} component={motion.div} {...fadeInUp}>
            <Box mb={2}>
              <NonSelectableText variant="h6" component="span" sx={{ mr: 1, display: 'block' }}>
                {edu.degree}
              </NonSelectableText>
              <NonSelectableText variant="body1" component="span" sx={{ display: 'block' }}>
                {edu.school} ({edu.graduationYear})
              </NonSelectableText>
              <NonSelectableText
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: typeof edu.subjects === 'string' ? edu.subjects : '',
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
        <IconWrapper>
          <Work />
          Work Experience
        </IconWrapper>
      </SectionTitle>
      <Grid container spacing={2}>
        {cvData.workExperience?.map((exp, index) => (
          <Grid item xs={12} key={index} component={motion.div} {...fadeInUp}>
            <Box mb={2}>
              <NonSelectableText variant="h6" component="span" sx={{ mr: 1, display: 'block' }}>
                {exp.position}
              </NonSelectableText>
              <NonSelectableText variant="body1" component="span" sx={{ mr: 1, display: 'block' }}>
                {exp.company}
              </NonSelectableText>
              <NonSelectableText variant="body2" component="span" color="textSecondary" sx={{ display: 'block' }}>
                {new Date(exp.startDate).toLocaleDateString('en-GB', {
                  month: 'short',
                  year: 'numeric'
                })}
                {' - '}
                {exp.endDate
                  ? new Date(exp.endDate).toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'Present'}
              </NonSelectableText>
              <NonSelectableText
                variant="body2"
                dangerouslySetInnerHTML={{
                  __html: typeof exp.description === 'string' ? exp.description : '',
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
        <IconWrapper>
          <Code />
          Skills
        </IconWrapper>
      </SectionTitle>
      <Box mb={3} component={motion.div} {...fadeInUp}>
        {cvData.skills.map((skill, index) => (
          <SkillChip key={index} label={typeof skill === 'string' ? skill : ''} />
        ))}
      </Box>

      {cvData.certifications?.length > 0 && (
        <>
          <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
            <IconWrapper>
              <EmojiEvents />
              Certifications
            </IconWrapper>
          </SectionTitle>
          <Box mb={3} component={motion.div} {...fadeInUp}>
            {cvData.certifications.map((cert, index) => (
              <Chip
                key={index}
                label={typeof cert === 'string' ? cert : ''}
                sx={{ m: 0.5 }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </>
      )}

      {cvData.projects?.length > 0 && (
        <>
          <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
            <IconWrapper>
              <Assignment />
              Projects
            </IconWrapper>
          </SectionTitle>
          <Grid container spacing={2}>
            {cvData.projects.map((project, index) => (
              <Grid item xs={12} sm={6} key={index} component={motion.div} {...fadeInUp}>
                <Box mb={2}>
                  <NonSelectableText variant="h6">{project.name}</NonSelectableText>
                  <NonSelectableText variant="body2">{project.description}</NonSelectableText>
                  {project.link && (
                    <Link href={project.link} target="_blank" rel="noopener noreferrer" color="primary">
                      View Project
                    </Link>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {cvData.languages?.length > 0 && (
        <>
          <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
            <IconWrapper>
              <Language />
              Languages
            </IconWrapper>
          </SectionTitle>
          <Box mb={3} component={motion.div} {...fadeInUp}>
            {cvData.languages.map((lang, index) => (
              <Chip
                key={index}
                label={`${lang.language} - ${lang.proficiency}`}
                sx={{ m: 0.5 }}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </>
      )}

      {cvData.hobbies.length > 0 && (
        <>
          <SectionTitle variant="h5" gutterBottom component={motion.div} {...fadeInUp}>
            <IconWrapper>
              <SportsEsports />
              Hobbies and Interests
            </IconWrapper>
          </SectionTitle>
          <Box mb={3} component={motion.div} {...fadeInUp}>
            {cvData.hobbies.map((hobby, index) => (
              <Chip key={index} label={hobby} sx={{ m: 0.5 }} />
            ))}
          </Box>
        </>
      )}

      {cvData.references.available && (
        <Box mt={3} component={motion.div} {...fadeInUp}>
          <IconWrapper>
            <ContactPage />
            <NonSelectableText variant="body1">
              References available upon request.
            </NonSelectableText>
          </IconWrapper>
        </Box>
      )}
    </StyledPaper>
  );
}