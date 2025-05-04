// Self-invoking anonymous function to avoid variable scope collisions.
(function() {
    // --- 1. Cookie Handling ---
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.startsWith(cookieName)) {
                // Decode value in case it was encoded
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

    // --- 3. Quiz Data ---
    const quizData = [
        { id: 1, text: "Who is Scotland's national poet?", correctAnswer: "BURNS" },
        { id: 2, text: "Which Loch is famous for a monster legend?", correctAnswer: "NESS" },
        { id: 3, text: "What is the name of the Scottish Parliament building?", correctAnswer: "HOLYROOD PALACE" },
        { id: 4, text: "What is the highest mountain in the British Isles?", correctAnswer: "BEN NEVIS" },
        { id: 5, text: "Who led the Scots at the Battle of Bannockburn?", correctAnswer: "ROBERT THE BRUCE" }
    ];

    // Derive word bank options from correct answers & shuffle them
    const wordBankValues = shuffleArray(quizData.map(q => q.correctAnswer));

    // Create a map for quick answer lookup during checking
    const correctAnswersMap = quizData.reduce((map, question) => {
        map[question.id] = question.correctAnswer;
        return map;
    }, {});

    // --- 4. DOM Element References ---
    const username = getCookie('username') || 'Guest'; // Get username or default

    // --- MODIFICATION POINT ---
    // Select the element to display the username using its CLASS
    const usernameDisplayElement = document.querySelector('.username-display');
    // --- END MODIFICATION POINT ---

    const questionListElement = document.getElementById('question-list');
    const wordBankElement = document.getElementById('word-bank');
    const submitButton = document.getElementById('submit-button');
    const validationMsgElement = document.getElementById('validation-message');
    const resultsContainer = document.getElementById('results-container');
    const quizContentContainer = document.getElementById('quiz-content');
    // const scoreDisplayContainer = document.querySelector('.score-container'); // Not currently used for display here
    const progressValueElement = document.querySelector('.progress-value');

    // Variables needed across functions
    let draggables = []; // Will be populated after generation
    let answerBoxes = []; // Will be populated after generation
    let draggedItem = null;
    let score = { correct: 0, incorrect: 0 };


    // --- 5. Helper Functions ---
    // Function to shuffle an array (Fisher-Yates Algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // --- 6. Dynamic HTML Generation ---
    function generateQuestions() {
        if (!questionListElement) return;
        questionListElement.innerHTML = '';

        quizData.forEach(question => {
            const listItem = document.createElement('li');
            listItem.textContent = question.text + ' ';

            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box', 'drop-zone');
            answerBox.dataset.question = question.id;

            listItem.appendChild(answerBox);
            questionListElement.appendChild(listItem);
        });
    }

    function generateWordBank() {
        if (!wordBankElement) return;
        wordBankElement.innerHTML = '';

        wordBankValues.forEach(answerValue => {
            const draggableElement = document.createElement('div');
            draggableElement.classList.add('draggable');
            draggableElement.setAttribute('draggable', 'true');
            draggableElement.dataset.answer = answerValue;
            draggableElement.textContent = answerValue;

            wordBankElement.appendChild(draggableElement);
        });
    }

    // --- 7. Drag and Drop Event Handlers ---
    function dragStart(event) {
        draggedItem = event.target;
        event.target.classList.add('dragging');
        event.dataTransfer.setData('text/plain', event.target.dataset.answer);
    }

    function dragEnd(event) {
        event.target.classList.remove('dragging');
        // draggedItem reset in drop handler is generally preferred
    }

    function dragOver(event) {
        event.preventDefault();
        if (event.target.classList.contains('drop-zone') || event.target.id === 'word-bank') {
             if (!event.target.classList.contains('drag-over')) { // Prevent flicker
                 event.target.classList.add('drag-over');
             }
        }
    }

    function dragLeave(event) {
        event.target.classList.remove('drag-over');
    }

    function drop(event) {
        event.preventDefault();
        const dropTarget = event.target;
        dropTarget.classList.remove('drag-over');

        if (!draggedItem) return;

        // Dropping onto an answer box
        if (dropTarget.classList.contains('answer-box') && dropTarget.children.length === 0) {
             // If item came from another box, move original back to bank first (optional enhancement)
             if (draggedItem.parentElement.classList.contains('answer-box') && wordBankElement) {
                 wordBankElement.appendChild(draggedItem);
             }
             dropTarget.appendChild(draggedItem);
             updateProgress();
        }
        // Dropping back onto the word bank
        else if (wordBankElement && (dropTarget.id === 'word-bank' || dropTarget.closest('#word-bank'))) {
             // Only move back if it came from an answer box
             if (draggedItem.parentElement.classList.contains('answer-box')) {
                 wordBankElement.appendChild(draggedItem);
                 updateProgress();
             }
        }

        draggedItem = null; // Reset after drop attempt
    }

    // --- 8. Check Answers and Validation ---
    function checkAnswers() {
        if (validationMsgElement) validationMsgElement.textContent = '';

        let filledBoxes = 0;
        answerBoxes.forEach(box => { // Ensure answerBoxes is populated before calling this
            if (box.children.length > 0) {
                filledBoxes++;
            }
        });

        const totalBoxes = quizData.length;

        if (filledBoxes < totalBoxes) {
            if (validationMsgElement) {
                validationMsgElement.textContent = `Please drag an answer to all ${totalBoxes} question boxes before submitting.`;
            } else {
                alert(`Please complete all ${totalBoxes} answers.`);
            }
            return;
        }

        score.correct = 0;
        score.incorrect = 0;

        answerBoxes.forEach(answerBox => {
            const questionNumber = answerBox.dataset.question;
            const droppedElement = answerBox.children[0];
            const droppedAnswer = droppedElement ? droppedElement.dataset.answer : null; // Check if element exists

            answerBox.classList.remove('correct', 'incorrect');

            if (droppedAnswer && correctAnswersMap[questionNumber] === droppedAnswer) {
                score.correct++;
                answerBox.classList.add('correct');
            } else {
                score.incorrect++;
                answerBox.classList.add('incorrect');
            }
        });

        // updateScoreDisplay(); // Update score display if needed
        updateProgress(true);
        disableInteractions();
        showResults();
    }

    // --- 9. Update UI Elements ---
    // function updateScoreDisplay() { /* Currently empty */ }

    function updateProgress(final = false) {
        let progress = 0;
        const totalBoxes = quizData.length;

        if (final) {
            progress = 100;
        } else {
             let filledBoxes = 0;
             // Re-query here or ensure answerBoxes is available
             const currentAnswerBoxes = document.querySelectorAll('.answer-box');
             currentAnswerBoxes.forEach(box => {
                 if (box.children.length > 0) {
                     filledBoxes++;
                 }
             });
             progress = totalBoxes > 0 ? (filledBoxes / totalBoxes) * 100 : 0;
        }

        if (progressValueElement) {
            progressValueElement.style.width = `${progress}%`;
            progressValueElement.textContent = `${Math.round(progress)}% completed`;
        }
    }

    // --- 10. Show Final Results ---
     function showResults() {
        if (quizContentContainer) {
            quizContentContainer.style.display = 'none';
        }

        let message = "";
        let messageClass = "";
        const passingScore = 3;
        const totalQuestions = quizData.length;

        if (score.correct >= passingScore) {
            message = "Congratulations! You passed the quiz!";
            messageClass = 'pass-message';
        } else {
            message = "Sorry, you didn't pass this time. Review the answers below.";
            messageClass = 'fail-message';
        }

        const resultsHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: ${score.correct} Correct, ${score.incorrect} Incorrect out of ${totalQuestions}.</p>
            <p class="${messageClass}">${message}</p>
            <div class="results-button">
                <button onclick="window.location.href='quizzes.html'">Back to Quizzes</button>
                 <button onclick="window.location.reload()">Try Again</button>
            </div>
             <hr>
             <h3>Review Your Answers:</h3>
             <div id="review-section"></div>
        `;

        if (resultsContainer) {
            resultsContainer.innerHTML = resultsHTML;
            resultsContainer.style.display = 'block';

             const reviewSection = resultsContainer.querySelector('#review-section');
             // Use the generated question list for cloning
             const originalQuestionList = document.getElementById('question-list');

             if (originalQuestionList && reviewSection) {
                 const questionListClone = originalQuestionList.cloneNode(true);

                 // Apply final feedback styles to the clone
                 questionListClone.querySelectorAll('.answer-box').forEach(clonedBox => {
                     const questionNum = clonedBox.dataset.question;
                     // Find the corresponding original box *at the time of checking*
                     const originalBox = answerBoxes.find(box => box.dataset.question === questionNum);

                     if (originalBox) {
                          if (originalBox.classList.contains('correct')) {
                               clonedBox.classList.add('correct');
                          } else if (originalBox.classList.contains('incorrect')) {
                               clonedBox.classList.add('incorrect');
                          }
                     }
                     // Make review items non-interactive
                     if (clonedBox.children[0]) {
                          clonedBox.children[0].style.cursor = 'default';
                          clonedBox.children[0].setAttribute('draggable','false');
                     }
                 });
                 reviewSection.appendChild(questionListClone);
             }
        }
    }

    // --- 11. Disable Interactions Post-Submission ---
    function disableInteractions() {
        draggables.forEach(draggable => { // Ensure draggables is populated
            draggable.setAttribute('draggable', 'false');
            draggable.style.cursor = 'default';
            draggable.classList.remove('dragging');
        });

        answerBoxes.forEach(box => { // Ensure answerBoxes is populated
            box.removeEventListener('dragover', dragOver);
            box.removeEventListener('drop', drop);
            box.removeEventListener('dragleave', dragLeave);
            box.classList.remove('drag-over');
        });

        if (wordBankElement) {
            wordBankElement.removeEventListener('dragover', dragOver);
            wordBankElement.removeEventListener('drop', drop);
            wordBankElement.removeEventListener('dragleave', dragLeave);
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitted"; // Optional: Change button text
             submitButton.style.cursor = 'not-allowed';
             submitButton.style.opacity = '0.7'; // Optional: Fade disabled button

        }
    }

    // --- 12. Initialization ---
    function initializeQuiz() {
        // Display username (done earlier)
        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = username;
        } else {
            // --- MODIFICATION POINT ---
            // Updated warning message for class selector
            console.warn("Element with class 'username-display' not found.");
            // --- END MODIFICATION POINT ---
        }


        // Generate dynamic content
        generateQuestions();
        generateWordBank();

        // Get references AFTER elements are generated
        draggables = document.querySelectorAll('.draggable');
        answerBoxes = document.querySelectorAll('.answer-box');

        // Attach event listeners
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', dragStart);
            draggable.addEventListener('dragend', dragEnd);
        });

        answerBoxes.forEach(answerBox => {
            answerBox.addEventListener('dragover', dragOver);
            answerBox.addEventListener('dragleave', dragLeave);
            answerBox.addEventListener('drop', drop);
        });

         if (wordBankElement) {
             wordBankElement.addEventListener('dragover', dragOver);
             wordBankElement.addEventListener('dragleave', dragLeave);
             wordBankElement.addEventListener('drop', drop);
         }

        if (submitButton) {
            submitButton.addEventListener('click', checkAnswers);
        }

        // Initial UI updates
        // updateScoreDisplay(); // Not displaying score initially here
        updateProgress();
    }

    // --- 13. Event Listeners ---
    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime(); // Initial date/time display
        setInterval(updateQuizDateTime, 60000); // Update date/time every minute
        initializeQuiz(); // Setup the rest of the quiz
    });

})(); // End of self-invoking function