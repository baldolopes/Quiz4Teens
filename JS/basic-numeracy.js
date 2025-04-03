// Self-invoking anonymous function to avoid variable scope collisions.
(function() {
    // Function to get cookie by name
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return "";
    }

    // Get username from cookies
    const username = getCookie('username');

    // Display username in the HTML
    document.getElementById('usernameDisplay').textContent = username;

    // Quiz Data (Questions and Answers)
    const quizData = [{
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
        // Add more questions here
    ];

    let currentQuestion = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // Show Current Question
    function showQuestion() {
        const questionData = quizData[currentQuestion];
        const questionContainer = document.getElementById('question-container');

        // clear previous content
        questionContainer.innerHTML = '';

        // show the actual question on HTML
        const questionElement = document.createElement('h2');
        questionElement.textContent = `Question ${currentQuestion + 1}: ${questionData.question}`;
        questionElement.classList.add('question-text'); // Add the class for styling
        questionContainer.appendChild(questionElement);

        // Create the options as radio buttons
        questionData.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option'); // Add the class for styling
            optionElement.innerHTML = `
                <label>
                    <input type="radio" name="answer" value="${option}">
                    ${option}
                </label>
            `;
            questionContainer.appendChild(optionElement);

            
        });

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

        if (!selectedOption) {
            alert('Please select an answer');
            return;
        }

        const answer = selectedOption.value;
        const feedbackContainer = document.getElementById('feedback-container');

        if (answer === quizData[currentQuestion].correctAnswer) {
            feedbackContainer.textContent = 'You\'re a genius! That\'s Right.';
            feedbackContainer.style.backgroundColor = '#00FF6A';
            correctAnswers++;
        } else {
            feedbackContainer.textContent = 'Not quite! Try Again!';
            feedbackContainer.style.backgroundColor = '#FF6F00';
            incorrectAnswers++;
        }

        // Update the score
        updateScore();


        // Move to the next question or finish the quiz
        currentQuestion++;
        if (currentQuestion < quizData.length) {

            // Update the progress bar
            updateProgress();

            showQuestion();
        } else {
            // Update the progress bar
            updateProgress();
            showResults();
        }
    }

    // Update the data for right/wrong answers
    function updateScore() {
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    }

    // Add functionality to the progress bar
    function updateProgress() {
        const progress = ((currentQuestion) / quizData.length) * 100;
        document.querySelector('.progress-value').style.width = `${progress}%`;
        document.querySelector('.progress-value').textContent = `${progress}% completed`;
    }

    // Create the feedback to be provided by the page when the users are done
    function showResults() {
        const questionContainer = document.getElementById('question-container');
        const feedbackContainer = document.getElementById('feedback-container');
        let message;
        let messageClass = '';// Creating a class for results

        if (correctAnswers >= 3) {
            message = "Congratulations! You passed the quiz!";
            messageClass = 'pass-message';
        } else {
            message = "Sorry, you failed the quiz.";
            messageClass = 'fail-message';
        }

        feedbackContainer.textContent = ''; // clean feedback

        // Create a container for the button
        let backToQuizzesButton = `<div class="results-button"><button onclick="window.location.href='quizzes.html'">Back to Quizzes</button></div>`;
        let displayResults = `<p class="quiz-completion-tag ${messageClass}">${message}</p>`; // adding styles

        questionContainer.innerHTML = `<h2>Quiz Completed!</h2><p>You got ${correctAnswers} correct and ${incorrectAnswers} incorrect.</p>${displayResults}${backToQuizzesButton}`;
        feedbackContainer.style.backgroundColor = 'transparent';// background = transparent
        feedbackContainer.style.border = '0px';
        feedbackContainer.style.padding = '0px';// paddings = 0
        
        const quizContainer = document.querySelector('.quiz-container'); // Select the main quiz container
        quizContainer.appendChild(feedbackContainer);

    }
    // Start with a 0% completed
    updateProgress();
    window.onload = showQuestion;
})();