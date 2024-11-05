import React from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

export default function FAQPage() {
  return (
    <Container maxWidth="md" sx={{ my: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Frequently Asked Questions
      </Typography>
      <Box my={4}>
        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${index}`}
              id={`faq-header-${index}`}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Divider sx={{ my: 4 }} />
      <Box>
        <Typography variant="h5" gutterBottom>
          Refund Policy
        </Typography>
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
      </Box>
    </Container>
  );
}