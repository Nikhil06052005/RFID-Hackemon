// Check authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        console.log('User logged in:', user);
        // Update UI to show user is logged in
        showUserSection(user.displayName || user.email);
        // Store user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify({
            uid: user.uid,
            name: user.displayName || user.email,
            email: user.email
        }));
    } else {
        // User is signed out
        console.log('User logged out');
        // Update UI to show user is logged out
        showLoginSection();
        // Remove user data from localStorage
        localStorage.removeItem('userData');
    }
});

// Function to show user section
function showUserSection(userName) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    document.querySelector('.user-name').textContent = userName;
}

// Function to show login section
function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
}

// Handle logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Sign out from Firebase
            auth.signOut().then(() => {
                console.log('User signed out');
                // Redirect to home page
                window.location.href = 'index.html';
            }).catch(error => {
                console.error('Sign out error:', error);
            });
        });
    }
});