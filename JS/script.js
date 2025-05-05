// Existing IIFE - Keep your form validation code inside
(function() {

    // --- START: Date and Time Functionality ---

    // Function to update the date and time display
    function updateDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');

        // Check if elements exist before trying to update them
        if (timeElement) {
            // Format time (e.g., 10:30:45 PM) - adjust options as needed
            const timeOptions = {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true // Use true for AM/PM, false for 24-hour
            };
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }

        if (dateElement) {
            // Format date (e.g.,  24 July 2025)
            const dateOptions = {
                
                year: 'numeric', // e.g., 2024
                month: 'long', // e.g., July
                day: 'numeric' // e.g., 24
            };
            dateElement.textContent = now.toLocaleDateString('en-UK', dateOptions);
        }
    }

    // --- END: Date and Time Functionality ---


    // --- START: Form Validation and Cookie Logic (Your existing code) ---

    function validateForm() {
        // Reset previous error messages
        const usernameError = document.getElementById('usernameError');
        const useremailError = document.getElementById('useremailError');
        if (usernameError) usernameError.textContent = '';
        if (useremailError) useremailError.textContent = '';


        // Get form values
        const nameInput = document.getElementById('username');
        const emailInput = document.getElementById('useremail');
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';

        let isValid = true; // Flag to track validation status

        // Validate name
        if (name === '') {
             if (usernameError) usernameError.textContent = 'Name is required';
             isValid = false;
        } else {
            // Regular expression to check if the name contains only letters and spaces
            const namePattern = /^[a-zA-ZÀ-ÿ\s']+$/; // Allow letters, spaces, accents, apostrophes
             if (!namePattern.test(name)) {
                 if (usernameError) usernameError.textContent = 'Name must contain only letters, spaces, and apostrophes';
                 isValid = false;
             }
        }


        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
             if (useremailError) useremailError.textContent = 'Email is required';
             isValid = false;
        } else if (!emailRegex.test(email)) {
             if (useremailError) useremailError.textContent = 'Invalid email address';
             isValid = false;
        }

        // If form is not valid, stop here
        if (!isValid) {
            return false;
        }

        // If valid, set cookies and redirect
        setCookie('username', name, 30); // Expires in 30 days
        setCookie('useremail', email, 30); // Expires in 30 days

        // Redirect to quizzes.html
        window.location.href = 'quizzes.html';

        // Prevent default shouldn't be needed here if called from event listener correctly
        // The function should ideally just return true/false or handle redirection
        return true; // Indicate success (though redirection happens before this)
    }

    // Function to set a cookie (Your existing function - slight improvement)
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        // Encode value to handle special characters
        document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/; SameSite=Lax"; // Added SameSite
    }

    // Get the form element
    const form = document.getElementById('quiz-login');

    // --- END: Form Validation and Cookie Logic ---


    // --- START: Event Listeners ---

    // Add event listener for form submission
    if (form) {
        form.addEventListener('submit', function(event) {
            // Prevent the default form submission *before* validation
            event.preventDefault();
            // Validate the form - redirection happens inside if valid
            validateForm();
        });
    }

    // Add event listener to run date/time update when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initial call to display date/time immediately on load
        updateDateTime();
        // Set an interval to update the time every second (1000 milliseconds)
        setInterval(updateDateTime, 1000);
    });

    // --- END: Event Listeners ---

})(); // End of IIFE