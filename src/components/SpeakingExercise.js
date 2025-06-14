import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.39.3';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        
        this.initSpeechRecognition();
        this.loadSentences();
        this.setupEventListeners();
    }
    
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-GB'; // British English
        
        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.updateRecordingUI(true);
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
            
            if (event.error === 'no-speech') {
                this.showFeedback('No speech detected. Please try again.', 'error');
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
    
    handleSpeechResult(event) {
        this.interimTranscript = '';
        this.finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                this.finalTranscript += transcript;
            } else {
                this.interimTranscript += transcript;
            }
        }
        
        // Update the visual feedback with current transcript
        this.updateTranscriptDisplay(this.finalTranscript + this.interimTranscript);
        
        // Reset silence timer whenever speech is detected
        this.resetSilenceTimer();
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
            transcriptDiv.textContent = text || 'Listening...';
            transcriptDiv.style.display = 'block';
        }
    }
    
    updateRecordingUI(isRecording) {
        const button = document.getElementById('record-btn');
        const indicator = document.getElementById('recording-indicator');
        
        if (isRecording) {
            button.textContent = 'Stop Recording';
            button.classList.add('recording');
            
            if (indicator) {
                indicator.style.display = 'block';
            }
        } else {
            button.textContent = 'Start Recording';
            button.classList.remove('recording');
            
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }
    
    async loadSentences() {
        try {
            const { data, error } = await supabase
                .from('sentences')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            this.sentences = data || [];
            if (this.sentences.length === 0) {
                this.showFeedback('No sentences available. Please add some first.', 'error');
                return;
            }
            
            this.displayCurrentSentence();
        } catch (error) {
            console.error('Error loading sentences:', error);
            this.showFeedback('Error loading sentences. Please refresh the page.', 'error');
        }
    }
    
    displayCurrentSentence() {
        if (this.currentIndex >= this.sentences.length) {
            this.showResults();
            return;
        }
        
        const sentence = this.sentences[this.currentIndex];
        document.getElementById('current-sentence').textContent = sentence.text;
        document.getElementById('sentence-counter').textContent = 
            `Sentence ${this.currentIndex + 1} of ${this.sentences.length}`;
        
        // Clear previous transcript
        this.updateTranscriptDisplay('');
        
        // Reset recording state
        this.isRecording = false;
        this.updateRecordingUI(false);
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
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.isRecording = false;
            this.showFeedback('Failed to start recording', 'error');
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
        
        // Process the recording if we have a transcript
        if (this.finalTranscript || this.interimTranscript) {
            const fullTranscript = this.finalTranscript + this.interimTranscript;
            this.processRecording(fullTranscript.trim());
        } else {
            this.showFeedback('No speech detected. Please try again.', 'warning');
        }
    }
    
    processRecording(transcript) {
        if (!transcript) {
            this.showFeedback('No speech detected. Please try again.', 'warning');
            return;
        }
        
        const targetSentence = this.sentences[this.currentIndex].text;
        const score = this.calculateScore(transcript, targetSentence);
        
        // Store result
        this.results.push({
            target: targetSentence,
            spoken: transcript,
            score: score
        });
        
        // Show immediate feedback
        this.showScoreFeedback(score);
        
        // Move to next sentence after delay
        setTimeout(() => {
            this.currentIndex++;
            this.displayCurrentSentence();
        }, 2000);
    }
    
    calculateScore(spoken, target) {
        // Normalise both strings
        const normaliseText = (text) => {
            return text.toLowerCase()
                .replace(/[.,!?;:'"]/g, '') // Remove punctuation
                .replace(/\s+/g, ' ')        // Normalise spaces
                .trim();
        };
        
        const spokenWords = normaliseText(spoken).split(' ');
        const targetWords = normaliseText(target).split(' ');
        
        // Handle homophones - common ones for British English
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
            'brake': ['break']
        };
        
        // Calculate matches considering homophones
        let matches = 0;
        const maxLength = Math.max(spokenWords.length, targetWords.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (i < spokenWords.length && i < targetWords.length) {
                const spokenWord = spokenWords[i];
                const targetWord = targetWords[i];
                
                if (spokenWord === targetWord) {
                    matches++;
                } else if (homophones[targetWord] && homophones[targetWord].includes(spokenWord)) {
                    matches++; // Count homophones as correct
                } else if (homophones[spokenWord] && homophones[spokenWord].includes(targetWord)) {
                    matches++; // Count homophones as correct
                }
            }
        }
        
        // Calculate percentage score
        const score = Math.round((matches / maxLength) * 100);
        return Math.max(0, Math.min(100, score)); // Ensure score is between 0-100
    }
    
    showScoreFeedback(score) {
        let message = '';
        let type = '';
        
        if (score >= 90) {
            message = `Excellent! ${score}% accuracy`;
            type = 'success';
        } else if (score >= 70) {
            message = `Good job! ${score}% accuracy`;
            type = 'success';
        } else if (score >= 50) {
            message = `Not bad! ${score}% accuracy`;
            type = 'warning';
        } else {
            message = `Keep practising! ${score}% accuracy`;
            type = 'error';
        }
        
        this.showFeedback(message, type);
    }
    
    skipSentence() {
        this.results.push({
            target: this.sentences[this.currentIndex].text,
            spoken: '',
            score: 0
        });
        
        this.currentIndex++;
        this.displayCurrentSentence();
    }
    
    showResults() {
        const exerciseDiv = document.getElementById('exercise-container');
        const totalScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
        
        let html = `
            <div class="results-container">
                <h2>Speaking Exercise Complete!</h2>
                <div class="overall-score">
                    <h3>Overall Score: ${Math.round(totalScore)}%</h3>
                </div>
                <div class="detailed-results">
                    <h3>Detailed Results:</h3>
        `;
        
        this.results.forEach((result, index) => {
            html += `
                <div class="result-item ${result.score >= 70 ? 'success' : result.score >= 50 ? 'warning' : 'error'}">
                    <h4>Sentence ${index + 1}: ${result.score}%</h4>
                    <p><strong>Target:</strong> ${result.target}</p>
                    <p><strong>You said:</strong> ${result.spoken || '(Skipped)'}</p>
                    <button class="listen-btn" data-text="${result.target.replace(/"/g, '&quot;')}">
                        Listen to Sample
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
                <button id="restart-btn" class="btn primary">Try Again</button>
                <button id="back-btn" class="btn secondary">Back to Menu</button>
            </div>
        `;
        
        exerciseDiv.innerHTML = html;
        
        // Add event listeners for sample playback
        document.querySelectorAll('.listen-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-text');
                this.playTextToSpeech(text);
            });
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    playTextToSpeech(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        } else {
            this.showFeedback('Text-to-speech not supported in your browser', 'error');
        }
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
