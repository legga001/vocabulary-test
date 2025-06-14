// src/waterTreatmentVocabularyData.js - Water treatment with worms and fleas article vocabulary test
export const waterTreatmentArticle = {
  title: "Worms and fleas used in green water treatment",
  url: "https://www.bbc.co.uk/news/uk-scotland-highlands-islands-50379846",
  date: "2019-11-12",
  summary: "A revolutionary emissions-free sewage treatment technique using earthworms and water fleas is being trialled in a Highland community to replicate natural soil processes.",
  
  // Article excerpt for context
  excerpt: `
An emissions-free technique for treating sewage using bugs is being trialled in a small Highland community. Earthworms and water fleas are being added to the waste water at Littlemill near Nairn. Two tanks have been installed at an existing treatment works to pilot the technique which aims to reduce the environmental impact from sewage.
  `,
  
  questions: [
    // A2 Level (2 questions)
    {
      level: "A2",
      sentence: "Scientists are trying to cl___ the dirty water using natural methods.",
      answer: "clean",
      hint: "This means to remove dirt or harmful substances.",
      context: "From the description of the water treatment process"
    },
    {
      level: "A2", 
      sentence: "The w____ will eat the larger pieces of rubbish in the water.",
      answer: "worms",
      hint: "These are long, thin creatures that live in soil.",
      context: "From the explanation of how earthworms help clean water"
    },
    // B1 Level (2 questions)
    {
      level: "B1",
      sentence: "The new technique aims to reduce the environmental imp___ from sewage treatment.",
      answer: "impact",
      hint: "This means the effect that something has on the environment.",
      context: "From the paragraph about the aims of the project"
    },
    {
      level: "B1",
      sentence: "The clean water will be rel_____ into local rivers after treatment.",
      answer: "released",
      hint: "This means to let something go free or set it loose.",
      context: "From the description of what happens to treated water"
    },
    // B2 Level (4 questions)
    {
      level: "B2",
      sentence: "An emissions-free tech_____ for treating sewage is being tested in Scotland.",
      answer: "technique",
      hint: "This means a particular way of doing something, especially one requiring skill.",
      context: "From the opening paragraph describing the new method"
    },
    {
      level: "B2",
      sentence: "The project rep______ a natural process that happens in soil.",
      answer: "replicates",
      hint: "This means to copy or reproduce something exactly.",
      context: "From Anna Baran's explanation of how the technology works"
    },
    {
      level: "B2",
      sentence: "During the trial, the water will still be treated using conv_______ methods.",
      answer: "conventional",
      hint: "This means traditional or usual ways of doing something.",
      context: "From the paragraph about the 12-month trial process"
    },
    {
      level: "B2",
      sentence: "It is estimated that 2.5 billion people have no san______ facilities.",
      answer: "sanitation",
      hint: "This refers to systems for keeping places clean and healthy, especially sewage systems.",
      context: "From the global statistics about access to clean water"
    },
    // C1 Level (2 questions)
    {
      level: "C1",
      sentence: "The technology could make a sig_______ impact on waste water treatment worldwide.",
      answer: "significant",
      hint: "This means important, large, or noticeable in effect or influence.",
      context: "From Anna Baran's quote about the project's potential"
    },
    {
      level: "C1",
      sentence: "Water fleas and microalgae remove the finer particles of org____ matter.",
      answer: "organic",
      hint: "This refers to materials that come from living things, like plants and animals.",
      context: "From the technical explanation of the two-stage treatment process"
    }
  ]
};

// Helper function to get water treatment vocabulary questions
export const getWaterTreatmentVocabularyQuestions = () => {
  return waterTreatmentArticle.questions;
};

// Helper function to get water treatment article info
export const getWaterTreatmentArticleInfo = () => {
  return {
    title: waterTreatmentArticle.title,
    url: waterTreatmentArticle.url,
    summary: waterTreatmentArticle.summary,
    date: waterTreatmentArticle.date,
    excerpt: waterTreatmentArticle.excerpt
  };
};
