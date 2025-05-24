// src/articleQuestions.js
// This file contains questions generated from BBC articles
// Update this file weekly with new article questions

export const currentArticle = {
  title: "Yachts easy way to bring in migrants - ex-smuggler",
  url: "https://www.bbc.co.uk/news/articles/c70664266plo",
  date: "2025-05-24",
  summary: "A former British soldier reveals how he used yachts to smuggle migrants through private marinas in seaside towns across south-east England.",
  // Questions generated from the actual BBC article content
  questions: [
    // A2 Level (2 questions)
    {
      level: "A2",
      sentence: "Nick would s__l from Kent to France during the night to avoid being seen.",
      answer: "sail",
      hint: "This means to travel by boat using wind or motor.",
      context: "From the paragraph about Nick's nighttime boat journeys"
    },
    {
      level: "A2", 
      sentence: "The migrants had to h__e inside the boat's cabin until the next evening.",
      answer: "hide",
      hint: "This means to stay out of sight so nobody can find you.",
      context: "From the paragraph about concealing people on the yacht"
    },
    // B1 Level (2 questions)
    {
      level: "B1",
      sentence: "Nick was c__t by police after they watched him for months.",
      answer: "caught",
      hint: "This means to be captured or arrested by authorities.",
      context: "From the paragraph about Nick's arrest by organized crime unit"
    },
    {
      level: "B1",
      sentence: "Private marinas have very little s______y compared to major ports.",
      answer: "security",
      hint: "This refers to protection measures and safety systems.",
      context: "From harbourmaster quotes about marina vulnerabilities"
    },
    // B2 Level (4 questions)
    {
      level: "B2",
      sentence: "Border Force described the smuggling methods as a really c______g risk.",
      answer: "concerning",
      hint: "This means worrying or causing serious anxiety about something.",
      context: "From Border Force's official response to the smuggling revelations"
    },
    {
      level: "B2",
      sentence: "The ex-soldier was r______d by an Albanian friend who needed his help.",
      answer: "recruited",
      hint: "This means to persuade someone to join an organization or activity.",
      context: "From the paragraph about how Matt convinced Nick to become a smuggler"
    },
    {
      level: "B2",
      sentence: "Nick would carefully plan his trips around favorable t__s and weather.",
      answer: "tides",
      hint: "These are the regular rise and fall of sea levels caused by the moon.",
      context: "From the paragraph about Nick's careful planning of smuggling trips"
    },
    {
      level: "B2",
      sentence: "The Vietnamese migrants wanted to d______r into the black economy.",
      answer: "disappear",
      hint: "This means to vanish completely without leaving any trace.",
      context: "From the paragraph about migrants avoiding detection after arrival"
    },
    // C1 Level (2 questions)
    {
      level: "C1",
      sentence: "Border Force said they would look at the v_____________s Nick had identified.",
      answer: "vulnerabilities",
      hint: "These are security weaknesses that can be exploited by criminals.",
      context: "From Border Force director's response about security gaps"
    },
    {
      level: "C1",
      sentence: "Nick's pale c________n helped him avoid suspicion from border authorities.",
      answer: "complexion",
      hint: "This refers to the natural color and texture of someone's facial skin.",
      context: "From the paragraph explaining why Nick was chosen for smuggling operations"
    }
  ]
};

// Template for generating new questions - you'll use this weekly
export const questionTemplate = {
  // Copy this structure when creating new questions
  level: "A2", // or B1, B2, C1
  sentence: "Sample sentence with g_p to fill", // Use first and last letter only
  answer: "gap", // The correct word
  hint: "Helpful hint about the word meaning",
  context: "Brief context about where this appeared in the article"
};

// Helper function to get article questions
export const getArticleQuestions = () => {
  return currentArticle.questions;
};

// Helper function to get article info
export const getArticleInfo = () => {
  return {
    title: currentArticle.title,
    url: currentArticle.url,
    date: currentArticle.date,
    summary: currentArticle.summary
  };
};