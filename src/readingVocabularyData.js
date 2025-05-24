// src/readingVocabularyData.js
// Vocabulary exercises based on the BBC article "Octopus invasion is ruining our livelihoods"

export const readingArticle = {
  title: "Octopus invasion is ruining our livelihoods",
  url: "https://www.bbc.co.uk/news/articles/ce81yl0gvrro",
  date: "2025-05-19",
  summary: "Some fishermen in south-west England say an 'invasion' of octopus and a local bylaw are 'decimating' the Devon shellfish industry.",
  
  // Article excerpt for context
  excerpt: `
Some fishermen in south-west England say an "invasion" of octopus and a local bylaw are "decimating" the Devon shellfish industry. The octopus, usually found in the Mediterranean, are being found in lobster and crab pots off the coastline. Fishers said they were landing between four and six tonnes of them a day. They said open escape holes in pots for juvenile shellfish, enforced by the bylaw, allowed the creatures in and out to eat shellfish, and fishermen wanted to close the gaps.
  `,
  
  questions: [
    // A2 Level (2 questions) - Very basic vocabulary
    {
      level: "A2",
      sentence: "The fishermen wanted to c__e the gaps in their crab pots.",
      answer: "close",
      hint: "This means to shut something.",
      context: "From the paragraph about fishermen wanting to block the holes"
    },
    {
      level: "A2", 
      sentence: "The octopus go through 50 p__s and eat all the crabs inside.",
      answer: "pots",
      hint: "These are containers used for catching sea animals.",
      context: "From the paragraph where Brian Tapper talks about his crab traps"
    },
    // B1 Level (2 questions) - Common intermediate words
    {
      level: "B1",
      sentence: "The octopus are r____g the fishing business for local fishermen.",
      answer: "ruining",
      hint: "This means destroying or spoiling something completely.",
      context: "From the paragraph where Brian Tapper describes the problem"
    },
    {
      level: "B1",
      sentence: "Fishermen are c_____g between four and six tonnes of octopus every day.",
      answer: "catching",
      hint: "This means taking fish or sea animals from the water.",
      context: "From the paragraph about the daily amount of octopus being found"
    },
    // B2 Level (4 questions) - More advanced but accessible vocabulary
    {
      level: "B2",
      sentence: "Barry Young described the octopus as an i_____n from the Mediterranean.",
      answer: "invasion",
      hint: "This means when large numbers of something unwanted arrive suddenly.",
      context: "From the paragraph where Barry Young explains the situation"
    },
    {
      level: "B2",
      sentence: "The octopus are usually found in the M___________n Sea, not in British waters.",
      answer: "Mediterranean",
      hint: "This is the name of the sea between Europe and Africa.",
      context: "From the paragraph explaining where these octopus normally live"
    },
    {
      level: "B2",
      sentence: "There are concerns about a s______e of crabs and lobsters in restaurants.",
      answer: "shortage",
      hint: "This means not having enough of something that is needed.",
      context: "From the paragraph about the impact on restaurants and shops"
    },
    {
      level: "B2",
      sentence: "The authority held an e_______y meeting to discuss the problem.",
      answer: "emergency",
      hint: "This describes something urgent that needs immediate attention.",
      context: "From the paragraph about the fishing authority's quick response"
    },
    // C1 Level (2 questions) - Advanced but not overly complex
    {
      level: "C1",
      sentence: "The escape holes allow j______e shellfish to get out of the pots safely.",
      answer: "juvenile",
      hint: "This describes young animals that are not yet fully grown.",
      context: "From the paragraph explaining the purpose of the escape holes"
    },
    {
      level: "C1",
      sentence: "Some fishermen are w______g the octopus arrival because they sell for high prices.",
      answer: "welcoming",
      hint: "This means being happy about something and accepting it positively.",
      context: "From the paragraph about fishermen who see the octopus as profitable"
    }
  ]
};

// Helper function to get reading vocabulary questions
export const getReadingVocabularyQuestions = () => {
  return readingArticle.questions;
};

// Helper function to get reading article info
export const getReadingArticleInfo = () => {
  return {
    title: readingArticle.title,
    url: readingArticle.url,
    summary: readingArticle.summary,
    date: readingArticle.date,
    excerpt: readingArticle.excerpt
  };
};