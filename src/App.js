// Updated section of src/App.js - Quiz component calls with proper props

// In the renderCurrentScreen function, update these cases:

case 'standard-vocabulary-quiz':
  return (
    <Quiz
      quizType="standard"  // ✅ ADD THIS
      onFinish={handleQuizFinish}
      onBack={goBack}
      onLogoClick={handleLogoClick}
    />
  );

case 'article-vocabulary-quiz':
  return (
    <Quiz
      quizType="article"  // ✅ ADD THIS
      articleType={selectedArticleType}  // ✅ ALREADY CORRECT
      onFinish={handleQuizFinish}
      onBack={goBack}
      onLogoClick={handleLogoClick}
    />
  );

case 'results':
  return (
    <Results
      userAnswers={quizResults}
      questions={testQuestions}
      quizType={currentScreen.includes('article') ? 'article' : 'standard'}  // ✅ DETERMINE FROM SCREEN
      articleType={selectedArticleType}  // ✅ ADD THIS
      onRestart={handleResultsFinish}
    />
  );
