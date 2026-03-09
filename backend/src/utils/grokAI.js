const axios = require('axios');

const grokAPI = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const getAIExplanation = async (prompt) => {
  try {
    const response = await grokAPI.post('/chat/completions', {
      model: process.env.GROK_MODEL || 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful library assistant. Provide clear, concise, and professional responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Grok AI Error:', error.message);
    return 'Unable to get AI explanation at this moment.';
  }
};

const explainFines = async (fineAmount, daysOverdue, bookTitle) => {
  const prompt = `A user has an overdue fine of Rs.${fineAmount} for the book "${bookTitle}" which is ${daysOverdue} days overdue. 
  Please provide a brief, friendly explanation of why this fine was charged and what they can do about it. Keep it under 100 words.`;
  return await getAIExplanation(prompt);
};

const summarizeBorrowingHistory = async (bookTitles, issueCounts, totalBooksIssued) => {
  const booksStr = bookTitles.slice(0, 5).join(', ');
  const prompt = `A library user has borrowed ${totalBooksIssued} books, with their top reads being: ${booksStr}. 
  Please provide a brief, personalized summary of their reading habits and preferences in 80 words or less.`;
  return await getAIExplanation(prompt);
};

const generateDemandForecast = async (categoryName, currentDemand, avgCheckout) => {
  const prompt = `In a library system, the category "${categoryName}" has a current demand of ${currentDemand} and average checkout rate of ${avgCheckout} per month. 
  Provide recommendations for stock management in 60 words.`;
  return await getAIExplanation(prompt);
};

const analyzeOverdueRisk = async (userName, pastOverdue, currentIssues, daysOverdueLimit) => {
  const prompt = `For a library member named ${userName} with ${pastOverdue} past overdue incidents and currently ${currentIssues} active issues, 
  analyze their overdue risk and provide brief recommendations in 50 words.`;
  return await getAIExplanation(prompt);
};

module.exports = {
  getAIExplanation,
  explainFines,
  summarizeBorrowingHistory,
  generateDemandForecast,
  analyzeOverdueRisk
};
