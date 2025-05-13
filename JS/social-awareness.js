// Self-invoking anonymous function to encapsulate scope
(function() {
    'use strict'; // Enable strict mode

    // --- Helper Functions ---
    function getCookie(name) {
        const cookieName = `${name}=`; // Use template literal
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

        // Check if elements exist and are visible (more robust check)
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

    // --- Quiz Data ---
    const quizData = [
        { question: "What is 'Equality'?", options: ["a) Treating people the same", "b) Sharing with only some", "c) Winning every time", "d) Giving more to friends"], correctAnswer: "a) Treating people the same" },
        { question: "What is 'Diversity'?", options: ["a) People looking the same", "b) People with different backgrounds", "c) A group of twins", "d) A classroom layout"], correctAnswer: "b) People with different backgrounds" },
        { question: "What is 'Stereotype'?", options: ["a) A radio", "b) A fair idea", "c) A wrong idea about a group", "d) A leader"], correctAnswer: "c) A wrong idea about a group" },
        { question: "What is 'Volunteering'?", options: ["a) Paid Work", "b) Doing chores", "c) Helping without pay", "d) Playing games"], correctAnswer: "c) Helping without pay" },
        { question: "How can you show kindness?", options: ["a) By shouting", "b) By helping", "c) By ignoring", "d) By complaining"], correctAnswer: "b) By helping" }
    ];

    // --- Quiz State Variables ---
    let currentQuestionIndex = 0; // Renamed for clarity
    let correctAnswersCount = 0;  // Renamed for clarity
    let incorrectAnswersCount = 0;// Renamed for clarity
    let actionButton = null;      // Renamed for clarity (was nextQuestionButton)

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
        questionContainerElement.innerHTML = ''; // Clear previous content

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
            optionTextSpan.textContent = ' ' + optionText; // Add leading space
            labelElement.appendChild(optionTextSpan);

            const feedbackSpan = document.createElement('span');
            feedbackSpan.classList.add('option-feedback-message');
            labelElement.appendChild(feedbackSpan);

            optionDiv.appendChild(labelElement);
            optionsContainer.appendChild(optionDiv);
        });
        questionContainerElement.appendChild(optionsContainer);

        actionButton = document.createElement('button');
        actionButton.classList.add('quiz-action-button'); // CSS handles initial display
        actionButton.addEventListener('click', loadNextQuestionOrResults);
        questionContainerElement.appendChild(actionButton);
    }

    // --- Function: Handle Option Selection and Give Instant Feedback ---
    function handleOptionSelection(event) {
        const selectedLabel = event.currentTarget;
        const selectedInput = selectedLabel.querySelector('input[type="radio"]');
        const allLabels = document.querySelectorAll('.options-container .option label');

        if (actionButton && actionButton.classList.contains('visible')) {
            return; // Prevent re-answering
        }
        if (!selectedInput) return; // Should ideally not happen

        selectedInput.checked = true;

        allLabels.forEach(label => {
            label.classList.add('disabled-option');
            label.removeEventListener('click', handleOptionSelection); // Crucial to prevent re-triggering
            const input = label.querySelector('input[type="radio"]');
            if (input) input.disabled = true;
        });

        const userAnswer = selectedInput.value;
        const correctAnswerText = quizData[currentQuestionIndex].correctAnswer;

        allLabels.forEach(label => { // Clear all previous feedback text
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
                    // Only add text feedback to the correct one if it wasn't the user's (wrong) choice
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
        const passingScore = 3; // Example passing score
        if (correctAnswersCount >= passingScore) {
            messageText = `<span class="result-highlight-word">Congratulations!</span><span class="result-secondary-text">You passed the quiz!</span>`;
            messageClass = 'pass-message';
        } else {
            // Assuming you have .result-highlight-word-sorry and .result-secondary-text-sorry for fail messages
            messageText = `<span class="result-highlight-word-sorry">Sorry,</span><span class="result-secondary-text-sorry">you did not pass the quiz this time.</span>`;
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

        updateProgressDisplay(); // Initial progress
        showQuestion(); // Show the first question
    });

})();