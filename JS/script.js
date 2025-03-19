(function() {
    function validateForm() {
        // Reset previous error messages
        document.getElementById('usernameError').textContent = '';
        document.getElementById('useremailError').textContent = '';

        // Get form values
        var name = document.getElementById('username').value.trim();
        var email = document.getElementById('useremail').value.trim();

        // Validate name
        if (name === '') {
            document.getElementById('usernameError').textContent = 'Name is required';
            return false;
        }

        // Regular expression to check if the name contains only letters and spaces
        var namePattern = /^[a-zA-Z ]+$/;

        if (!namePattern.test(name)) {
            document.getElementById('usernameError').textContent = 'Name must contain only letters and spaces';
            return false;
        }

        // Validate email
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('useremailError').textContent = 'Invalid email address';
            return false;
        }
        // Set cookies
        setCookie('username', name, 30); // Expires in 30 days
        setCookie('useremail', email, 30); // Expires in 30 days

        // Redirect to quizzes.html
        window.location.href = 'quizzes.html';

        return true; // Form is valid
    }

    function saveDataLocally(name, email) {
        localStorage.setItem('username', name);
        localStorage.setItem('useremail', email);
    }

    // Function to set a cookie
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Get the form element
    const form = document.getElementById('quiz-login');

    // Add event listener for form submission
    form.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Validate the form
        validateForm();
    });
})();