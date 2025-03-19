(function() {
    // Function to get a cookie by name
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

    // Get username and email from cookies
    const username = getCookie('username');
    const useremail = getCookie('useremail');

    // Display username and email in the HTML
    document.getElementById('usernameDisplay').textContent = username;
    document.getElementById('useremailDisplay').textContent = useremail;
})();