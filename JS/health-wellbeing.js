// Self-invoking anonymous function to encapsulate scope
(function() {
    'use strict'; // Enable strict mode

    // --- 1. Cookie Handling ---
    function getCookie(name) {
        const cookieName = `${name}=`;
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

    // --- 2. Date and Time Functionality ---
    function updateQuizDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time-quiz');
        const dateElement = document.getElementById('current-date-quiz');

        // Only update if elements exist and are intended to be visible
        if (timeElement && getComputedStyle(timeElement).display !== 'none') {
            const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }
        if (dateElement && getComputedStyle(dateElement).display !== 'none') {
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-GB', dateOptions);
        }
    }

    // --- 3. Quiz Data ---
    const quizData = [
        { id: 1, text: "Number for emergencies?", correctAnswer: "999" },
        { id: 2, text: "Scotland's national health service?", correctAnswer: "NHS Scotland" },
        { id: 3, text: "What does NHS stand for?", correctAnswer: "National Health Service" },
        { id: 4, text: "What is a healthy snack?", correctAnswer: "Apple" },
        { id: 5, text: "What is good for heart health?", correctAnswer: "Walking" } // Corrected double question mark
    ];
    const wordBankValues = shuffleArray(quizData.map(q => q.correctAnswer));
    const correctAnswersMap = quizData.reduce((map, question) => {
        map[question.id] = question.correctAnswer;
        return map;
    }, {});

    // --- 4. DOM Element References (Cached for performance) ---
    const username = getCookie('username') || 'Guest';
    const usernameDisplayElement = document.querySelector('.username-display');
    const questionListElement = document.getElementById('question-list');
    const wordBankElement = document.getElementById('word-bank');
    const submitButton = document.getElementById('submit-button');
    const validationMsgElement = document.getElementById('validation-message');
    const resultsContainer = document.getElementById('results-container');
    const quizContentContainer = document.getElementById('quiz-content');
    const progressValueElement = document.querySelector('.progress-value');
    const topSectionDateTimeHeader = document.querySelector('.top-section .date-time-header');
    const topSectionProgressContainer = document.querySelector('.top-section .progress-container');
    const topSectionElement = document.querySelector('.top-section');


    // --- Quiz State Variables ---
    let draggedItem = null;
    let score = { correct: 0, incorrect: 0 };
    let userAnswers = {}; // Stores user's answer for each question ID

    // --- 5. Helper Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
        }
        return array;
    }

    // --- 6. Dynamic HTML Generation & Listener Attachment ---
    function generateQuestions() {
        if (!questionListElement) {
            console.error("Element with ID 'question-list' not found.");
            return;
        }
        questionListElement.innerHTML = ''; // Clear any existing questions

        quizData.forEach(question => {
            const listItem = document.createElement('li');
            listItem.appendChild(document.createTextNode(question.text + ' '));

            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box', 'drop-zone');
            answerBox.dataset.question = question.id; // Use dataset for question ID

            answerBox.addEventListener('dragover', dragOver);
            answerBox.addEventListener('dragleave', dragLeave);
            answerBox.addEventListener('drop', drop);

            listItem.appendChild(answerBox);
            questionListElement.appendChild(listItem);
        });
    }

    function generateWordBank() {
        if (!wordBankElement) {
            console.error("Element with ID 'word-bank' not found.");
            return;
        }
        wordBankElement.innerHTML = ''; // Clear existing word bank items

        wordBankValues.forEach(answerValue => {
            const draggableElement = document.createElement('div');
            draggableElement.classList.add('draggable');
            draggableElement.draggable = true; // Set draggable attribute
            draggableElement.dataset.answer = answerValue;
            draggableElement.textContent = answerValue;

            draggableElement.addEventListener('dragstart', dragStart);
            draggableElement.addEventListener('dragend', dragEnd);

            wordBankElement.appendChild(draggableElement);
        });

        // Add listeners to the word bank container for dropping items back
        wordBankElement.addEventListener('dragover', dragOver);
        wordBankElement.addEventListener('dragleave', dragLeave);
        wordBankElement.addEventListener('drop', drop);
    }

    // --- 7. Drag and Drop Event Handlers ---
    function dragStart(event) {
        draggedItem = event.target;
        if (draggedItem && draggedItem.classList) { // Check if classList exists
            draggedItem.classList.add('dragging');
        }
        event.dataTransfer.setData('text/plain', draggedItem.dataset.answer);
        event.dataTransfer.effectAllowed = "move";
    }

    function dragEnd() { // event parameter is often not needed here
        if (draggedItem && draggedItem.classList) {
            draggedItem.classList.remove('dragging');
        }
        // draggedItem is reset in the drop function or if the drag is cancelled
    }

    function dragOver(event) {
        event.preventDefault(); // Necessary to allow dropping
        const target = event.target;
        // Allow drop on word bank OR an empty answer box
        const isAnswerBox = target.classList.contains('answer-box');
        const isWordBank = target.id === 'word-bank' || target.closest('#word-bank');

        if (isWordBank || (isAnswerBox && target.children.length === 0)) {
             if (!target.classList.contains('drag-over')) {
                 target.classList.add('drag-over');
             }
             event.dataTransfer.dropEffect = "move";
        } else {
             event.dataTransfer.dropEffect = "none";
        }
    }

    function dragLeave(event) {
        const target = event.target;
        if (target.classList.contains('drop-zone') || target.id === 'word-bank' || target.closest('#word-bank')) {
             target.classList.remove('drag-over');
        }
    }

    function drop(event) {
        event.preventDefault();
        const dropTarget = event.target.closest('.drop-zone') || event.target.closest('#word-bank') || event.target;
        if(dropTarget.classList.contains('drag-over')){
            dropTarget.classList.remove('drag-over');
        }


        if (!draggedItem) return;

        const isAnswerBoxTarget = dropTarget.classList.contains('answer-box');
        const isWordBankTarget = dropTarget.id === 'word-bank' || dropTarget.closest('#word-bank');

        // Case 1: Dropping onto an empty answer box
        if (isAnswerBoxTarget && dropTarget.children.length === 0) {
            if (draggedItem.parentElement.classList.contains('answer-box')) {
                 // No need to appendChild back to word bank, just remove from old box
                 // The browser handles moving the element.
            }
            dropTarget.appendChild(draggedItem);
            updateProgressDisplay();
        }
        // Case 2: Dropping back onto the word bank container
        else if (isWordBankTarget) {
            if (draggedItem.parentElement.classList.contains('answer-box')) {
                 wordBankElement.appendChild(draggedItem); // Move item back to word bank
                 updateProgressDisplay();
            }
        }
        draggedItem = null;
    }

    // --- 8. Check Answers and Validation ---
    function checkAnswers() {
        if (validationMsgElement) validationMsgElement.textContent = '';
        userAnswers = {};

        let filledBoxes = 0;
        const currentAnswerBoxes = document.querySelectorAll('#question-list .answer-box');
        currentAnswerBoxes.forEach(box => {
            if (box.children.length > 0) {
                filledBoxes++;
            }
        });

        const totalQuestions = quizData.length;
        if (filledBoxes < totalQuestions) {
            const message = `Please drag an answer to all ${totalQuestions} boxes.`;
            if (validationMsgElement) {
                validationMsgElement.textContent = message;
            } else {
                alert(message); // Fallback if validationMsgElement is not found
            }
            return;
        }

        score.correct = 0;
        score.incorrect = 0;

        currentAnswerBoxes.forEach(answerBox => {
            const questionId = answerBox.dataset.question; // Retrieve question ID
            const droppedElement = answerBox.children[0];
            const droppedAnswer = droppedElement ? droppedElement.dataset.answer : null;
            userAnswers[questionId] = droppedAnswer || "No Answer"; // Store user's answer

            answerBox.classList.remove('correct', 'incorrect'); // Clear previous visual state

            if (droppedAnswer && correctAnswersMap[questionId] === droppedAnswer) {
                score.correct++;
            } else {
                score.incorrect++;
            }
        });

        updateProgressDisplay(true); // Mark as final progress
        disableInteractions(currentAnswerBoxes);
        showResults();
    }

    // --- 9. Update UI Elements ---
    function updateProgressDisplay(isFinal = false) {
        let progressPercentage = 0;
        const totalQuestions = quizData.length;

        if (isFinal) {
            progressPercentage = 100;
        } else {
            let filledBoxes = 0;
            // Query current answer boxes each time, as DOM might change
            document.querySelectorAll('#question-list .answer-box').forEach(box => {
                if (box.children.length > 0) {
                    filledBoxes++;
                }
            });
            progressPercentage = totalQuestions > 0 ? (filledBoxes / totalQuestions) * 100 : 0;
        }

        if (topSectionProgressContainer && getComputedStyle(topSectionProgressContainer).display !== 'none' && progressValueElement) {
            progressValueElement.style.width = `${progressPercentage}%`;
            progressValueElement.textContent = `${Math.round(progressPercentage)}% completed`;
        } else if (progressValueElement && isFinal) {
             progressValueElement.style.width = `100%`;
             progressValueElement.textContent = `100% completed`;
        } else if (!topSectionProgressContainer || !progressValueElement) {
             if (!isFinal) { console.warn("Progress bar elements not found during update."); }
        }
    }

    // --- 10. Show Final Results ---
     function showResults() {
        if (quizContentContainer) {
            quizContentContainer.style.display = 'none';
        }

        if (topSectionDateTimeHeader) topSectionDateTimeHeader.style.display = 'none';
        if (topSectionProgressContainer) topSectionProgressContainer.style.display = 'none';

        if (topSectionElement) {
             topSectionElement.style.marginBottom = '0.5rem';
             topSectionElement.style.paddingBottom = '0.2rem';
        }

        let messageHTML = "";
        let messageClass = "";
        const passingScore = 3; // Example: 3 out of 5 to pass
        const totalQuestions = quizData.length;

        if (score.correct >= passingScore) {
            messageHTML = `<span class="result-highlight-word pass-highlight">Congratulations!</span><br><span class="result-secondary-text pass-secondary">You passed the quiz!</span>`;
            messageClass = 'pass-message';
        } else {
            messageHTML = `<span class="result-highlight-word fail-highlight">Sorry,</span><br><span class="result-secondary-text fail-secondary">You didn't pass the quiz this time.</span>`;
            messageClass = 'fail-message';
        }

        // Using template literals for cleaner HTML string construction
        let resultsHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: ${score.correct} Correct, ${score.incorrect} Incorrect out of ${totalQuestions}.</p>
            <p class="${messageClass}">${messageHTML}</p>
            <h3>Review Your Answers:</h3>
            <div id="review-section"><ul>`;

        quizData.forEach(question => {
            const questionId = question.id;
            const questionText = question.text;
            const userAns = userAnswers[questionId] || "No Answer";
            const correctAns = correctAnswersMap[questionId];
            const isUserCorrect = (userAns === correctAns);

            resultsHTML += `
                <li class="review-item ${isUserCorrect ? 'review-correct' : 'review-incorrect'}">
                    <p class="review-question"><strong>Q${questionId}:</strong> ${questionText}</p>
                    <p class="review-user-answer">Your Answer: <span class="answer-value user-ans">${userAns}</span></p>
                    <p class="review-correct-answer">Correct Answer: <span class="answer-value correct-ans">${correctAns}</span></p>
                </li>`;
        });

        resultsHTML += `</ul></div>
            <div class="results-button">
                <button onclick="window.location.href='quizzes.html'">Back to Quizzes</button>
                <button onclick="window.location.reload()">Try Again</button>
            </div>`;

        if (resultsContainer) {
            resultsContainer.innerHTML = resultsHTML;
            resultsContainer.style.display = 'block';
        } else {
            console.error("Element with ID 'results-container' not found.");
        }
    }

    // --- 11. Disable Interactions Post-Submission ---
    function disableInteractions(answerBoxesToDisable) {
        document.querySelectorAll('.draggable').forEach(draggable => {
            draggable.draggable = false; // Use boolean for draggable attribute
            draggable.style.cursor = 'default';
            draggable.classList.remove('dragging'); // Ensure no dragging class remains
        });

        answerBoxesToDisable.forEach(box => {
            box.removeEventListener('dragover', dragOver);
            box.removeEventListener('drop', drop);
            box.removeEventListener('dragleave', dragLeave);
            box.classList.remove('drag-over'); // Clear any visual hover state
        });

        if (wordBankElement) {
            wordBankElement.removeEventListener('dragover', dragOver);
            wordBankElement.removeEventListener('drop', drop);
            wordBankElement.removeEventListener('dragleave', dragLeave);
         }
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitted";
            submitButton.style.cursor = 'not-allowed';
            submitButton.style.opacity = '0.7';
        }
    }

    // --- 12. Initialization ---
    function initializeQuiz() {
        // Ensure header elements are visible on quiz start/retry
        if(topSectionDateTimeHeader) topSectionDateTimeHeader.style.display = 'flex'; // Assuming it's a flex container
        if(topSectionProgressContainer) topSectionProgressContainer.style.display = ''; // Reset to default or specific display
        const scoreContainer = document.querySelector('.top-section .score-container');
        if(scoreContainer) scoreContainer.style.display = '';

        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = username;
        } else {
            console.warn("Element with class 'username-display' not found for username.");
        }

        generateQuestions();
        generateWordBank();

        if (submitButton) {
            submitButton.addEventListener('click', checkAnswers);
            // Reset button state for retries
            submitButton.disabled = false;
            submitButton.textContent = "SUBMIT";
            submitButton.style.cursor = 'pointer';
            submitButton.style.opacity = '1';
        } else {
             console.error("Element with ID 'submit-button' not found.");
        }
        updateProgressDisplay(); // Initial progress (0%)
    }

    // --- 13. Event Listener for DOMContentLoaded ---
    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime(); // Initial call
        setInterval(updateQuizDateTime, 1000); // Update time every second
        initializeQuiz();
    });

})();