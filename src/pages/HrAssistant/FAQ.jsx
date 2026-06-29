import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Box } from '@mui/material';

const faqs = [
  {
    question: 'What is the process for requesting time off?',
    answer: 'To request time off, please submit a request through the HR portal. Your manager will then review and approve it.',
  },
  {
    question: 'How can I view my remaining vacation days?',
    answer: 'You can view your remaining vacation days in the employee dashboard of the HR portal.',
  },
  {
    question: 'What are the company holidays?',
    answer: 'A list of company holidays is available in the employee handbook, which can be found in the documents section of the HR portal.',
  },
  {
    question: 'How do I enroll in or change my benefits?',
    answer: 'Benefit enrollment and changes can be made during the open enrollment period. You will receive an email notification with instructions.',
  },
];

const FAQ = () => {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const handleChange = (event) => {
    const question = event.target.value;
    setSelectedQuestion(question);
    const faq = faqs.find(f => f.question === question);
    setSelectedAnswer(faq ? faq.answer : '');
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
        Frequently Asked Questions
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Select a question</InputLabel>
        <Select value={selectedQuestion} onChange={handleChange}>
          {faqs.map((faq, index) => (
            <MenuItem key={index} value={faq.question}>
              {faq.question}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedAnswer && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography>{selectedAnswer}</Typography>
        </Box>
      )}
    </div>
  );
};

export default FAQ;
