// Updated sections of src/components/Quiz.js to add zooplankton support

// In the loadQuestions useEffect:
useEffect(() => {
  const loadQuestions = async () => {
    try {
      let questionData = [];
      
      if (quizType === 'article') {
        console.log('📚 Loading article questions for type:', articleType);
        
        switch (articleType) {
          case 'zooplankton-quiz':
            const zooplanktonModule = await import('../zooplanktonVocabularyData');
            questionData = zooplanktonModule.getZooplanktonVocabularyQuestions();
            break;
          case 'killer-whale-quiz':
            const killerWhaleModule = await import('../killerWhaleVocabularyData');
            questionData = killerWhaleModule.getKillerWhaleVocabularyQuestions();
            break;
          case 'smuggling-quiz':
            const smugglingModule = await import('../smugglingVocabularyData');
            questionData = smugglingModule.getSmugglingVocabularyQuestions();
            break;
          case 'air-india-quiz':
            const airIndiaModule = await import('../airIndiaVocabularyData');
            questionData = airIndiaModule.getAirIndiaVocabularyQuestions();
            break;
          case 'water-treatment-quiz':
            const waterTreatmentModule = await import('../waterTreatmentVocabularyData');
            questionData = waterTreatmentModule.getWaterTreatmentVocabularyQuestions();
            break;
          case 'octopus-quiz':
            const octopusModule = await import('../readingVocabularyData');
            questionData = octopusModule.getReadingVocabularyQuestions();
            break;
          default:
            const defaultModule = await import('../articleQuestions');
            questionData = defaultModule.getArticleQuestions();
        }
      } else {
        console.log('📚 Loading standard vocabulary questions');
        const standardModule = await import('../questionsData');
        questionData = standardModule.getNewQuestions();
      }
      
      console.log('✅ Questions loaded:', questionData);
      setQuestions(questionData);
    } catch (error) {
      console.error('❌ Error loading questions:', error);
      // Fallback to default questions
      import('../questionsData').then(module => {
        setQuestions(module.getNewQuestions());
      });
    }
  };

  loadQuestions();
}, [quizType, articleType]);

// In the getArticleInfo function:
const getArticleInfo = () => {
  try {
    if (quizType === 'article') {
      switch (articleType) {
        case 'zooplankton-quiz':
          const zooplanktonModule = require('../zooplanktonVocabularyData');
          return zooplanktonModule.getZooplanktonArticleInfo();
        case 'killer-whale-quiz':
          const killerWhaleModule = require('../killerWhaleVocabularyData');
          return killerWhaleModule.getKillerWhaleArticleInfo();
        case 'smuggling-quiz':
          const smugglingModule = require('../smugglingVocabularyData');
          return smugglingModule.getArticleInfo();
        case 'air-india-quiz':
          const airIndiaModule = require('../airIndiaVocabularyData');
          return airIndiaModule.getAirIndiaArticleInfo();
        case 'water-treatment-quiz':
          const waterTreatmentModule = require('../waterTreatmentVocabularyData');
          return waterTreatmentModule.getWaterTreatmentArticleInfo();
        case 'octopus-quiz':
          const octopusModule = require('../readingVocabularyData');
          return octopusModule.getReadingArticleInfo();
        default:
          const defaultModule = require('../articleQuestions');
          return defaultModule.getArticleInfo();
      }
    }
  } catch (error) {
    console.error('Error getting article info:', error);
  }
  return null;
};
