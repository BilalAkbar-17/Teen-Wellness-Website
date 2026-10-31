document.addEventListener('DOMContentLoaded', function() {
    const quizForm = document.getElementById('wellness-quiz');
    const questions = document.querySelectorAll('.quiz-question');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const warningMessage = document.querySelector('.quiz-warning');

    let currentQuestion = 1;
    const totalQuestions = questions.length;

    function initQuiz() {
        updateProgress();
        updateNavigationButtons();
    }

    function updateProgress() {
        const progressPercentage = ((currentQuestion - 1) / totalQuestions) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
    }

    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestion === 1;
        nextBtn.style.display = currentQuestion === totalQuestions ? 'none' : 'inline-block';
        submitBtn.style.display = currentQuestion === totalQuestions ? 'inline-block' : 'none';
    }

    function showQuestion(questionNumber) {
        questions.forEach(question => {
            question.classList.remove('active');
            if (parseInt(question.dataset.question) === questionNumber) {
                question.classList.add('active');
            }
        });
    }

    function showWarning() {
        warningMessage.classList.add('show');
        setTimeout(() => {
            warningMessage.classList.remove('show');
        }, 3000);
    }

    function validateQuestion() {
        const currentQuestionElement = document.querySelector(`.quiz-question[data-question="${currentQuestion}"]`);
        const selectedOption = currentQuestionElement.querySelector('input[type="radio"]:checked');
        return selectedOption !== null;
    }

    nextBtn.addEventListener('click', function() {
        if (validateQuestion()) {
            currentQuestion++;
            showQuestion(currentQuestion);
            updateProgress();
            updateNavigationButtons();
        } else {
            showWarning();
        }
    });

    prevBtn.addEventListener('click', function() {
        currentQuestion--;
        showQuestion(currentQuestion);
        updateProgress();
        updateNavigationButtons();
    });

    function calculateResults() {
        const results = {
            screenTime: parseInt(document.querySelector('input[name="screen-time"]:checked')?.value || 0),
            sleep: parseInt(document.querySelector('input[name="sleep"]:checked')?.value || 0),
            exercise: parseInt(document.querySelector('input[name="exercise"]:checked')?.value || 0),
            stress: parseInt(document.querySelector('input[name="stress"]:checked')?.value || 0),
            nutrition: parseInt(document.querySelector('input[name="nutrition"]:checked')?.value || 0)
        };

        const totalScore = Object.values(results).reduce((sum, value) => sum + value, 0);

        let wellnessLevel;
        if (totalScore <= 8) {
            wellnessLevel = 'Needs Improvement';
        } else if (totalScore <= 12) {
            wellnessLevel = 'Fair';
        } else if (totalScore <= 16) {
            wellnessLevel = 'Good';
        } else {
            wellnessLevel = 'Excellent';
        }

        return {
            score: totalScore,
            maxScore: 20,
            level: wellnessLevel,
            details: results
        };
    }

    function generateRecommendations(results) {
        const recommendations = [];

        if (results.details.screenTime === 1) {
            recommendations.push('Keep up the good work with screen time management!');
        } else if (results.details.screenTime === 2) {
            recommendations.push('Consider reducing screen time by 1-2 hours daily.');
        } else if (results.details.screenTime === 3) {
            recommendations.push('Try to reduce screen time and take regular breaks.');
        } else {
            recommendations.push('Try to significantly reduce screen time and take frequent breaks.');
        }

        if (results.details.sleep === 4) {
            recommendations.push('Great job maintaining healthy sleep habits!');
        } else if (results.details.sleep === 3) {
            recommendations.push('Your sleep habits are good. Try to maintain a consistent schedule.');
        } else if (results.details.sleep === 2) {
            recommendations.push('Work on improving your sleep schedule. Aim for 7-9 hours of sleep.');
        } else {
            recommendations.push('Your sleep is insufficient. Prioritize getting at least 8 hours of sleep nightly.');
        }

        if (results.details.exercise === 4) {
            recommendations.push('Excellent exercise routine! Keep it up!');
        } else if (results.details.exercise === 3) {
            recommendations.push('Keep up the regular exercise! Consider increasing frequency gradually.');
        } else if (results.details.exercise === 2) {
            recommendations.push('Try to increase your physical activity to at least 3-4 times per week.');
        } else {
            recommendations.push('Start with small, achievable exercise goals. Even 15 minutes daily helps!');
        }

        if (results.details.stress === 4) {
            recommendations.push('Great job managing stress! Continue your current practices.');
        } else if (results.details.stress === 3) {
            recommendations.push('Your stress management is good. Keep practicing relaxation techniques.');
        } else if (results.details.stress === 2) {
            recommendations.push('Try more stress management techniques like deep breathing or meditation.');
        } else {
            recommendations.push('High stress levels need attention. Consider daily relaxation practices and seeking support.');
        }

        if (results.details.nutrition === 4) {
            recommendations.push('Excellent nutrition habits! Maintain your balanced diet.');
        } else if (results.details.nutrition === 3) {
            recommendations.push('Your eating habits are good. Keep making healthy choices.');
        } else if (results.details.nutrition === 2) {
            recommendations.push('Try to incorporate more fruits, vegetables, and whole grains into your diet.');
        } else {
            recommendations.push('Focus on improving your diet with regular meals and more nutritious options.');
        }

        return recommendations;
    }

    function displayResults(results) {
        const recommendations = generateRecommendations(results);

        const resultsHTML = `
            <div class="quiz-results">
                <h2>Your Wellness Assessment Results</h2>
                <div class="score-container">
                    <div class="score-circle">
                        <span class="score">${results.score}/${results.maxScore}</span>
                        <span class="level">${results.level}</span>
                    </div>
                </div>
                <div class="recommendations">
                    <h3>Personalized Recommendations</h3>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="btn primary-btn" onclick="location.reload()">Take Quiz Again</button>
                    <button class="btn secondary-btn" onclick="window.location.href='resources.html'">View Resources</button>
                </div>
            </div>
        `;

        quizForm.innerHTML = resultsHTML;
    }

    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateQuestion()) {
            const results = calculateResults();
            displayResults(results);
        } else {
            showWarning();
        }
    });

    initQuiz();
});