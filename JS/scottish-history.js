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
        { id: 1, text: "Scotland's national poet?", correctAnswer: "BURNS" },
        { id: 2, text: "Famous monster legend loch?", correctAnswer: "NESS" },
        { id: 3, text: "Scottish Parliament building name?", correctAnswer: "HOLYROOD PALACE" },
        { id: 4, text: "Highest British Isles mountain?", correctAnswer: "BEN NEVIS" },
        { id: 5, text: "Bannockburn Scots leader?", correctAnswer: "ROBERT THE BRUCE" }
    ];
    const wordBankValues = shuffleArray(quizData.map(q => q.correctAnswer)); // Ensure shuffleArray is defined
    const correctAnswersMap = quizData.reduce((map, question) => {
        map[question.id] = question.correctAnswer;
        return map;
    }, {});

    // --- 4. DOM Element References (Cached) ---
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
    let userAnswers = {};

    // --- 5. Helper Function: Shuffle Array ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- 6. Dynamic HTML Generation ---
    function generateQuestions() {
        if (!questionListElement) {
            console.error("Element with ID 'question-list' not found.");
            return;
        }
        questionListElement.innerHTML = '';

        quizData.forEach(question => {
            const listItem = document.createElement('li');
            listItem.appendChild(document.createTextNode(question.text + ' '));

            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box', 'drop-zone');
            answerBox.dataset.questionId = question.id; // Consistent dataset naming

            answerBox.addEventListener('dragover', dragOverHandler);
            answerBox.addEventListener('dragleave', dragLeaveHandler);
            answerBox.addEventListener('drop', dropHandler);

            listItem.appendChild(answerBox);
            questionListElement.appendChild(listItem);
        });
    }

    function generateWordBank() {
        if (!wordBankElement) {
            console.error("Element with ID 'word-bank' not found.");
            return;
        }
        wordBankElement.innerHTML = '';

        wordBankValues.forEach(answerValue => {
            const draggableElement = document.createElement('div');
            draggableElement.classList.add('draggable');
            draggableElement.draggable = true;
            draggableElement.dataset.answerValue = answerValue; // Consistent dataset naming
            draggableElement.textContent = answerValue;

            draggableElement.addEventListener('dragstart', dragStartHandler);
            draggableElement.addEventListener('dragend', dragEndHandler);

            wordBankElement.appendChild(draggableElement);
        });

        wordBankElement.addEventListener('dragover', dragOverHandler);
        wordBankElement.addEventListener('dragleave', dragLeaveHandler);
        wordBankElement.addEventListener('drop', dropHandler);
    }

    // --- 7. Drag and Drop Event Handlers (renamed for clarity) ---
    function dragStartHandler(event) {
        draggedItem = event.target;
        if (draggedItem && draggedItem.classList) {
            draggedItem.classList.add('dragging');
        }
        event.dataTransfer.setData('text/plain', draggedItem.dataset.answerValue);
        event.dataTransfer.effectAllowed = "move";
    }

    function dragEndHandler() {
        if (draggedItem && draggedItem.classList) {
            draggedItem.classList.remove('dragging');
        }
    }

    function dragOverHandler(event) {
        event.preventDefault();
        const target = event.target;
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

    function dragLeaveHandler(event) {
        const target = event.target;
        if (target.classList.contains('drop-zone') || target.id === 'word-bank' || target.closest('#word-bank')) {
             target.classList.remove('drag-over');
        }
    }

    function dropHandler(event) {
        event.preventDefault();
        const dropTarget = event.target.closest('.drop-zone') || event.target.closest('#word-bank') || event.target;
        if (dropTarget.classList.contains('drag-over')) {
            dropTarget.classList.remove('drag-over');
        }

        if (!draggedItem) return;

        const isAnswerBoxTarget = dropTarget.classList.contains('answer-box');
        const isWordBankTarget = dropTarget.id === 'word-bank' || dropTarget.closest('#word-bank');

        if (isAnswerBoxTarget && dropTarget.children.length === 0) {
            dropTarget.appendChild(draggedItem);
            updateProgressDisplay();
        } else if (isWordBankTarget && draggedItem.parentElement.classList.contains('answer-box')) {
            wordBankElement.appendChild(draggedItem);
            updateProgressDisplay();
        }
        draggedItem = null;
    }

    // --- 8. Check Answers and Validation ---
    function checkAnswers() {
        if (validationMsgElement) validationMsgElement.textContent = '';
        userAnswers = {};

        let filledBoxesCount = 0;
        const currentAnswerBoxes = document.querySelectorAll('#question-list .answer-box');
        currentAnswerBoxes.forEach(box => {
            if (box.children.length > 0) filledBoxesCount++;
        });

        const totalQuestions = quizData.length;
        if (filledBoxesCount < totalQuestions) {
            const message = `Please drag an answer to all ${totalQuestions} boxes.`;
            if (validationMsgElement) {
                validationMsgElement.textContent = message;
            } else {
                alert(message);
            }
            return;
        }

        score.correct = 0;
        score.incorrect = 0;

        currentAnswerBoxes.forEach(answerBox => {
            const questionId = answerBox.dataset.questionId;
            const droppedElement = answerBox.children[0];
            const droppedAnswer = droppedElement ? droppedElement.dataset.answerValue : null;
            userAnswers[questionId] = droppedAnswer || "No Answer";

            answerBox.classList.remove('correct', 'incorrect');

            if (droppedAnswer && correctAnswersMap[questionId] === droppedAnswer) {
                score.correct++;
            } else {
                score.incorrect++;
            }
        });

        updateProgressDisplay(true);
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
            let filledBoxesCount = 0;
            document.querySelectorAll('#question-list .answer-box').forEach(box => {
                if (box.children.length > 0) filledBoxesCount++;
            });
            progressPercentage = totalQuestions > 0 ? (filledBoxesCount / totalQuestions) * 100 : 0;
        }

        if (topSectionProgressContainer && getComputedStyle(topSectionProgressContainer).display !== 'none' && progressValueElement) {
            progressValueElement.style.width = `${progressPercentage}%`;
            progressValueElement.textContent = `${Math.round(progressPercentage)}% completed`;
        } else if (progressValueElement && isFinal) {
             progressValueElement.style.width = `100%`;
             progressValueElement.textContent = `100% completed`;
        } else if (!topSectionProgressContainer || !progressValueElement) {
             if (!isFinal) console.warn("Progress bar elements not found during update.");
        }
    }

    // --- 10. Show Final Results ---
     function showResults() {
        if (quizContentContainer) quizContentContainer.style.display = 'none';
        if (topSectionDateTimeHeader) topSectionDateTimeHeader.style.display = 'none';
        if (topSectionProgressContainer) topSectionProgressContainer.style.display = 'none';

        if (topSectionElement) {
             topSectionElement.style.marginBottom = '0.5rem';
             topSectionElement.style.paddingBottom = '0.2rem';
        }

        let messageHTML = "";
        let messageClass = "";
        const passingScore = 3;
        const totalQuestions = quizData.length;

        if (score.correct >= passingScore) {
            messageHTML = `<span class="result-highlight-word pass-highlight">Congratulations!</span><br><span class="result-secondary-text pass-secondary">You passed the quiz!</span>`;
            messageClass = 'pass-message';
        } else {
            messageHTML = `<span class="result-highlight-word fail-highlight">Sorry,</span><br><span class="result-secondary-text fail-secondary">You didn't pass the quiz this time.</span>`;
            messageClass = 'fail-message';
        }

        let resultsHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: ${score.correct} Correct, ${score.incorrect} Incorrect out of ${totalQuestions}.</p>
            <p class="${messageClass}">${messageHTML}</p>
            <h3>Review Your Answers:</h3>
            <div id="review-section"><ul>`;

        quizData.forEach(question => {
            const questionId = question.id;
            const userAns = userAnswers[questionId] || "No Answer";
            const correctAns = correctAnswersMap[questionId];
            const isUserCorrect = (userAns === correctAns);

            resultsHTML += `
                <li class="review-item ${isUserCorrect ? 'review-correct' : 'review-incorrect'}">
                    <p class="review-question"><strong>Q${questionId}:</strong> ${question.text}</p>
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
            draggable.draggable = false;
            draggable.style.cursor = 'default';
            draggable.classList.remove('dragging');
        });

        answerBoxesToDisable.forEach(box => {
            box.removeEventListener('dragover', dragOverHandler);
            box.removeEventListener('drop', dropHandler);
            box.removeEventListener('dragleave', dragLeaveHandler);
            box.classList.remove('drag-over');
        });

        if (wordBankElement) {
            wordBankElement.removeEventListener('dragover', dragOverHandler);
            wordBankElement.removeEventListener('drop', dropHandler);
            wordBankElement.removeEventListener('dragleave', dragLeaveHandler);
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
        if(topSectionDateTimeHeader) topSectionDateTimeHeader.style.display = 'flex';
        if(topSectionProgressContainer) topSectionProgressContainer.style.display = '';
        const scoreContainer = document.querySelector('.top-section .score-container');
        if(scoreContainer) scoreContainer.style.display = '';

        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = username;
        } else {
            console.warn("Element with class 'username-display' not found for username.");
        }

        generateQuestions(); // Renamed
        generateWordBank();    // Renamed

        if (submitButton) {
            submitButton.addEventListener('click', checkAnswers);
            submitButton.disabled = false;
            submitButton.textContent = "SUBMIT";
            submitButton.style.cursor = 'pointer';
            submitButton.style.opacity = '1';
        } else {
             console.error("Element with ID 'submit-button' not found.");
        }
        updateProgressDisplay();
    }

    // --- 13. DOMContentLoaded Event Listener ---
    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime();
        setInterval(updateQuizDateTime, 1000);
        initializeQuiz();
    });

})();