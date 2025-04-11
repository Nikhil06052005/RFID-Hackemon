// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    const currentPage = window.location.pathname.split('/').pop();
    
    // Initialize appropriate functionality based on page
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'found.html') {
        initDashboard();
    } else if (currentPage === 'login.html') {
        initLogin();
    } else if (currentPage === 'signup.html') {
        initSignup();
    }
    
    // Initialize map if it exists on the page
    if (document.getElementById('map')) {
        initMap();
    }
});

// Dashboard Functionality
function initDashboard() {
    // Search functionality
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    // Search button
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const categoryFilter = document.getElementById('category-filter').value;
            const locationFilter = document.getElementById('location-filter').value;
            const dateFilter = document.getElementById('date-filter').value;
            const statusFilter = document.getElementById('status-filter').value;
            
            performFilteredSearch(categoryFilter, locationFilter, dateFilter, statusFilter);
        });
    }
    
    // Action buttons
    const claimBtn = document.querySelector('.claim-btn');
    if (claimBtn) {
        claimBtn.addEventListener('click', function() {
            showModal('Claim Item', 'Please provide your identification details to claim this item.');
        });
    }
    
    const reportBtn = document.querySelector('.report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            showModal('Report Issue', 'Please describe the issue you are experiencing with this item.');
        });
    }
    
    const historyBtn = document.querySelector('.history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            showItemHistory();
        });
    }
}

// Login Page Functionality
function initLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Validate inputs
            if (!email || !password) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Simulate login API call
            simulateApiCall({email, password, remember})
                .then(response => {
                    showNotification('Login successful! Redirecting...', 'success');
                    // Store user session
                    localStorage.setItem('user', JSON.stringify({email, isLoggedIn: true}));
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(error => {
                    showNotification('Login failed: ' + error, 'error');
                });
        });
    }
}

// Signup Page Functionality
function initSignup() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Validate inputs
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('You must agree to the Terms of Service', 'error');
                return;
            }
            
            // Simulate signup API call
            simulateApiCall({firstName, lastName, email, phone, password})
                .then(response => {
                    showNotification('Account created successfully! Redirecting to login...', 'success');
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                })
                .catch(error => {
                    showNotification('Signup failed: ' + error, 'error');
                });
        });
    }
}

// Map Initialization
function initMap() {
    // This would typically use a mapping API like Google Maps or Leaflet
    // For this example, we'll just create a placeholder
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: #e9ecef;">
                <div style="text-align: center;">
                    <i class="fas fa-map-marker-alt" style="font-size: 40px; color: #e74c3c; margin-bottom: 10px;"></i>
                    <p>Terminal 2, Gate 15, Airport</p>
                    <p style="font-size: 12px; color: #6c757d;">Map data would load here in a production environment</p>
                </div>
            </div>
        `;
    }
}

// Helper Functions
function performSearch(query) {
    console.log('Searching for:', query);
    // In a real application, this would make an API call to search the database
    showNotification('Search functionality would be implemented in a production environment', 'info');
}

function performFilteredSearch(category, location, date, status) {
    console.log('Filtered search:', {category, location, date, status});
    // In a real application, this would make an API call with the filters
    showNotification('Filter functionality would be implemented in a production environment', 'info');
}

function showItemHistory() {
    // This would typically fetch and display the item's history
    showModal('Item History', `
        <div class="history-timeline">
            <div class="history-item">
                <div class="history-date">March 28, 2025, 2:45 PM</div>
                <div class="history-event">Item found at Terminal 2, Gate 15</div>
            </div>
            <div class="history-item">
                <div class="history-date">March 28, 2025, 3:30 PM</div>
                <div class="history-event">Item transported to Lost & Found Office</div>
            </div>
            <div class="history-item">
                <div class="history-date">March 29, 2025, 9:15 AM</div>
                <div class="history-event">Item registered in system</div>
            </div>
            <div class="history-item">
                <div class="history-date">March 29, 2025, 10:30 AM</div>
                <div class="history-event">Owner notification sent</div>
            </div>
        </div>
    `);
}

function showModal(title, content) {
    // Create modal element if it doesn't exist
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3></h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Update modal content
    modal.querySelector('.modal-header h3').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;
    
    // Display modal
    modal.style.display = 'flex';
}

function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification type class
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`);
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Simulate API call (for demo purposes)
function simulateApiCall(data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() < 0.9) {
                resolve({success: true, data});
            } else {
                reject('Server error. Please try again.');
            }
        }, 1000);
    });
}

// Add these styles for modal and notification
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            animation: modalFadeIn 0.3s;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #2c3e50;
        }
        
        .close-modal {
            font-size: 24px;
            cursor: pointer;
            color: #6c757d;
        }
        
        .close-modal:hover {
            color: #343a40;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        /* Notification Styles */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            display: none;
            animation: notificationFadeIn 0.3s;
        }
        
        @keyframes notificationFadeIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        .notification-success {
            background-color: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
        
        .notification-error {
            background-color: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }
        
        .notification-info {
            background-color: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }
        
        /* History Timeline Styles */
        .history-timeline {
            position: relative;
            padding: 20px 0;
        }
        
        .history-timeline::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 15px;
            width: 2px;
            background-color: #e9ecef;
        }
        
        .history-item {
            position: relative;
            padding-left: 40px;
            margin-bottom: 20px;
        }
        
        .history-item::before {
            content: '';
            position: absolute;
            left: 7px;
            top: 5px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #f5b942;
            border: 2px solid white;
            z-index: 1;
        }
        
        .history-date {
            font-weight: 600;
            margin-bottom: 5px;
            color: #2c3e50;
        }
        
        .history-event {
            color: #6c757d;
        }
    `;
    document.head.appendChild(style);
});

// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

// Function to check login status
function checkLoginStatus() {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        // User is logged in
        const user = JSON.parse(userData);
        showUserSection(user.name);
    } else {
        // User is not logged in
        showLoginSection();
    }
}

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
            // Clear user data from localStorage
            localStorage.removeItem('userData');
            // Show login section
            showLoginSection();
            // Redirect to home page if needed
            // window.location.href = 'index.html';
        });
    }
});