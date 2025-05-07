// Self-invoking anonymous function
(function() {
    // --- Helper Functions (getCookie, updateQuizDateTime) ---
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
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        }
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    // --- Get and Display Username ---
    const username = getCookie('username');
    const usernameDisplayElement = document.getElementById('usernameDisplay'); // Using ID as per last HTML
    if (usernameDisplayElement) {
        usernameDisplayElement.textContent = username || 'Guest';
    } else {
        console.warn("Element with ID 'usernameDisplay' not found.");
    }

    // --- Quiz Data ---
    const quizData = [
        { question: "What is the result of 5 multiplied by 7?", options: ["a) 30", "b) 35", "c) 42", "d) 45"], correctAnswer: "b) 35" },
        { question: "What is 12 + 8?", options: ["a) 10", "b) 15", "c) 20", "d) 25"], correctAnswer: "c) 20" },
        { question: "What is 20 - 5?", options: ["a) 10", "b) 15", "c) 20", "d) 25"], correctAnswer: "b) 15" },
        { question: "What is 6 / 3?", options: ["a) 2", "b) 3", "c) 4", "d) 5"], correctAnswer: "a) 2" },
        { question: "What is 5 * 5?", options: ["a) 10", "b) 15", "c) 20", "d) 25"], correctAnswer: "d) 25" }
    ];

    // --- Quiz State Variables ---
    let currentQuestion = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let nextQuestionButton = null;

    // --- Function to Show Current Question ---
    function showQuestion() {
        const questionData = quizData[currentQuestion];
        const questionContainer = document.getElementById('question-container');
        if (!questionContainer) { console.error("Q-Container not found."); return; }

        questionContainer.innerHTML = ''; // Clear previous

        const questionElement = document.createElement('h2');
        questionElement.textContent = `Question ${currentQuestion + 1}: ${questionData.question}`;
        questionElement.classList.add('question-text');
        questionContainer.appendChild(questionElement);

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');

        questionData.options.forEach((optionText, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            const labelElement = document.createElement('label');
            const inputId = `q${currentQuestion}_option${index}`;
            const inputElement = document.createElement('input');
            inputElement.type = 'radio';
            inputElement.name = 'answer';
            inputElement.value = optionText;
            inputElement.id = inputId;

            labelElement.addEventListener('click', handleOptionSelection); // Attach listener here
            labelElement.htmlFor = inputId;
            labelElement.appendChild(inputElement);
            const optionTextSpan = document.createElement('span'); // Span for text
            optionTextSpan.classList.add('option-text-content');
            optionTextSpan.textContent = ' ' + optionText;
            labelElement.appendChild(optionTextSpan);
            const feedbackSpan = document.createElement('span'); // Span for feedback message
            feedbackSpan.classList.add('option-feedback-message');
            labelElement.appendChild(feedbackSpan);

            optionDiv.appendChild(labelElement);
            optionsContainer.appendChild(optionDiv);
        });
        questionContainer.appendChild(optionsContainer);

        // Create the action button (Next/Results) but keep it hidden
        nextQuestionButton = document.createElement('button');
        // Default text will be set later in handleOptionSelection
        nextQuestionButton.classList.add('quiz-action-button');
        // nextQuestionButton.style.display = 'none'; // CSS handles initial display:none
        nextQuestionButton.addEventListener('click', loadNextQuestionOrResults);
        questionContainer.appendChild(nextQuestionButton);
    }

    // --- Function: Handle Option Selection and Give Instant Feedback ---
    function handleOptionSelection(event) {
        const selectedLabel = event.currentTarget;
        const selectedInput = selectedLabel.querySelector('input[type="radio"]');
        const allLabels = document.querySelectorAll('.options-container .option label');
        const allInputs = document.querySelectorAll('.options-container input[type="radio"]');

        // Prevent re-answering if already answered
        if (nextQuestionButton && nextQuestionButton.classList.contains('visible')) {
            return;
        }

        if (selectedInput) {
            selectedInput.checked = true;
        }

        // Disable all options
        allLabels.forEach(label => {
            label.classList.add('disabled-option');
            label.removeEventListener('click', handleOptionSelection); // Remove listener
            const input = label.querySelector('input[type="radio"]');
            if (input) input.disabled = true;
        });

        const userAnswer = selectedInput.value;
        const correctAnswerText = quizData[currentQuestion].correctAnswer;

        // Clear previous feedback messages
        allLabels.forEach(label => {
            const existingFeedback = label.querySelector('.option-feedback-message');
            if (existingFeedback) existingFeedback.textContent = ''; // Clear text content
        });

        // Helper to append feedback
        function appendFeedback(label, text, isCorrectType) {
            const feedbackSpan = label.querySelector('.option-feedback-message');
            if (feedbackSpan) {
                 feedbackSpan.classList.remove('correct-text', 'incorrect-text'); // Clear previous color classes
                 feedbackSpan.textContent = `(${text})`;
                 feedbackSpan.classList.add(isCorrectType ? 'correct-text' : 'incorrect-text');
            }
        }

        // Provide feedback
        if (userAnswer === correctAnswerText) {
            correctAnswers++;
            selectedLabel.classList.add('correct');
            appendFeedback(selectedLabel, 'Correct Answer!', true);
        } else {
            incorrectAnswers++;
            selectedLabel.classList.add('incorrect');
            appendFeedback(selectedLabel, 'Incorrect Answer', false);

            // Highlight the correct answer
            allLabels.forEach(label => {
                const input = label.querySelector('input[type="radio"]');
                if (input && input.value === correctAnswerText) {
                    label.classList.add('correct');
                    appendFeedback(label, 'This is the correct answer', true);
                }
            });
        }

        updateScore();

        // --- MODIFICATION START: Change button text based on question index ---
        if (nextQuestionButton) {
            if (currentQuestion === quizData.length - 1) {
                // This is the last question
                nextQuestionButton.textContent = 'See Results';
            } else {
                // Not the last question
                nextQuestionButton.textContent = 'Next Question';
            }
            // --- END MODIFICATION ---
            nextQuestionButton.classList.add('visible'); // Make button visible
        }
    }

    // --- Function: Load Next Question or Show Results ---
    function loadNextQuestionOrResults() {
        currentQuestion++;
        updateProgress(); // Update progress first
        if (currentQuestion < quizData.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    // --- Functions: updateScore, updateProgress, showResults (as before) ---
    function updateScore() {
        const correctEl = document.getElementById('correctAnswers');
        const incorrectEl = document.getElementById('incorrectAnswers');
        if (correctEl) correctEl.textContent = correctAnswers;
        if (incorrectEl) incorrectEl.textContent = incorrectAnswers;
    }

    function updateProgress() {
        const totalQuestions = quizData.length || 1;
        const questionsCompleted = currentQuestion; // Progress reflects questions *completed*
        const progress = totalQuestions > 0 ? (questionsCompleted / totalQuestions) * 100 : 0;
        const progressValueEl = document.querySelector('.progress-value');
        if (progressValueEl) {
            progressValueEl.style.width = `${progress}%`;
            progressValueEl.textContent = `${Math.round(progress)}% completed`;
        }
    }

    function showResults() {
        const questionContainer = document.getElementById('question-container');
        if (!questionContainer) { console.error("Q-Container not found for results."); return; }

        let message, messageClass = '';
        const passingScore = 3;
        if (correctAnswers >= passingScore) {
            message = `<span class="result-highlight-word">Congratulations!</span><span class="result-secondary-text">You passed the quiz!</span>`;
            messageClass = 'pass-message';
        } else {
            message = `<span class="result-highlight-word">Sorry,</span>you did not pass the quiz this time.`;
            messageClass = 'fail-message';
        }

        const backToQuizzesButtonHTML = `<div class="results-button"><button onclick="window.location.href='quizzes.html'">Back to Quizzes</button></div>`;
        const displayResultsHTML = `<p class="quiz-completion-tag ${messageClass}">${message}</p>`;

        questionContainer.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: <br> ${correctAnswers} correct and ${incorrectAnswers} incorrect out of ${quizData.length}.</p> <!-- Added total questions -->
            ${displayResultsHTML}
            ${backToQuizzesButtonHTML}
        `;
    }

    // --- Initial Setup & Event Listeners ---
    updateProgress();

    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime();
        setInterval(updateQuizDateTime, 1000);
        showQuestion();
    });

})();