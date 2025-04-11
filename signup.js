document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const signupButton = document.getElementById('signup-button');
    const errorMessage = document.getElementById('error-message');

    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is already logged in, redirect to home page
            window.location.href = 'index.html';
        }
    });

    // Handle signup form submission
    signupButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            errorMessage.textContent = 'Please fill in all fields.';
            return;
        }
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            return;
        }
        
        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters.';
            return;
        }
        
        // Show loading state
        signupButton.textContent = 'Creating Account...';
        signupButton.disabled = true;
        
        // Create user with Firebase
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Signup successful
                console.log('Signup successful:', userCredential.user);
                
                // Update user profile with name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                // Store additional user data in Firestore
                return db.collection('users').doc(auth.currentUser.uid).set({
                    name: name,
                    email: email,
                    createdAt: new Date()
                });
            })
            .then(() => {
                // Redirect to home page
                window.location.href = 'index.html';
            })
            .catch(error => {
                // Handle errors
                console.error('Signup error:', error);
                let errorMsg = 'Signup failed. Please try again.';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMsg = 'This email is already registered.';
                        break;
                    case 'auth/invalid-email':
                        errorMsg = 'Invalid email format.';
                        break;
                    case 'auth/weak-password':
                        errorMsg = 'Password is too weak.';
                        break;
                }
                
                errorMessage.textContent = errorMsg;
                
                // Reset button state
                signupButton.textContent = 'Sign Up';
                signupButton.disabled = false;
            });
    });
});