// Self-invoking anonymous function to encapsulate scope
(function() {
    'use strict'; // Enable strict mode for better error handling

    // --- Helper Functions ---
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.startsWith(cookieName)) {
                return decodeURIComponent(cookie.substring(cookieName.length));
            }
        }
        return "";
    }

    function updateQuizDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time-quiz');
        const dateElement = document.getElementById('current-date-quiz');

        if (timeElement && getComputedStyle(timeElement).display !== 'none') {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
        if (dateElement && getComputedStyle(dateElement).display !== 'none') {
            dateElement.textContent = now.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    // --- Get and Display Username ---
    const username = getCookie('username');
    const usernameDisplayElement = document.getElementById('usernameDisplay');
    if (usernameDisplayElement) {
        usernameDisplayElement.textContent = username || 'Guest';
    } else {
        console.warn("Element with ID 'usernameDisplay' not found.");
    }

    // --- Quiz Data for Basic Literacy ---
    const quizData = [
        { question: "What is a noun?", options: ["a) Action word", "b) Describing word", "c) Person, place, or thing", "d) Joining word"], correctAnswer: "c) Person, place, or thing" },
        { question: "Which is a verb: 'quick', 'jump', 'happy', 'table'?", options: ["a) quick", "b) jump", "c) happy", "d) table"], correctAnswer: "b) jump" },
        { question: "What is the plural of 'mouse'?", options: ["a) mouses", "b) mouse", "c) mices", "d) mice"], correctAnswer: "d) mice" },
        { question: "A sentence ends with a...", options: ["a) Comma", "b) Full stop", "c) Question mark", "d) Full stop or question mark or exclamation mark"], correctAnswer: "d) Full stop or question mark or exclamation mark" },
        { question: "Which word means 'very big'?", options: ["a) tiny", "b) enormous", "c) average", "d) quiet"], correctAnswer: "b) enormous" }
    ];

    // --- Quiz State Variables ---
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let actionButton = null;

    // --- DOM Element Cache ---
    const questionContainerElement = document.getElementById('question-container');
    const correctAnswersDisplay = document.getElementById('correctAnswers');
    const incorrectAnswersDisplay = document.getElementById('incorrectAnswers');
    const progressValueDisplay = document.querySelector('.progress-value');


    // --- Function to Show Current Question ---
    function showQuestion() {
        if (!questionContainerElement) {
            console.error("Question container element not found.");
            return;
        }
        const questionData = quizData[currentQuestionIndex];
        questionContainerElement.innerHTML = '';

        const questionTextElement = document.createElement('h2');
        questionTextElement.textContent = `Question ${currentQuestionIndex + 1}: ${questionData.question}`;
        questionTextElement.classList.add('question-text');
        questionContainerElement.appendChild(questionTextElement);

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');

        questionData.options.forEach((optionText, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            const labelElement = document.createElement('label');
            const inputId = `q${currentQuestionIndex}_option${index}`;
            const inputElement = document.createElement('input');
            inputElement.type = 'radio';
            inputElement.name = 'answer';
            inputElement.value = optionText;
            inputElement.id = inputId;

            labelElement.htmlFor = inputId;
            labelElement.addEventListener('click', handleOptionSelection);
            labelElement.appendChild(inputElement);
            const optionTextSpan = document.createElement('span');
            optionTextSpan.classList.add('option-text-content');
            optionTextSpan.textContent = ' ' + optionText;
            labelElement.appendChild(optionTextSpan);
            const feedbackSpan = document.createElement('span');
            feedbackSpan.classList.add('option-feedback-message');
            labelElement.appendChild(feedbackSpan);

            optionDiv.appendChild(labelElement);
            optionsContainer.appendChild(optionDiv);
        });
        questionContainerElement.appendChild(optionsContainer);

        actionButton = document.createElement('button');
        actionButton.classList.add('quiz-action-button');
        actionButton.addEventListener('click', loadNextQuestionOrResults);
        questionContainerElement.appendChild(actionButton);
    }

    // --- Function: Handle Option Selection and Give Instant Feedback ---
    function handleOptionSelection(event) {
        const selectedLabel = event.currentTarget;
        const selectedInput = selectedLabel.querySelector('input[type="radio"]');
        const allLabels = document.querySelectorAll('.options-container .option label');

        if (actionButton && actionButton.classList.contains('visible')) {
            return;
        }
        if (!selectedInput) return;

        selectedInput.checked = true;

        allLabels.forEach(label => {
            label.classList.add('disabled-option');
            label.removeEventListener('click', handleOptionSelection);
            const input = label.querySelector('input[type="radio"]');
            if (input) input.disabled = true;
        });

        const userAnswer = selectedInput.value;
        const correctAnswerText = quizData[currentQuestionIndex].correctAnswer;

        allLabels.forEach(label => {
            const existingFeedback = label.querySelector('.option-feedback-message');
            if (existingFeedback) existingFeedback.textContent = '';
        });

        function appendFeedback(label, text, isCorrectType) {
            const feedbackSpan = label.querySelector('.option-feedback-message');
            if (feedbackSpan) {
                 feedbackSpan.classList.remove('correct-text', 'incorrect-text');
                 feedbackSpan.textContent = `(${text})`;
                 feedbackSpan.classList.add(isCorrectType ? 'correct-text' : 'incorrect-text');
            }
        }

        if (userAnswer === correctAnswerText) {
            correctAnswersCount++;
            selectedLabel.classList.add('correct');
            appendFeedback(selectedLabel, 'Correct Answer!', true);
        } else {
            incorrectAnswersCount++;
            selectedLabel.classList.add('incorrect');
            appendFeedback(selectedLabel, 'Incorrect Answer', false);

            allLabels.forEach(label => {
                const input = label.querySelector('input[type="radio"]');
                if (input && input.value === correctAnswerText) {
                    label.classList.add('correct');
                    if (input !== selectedInput) {
                        appendFeedback(label, 'Correct Answer', true);
                    }
                }
            });
        }

        updateScoreDisplay();

        if (actionButton) {
            actionButton.textContent = (currentQuestionIndex === quizData.length - 1) ? 'See Results' : 'Next Question';
            actionButton.classList.add('visible');
        }
    }

    // --- Function: Load Next Question or Show Results ---
    function loadNextQuestionOrResults() {
        currentQuestionIndex++;
        updateProgressDisplay();
        if (currentQuestionIndex < quizData.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    // --- UI Update Functions ---
    function updateScoreDisplay() {
        if (correctAnswersDisplay) correctAnswersDisplay.textContent = correctAnswersCount;
        if (incorrectAnswersDisplay) incorrectAnswersDisplay.textContent = incorrectAnswersCount;
    }

    function updateProgressDisplay() {
        const totalQuestions = quizData.length || 1;
        const progressPercentage = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

        if (progressValueDisplay) {
            progressValueDisplay.style.width = `${progressPercentage}%`;
            progressValueDisplay.textContent = `${Math.round(progressPercentage)}% completed`;
        }
    }

    function showResults() {
        if (!questionContainerElement) {
            console.error("Question container element not found for displaying results.");
            return;
        }

        let messageText, messageClass = '';
        const passingScore = 3;
        if (correctAnswersCount >= passingScore) {
            messageText = `<span class="result-highlight-word">Congratulations!</span><span class="result-secondary-text">You passed the quiz!</span>`;
            messageClass = 'pass-message';
        } else {
            // --- CAMBIO IMPORTANTE REALIZADO AQUÍ ---
            messageText = `<span class="result-highlight-word-sorry">Sorry,</span><span class="result-secondary-text-sorry">you did not pass the quiz this time.</span>`;
            // --- FIN DEL CAMBIO ---
            messageClass = 'fail-message';
        }

        questionContainerElement.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: <br> ${correctAnswersCount} correct and ${incorrectAnswersCount} incorrect out of ${quizData.length}.</p>
            <p class="quiz-completion-tag ${messageClass}">${messageText}</p>
            <div class="results-button">
                <button onclick="window.location.href='quizzes.html'">Back to Quizzes</button>
            </div>
        `;
    }

    // --- Initial Setup & Event Listeners ---
    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime();
        setInterval(updateQuizDateTime, 1000);

        updateProgressDisplay();
        showQuestion();
    });

})();