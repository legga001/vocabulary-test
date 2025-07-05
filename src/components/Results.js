// Updated section of src/components/Results.js to add zooplankton support

// In the getQuestionsAndArticleInfo function:
const getQuestionsAndArticleInfo = () => {
  let questions = [];
  let articleInfo = null;

  if (quizType === 'article') {
    try {
      switch (articleType) {
        case 'zooplankton-quiz':
          const zooplanktonModule = require('../zooplanktonVocabularyData');
          questions = zooplanktonModule.getZooplanktonVocabularyQuestions();
          articleInfo = zooplanktonModule.getZooplanktonArticleInfo();
          break;
        case 'killer-whale-quiz':
          const killerWhaleModule = require('../killerWhaleVocabularyData');
          questions = killerWhaleModule.getKillerWhaleVocabularyQuestions();
          articleInfo = killerWhaleModule.getKillerWhaleArticleInfo();
          break;
        case 'smuggling-quiz':
          const smugglingModule = require('../smugglingVocabularyData');
          questions = smugglingModule.getSmugglingVocabularyQuestions();
          articleInfo = smugglingModule.getArticleInfo();
          break;
        case 'air-india-quiz':
          const airIndiaModule = require('../airIndiaVocabularyData');
          questions = airIndiaModule.getAirIndiaVocabularyQuestions();
          articleInfo = airIndiaModule.getAirIndiaArticleInfo();
          break;
        case 'water-treatment-quiz':
          const waterTreatmentModule = require('../waterTreatmentVocabularyData');
          questions = waterTreatmentModule.getWaterTreatmentVocabularyQuestions();
          articleInfo = waterTreatmentModule.getWaterTreatmentArticleInfo();
          break;
        case 'octopus-quiz':
          const octopusModule = require('../readingVocabularyData');
          questions = octopusModule.getReadingVocabularyQuestions();
          articleInfo = octopusModule.getReadingArticleInfo();
          break;
        default:
          const defaultModule = require('../articleQuestions');
          questions = defaultModule.getArticleQuestions();
          articleInfo = defaultModule.getArticleInfo();
      }
    } catch (error) {
      console.error('Error loading article questions:', error);
      const fallbackModule = require('../articleQuestions');
      questions = fallbackModule.getArticleQuestions();
      articleInfo = fallbackModule.getArticleInfo();
    }
  } else {
    questions = getNewQuestions();
  }
  
  return { questions, articleInfo };
};
