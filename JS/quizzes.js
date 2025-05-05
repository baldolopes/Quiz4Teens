(function() {
    // --- Cookie Function (Keep as is) ---
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.startsWith(cookieName)) {
                // Decode the cookie value in case it was encoded
                return decodeURIComponent(cookie.substring(cookieName.length));
            }
        }
        return "";
    }

    // --- Get and Display Username (Keep as is) ---
    const username = getCookie('username');
    const usernameDisplayElement = document.getElementById('usernameDisplay');
    if (usernameDisplayElement) {
        // Display username or 'Friend' if empty
        usernameDisplayElement.textContent = username || 'Friend';
    } else {
        console.warn("Element with ID 'usernameDisplay' not found.");
    }


    // --- START: Date and Time Functionality for Quizzes Page ---
    function updateQuizDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time-quiz');
        const dateElement = document.getElementById('current-date-quiz');

        // Update Time
        if (timeElement) {
            const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions); // Adjust locale/options as needed
        }

        // Update Date
        if (dateElement) {
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-GB', dateOptions); // Example: 14 February 2025
        }
    }

    // --- END: Date and Time Functionality ---


    // --- START: Event Listeners ---

    // Update date/time when the page loads and then every minute (no need for seconds here)
    document.addEventListener('DOMContentLoaded', function() {
        updateQuizDateTime(); // Initial call
        // No need to update every second unless you show seconds
        setInterval(updateQuizDateTime, 1000); // Update every 60 seconds (1 minute)
    });

    // --- END: Event Listeners ---

})(); // End of IIFE