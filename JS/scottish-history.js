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
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return "";
    }

    // --- 2. Quiz Data ---
    const quizData = [
        { id: 1, text: "Who is Scotland's national poet?", correctAnswer: "BURNS" },
        { id: 2, text: "Which Loch is famous for a monster legend?", correctAnswer: "NESS" },
        { id: 3, text: "What is the name of the Scottish Parliament building?", correctAnswer: "HOLYROOD PALACE" }, // Note: Technically Holyrood. Adjust if precise.
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

    // --- 3. DOM Element References ---
    const username = getCookie('username') || 'Guest';
    const usernameDisplayElement = document.getElementById('usernameDisplay');
    const questionListElement = document.getElementById('question-list');
    const wordBankElement = document.getElementById('word-bank');
    const submitButton = document.getElementById('submit-button');
    const validationMsgElement = document.getElementById('validation-message');
    const resultsContainer = document.getElementById('results-container');
    const quizContentContainer = document.getElementById('quiz-content');
    const scoreDisplayContainer = document.querySelector('.score-container');
    const progressValueElement = document.querySelector('.progress-value');

    // Variables needed across functions
    let draggables = []; // Will be populated after generation
    let answerBoxes = []; // Will be populated after generation
    let draggedItem = null;
    let score = { correct: 0, incorrect: 0 };


    // --- 4. Helper Functions ---
    // Function to shuffle an array (Fisher-Yates Algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // --- 5. Dynamic HTML Generation ---
    function generateQuestions() {
        if (!questionListElement) return;
        questionListElement.innerHTML = ''; // Clear existing (if any)

        quizData.forEach(question => {
            const listItem = document.createElement('li');
            listItem.textContent = question.text + ' '; // Add space before answer box

            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box', 'drop-zone');
            answerBox.dataset.question = question.id; // Store question ID

            listItem.appendChild(answerBox);
            questionListElement.appendChild(listItem);
        });
    }

    function generateWordBank() {
        if (!wordBankElement) return;
        wordBankElement.innerHTML = ''; // Clear existing

        wordBankValues.forEach(answerValue => {
            const draggableElement = document.createElement('div');
            draggableElement.classList.add('draggable');
            draggableElement.setAttribute('draggable', 'true');
            draggableElement.dataset.answer = answerValue; // Store answer value
            draggableElement.textContent = answerValue;

            wordBankElement.appendChild(draggableElement);
        });
    }

    // --- 6. Drag and Drop Event Handlers (Identical to previous version) ---
    function dragStart(event) {
        draggedItem = event.target;
        event.target.classList.add('dragging');
        event.dataTransfer.setData('text/plain', event.target.dataset.answer);
    }

    function dragEnd(event) {
        event.target.classList.remove('dragging');
        // Note: draggedItem is set to null in the 'drop' handler to avoid issues
        // if the drop wasn't successful onto a valid target. Resetting here might be redundant
        // but safe. Consider resetting only in drop or if needed after invalid drops.
        // draggedItem = null;
    }

    function dragOver(event) {
        event.preventDefault();
        if (event.target.classList.contains('drop-zone') || event.target.id === 'word-bank') {
            event.target.classList.add('drag-over');
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
            // Optional: If item came from another box, move original back to bank first
             if (draggedItem.parentElement.classList.contains('answer-box')) {
                 wordBankElement.appendChild(draggedItem); // Move back to allow new placement
             }
             // Append the item being dragged
            dropTarget.appendChild(draggedItem);
            updateProgress();
        }
        // Dropping back onto the word bank
        else if (dropTarget.id === 'word-bank' || dropTarget.closest('#word-bank')) {
            // Only move back if it came from an answer box
             if (draggedItem.parentElement.classList.contains('answer-box')) {
                 wordBankElement.appendChild(draggedItem);
                 updateProgress();
             }
        }

        draggedItem = null; // Reset after successful drop logic
    }

    // --- 7. Check Answers and Validation (Logic mostly same, uses dynamic elements) ---
    function checkAnswers() {
        if (validationMsgElement) validationMsgElement.textContent = '';

        let filledBoxes = 0;
        answerBoxes.forEach(box => {
            if (box.children.length > 0) {
                filledBoxes++;
            }
        });

        const totalBoxes = answerBoxes.length;

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
            const droppedAnswer = droppedElement.dataset.answer;

            answerBox.classList.remove('correct', 'incorrect'); // Clear previous first

            // Use the pre-generated correctAnswersMap for lookup
            if (correctAnswersMap[questionNumber] === droppedAnswer) {
                score.correct++;
                answerBox.classList.add('correct');
            } else {
                score.incorrect++;
                answerBox.classList.add('incorrect');
            }
        });

        updateScoreDisplay();
        updateProgress(true); // Mark as final 100%
        disableInteractions();
        showResults();
    }

    // --- 8. Update UI Elements (Mostly identical) ---
    function updateScoreDisplay() {
        // Decided to show score only in results, so this is empty now
        // if (scoreDisplayContainer) {
        //      scoreDisplayContainer.innerHTML = `Score: ${score.correct}/${answerBoxes.length}`;
        // }
    }

    function updateProgress(final = false) {
        let progress = 0;
        const totalBoxes = quizData.length; // Use quizData length

        if (final) {
            progress = 100;
        } else {
            let filledBoxes = 0;
            // Need to query answerBoxes again inside here if they aren't global yet
            // Or ensure answerBoxes is populated before this is called during interaction
             document.querySelectorAll('.answer-box').forEach(box => {
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

    // --- 9. Show Final Results (Identical logic, uses dynamic score) ---
     function showResults() {
        if (quizContentContainer) {
            quizContentContainer.style.display = 'none';
        }

        let message = "";
        let messageClass = "";
        const passingScore = 3; // Example passing threshold

        if (score.correct >= passingScore) {
            message = "Congratulations! You passed the quiz!";
            messageClass = 'pass-message';
        } else {
            message = "Sorry, you didn't pass this time. Review the answers below.";
            messageClass = 'fail-message';
        }

        const totalQuestions = quizData.length;
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
             const originalQuestionList = document.getElementById('question-list'); // Get the one used during the quiz

             if (originalQuestionList && reviewSection) {
                 const questionListClone = originalQuestionList.cloneNode(true);

                 // Ensure feedback styles are applied to the clone based on final score
                 questionListClone.querySelectorAll('.answer-box').forEach(box => {
                     const questionNum = box.dataset.question;
                     // Check if the box *had* a correct/incorrect class from checkAnswers
                     const originalBox = originalQuestionList.querySelector(`.answer-box[data-question="${questionNum}"]`);
                     if (originalBox) {
                          if (originalBox.classList.contains('correct')) {
                               box.classList.add('correct');
                          } else if (originalBox.classList.contains('incorrect')) {
                               box.classList.add('incorrect');
                          }
                     }
                     // Optional: Make items in review non-interactive visually
                     if (box.children[0]) {
                          box.children[0].style.cursor = 'default';
                          box.children[0].setAttribute('draggable','false');
                     }

                 });

                 reviewSection.appendChild(questionListClone);
             }
        }
    }

    // --- 10. Disable Interactions Post-Submission (Identical) ---
    function disableInteractions() {
        draggables.forEach(draggable => {
            draggable.setAttribute('draggable', 'false');
            draggable.style.cursor = 'default';
            draggable.classList.remove('dragging');
        });

        answerBoxes.forEach(box => {
            box.removeEventListener('dragover', dragOver);
            box.removeEventListener('drop', drop);
            box.removeEventListener('dragleave', dragLeave);
            box.classList.remove('drag-over', 'correct', 'incorrect'); // Clear visual state maybe? Or keep feedback? Keep feedback.
             box.classList.remove('drag-over');
        });
         // Word bank listener removal
         wordBankElement.removeEventListener('dragover', dragOver);
         wordBankElement.removeEventListener('drop', drop);
         wordBankElement.removeEventListener('dragleave', dragLeave);


        if (submitButton) {
            submitButton.disabled = true;
        }
    }

    // --- 11. Initialization ---
    function initializeQuiz() {
        // Set username
        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = username;
        }

        // Generate dynamic content
        generateQuestions();
        generateWordBank();

        // --- IMPORTANT: Get references AFTER elements are generated ---
        draggables = document.querySelectorAll('.draggable');
        answerBoxes = document.querySelectorAll('.answer-box');

        // Attach event listeners to newly created elements
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', dragStart);
            draggable.addEventListener('dragend', dragEnd);
        });

        answerBoxes.forEach(answerBox => {
            answerBox.addEventListener('dragover', dragOver);
            answerBox.addEventListener('dragleave', dragLeave);
            answerBox.addEventListener('drop', drop);
        });

         wordBankElement.addEventListener('dragover', dragOver);
         wordBankElement.addEventListener('dragleave', dragLeave);
         wordBankElement.addEventListener('drop', drop);


        if (submitButton) {
            submitButton.addEventListener('click', checkAnswers);
        }

        // Initial UI updates
        updateScoreDisplay();
        updateProgress();
    }

    // --- 12. Run Initialization ---
    document.addEventListener('DOMContentLoaded', initializeQuiz);

})();