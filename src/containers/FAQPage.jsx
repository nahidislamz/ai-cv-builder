import React from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "How does the AI CV optimization work?",
    answer: "Our AI analyzes the job description you provide and compares it with your CV. It then suggests modifications to your CV to better align with the job requirements, such as highlighting relevant skills and experiences, and adjusting the language to match the job posting."
  },
  {
    question: "How long does it take to create a CV using your platform?",
    answer: "With our AI-powered tools, you can create a professional CV in as little as 10-15 minutes. However, we recommend taking your time to review and personalize the content for the best results."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent."
  },
  {
    question: "Can I create multiple versions of my CV?",
    answer: "Our platform allows you to create and save multiple versions of your CV. This is particularly useful when applying for different types of jobs or industries."
  },
  {
    question: "How do I know if my CV is ATS-friendly?",
    answer: "Our system automatically formats your CV to be ATS-friendly. We use simple, clean layouts, standard fonts, and avoid complex graphics or tables that might confuse ATS software. We also provide an ATS compatibility score for your CV."
  },
  {
    question: "Do you offer refunds?",
    answer: "We have a strict no-refund policy. Once you've purchased our service and gained access to our AI CV builder and optimization tools, we cannot offer refunds. We encourage you to carefully review our service offerings and terms before making a purchase. If you have any questions or concerns, please contact our customer support team before buying."
  },
  {
    question: "Can I download my CV in different formats?",
    answer: "Yes, you can download your CV in PDF, Word, and plain text formats. The PDF and Word formats are great for sending to employers, while the plain text version is useful for copying and pasting into online application forms."
  },
  {
    question: "How often should I update my CV?",
    answer: "We recommend updating your CV whenever you have new relevant experiences, skills, or achievements. At a minimum, you should review and update your CV every 6-12 months, even if you're not actively job hunting."
  }
];

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const MotionContainer = motion(Container);
const MotionTypography = motion(Typography);
const MotionBox = motion(Box);

export default function FAQPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MotionContainer
      maxWidth="md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box my={8}>
        <MotionTypography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          fontWeight="bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Frequently Asked Questions
        </MotionTypography>
        <MotionBox
          my={6}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <StyledAccordion>
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-content-${index}`}
                  id={`faq-header-${index}`}
                >
                  <Typography variant="h6">{faq.question}</Typography>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </StyledAccordionDetails>
              </StyledAccordion>
            </motion.div>
          ))}
        </MotionBox>
        <Divider sx={{ my: 6 }} />
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <MotionTypography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Refund Policy
          </MotionTypography>
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Typography variant="body1" paragraph>
              At AI CV Builder, we are committed to providing high-quality services to help you create the best possible CV. Please note that we have a strict no-refund policy.
            </Typography>
            <Typography variant="body1" paragraph>
              Once you have made a purchase and gained access to our AI CV building and optimization tools, we cannot offer refunds. This policy is in place because our service provides immediate access to valuable digital content and tools.
            </Typography>
            <Typography variant="body1" paragraph>
              We encourage all users to carefully review our service offerings, terms of use, and this FAQ section before making a purchase. If you have any questions or concerns about our services, please contact our customer support team before buying.
            </Typography>
            <Typography variant="body1">
              By making a purchase, you acknowledge and agree to this no-refund policy. We appreciate your understanding and look forward to helping you create an outstanding CV.
            </Typography>
          </MotionBox>
        </Paper>
      </Box>
    </MotionContainer>
  );
}