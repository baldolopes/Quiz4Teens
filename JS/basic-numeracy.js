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
    const usernameDisplayElement = document.getElementById('usernameDisplay');
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
    let nextQuestionButton = null; // To store reference to the "Next Question" button

    // --- Function to Show Current Question ---
    function showQuestion() {
        const questionData = quizData[currentQuestion];
        const questionContainer = document.getElementById('question-container');
        if (!questionContainer) { console.error("Q-Container not found."); return; }

        questionContainer.innerHTML = ''; // Clear previous

        // Question Text
        const questionElement = document.createElement('h2');
        questionElement.textContent = `Question ${currentQuestion + 1}: ${questionData.question}`;
        questionElement.classList.add('question-text');
        questionContainer.appendChild(questionElement);

        // Options Container
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');

        // Options
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

            // --- ADDED: Event listener for instant feedback on click ---
            labelElement.addEventListener('click', handleOptionSelection);

            labelElement.htmlFor = inputId;
            labelElement.appendChild(inputElement);
            labelElement.appendChild(document.createTextNode(' ' + optionText)); // Option text
            // Placeholder for feedback message (will be added on click)
            const feedbackSpan = document.createElement('span');
            feedbackSpan.classList.add('option-feedback-message'); // Add class for styling
            labelElement.appendChild(feedbackSpan); // Add empty span to label

            optionDiv.appendChild(labelElement);
            optionsContainer.appendChild(optionDiv);
        });
        questionContainer.appendChild(optionsContainer);

        // "Next Question" Button (initially hidden)
        nextQuestionButton = document.createElement('button');
        nextQuestionButton.textContent = 'Next Question';
        nextQuestionButton.classList.add('quiz-action-button'); // Use new class
        nextQuestionButton.style.display = 'none'; // Hide it initially
        nextQuestionButton.addEventListener('click', loadNextQuestionOrResults);
        questionContainer.appendChild(nextQuestionButton);
    }

    // --- NEW Function: Handle Option Selection and Give Instant Feedback ---
    function handleOptionSelection(event) {
        // Prevent default if clicking label that triggers input
        // event.preventDefault(); // Might not be needed if input is visually hidden

        const selectedLabel = event.currentTarget; // The label that was clicked
        const selectedInput = selectedLabel.querySelector('input[type="radio"]');
        const allLabels = document.querySelectorAll('.options-container .option label');
        const allInputs = document.querySelectorAll('.options-container input[type="radio"]');

        // 1. If already answered (e.g., button visible), do nothing
        if (nextQuestionButton && nextQuestionButton.style.display !== 'none') {
            return;
        }
        
        // 2. Check the selected radio button programmatically
        if (selectedInput) {
            selectedInput.checked = true;
        }

        // 3. Disable all options
        allLabels.forEach(label => label.classList.add('disabled-option')); // Visually disable
        allInputs.forEach(input => input.disabled = true); // Functionally disable

        // 4. Get user answer and correct answer
        const userAnswer = selectedInput.value;
        const correctAnswer = quizData[currentQuestion].correctAnswer;

        // 5. Provide Feedback
        const selectedFeedbackSpan = selectedLabel.querySelector('.option-feedback-message');

        if (userAnswer === correctAnswer) {
            correctAnswers++;
            selectedLabel.classList.add('correct');
            if (selectedFeedbackSpan) {
                selectedFeedbackSpan.textContent = 'Correct Answer!';
                selectedFeedbackSpan.classList.add('correct-text');
            }
        } else {
            incorrectAnswers++;
            selectedLabel.classList.add('incorrect');
            if (selectedFeedbackSpan) {
                selectedFeedbackSpan.textContent = 'Incorrect Answer';
                selectedFeedbackSpan.classList.add('incorrect-text');
            }

            // Highlight the correct answer
            allLabels.forEach(label => {
                const input = label.querySelector('input[type="radio"]');
                if (input && input.value === correctAnswer) {
                    label.classList.add('correct');
                    const correctFeedbackSpan = label.querySelector('.option-feedback-message');
                    if (correctFeedbackSpan) {
                        correctFeedbackSpan.textContent = 'This is the correct answer';
                        correctFeedbackSpan.classList.add('correct-text');
                    }
                }
            });
        }

        // 6. Update score and show "Next Question" button
        updateScore();
        if (nextQuestionButton) {
            nextQuestionButton.style.display = 'inline-block'; // Show the button
            nextQuestionButton.classList.add('visible');
        }
    }

    // --- NEW Function: Load Next Question or Show Results ---
    function loadNextQuestionOrResults() {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            updateProgress();
            showQuestion(); // Load next question
        } else {
            updateProgress();
            showResults(); // Show final results
        }
    }

    // --- Functions: updateScore, updateProgress, showResults (Keep as is, but results no longer clears separate feedback) ---
    function updateScore() {
        const correctEl = document.getElementById('correctAnswers');
        const incorrectEl = document.getElementById('incorrectAnswers');
        if (correctEl) correctEl.textContent = correctAnswers;
        if (incorrectEl) incorrectEl.textContent = incorrectAnswers;
    }

    function updateProgress() {
        const totalQuestions = quizData.length || 1;
        const questionsCompleted = currentQuestion;
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
            message = "Congratulations! You passed the quiz!";
            messageClass = 'pass-message';
        } else {
            message = "Sorry, you did not pass the quiz this time.";
            messageClass = 'fail-message';
        }

        const backToQuizzesButtonHTML = `<div class="results-button"><button onclick="window.location.href='quizzes.html'">Back to Quizzes</button></div>`;
        const displayResultsHTML = `<p class="quiz-completion-tag ${messageClass}">${message}</p>`;

        questionContainer.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: ${correctAnswers} correct and ${incorrectAnswers} incorrect.</p>
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