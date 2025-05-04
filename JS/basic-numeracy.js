// Self-invoking anonymous function to avoid variable scope collisions.
(function() {
    // Function to get cookie by name
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim(); // Use trim
            if (cookie.startsWith(cookieName)) { // Use startsWith
                // Decode value in case it was encoded
                return decodeURIComponent(cookie.substring(cookieName.length));
            }
        }
        return "";
    }

    // --- START: Date and Time Functionality ---
    // Function definition (already provided by you)
    function updateQuizDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time-quiz');
        const dateElement = document.getElementById('current-date-quiz');

        // Update Time
        if (timeElement) {
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions); // Adjust locale/options as needed
        }

        // Update Date
        if (dateElement) {
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-GB', dateOptions); // Example: 14 February 2025
        }
    }
    // --- END: Date and Time Functionality ---


    // Get username from cookies
    const username = getCookie('username');

    // Display username in the HTML
    const usernameDisplayElement = document.getElementById('usernameDisplay');
    if (usernameDisplayElement) {
        usernameDisplayElement.textContent = username || 'Guest';
    } else {
        console.warn("Element with ID 'usernameDisplay' not found.");
    }

    // Quiz Data (Questions and Answers)
    const quizData = [
        // ... (your quiz questions remain here) ...
         {
            question: "What is the result of 5 multiplied by 7?",
            options: ["a) 30", "b) 35", "c) 42", "d) 45"],
            correctAnswer: "b) 35"
        },
        {
            question: "What is 12 + 8?",
            options: ["a) 10", "b) 15", "c) 20", "d) 25"],
            correctAnswer: "c) 20"
        },
        {
            question: "What is 20 - 5?",
            options: ["a) 10", "b) 15", "c) 20", "d) 25"],
            correctAnswer: "b) 15"
        },
        {
            question: "What is 6 / 3?",
            options: ["a) 2", "b) 3", "c) 4", "d) 5"],
            correctAnswer: "a) 2"
        },
        {
            question: "What is 5 * 5?",
            options: ["a) 10", "b) 15", "c) 20", "d) 25"],
            correctAnswer: "d) 25"
        }
    ];

    // Quiz state variables
    let currentQuestion = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // --- Quiz Functions (showQuestion, checkAnswer, updateScore, updateProgress, showResults) ---
    // ... (Keep all your existing quiz functions exactly as they were) ...
     // Show Current Question
    function showQuestion() {
        const questionData = quizData[currentQuestion];
        const questionContainer = document.getElementById('question-container');
        const feedbackContainer = document.getElementById('feedback-container'); // Get feedback container

        // Check if containers exist
        if (!questionContainer) {
            console.error("Element with ID 'question-container' not found. Cannot display question.");
            return;
        }
        if (feedbackContainer) { // Clear previous feedback if container exists
             feedbackContainer.textContent = '';
             feedbackContainer.style.backgroundColor = 'transparent';
             feedbackContainer.style.border = '0px';
             feedbackContainer.style.padding = '0px';
        }


        // Clear previous content
        questionContainer.innerHTML = '';

        // Show the actual question in HTML
        const questionElement = document.createElement('h2');
        questionElement.textContent = `Question ${currentQuestion + 1}: ${questionData.question}`;
        questionElement.classList.add('question-text'); // Add the class for styling
        questionContainer.appendChild(questionElement);

        // Create a container for the options
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container'); // Add class for styling options block

        // Create the options as radio buttons
        questionData.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option'); // Add the class for styling each option
            optionElement.innerHTML = `
                <label>
                    <input type="radio" name="answer" value="${option}">
                    ${option}
                </label>
            `;
            optionsContainer.appendChild(optionElement);
        });
        questionContainer.appendChild(optionsContainer); // Add options container to question container

        // --- START: Add element for validation message ---
        const validationMessageElement = document.createElement('div');
        validationMessageElement.id = 'validation-message'; // Give it an ID
        validationMessageElement.classList.add('validation-error'); // Add a class for styling
        questionContainer.appendChild(validationMessageElement);
        // --- END: Add element for validation message ---

        // Create the submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Answer';
        submitButton.classList.add('submit-button'); // Add the class for styling
        submitButton.addEventListener('click', checkAnswer);
        questionContainer.appendChild(submitButton);
    }

    // Verify the answer
    function checkAnswer() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        const feedbackContainer = document.getElementById('feedback-container');
        const validationMsgElement = document.getElementById('validation-message'); // Get validation message element

        // --- START: Clear previous messages and check selection ---
        // Clear previous validation message
        if (validationMsgElement) {
             validationMsgElement.textContent = '';
        }
        // Clear previous feedback message
        if (feedbackContainer) {
             feedbackContainer.textContent = '';
             feedbackContainer.style.backgroundColor = 'transparent';
             feedbackContainer.style.border = '0px';
             feedbackContainer.style.padding = '0px';
        }

        // Check if an option was selected
        if (!selectedOption) {
            // Display message in the dedicated element instead of alert
            if (validationMsgElement) {
                validationMsgElement.textContent = 'Please select an answer before submitting.';
            } else {
                 // Fallback if the validation element wasn't found
                 console.error("Element with ID 'validation-message' not found.");
                 alert('Please select an answer before submitting.'); // Keep alert as fallback
            }
            return; // Stop execution if no answer is selected
        }
        // --- END: Clear previous messages and check selection ---

        // If an option was selected, proceed
        const answer = selectedOption.value;

        // Display feedback
        if (feedbackContainer) {
            if (answer === quizData[currentQuestion].correctAnswer) {
                feedbackContainer.textContent = "Correct! Well done."; // Adjusted feedback
                feedbackContainer.style.backgroundColor = '#00FF6A'; // Green for correct
                correctAnswers++;
            } else {
                // Show the correct answer in feedback for incorrect ones
                feedbackContainer.textContent = `Incorrect. The correct answer was: ${quizData[currentQuestion].correctAnswer}`;
                feedbackContainer.style.backgroundColor = '#FF6F00'; // Orange/Red for incorrect
                incorrectAnswers++;
            }
            // Apply consistent styling for feedback visibility
            feedbackContainer.style.border = '1px solid #ccc';
            feedbackContainer.style.padding = '10px';
        } else {
            // Handle case where feedback container doesn't exist, maybe just log score changes
            console.warn("Element with ID 'feedback-container' not found. Feedback not displayed.");
             if (answer === quizData[currentQuestion].correctAnswer) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        }

        // Update the score display
        updateScore();

        // Disable options and button after submitting to prevent changes/resubmits
        document.querySelectorAll('input[name="answer"]').forEach(input => input.disabled = true);
        const submitBtn = document.querySelector('.submit-button');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Answer Submitted';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.style.backgroundColor = '#aaa'; // Grey out disabled button
        }


        // Short delay before moving to the next question or finishing the quiz
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < quizData.length) {
                updateProgress();
                showQuestion(); // Show the next question (this also clears feedback/validation)
            } else {
                updateProgress();
                showResults(); // Show final results
            }
        }, 1500); // 1.5 second delay
    }

    // Update the score display in the header
    function updateScore() {
        const correctEl = document.getElementById('correctAnswers');
        const incorrectEl = document.getElementById('incorrectAnswers');
        if (correctEl) correctEl.textContent = correctAnswers;
        if (incorrectEl) incorrectEl.textContent = incorrectAnswers;
    }

    // Update the progress bar percentage and text
    function updateProgress() {
        const totalQuestions = quizData.length || 1;
        const questionsCompleted = currentQuestion;
        const progress = (questionsCompleted / totalQuestions) * 100;
        const progressValueEl = document.querySelector('.progress-value');

        if (progressValueEl) {
            progressValueEl.style.width = `${progress}%`;
            progressValueEl.textContent = `${Math.round(progress)}% completed`;
        } else {
             console.warn("Element with class '.progress-value' not found.");
        }
    }

    // Display the final results after the quiz ends
    function showResults() {
        const questionContainer = document.getElementById('question-container');
        const feedbackContainer = document.getElementById('feedback-container');
        let message;
        let messageClass = '';

        if (!questionContainer) {
             console.error("Element with ID 'question-container' not found. Cannot display results.");
            return;
        }

        const passingScore = 3;
        if (correctAnswers >= passingScore) {
            message = "Congratulations! You passed the quiz!";
            messageClass = 'pass-message';
        } else {
            message = "Sorry, you did not pass the quiz this time.";
            messageClass = 'fail-message';
        }

        if (feedbackContainer) {
            feedbackContainer.textContent = '';
            feedbackContainer.style.backgroundColor = 'transparent';
            feedbackContainer.style.border = '0px';
            feedbackContainer.style.padding = '0px';
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
    // --- END Quiz Functions ---


    // --- Initial Setup ---
    updateProgress(); // Set initial progress (0%)

    // Use DOMContentLoaded to ensure the HTML is parsed before starting
    // --- MODIFIED EVENT LISTENER ---
    document.addEventListener('DOMContentLoaded', function() { // Changed to function block
        // --- ADDED ---
        // Call the date/time function immediately on load
        updateQuizDateTime();
        // Set interval to update time every second (1000ms)
        // Change 1000 to 60000 if you only need minute updates
        setInterval(updateQuizDateTime, 1000);
        // --- END ADDED ---

        // Call the original function to show the first question
        showQuestion();
    });
    // --- END MODIFIED EVENT LISTENER ---


})(); // End of self-invoking function