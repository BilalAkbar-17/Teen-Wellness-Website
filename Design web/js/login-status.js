document.addEventListener('DOMContentLoaded', function() {

    if (typeof firebase !== 'undefined' && firebase.auth) {

        firebase.auth().onAuthStateChanged(function(user) {
            updateLoginUI(user);
        });
    } else {
        console.error("Firebase Auth is not available");

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');

        updateLoginUI(isLoggedIn ? { email: userEmail, displayName: userName } : null);
    }

    function updateLoginUI(user) {
        const isLoggedIn = !!user;
        const loginButtons = document.querySelectorAll('.login-btn, .login-status');
        const restrictedElements = document.querySelectorAll('[data-requires-login="true"]');

        loginButtons.forEach(button => {
            if (isLoggedIn) {
                const displayName = user.displayName || user.email;
                button.textContent = `Hi, ${displayName.split(' ')[0]} | Logout`;
                button.href = "#";

                button.addEventListener('click', function(e) {
                    e.preventDefault();

                    if (typeof firebase !== 'undefined' && firebase.auth) {
                        firebase.auth().signOut().then(() => {

                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('userEmail');
                            localStorage.removeItem('userName');
                            window.location.href = 'index.html';
                        }).catch((error) => {

                            console.error("Error signing out:", error);
                        });
                    } else {

                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userName');
                        window.location.href = 'index.html';
                    }
                });
            } else {
                button.textContent = "Login / Sign Up";
                button.href = "login.html";

                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
            }
        });

        restrictedElements.forEach(element => {
            if (isLoggedIn) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });

        const createLinks = document.querySelectorAll('.create-blog-link, .create-story-link');
        createLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (!isLoggedIn) {
                    e.preventDefault();
                    const linkType = link.classList.contains('create-blog-link') ? 'create-blog.html' : 'write-story.html';
                    window.location.href = `login.html?redirect=${linkType}`;
                }
            });
        });
    }
});