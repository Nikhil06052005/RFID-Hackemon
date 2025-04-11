document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is already logged in, redirect to home page
            window.location.href = 'index.html';
        }
    });

    // Handle login form submission
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            return;
        }
        
        // Show loading state
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;
        
        // Sign in with Firebase
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Login successful
                console.log('Login successful:', userCredential.user);
                // Redirect to home page
                window.location.href = 'index.html';
            })
            .catch(error => {
                // Handle errors
                console.error('Login error:', error);
                let errorMsg = 'Login failed. Please check your credentials.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMsg = 'No account found with this email.';
                        break;
                    case 'auth/wrong-password':
                        errorMsg = 'Incorrect password.';
                        break;
                    case 'auth/invalid-email':
                        errorMsg = 'Invalid email format.';
                        break;
                    case 'auth/too-many-requests':
                        errorMsg = 'Too many failed login attempts. Please try again later.';
                        break;
                }
                
                errorMessage.textContent = errorMsg;
                
                // Reset button state
                loginButton.textContent = 'Login';
                loginButton.disabled = false;
            });
    });
});