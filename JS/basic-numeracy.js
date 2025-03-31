(function() {
    // Función para obtener una cookie por nombre
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

    // Obtener el nombre de usuario de las cookies
    const username = getCookie('username');

    // Mostrar el nombre de usuario en el HTML
    document.getElementById('usernameDisplay').textContent = username;

    // Datos del Quiz (preguntas y respuestas)
    const quizData = [
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
        // Agrega más preguntas aquí
    ];

    let currentQuestion = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // Función para mostrar la pregunta actual
    function showQuestion() {
        const questionData = quizData[currentQuestion];
        const questionContainer = document.getElementById('question-container');

        // Limpiar el contenido anterior
        questionContainer.innerHTML = '';

        // Crear el elemento de la pregunta
        const questionElement = document.createElement('h2');
        questionElement.textContent = `Question ${currentQuestion + 1}: ${questionData.question}`;
        questionContainer.appendChild(questionElement);

        // Crear las opciones como botones de radio
        questionData.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.innerHTML = `
                <label>
                    <input type="radio" name="answer" value="${option}">
                    ${option}
                </label>
            `;
            questionContainer.appendChild(optionElement);
        });

        // Crear el botón para enviar la respuesta
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Answer';
        submitButton.addEventListener('click', checkAnswer);
        questionContainer.appendChild(submitButton);
    }

    // Función para verificar la respuesta seleccionada
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

        // Actualizar los marcadores
        updateScore();

        // Actualizar la barra de progreso
        updateProgress();

        // Pasar a la siguiente pregunta o finalizar el quiz
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    // Función para actualizar los marcadores (correctas e incorrectas)
    function updateScore() {
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    }

    // Función para actualizar la barra de progreso
    function updateProgress() {
        const progress = ((currentQuestion + 1) / quizData.length) * 100;
        document.querySelector('.progress-value').style.width = `${progress}%`;
        document.querySelector('.progress-value').textContent = `${progress}% completed`;
    }

    // Función para mostrar los resultados finales
    function showResults() {
        const questionContainer = document.getElementById('question-container');
        const feedbackContainer = document.getElementById('feedback-container');

        questionContainer.innerHTML = `<h2>Quiz Completed!</h2><p>You got ${correctAnswers} correct and ${incorrectAnswers} incorrect.</p>`;
        feedbackContainer.textContent = '';
    }

    // Inicializar el quiz al cargar la página
    window.onload = showQuestion;
})();