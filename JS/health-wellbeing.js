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
        // Get elements inside the function to ensure they exist if called later
        const timeElement = document.getElementById('current-time-quiz');
        const dateElement = document.getElementById('current-date-quiz');

        // Only update if elements exist and are visible
        if (timeElement && timeElement.style.display !== 'none') {
            const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit' , hour12: true };
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }
        if (dateElement && dateElement.style.display !== 'none') {
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
        { id: 5, text: "What is good for heart health??", correctAnswer: "Walking" }
    ];
    const wordBankValues = shuffleArray(quizData.map(q => q.correctAnswer));
    const correctAnswersMap = quizData.reduce((map, question) => {
        map[question.id] = question.correctAnswer;
        return map;
    }, {});

    // --- 4. DOM Element References (Get static ones early) ---
    const username = getCookie('username') || 'Guest';
    const usernameDisplayElement = document.querySelector('.username-display'); // Select by class
    const questionListElement = document.getElementById('question-list');
    const wordBankElement = document.getElementById('word-bank');
    const submitButton = document.getElementById('submit-button');
    const validationMsgElement = document.getElementById('validation-message');
    const resultsContainer = document.getElementById('results-container');
    const quizContentContainer = document.getElementById('quiz-content');
    const progressValueElement = document.querySelector('.progress-value');
    // NOTE: Elements to hide are selected later

    // --- Variables ---
    let draggedItem = null;
    let score = { correct: 0, incorrect: 0 };
    let userAnswers = {};


    // --- 5. Helper Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- 6. Dynamic HTML Generation & Listener Attachment ---
    function generateQuestionsAndAttachListeners() {
        if (!questionListElement) { console.error("#question-list not found."); return; }
        questionListElement.innerHTML = '';

        quizData.forEach(question => {
            const listItem = document.createElement('li');
            listItem.appendChild(document.createTextNode(question.text + ' '));

            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box', 'drop-zone');
            answerBox.dataset.question = question.id;

            // Attach Drop Listeners Directly to Answer Box
            answerBox.addEventListener('dragover', dragOver);
            answerBox.addEventListener('dragleave', dragLeave);
            answerBox.addEventListener('drop', drop);

            listItem.appendChild(answerBox);
            questionListElement.appendChild(listItem);
        });
    }

    function generateWordBankAndAttachListeners() {
        if (!wordBankElement) { console.error("#word-bank not found."); return; }
        wordBankElement.innerHTML = '';

        wordBankValues.forEach(answerValue => {
            const draggableElement = document.createElement('div');
            draggableElement.classList.add('draggable');
            draggableElement.setAttribute('draggable', 'true');
            draggableElement.dataset.answer = answerValue;
            draggableElement.textContent = answerValue;

            // Attach Drag Listeners Directly to Draggable Item
            draggableElement.addEventListener('dragstart', dragStart);
            draggableElement.addEventListener('dragend', dragEnd);

            wordBankElement.appendChild(draggableElement);
        });

        // Add listeners to the word bank container for dropping back
        wordBankElement.addEventListener('dragover', dragOver);
        wordBankElement.addEventListener('dragleave', dragLeave);
        wordBankElement.addEventListener('drop', drop);
    }

    // --- 7. Drag and Drop Event Handlers ---
    function dragStart(event) {
        draggedItem = event.target; // The element being dragged
        if (draggedItem && typeof draggedItem.classList !== 'undefined') {
            draggedItem.classList.add('dragging');
        }
        event.dataTransfer.setData('text/plain', event.target.dataset.answer);
        event.dataTransfer.effectAllowed = "move"; // Indicate it's a move operation
    }

    function dragEnd(event) {
        // Use optional chaining in case draggedItem is unexpectedly null
        draggedItem?.classList?.remove('dragging');
        // Resetting draggedItem reference happens in drop or if drag is cancelled implicitly
    }

    function dragOver(event) {
        event.preventDefault(); // Necessary to allow dropping
        const target = event.target;
        // Allow drop on word bank OR an empty answer box
        if (target.id === 'word-bank' || target.closest('#word-bank') || (target.classList.contains('answer-box') && target.children.length === 0)) {
             if (!target.classList.contains('drag-over')) {
                 target.classList.add('drag-over');
             }
             event.dataTransfer.dropEffect = "move"; // Indicate valid drop target
        } else {
             event.dataTransfer.dropEffect = "none"; // Indicate invalid drop target
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
        const dropTarget = event.target;
        dropTarget.classList.remove('drag-over');

        if (!draggedItem) return; // Exit if nothing valid is being dragged

        // Case 1: Dropping onto an empty answer box
        if (dropTarget.classList.contains('answer-box') && dropTarget.children.length === 0) {
            // Optional: If item came from another box, remove it from there first
            if (draggedItem.parentElement.classList.contains('answer-box')) {
                 // No need to appendChild back to word bank, just remove from old box
                 draggedItem.parentElement.removeChild(draggedItem);
            }
            dropTarget.appendChild(draggedItem); // Place item
            updateProgress();
        }
        // Case 2: Dropping back onto the word bank container
        else if (wordBankElement && (dropTarget.id === 'word-bank' || dropTarget.closest('#word-bank'))) {
            // Only move back if it came from an answer box
            if (draggedItem.parentElement.classList.contains('answer-box')) {
                 // We only need to append, the browser handles removal from original parent
                 wordBankElement.appendChild(draggedItem);
                 updateProgress();
            }
        }
        // If dropped elsewhere or on a full box, it should implicitly return or do nothing.

        draggedItem = null; // Reset after handling drop
    }


    // --- 8. Check Answers and Validation ---
    function checkAnswers() {
        if (validationMsgElement) validationMsgElement.textContent = '';
        userAnswers = {}; // Reset user answers

        let filledBoxes = 0;
        const currentAnswerBoxes = document.querySelectorAll('#question-list .answer-box'); // Query fresh list
        currentAnswerBoxes.forEach(box => {
            if (box.children.length > 0) { filledBoxes++; }
        });

        const totalBoxes = quizData.length;
        if (filledBoxes < totalBoxes) {
            if (validationMsgElement) { validationMsgElement.textContent = `Please drag an answer to all ${totalBoxes} boxes.`; }
            else { alert(`Please complete all ${totalBoxes} answers.`); }
            return;
        }

        score.correct = 0;
        score.incorrect = 0;

        currentAnswerBoxes.forEach(answerBox => {
            const questionNumber = answerBox.dataset.question;
            const droppedElement = answerBox.children[0];
            const droppedAnswer = droppedElement ? droppedElement.dataset.answer : null;
            userAnswers[questionNumber] = droppedAnswer || "No Answer";

            answerBox.classList.remove('correct', 'incorrect'); // Clear visual state before re-evaluating

            if (droppedAnswer && correctAnswersMap[questionNumber] === droppedAnswer) {
                score.correct++;
                // answerBox.classList.add('correct'); // Don't visually mark during check, only in results review
            } else {
                score.incorrect++;
                // answerBox.classList.add('incorrect'); // Don't visually mark
            }
        });

        updateProgress(true); // Set progress to 100%
        disableInteractions(currentAnswerBoxes); // Disable UI
        showResults(); // Show results screen
    }

    // --- 9. Update UI Elements ---
    function updateProgress(final = false) {
        let progress = 0;
        const totalBoxes = quizData.length;
        const progressContainer = document.querySelector('.top-section .progress-container'); // Select container

        if (final) {
            progress = 100;
        } else {
            let filledBoxes = 0;
            const currentAnswerBoxes = document.querySelectorAll('#question-list .answer-box'); // Query current boxes
            currentAnswerBoxes.forEach(box => {
                if (box.children.length > 0) { filledBoxes++; }
            });
            progress = totalBoxes > 0 ? (filledBoxes / totalBoxes) * 100 : 0;
        }

        // Only update if progress elements exist and container is not hidden
        if (progressContainer && progressContainer.style.display !== 'none' && progressValueElement) {
            progressValueElement.style.width = `${progress}%`;
            progressValueElement.textContent = `${Math.round(progress)}% completed`;
        } else if (progressValueElement && final) {
            // Ensure final state is set even if hidden
             progressValueElement.style.width = `100%`;
             progressValueElement.textContent = `100% completed`;
        }
        else if (!progressContainer || !progressValueElement) {
             if (!final) { console.warn("Progress bar elements not found."); }
        }
    }

    // --- 10. Show Final Results (Hides header elements) ---
     function showResults() {
        // 1. Hide Quiz Content Area
        if (quizContentContainer) {
            quizContentContainer.style.display = 'none';
        }

        // --- Get references and Hide Date/Time and Progress ---
        const dateTimeHeader = document.querySelector('.top-section .date-time-header');
        const progressContainer = document.querySelector('.top-section .progress-container');
        const topSection = document.querySelector('.top-section');
        // const scoreContainer = document.querySelector('.top-section .score-container'); // Keep score visible

        if (dateTimeHeader) dateTimeHeader.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'none';
        // --- End Hide ---

        // --- Optional: Adjust top section spacing ---
        if (topSection) {
             topSection.style.marginBottom = '0.5rem'; // Example adjustment
             topSection.style.paddingBottom = '0.2rem';
        }
        // if(scoreContainer) { scoreContainer.style.marginTop = '0.2rem'; }
        // --- End Optional Adjustments ---

        // 2. Determine Pass/Fail Message
        let message = "";
        let messageClass = "";
        const passingScore = 3;
        const totalQuestions = quizData.length;

        if (score.correct >= passingScore) {
            message = `<span class="result-highlight-word pass-highlight">Congratulations!</span><br><span class="result-secondary-text pass-secondary">You passed the quiz!</span>`;
            messageClass = 'pass-message';
        } else {
            message = `<span class="result-highlight-word fail-highlight">Sorry,</span><br><span class="result-secondary-text fail-secondary">You didn't pass the quiz this time.</span>`;
            messageClass = 'fail-message';
        }

        // 3. Build Results HTML
        let resultsHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your Final Score: ${score.correct} Correct, ${score.incorrect} Incorrect out of ${totalQuestions}.</p>
            <p class="${messageClass}">${message}</p>
            
            <h3>Review Your Answers:</h3>
            <div id="review-section">
                <ul>`;

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
                  
                </li>
            `;
        });

        resultsHTML += `
                </ul>
            </div>
            <div class="results-button">
                <button onclick="window.location.href='quizzes.html'">Back to Quizzes</button>
                 <button onclick="window.location.reload()">Try Again</button>
            </div>
        `;

        // 4. Display Results
        if (resultsContainer) {
            resultsContainer.innerHTML = resultsHTML;
            resultsContainer.style.display = 'block';
        } else {
            console.error("Element #results-container not found.");
        }
    }

    // --- 11. Disable Interactions Post-Submission ---
    function disableInteractions(currentAnswerBoxes) { // Pass current boxes
        const currentDraggables = document.querySelectorAll('.draggable');
        currentDraggables.forEach(draggable => {
            draggable.setAttribute('draggable', 'false');
            draggable.style.cursor = 'default';
            draggable.classList.remove('dragging');
        });

        // Disable drop zones that were passed in
        currentAnswerBoxes.forEach(box => {
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
            submitButton.textContent = "Submitted";
             submitButton.style.cursor = 'not-allowed';
             submitButton.style.opacity = '0.7';
        }
    }


    // --- 12. Initialization ---
    function initializeQuiz() {
        // 1. Ensure header elements are visible
        const dtHeader = document.querySelector('.top-section .date-time-header');
        const progContainer = document.querySelector('.top-section .progress-container');
        const scoreCont = document.querySelector('.top-section .score-container');
        if(dtHeader) dtHeader.style.display = 'flex';
        if(progContainer) progContainer.style.display = ''; // Reset display
        if(scoreCont) scoreCont.style.display = ''; // Reset display

        // 2. Display Username
        if (usernameDisplayElement) {
            usernameDisplayElement.textContent = username;
        } else {
            console.warn("Element with class 'username-display' not found.");
        }

        // 3. Generate questions and word bank, attaching listeners
        generateQuestionsAndAttachListeners();
        generateWordBankAndAttachListeners();

        // 4. Submit Button Listener
        if (submitButton) {
            submitButton.addEventListener('click', checkAnswers);
            // Reset button state on init/reload
            submitButton.disabled = false;
            submitButton.textContent = "SUBMIT";
            submitButton.style.cursor = 'pointer';
            submitButton.style.opacity = '1';
        } else {
             console.error("Element #submit-button not found.");
        }

        // 5. Initial Progress Update
        updateProgress();
    }

    // --- 13. Event Listeners ---
    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime(); // Initial date/time display
        setInterval(updateQuizDateTime, 1000); // Start timer
        initializeQuiz(); // Setup the quiz elements and listeners
    });

})(); // End of self-invoking function