// src/airIndiaVocabularyData.js - Air India crash article vocabulary test
export const airIndiaArticle = {
  title: "'Traffic saved me': Student missed Air India crash by just 10 minutes",
  url: "https://www.bbc.co.uk/news/articles/cvgv26zz5wzo",
  date: "2025-01-14",
  summary: "Bhoomi Chauhan missed her Air India flight to London by 10 minutes due to traffic delays, unknowingly avoiding a crash that killed 241 people.",
  
  // Article excerpt for context
  excerpt: `
Bhoomi Chauhan remembers being angry and frustrated. Bumper-to-bumper traffic had delayed her car journey to Ahmedabad airport - so much so that she missed her Air India flight to London Gatwick by just 10 minutes. The 28-year-old was due to fly home on AI171 on Thursday, which crashed shortly after take-off, killing 241 people on board and more on the ground.
  `,
  
  questions: [
    // A2 Level (2 questions)
    {
      level: "A2",
      sentence: "The traffic made her very a____ and frustrated when she missed the flight.",
      answer: "angry",
      hint: "This emotion is the opposite of happy or calm.",
      context: "From the opening paragraph where Bhoomi describes her feelings"
    },
    {
      level: "A2", 
      sentence: "She was d__ to fly home on Thursday on flight AI171.",
      answer: "due",
      hint: "This means 'supposed to' or 'scheduled to'.",
      context: "From the paragraph about her planned departure"
    },
    // B1 Level (2 questions)
    {
      level: "B1",
      sentence: "The plane cra____ shortly after take-off from Ahmedabad airport.",
      answer: "crashed",
      hint: "This means when an aircraft falls from the sky and hits the ground violently.",
      context: "From the paragraph describing what happened to flight AI171"
    },
    {
      level: "B1",
      sentence: "She was very disa_______ when the airline staff wouldn't let her board.",
      answer: "disappointed",
      hint: "This feeling happens when something you hoped for doesn't happen.",
      context: "From Bhoomi's quote about being turned away at the airport"
    },
    // B2 Level (4 questions)
    {
      level: "B2",
      sentence: "Bumper-to-bumper traffic del_____ her car journey to the airport significantly.",
      answer: "delayed",
      hint: "This means to make something happen later than planned.",
      context: "From the opening paragraph about the traffic problems"
    },
    {
      level: "B2",
      sentence: "She was fru_______ by the heavy traffic that made her late for her flight.",
      answer: "frustrated",
      hint: "This feeling comes when you're prevented from achieving something.",
      context: "From the description of Bhoomi's emotional state in traffic"
    },
    {
      level: "B2",
      sentence: "When she missed the flight, she was dej_____ and could only think about starting earlier.",
      answer: "dejected",
      hint: "This means feeling sad and disappointed, especially after a failure.",
      context: "From Bhoomi's quote about her feelings after missing the flight"
    },
    {
      level: "B2",
      sentence: "She req______ airline staff to allow her inside as she was only 10 minutes late.",
      answer: "requested",
      hint: "This means to ask for something politely but formally.",
      context: "From Bhoomi's description of pleading with airport staff"
    },
    // C1 Level (2 questions)
    {
      level: "C1",
      sentence: "The plane appeared to str_____ to gain altitude and crashed about 30 seconds into the flight.",
      answer: "struggle",
      hint: "This means to try very hard to do something difficult.",
      context: "From the technical description of the aircraft's final moments"
    },
    {
      level: "C1",
      sentence: "Emergency services worked late into the night to clear deb___ and search for answers.",
      answer: "debris",
      hint: "This refers to scattered pieces of something that has been destroyed.",
      context: "From the paragraph about the rescue and investigation efforts"
    }
  ]
};

// Helper function to get Air India vocabulary questions
export const getAirIndiaVocabularyQuestions = () => {
  return airIndiaArticle.questions;
};

// Helper function to get Air India article info
export const getAirIndiaArticleInfo = () => {
  return {
    title: airIndiaArticle.title,
    url: airIndiaArticle.url,
    summary: airIndiaArticle.summary,
    date: airIndiaArticle.date,
    excerpt: airIndiaArticle.excerpt
  };
};
