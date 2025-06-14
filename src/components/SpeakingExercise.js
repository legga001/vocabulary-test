// Speaking Exercise - Enhanced with quality of life improvements
import { SENTENCE_POOLS, TEST_STRUCTURE } from '../data/listenAndTypeSentences.js';
import { recordTestResult } from '../utils/progressDataManager.js';

class SpeakingExercise {
    constructor() {
        this.currentIndex = 0;
        this.sentences = [];
        this.results = [];
        this.recognition = null;
        this.isRecording = false;
        this.silenceTimer = null;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.startTime = null;
        this.testStartTime = null;
        
        this.initSpeechRecognition();
        this.loadSentences();
        this.setupEventListeners();
        this.checkMicrophonePermission();
    }
    
    async checkMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.showFeedback('Microphone ready! Click Start Recording to begin.', 'success');
        } catch (error) {
            this.showFeedback('Please allow microphone access to use this exercise.', 'error');
        }
    }
    
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.showBrowserNotSupportedMessage();
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-GB'; // British English
        
        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.updateRecordingUI(true);
            this.startTime = Date.now();
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
            
            if (event.error === 'no-speech') {
                this.showFeedback('No speech detected. Please speak louder and clearer.', 'error');
            } else if (event.error === 'audio-capture') {
                this.showFeedback('Microphone error. Please check your microphone settings.', 'error');
            } else if (event.error === 'not-allowed') {
                this.showFeedback('Microphone access denied. Please allow microphone access and refresh.', 'error');
            } else {
                this.showFeedback(`Error: ${event.error}`, 'error');
            }
        };
        
        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            if (this.isRecording) {
                this.stopRecording();
            }
        };
    }
    
    showBrowserNotSupportedMessage() {
        const exerciseDiv = document.getElementById('exercise-container');
        exerciseDiv.innerHTML = `
            <div class="browser-not-supported">
                <h2>Browser Not Supported</h2>
                <p>Your browser does not support speech recognition.</p>
                <p>Please use one of the following browsers:</p>
                <ul>
                    <li>Google Chrome (recommended)</li>
                    <li>Microsoft Edge</li>
                    <li>Safari (Mac/iOS)</li>
                </ul>
                <button onclick="window.location.href='index.html'" class="btn secondary">
                    Back to Menu
                </button>
            </div>
        `;
    }
    
    handleSpeechResult(event) {
        this.interimTranscript = '';
        let currentFinalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                currentFinalTranscript += transcript;
            } else {
                this.interimTranscript += transcript;
            }
        }
        
        if (currentFinalTranscript) {
            this.finalTranscript += currentFinalTranscript;
        }
        
        // Update the visual feedback with current transcript
        const displayText = this.finalTranscript + this.interimTranscript;
        this.updateTranscriptDisplay(displayText);
        
        // Show confidence level if available
        if (event.results.length > 0) {
            const latestResult = event.results[event.results.length - 1];
            if (latestResult[0].confidence) {
                this.updateConfidenceDisplay(latestResult[0].confidence);
            }
        }
        
        // Reset silence timer whenever speech is detected
        this.resetSilenceTimer();
    }
    
    updateConfidenceDisplay(confidence) {
        const confidenceDiv = document.getElementById('confidence-display');
        if (confidenceDiv) {
            const percentage = Math.round(confidence * 100);
            confidenceDiv.innerHTML = `
                <span class="confidence-label">Recognition confidence:</span>
                <span class="confidence-value ${percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low'}">
                    ${percentage}%
                </span>
            `;
        }
    }
    
    resetSilenceTimer() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }
        
        // Auto-stop after 5 seconds of silence
        this.silenceTimer = setTimeout(() => {
            if (this.isRecording) {
                console.log('Stopping due to 5 seconds of silence');
                this.stopRecording();
            }
        }, 5000);
    }
    
    updateTranscriptDisplay(text) {
        const transcriptDiv = document.getElementById('transcript-display');
        if (transcriptDiv) {
            if (text) {
                transcriptDiv.innerHTML = `
                    <div class="transcript-label">You're saying:</div>
                    <div class="transcript-text">"${text}"</div>
                `;
            } else {
                transcriptDiv.innerHTML = '<div class="listening-indicator">🎤 Listening...</div>';
            }
            transcriptDiv.style.display = 'block';
        }
    }
    
    updateRecordingUI(isRecording) {
        const button = document.getElementById('record-btn');
        const indicator = document.getElementById('recording-indicator');
        
        if (isRecording) {
            button.innerHTML = `
                <span class="stop-icon">⏹</span>
                <span>Stop Recording</span>
            `;
            button.classList.add('recording');
            
            if (indicator) {
                indicator.innerHTML = `
                    <div class="recording-pulse"></div>
                    <div class="recording-text">Recording in progress...</div>
                `;
                indicator.style.display = 'block';
            }
        } else {
            button.innerHTML = `
                <span class="mic-icon">🎤</span>
                <span>Start Recording</span>
            `;
            button.classList.remove('recording');
            
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }
    
    loadSentences() {
        // Start timing the test
        this.testStartTime = Date.now();
        
        // Select random sentences based on TEST_STRUCTURE
        this.sentences = [];
        
        TEST_STRUCTURE.forEach(({ level, count }) => {
            const levelSentences = SENTENCE_POOLS[level];
            if (!levelSentences || levelSentences.length === 0) {
                console.error(`No sentences found for level ${level}`);
                return;
            }
            
            // Shuffle sentences for this level
            const shuffled = [...levelSentences].sort(() => Math.random() - 0.5);
            
            // Take the required number of sentences
            const selected = shuffled.slice(0, Math.min(count, shuffled.length));
            
            // Add level and audio file to each sentence
            selected.forEach(sentence => {
                this.sentences.push({
                    text: sentence.correctText,
                    level: level,
                    audioFile: sentence.audioFile,
                    difficulty: sentence.difficulty
                });
            });
        });
        
        if (this.sentences.length === 0) {
            this.showFeedback('No sentences available. Please refresh the page.', 'error');
            return;
        }
        
        console.log(`Loaded ${this.sentences.length} sentences for speaking exercise`);
        this.displayCurrentSentence();
    }
    
    displayCurrentSentence() {
        if (this.currentIndex >= this.sentences.length) {
            this.showResults();
            return;
        }
        
        const sentence = this.sentences[this.currentIndex];
        const progressPercentage = Math.round((this.currentIndex / this.sentences.length) * 100);
        
        document.getElementById('current-sentence').textContent = sentence.text;
        document.getElementById('sentence-counter').textContent = 
            `Sentence ${this.currentIndex + 1} of ${this.sentences.length} (${sentence.level})`;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        // Add listen button
        const listenBtn = document.getElementById('listen-btn');
        if (listenBtn) {
            listenBtn.onclick = () => this.playCurrentAudio();
        }
        
        // Clear previous transcript and confidence
        this.updateTranscriptDisplay('');
        const confidenceDiv = document.getElementById('confidence-display');
        if (confidenceDiv) {
            confidenceDiv.innerHTML = '';
        }
        
        // Reset recording state
        this.isRecording = false;
        this.updateRecordingUI(false);
    }
    
    playCurrentAudio() {
        const sentence = this.sentences[this.currentIndex];
        if (sentence && sentence.audioFile) {
            const audio = new Audio(sentence.audioFile);
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                this.showFeedback('Error playing audio file', 'error');
            });
        }
    }
    
    setupEventListeners() {
        document.getElementById('record-btn').addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });
        
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.skipSentence();
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (this.isRecording) {
                    this.stopRecording();
                } else {
                    this.startRecording();
                }
            } else if (e.key === 'Enter' && !this.isRecording) {
                this.skipSentence();
            }
        });
    }
    
    startRecording() {
        if (!this.recognition) {
            this.showFeedback('Speech recognition not available', 'error');
            return;
        }
        
        this.isRecording = true;
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        try {
            this.recognition.start();
            this.resetSilenceTimer();
            this.showFeedback('Listening... Speak clearly!', 'info');
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.isRecording = false;
            this.showFeedback('Failed to start recording. Please try again.', 'error');
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.updateRecordingUI(false);
        
        // Calculate recording duration
        const recordingDuration = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
        
        // Process the recording if we have a transcript
        if (this.finalTranscript || this.interimTranscript) {
            const fullTranscript = (this.finalTranscript + this.interimTranscript).trim();
            this.processRecording(fullTranscript, recordingDuration);
        } else {
            this.showFeedback('No speech detected. Try speaking louder or check your microphone.', 'warning');
        }
    }
    
    processRecording(transcript, duration) {
        if (!transcript) {
            this.showFeedback('No speech detected. Please try again.', 'warning');
            return;
        }
        
        const targetSentence = this.sentences[this.currentIndex].text;
        const scoreData = this.calculateDetailedScore(transcript, targetSentence);
        
        // Store result with additional data
        this.results.push({
            target: targetSentence,
            spoken: transcript,
            score: scoreData.percentage,
            level: this.sentences[this.currentIndex].level,
            audioFile: this.sentences[this.currentIndex].audioFile,
            duration: duration,
            wordAccuracy: scoreData.wordAccuracy,
            matchedWords: scoreData.matchedWords,
            totalWords: scoreData.totalWords
        });
        
        // Show detailed feedback
        this.showDetailedFeedback(scoreData);
        
        // Move to next sentence after delay
        setTimeout(() => {
            this.currentIndex++;
            this.displayCurrentSentence();
        }, 3000);
    }
    
    calculateDetailedScore(spoken, target) {
        // Normalise both strings
        const normaliseText = (text) => {
            return text.toLowerCase()
                .replace(/[.,!?;:'"]/g, '') // Remove punctuation
                .replace(/\s+/g, ' ')        // Normalise spaces
                .trim();
        };
        
        const spokenWords = normaliseText(spoken).split(' ');
        const targetWords = normaliseText(target).split(' ');
        
        // Enhanced homophones list for British English
        const homophones = {
            'to': ['too', 'two'],
            'too': ['to', 'two'],
            'two': ['to', 'too'],
            'there': ['their', 'they\'re'],
            'their': ['there', 'they\'re'],
            'they\'re': ['there', 'their'],
            'your': ['you\'re'],
            'you\'re': ['your'],
            'its': ['it\'s'],
            'it\'s': ['its'],
            'where': ['wear', 'ware'],
            'wear': ['where', 'ware'],
            'here': ['hear'],
            'hear': ['here'],
            'no': ['know'],
            'know': ['no'],
            'right': ['write', 'rite'],
            'write': ['right', 'rite'],
            'peace': ['piece'],
            'piece': ['peace'],
            'break': ['brake'],
            'brake': ['break'],
            'would': ['wood'],
            'wood': ['would'],
            'weather': ['whether'],
            'whether': ['weather'],
            'for': ['four', 'fore'],
            'four': ['for', 'fore'],
            'fore': ['for', 'four'],
            'been': ['bean'],
            'bean': ['been'],
            'by': ['buy', 'bye'],
            'buy': ['by', 'bye'],
            'bye': ['by', 'buy'],
            'hour': ['our'],
            'our': ['hour'],
            'week': ['weak'],
            'weak': ['week'],
            'allowed': ['aloud'],
            'aloud': ['allowed'],
            'threw': ['through'],
            'through': ['threw'],
            'mail': ['male'],
            'male': ['mail'],
            'principal': ['principle'],
            'principle': ['principal']
        };
        
        // Calculate matches with word-by-word accuracy
        let matches = 0;
        const wordAccuracy = [];
        const maxLength = Math.max(spokenWords.length, targetWords.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (i < spokenWords.length && i < targetWords.length) {
                const spokenWord = spokenWords[i];
                const targetWord = targetWords[i];
                
                let isMatch = false;
                
                if (spokenWord === targetWord) {
                    matches++;
                    isMatch = true;
                } else if (homophones[targetWord] && homophones[targetWord].includes(spokenWord)) {
                    matches++; // Count homophones as correct
                    isMatch = true;
                } else if (homophones[spokenWord] && homophones[spokenWord].includes(targetWord)) {
                    matches++; // Count homophones as correct
                    isMatch = true;
                }
                
                wordAccuracy.push({
                    target: targetWord,
                    spoken: spokenWord,
                    correct: isMatch
                });
            } else if (i < targetWords.length) {
                // Missing word
                wordAccuracy.push({
                    target: targetWords[i],
                    spoken: '(missing)',
                    correct: false
                });
            } else {
                // Extra word
                wordAccuracy.push({
                    target: '(none)',
                    spoken: spokenWords[i],
                    correct: false
                });
            }
        }
        
        // Calculate percentage score
        const percentage = Math.round((matches / maxLength) * 100);
        
        return {
            percentage: Math.max(0, Math.min(100, percentage)),
            matchedWords: matches,
            totalWords: maxLength,
            wordAccuracy: wordAccuracy
        };
    }
    
    showDetailedFeedback(scoreData) {
        let message = '';
        let type = '';
        let emoji = '';
        
        if (scoreData.percentage >= 90) {
            message = `Excellent! ${scoreData.percentage}% accuracy`;
            type = 'success';
            emoji = '🌟';
        } else if (scoreData.percentage >= 70) {
            message = `Good job! ${scoreData.percentage}% accuracy`;
            type = 'success';
            emoji = '👍';
        } else if (scoreData.percentage >= 50) {
            message = `Not bad! ${scoreData.percentage}% accuracy`;
            type = 'warning';
            emoji = '📈';
        } else {
            message = `Keep practising! ${scoreData.percentage}% accuracy`;
            type = 'error';
            emoji = '💪';
        }
        
        // Add word accuracy info
        message += ` (${scoreData.matchedWords}/${scoreData.totalWords} words correct)`;
        
        this.showFeedback(`${emoji} ${message}`, type);
    }
    
    skipSentence() {
        this.results.push({
            target: this.sentences[this.currentIndex].text,
            spoken: '',
            score: 0,
            level: this.sentences[this.currentIndex].level,
            audioFile: this.sentences[this.currentIndex].audioFile,
            duration: 0,
            wordAccuracy: [],
            matchedWords: 0,
            totalWords: this.sentences[this.currentIndex].text.split(' ').length
        });
        
        this.showFeedback('Sentence skipped', 'info');
        this.currentIndex++;
        this.displayCurrentSentence();
    }
    
    showResults() {
        const exerciseDiv = document.getElementById('exercise-container');
        const testDuration = Math.round((Date.now() - this.testStartTime) / 1000);
        
        // Calculate overall statistics
        const totalScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
        const levelScores = this.calculateLevelScores();
        const averageWordAccuracy = this.calculateAverageWordAccuracy();
        
        // Save results to progress tracking
        this.saveTestResults(totalScore, testDuration);
        
        let html = `
            <div class="results-container">
                <h2>Speaking Exercise Complete!</h2>
                
                <div class="overall-score">
                    <h3>Overall Score: ${Math.round(totalScore)}%</h3>
                    <p class="score-subtitle">Average word accuracy: ${averageWordAccuracy}%</p>
                </div>
                
                <div class="level-breakdown">
                    <h3>Performance by Level:</h3>
                    <div class="level-scores">
        `;
        
        // Add level breakdown
        Object.entries(levelScores).forEach(([level, score]) => {
            const levelClass = score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error';
            html += `
                <div class="level-score-item ${levelClass}">
                    <span class="level-name">${level}:</span>
                    <span class="level-score">${Math.round(score)}%</span>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="test-stats">
                    <p>⏱ Time taken: ${this.formatDuration(testDuration)}</p>
                    <p>📊 Sentences completed: ${this.results.filter(r => r.spoken).length}/${this.sentences.length}</p>
                </div>
                
                <div class="detailed-results">
                    <h3>Detailed Results:</h3>
        `;
        
        this.results.forEach((result, index) => {
            const scoreClass = result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error';
            
            html += `
                <div class="result-item ${scoreClass}">
                    <div class="result-header">
                        <h4>Sentence ${index + 1} (${result.level}): ${result.score}%</h4>
                        ${result.duration ? `<span class="duration">⏱ ${result.duration.toFixed(1)}s</span>` : ''}
                    </div>
                    <p><strong>Target:</strong> ${result.target}</p>
                    <p><strong>You said:</strong> ${result.spoken || '(Skipped)'}</p>
                    ${result.wordAccuracy && result.wordAccuracy.length > 0 ? this.renderWordAccuracy(result.wordAccuracy) : ''}
                    <button class="listen-btn" data-audio="${result.audioFile}">
                        🔊 Listen to Sample
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="action-buttons">
                    <button id="restart-btn" class="btn primary">🔄 Try Again</button>
                    <button id="back-btn" class="btn secondary">← Back to Menu</button>
                </div>
            </div>
        `;
        
        exerciseDiv.innerHTML = html;
        
        // Add event listeners for sample playback
        document.querySelectorAll('.listen-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const audioFile = e.target.getAttribute('data-audio');
                this.playAudioFile(audioFile);
            });
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    renderWordAccuracy(wordAccuracy) {
        let html = '<div class="word-accuracy"><strong>Word-by-word:</strong> ';
        
        wordAccuracy.forEach(word => {
            const className = word.correct ? 'correct' : 'incorrect';
            const displayWord = word.spoken === '(missing)' ? '___' : word.spoken;
            html += `<span class="word ${className}" title="${word.target}">${displayWord}</span> `;
        });
        
        html += '</div>';
        return html;
    }
    
    calculateLevelScores() {
        const levelScores = {};
        
        this.results.forEach(result => {
            if (!levelScores[result.level]) {
                levelScores[result.level] = {
                    total: 0,
                    count: 0
                };
            }
            levelScores[result.level].total += result.score;
            levelScores[result.level].count++;
        });
        
        const averages = {};
        Object.entries(levelScores).forEach(([level, data]) => {
            averages[level] = data.count > 0 ? data.total / data.count : 0;
        });
        
        return averages;
    }
    
    calculateAverageWordAccuracy() {
        let totalMatched = 0;
        let totalWords = 0;
        
        this.results.forEach(result => {
            totalMatched += result.matchedWords || 0;
            totalWords += result.totalWords || 0;
        });
        
        return totalWords > 0 ? Math.round((totalMatched / totalWords) * 100) : 0;
    }
    
    saveTestResults(score, duration) {
        try {
            // Format answers for progress tracking
            const userAnswers = this.results.map(result => ({
                answer: result.spoken || '',
                correct: result.score >= 70, // Consider 70% or above as correct
                score: result.score,
                level: result.level
            }));
            
            recordTestResult({
                quizType: 'speak-and-record',
                score: Math.round(score / 10), // Convert percentage to score out of 10
                totalQuestions: 10,
                completedAt: new Date(),
                timeSpent: duration,
                userAnswers: userAnswers
            });
            
            console.log('Speaking test results saved to progress');
        } catch (error) {
            console.error('Error saving test results:', error);
        }
    }
    
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }
    
    playAudioFile(audioFile) {
        if (!audioFile) {
            this.showFeedback('Audio file not available', 'error');
            return;
        }
        
        const audio = new Audio(audioFile);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
            this.showFeedback('Error playing audio file', 'error');
        });
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type} show`;
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
}

// Initialise when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpeakingExercise();
});
