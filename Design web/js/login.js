document.addEventListener('DOMContentLoaded', function() {

    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
    const signupTab = document.querySelector('.auth-tab[data-tab="signup"]');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const signupPassword = document.getElementById('signup-password');
    const strengthSegments = document.querySelectorAll('.strength-segment');
    const strengthText = document.querySelector('.strength-text span');
    const loginSubmitBtn = document.querySelector('.login-submit');
    const signupSubmitBtn = document.querySelector('.signup-submit');

    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    if (redirectUrl) {
        const redirectMessage = document.createElement('div');
        redirectMessage.style.cssText = `
            background-color: #e8f4fd;
            color: #0366d6;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 10px;
            text-align: center;
            border-left: 5px solid #0366d6;
        `;
        redirectMessage.innerHTML = `
            <p><strong>Login required:</strong> Please log in to create a ${redirectUrl.includes('blog') ? 'blog post' : 'success story'}</p>
        `;

        if (loginForm) {
            loginForm.insertBefore(redirectMessage, loginForm.firstChild);
        }
    }

    const loginErrorMsg = document.createElement('div');
    loginErrorMsg.className = 'error-message';
    loginErrorMsg.style.color = '#f44336';
    loginErrorMsg.style.marginBottom = '15px';
    loginErrorMsg.style.fontWeight = '500';
    loginErrorMsg.style.display = 'none';

    const signupErrorMsg = document.createElement('div');
    signupErrorMsg.className = 'error-message';
    signupErrorMsg.style.color = '#f44336';
    signupErrorMsg.style.marginBottom = '15px';
    signupErrorMsg.style.fontWeight = '500';
    signupErrorMsg.style.display = 'none';

    if (loginForm) {
        loginForm.insertBefore(loginErrorMsg, loginForm.querySelector('.form-group'));
    }

    if (signupForm) {
        signupForm.insertBefore(signupErrorMsg, signupForm.querySelector('.form-row'));
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000); 
    }

    if (loginTab && signupTab) {
        loginTab.addEventListener('click', function() {
            this.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });

        signupTab.addEventListener('click', function() {
            this.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }

    togglePasswordBtns.forEach(btn => {

        btn.innerHTML = '<i class="fas fa-eye"></i>';

        btn.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    function updatePasswordStrength(password) {

        strengthSegments.forEach(segment => {
            segment.className = 'strength-segment';
        });

        let score = 0;

        if (password.length > 0) score++;
        if (password.length >= 6) score++; 

        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        let segmentsToFill = 0;
        let strengthClass = '';

        if (score === 0) {
            strengthText.textContent = 'None';
            strengthText.className = 'weak';
            segmentsToFill = 0;
            strengthClass = 'weak';
        } else if (score <= 1) {
            strengthText.textContent = 'Weak';
            strengthText.className = 'weak';
            segmentsToFill = 1;
            strengthClass = 'weak';
        } else if (score <= 2) {
            strengthText.textContent = 'Medium';
            strengthText.className = 'medium';
            segmentsToFill = 2;
            strengthClass = 'medium';
        } else if (score <= 3) {
            strengthText.textContent = 'Strong';
            strengthText.className = 'strong';
            segmentsToFill = 3;
            strengthClass = 'strong';
        } else {

            strengthText.textContent = 'Very Strong';
            strengthText.className = 'strong';
            segmentsToFill = 4;
            strengthClass = 'strong';
        }

        for (let i = 0; i < segmentsToFill; i++) {
            if (i < strengthSegments.length) {
                strengthSegments[i].classList.add(strengthClass);
            }
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Login form submitted");

            try {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                console.log("Email:", email);
                console.log("Firebase auth object available:", !!auth);

                if (!email || !password) {
                    showError(loginErrorMsg, 'Please fill in all fields');
                    return;
                }

                loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                loginSubmitBtn.disabled = true;

                if (!auth) {
                    console.error("Firebase auth is not initialized");
                    showError(loginErrorMsg, 'Authentication service unavailable. Please try again later.');
                    loginSubmitBtn.innerHTML = 'Log In';
                    loginSubmitBtn.disabled = false;
                    return;
                }

                console.log("Attempting to sign in with Firebase...");

                let loginTimeout = setTimeout(() => {
                    console.warn("Login timed out after 10 seconds");
                    loginSubmitBtn.innerHTML = 'Log In';
                    loginSubmitBtn.disabled = false;
                    showError(loginErrorMsg, 'Login request timed out. Please check if Firebase Authentication is enabled in your project.');
                }, 10000);

                auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        clearTimeout(loginTimeout);
                        console.log("Sign in successful", userCredential);

                        const user = userCredential.user;

                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userEmail', email);
                        localStorage.setItem('userName', user.displayName || email);

                        if (!db) {
                            console.warn("Firestore not available, skipping user data fetch");
                            if (redirectUrl) {
                                window.location.href = redirectUrl;
                            } else {
                                window.location.href = 'index.html';
                            }
                            return;
                        }

                        console.log("Fetching additional user data from Firestore...");

                        db.collection('users').doc(user.uid).get()
                            .then((doc) => {
                                console.log("Firestore doc retrieved:", doc.exists);
                                if (doc.exists) {
                                    const userData = doc.data();

                                    localStorage.setItem('userName', userData.firstName || user.displayName || email);
                                }

                                if (redirectUrl) {
                                    window.location.href = redirectUrl;
                                } else {
                                    window.location.href = 'index.html';
                                }
                            })
                            .catch((error) => {
                                console.error("Error getting user document:", error);

                                if (redirectUrl) {
                                    window.location.href = redirectUrl;
                                } else {
                                    window.location.href = 'index.html';
                                }
                            });
                    })
                    .catch((error) => {
                        clearTimeout(loginTimeout);
                        console.error("Sign in error:", error.code, error.message);
                        loginSubmitBtn.innerHTML = 'Log In';
                        loginSubmitBtn.disabled = false;

                        const errorCode = error.code;
                        let errorMessage = 'Incorrect email or password. Please try again.';

                        if (errorCode === 'auth/wrong-password') {
                            errorMessage = 'Incorrect password. Please try again.';
                        } else if (errorCode === 'auth/user-not-found') {
                            errorMessage = 'No account found with this email. Please sign up first.';
                        } else if (errorCode === 'auth/invalid-email') {
                            errorMessage = 'Invalid email format. Please check your email.';
                        } else if (errorCode === 'auth/too-many-requests') {
                            errorMessage = 'Too many failed login attempts. Please try again later.';
                        } else if (errorCode === 'auth/configuration-not-found') {
                            errorMessage = 'Authentication service not configured. Please contact support.';
                        }

                        showError(loginErrorMsg, errorMessage);
                    });
            } catch (err) {
                console.error("Unexpected error during login:", err);
                loginSubmitBtn.innerHTML = 'Log In';
                loginSubmitBtn.disabled = false;
                showError(loginErrorMsg, 'An unexpected error occurred. Please try again.');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const birthdate = document.getElementById('birthdate').value;

            if (!firstName || !lastName || !email || !password || !birthdate) {
                showError(signupErrorMsg, 'Please fill in all required fields');
                return;
            }

            const today = new Date();
            const birthDate = new Date(birthdate);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 13) {
                showError(signupErrorMsg, 'You must be at least 13 years old to create an account');
                return;
            }

            if (age > 19) {
                showError(signupErrorMsg, 'This platform is designed for teens (13-19 years old)');
                return;
            }

            const passwordScore = calculatePasswordScore(password);
            if (passwordScore < 2) {
                showError(signupErrorMsg, 'Please choose a stronger password');
                return;
            }

            signupSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            signupSubmitBtn.disabled = true;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {

                    const user = userCredential.user;

                    user.updateProfile({
                        displayName: firstName
                    }).then(() => {
                        console.log("Display name updated");
                    }).catch((error) => {
                        console.error("Error updating display name:", error);
                    });

                    db.collection('users').doc(user.uid).set({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        birthdate: birthdate,
                        age: age,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        console.log("User document created in Firestore");

                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userEmail', email);
                        localStorage.setItem('userName', firstName);

                        if (redirectUrl) {
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = 'index.html';
                        }
                    })
                    .catch((error) => {
                        console.error("Error writing user document to Firestore:", error);

                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('userEmail', email);
                        localStorage.setItem('userName', firstName);

                        if (redirectUrl) {
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = 'index.html';
                        }
                    });
                })
                .catch((error) => {
                    signupSubmitBtn.innerHTML = 'Create Account';
                    signupSubmitBtn.disabled = false;

                    const errorCode = error.code;
                    let errorMessage = 'Failed to create account. Please try again.';

                    if (errorCode === 'auth/email-already-in-use') {
                        errorMessage = 'An account with this email already exists. Please log in instead.';
                    } else if (errorCode === 'auth/invalid-email') {
                        errorMessage = 'Invalid email format. Please check your email.';
                    } else if (errorCode === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please choose a stronger password.';
                    }

                    showError(signupErrorMsg, errorMessage);
                });
        });
    }

    function calculatePasswordScore(password) {
        let score = 0;

        if (password.length > 0) score++;
        if (password.length >= 6) score++;

        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        return score;
    }
}); 

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {

        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        alert('Please enter both username and password');
    }
}