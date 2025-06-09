/* Add these styles to your src/progress.css file */

/* ==============================================
   RECENT TESTS SECTION (Grey Box Styling)
   ============================================== */
.recent-tests {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin: 30px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-tests-header {
  text-align: center;
  margin-bottom: 20px;
}

.recent-tests-header h3 {
  color: #4c51bf;
  margin: 0;
  font-size: 1.4em;
}

.test-list {
  max-width: 600px;
  margin: 0 auto;
}

.test-item {
  background: #f8f9fa;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.test-item:hover {
  border-color: #4c51bf;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 81, 191, 0.1);
}

.test-info {
  flex: 1;
  text-align: left;
}

.test-type {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
  font-size: 0.95em;
}

.test-date {
  color: #666;
  font-size: 0.85em;
  margin-bottom: 4px;
}

.test-details {
  color: #4a5568;
  font-size: 0.8em;
}

.test-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.score-circle {
  width: 50px;
  height: 50px;
  border: 3px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9em;
}

.score-level {
  font-size: 0.75em;
  color: #666;
  font-weight: 600;
}

.no-tests {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-tests p {
  margin: 0;
  font-size: 1.1em;
}

/* ==============================================
   WEAKNESSES ANALYSIS SECTION
   ============================================== */
.weaknesses-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin: 30px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.weaknesses-header {
  text-align: center;
  margin-bottom: 25px;
}

.weaknesses-header h3 {
  color: #4c51bf;
  margin-bottom: 8px;
  font-size: 1.4em;
}

.weaknesses-header p {
  color: #666;
  margin: 0;
  font-size: 0.95em;
}

.weaknesses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.weakness-card {
  background: #f8f9fa;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.weakness-card:hover {
  border-color: #4c51bf;
  box-shadow: 0 4px 12px rgba(76, 81, 191, 0.1);
}

.weakness-card h4 {
  color: #4c51bf;
  margin-bottom: 15px;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.weakness-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weakness-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.weakness-item:hover {
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.weakness-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.weakness-title {
  font-weight: 700;
  color: #2d3748;
  font-size: 0.95em;
}

.weakness-detail {
  font-size: 0.85em;
  color: #666;
  font-weight: 600;
}

.weakness-suggestion {
  font-size: 0.85em;
  color: #4a5568;
  font-style: italic;
  background: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #4c51bf;
}

/* Specific weakness type styles */
.level-weakness {
  border-left: 4px solid #ed8936;
}

.word-weakness {
  border-left: 4px solid #f56565;
}

.exercise-weakness {
  border-left: 4px solid #9f7aea;
}

/* No weaknesses state */
.no-weaknesses {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0fff4, #e6fffa);
  border-radius: 12px;
  border: 2px solid #48bb78;
}

.no-weaknesses-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.no-weaknesses h4 {
  color: #38a169;
  margin-bottom: 10px;
  font-size: 1.3em;
}

.no-weaknesses p {
  color: #2d3748;
  margin-bottom: 8px;
}

.no-weaknesses small {
  color: #4a5568;
  font-style: italic;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .weaknesses-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .weakness-card {
    padding: 15px;
  }
  
  .weakness-item {
    padding: 12px;
  }
  
  .weakness-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .weakness-suggestion {
    padding: 6px 10px;
    font-size: 0.8em;
  }
  
  .no-weaknesses {
    padding: 30px 15px;
  }
}

@media (max-width: 480px) {
  .weaknesses-section {
    padding: 20px;
    margin: 20px 0;
  }
  
  .weaknesses-header h3 {
    font-size: 1.2em;
  }
  
  .weakness-card h4 {
    font-size: 1em;
  }
  
  .weakness-title {
    font-size: 0.9em;
  }
  
  .weakness-detail {
    font-size: 0.8em;
  }
  
  .weakness-suggestion {
    font-size: 0.75em;
  }
}
