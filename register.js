// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClON9wltSBZq3nPq5rGMmd092JTmzohx0",
    authDomain: "lostfoundsystem-36252.firebaseapp.com",
    databaseURL: "https://lostfoundsystem-36252-default-rtdb.firebaseio.com",
    projectId: "lostfoundsystem-36252",
    storageBucket: "lostfoundsystem-36252.appspot.com",
    messagingSenderId: "584490644588",
    appId: "1:584490644588:web:ff76482a71cc0fc30b1449",
    measurementId: "G-5KG6312FVW"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const rtdb = firebase.database();

// DOM Elements
const registerForm = document.getElementById('register-form');
const scanBtn = document.getElementById('scan-btn');
const submitBtn = document.getElementById('submit-btn');
const scanningModal = document.getElementById('scanning-modal');
const successModal = document.getElementById('success-modal');
const cancelScanBtn = document.getElementById('cancel-scan-btn');
const registerAnotherBtn = document.getElementById('register-another-btn');
const viewDetailsBtn = document.getElementById('view-details-btn');
const refreshBtn = document.getElementById('refresh-btn');
const registrationList = document.getElementById('registration-list');

// Global variables
let currentTagId = null;
let currentTagUid = null;
let isScanning = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load recent registrations
    loadRecentRegistrations();
    
    // Set up event listeners
    if (scanBtn) {
        scanBtn.addEventListener('click', startScanning);
    }
    
    if (cancelScanBtn) {
        cancelScanBtn.addEventListener('click', cancelScanning);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (registerAnotherBtn) {
        registerAnotherBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
            resetForm();
        });
    }
    
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
            // Redirect to admin page with the tag ID
            window.location.href = `admin.html?tag=${currentTagId}`;
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadRecentRegistrations);
    }
    
    // Set up RFID tag detection listener
    setupRFIDListener();
});

// Load recent registrations
function loadRecentRegistrations() {
    registrationList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Loading recent registrations...
        </div>
    `;
    
    db.collection('RFID_Tags')
        .orderBy('timestamp', 'desc')
        .limit(6)
        .get()
        .then(snapshot => {
            registrationList.innerHTML = '';
            
            if (snapshot.empty) {
                registrationList.innerHTML = `
                    <div class="no-items">No registrations found.</div>
                `;
                return;
            }
            
            snapshot.forEach(doc => {
                const item = doc.data();
                const card = document.createElement('div');
                card.className = 'registration-card';
                
                // Format timestamp
                let timestamp = 'Recently';
                if (item.timestamp) {
                    const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
                    timestamp = date.toLocaleString();
                }
                
                card.innerHTML = `
                    <div class="tag-id">Tag ID: ${doc.id}</div>
                    <div class="item-name">${item.lostItem || 'Unnamed Item'}</div>
                    <div class="owner-name">Owner: ${item.ownerName || 'Unknown'}</div>
                    <div class="timestamp">${timestamp}</div>
                `;
                
                registrationList.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading recent registrations:', error);
            registrationList.innerHTML = `
                <div class="error-message">Error loading registrations. Please try again later.</div>
            `;
        });
}

// Start scanning for RFID tags
function startScanning() {
    isScanning = true;
    scanningModal.style.display = 'block';
    document.getElementById('modal-scan-status').textContent = 'Waiting for tag...';
    
    // Create a reference in RTDB to trigger ESP32 to start scanning
    rtdb.ref('rfid_command').set({
        command: 'scan',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log('Scan command sent to ESP32');
    })
    .catch(error => {
        console.error('Error sending scan command:', error);
        document.getElementById('modal-scan-status').textContent = 'Error starting scan';
        showNotification('Error starting scan. Please try again.', 'error');
    });
}

// Cancel scanning
function cancelScanning() {
    isScanning = false;
    scanningModal.style.display = 'none';
    
    // Send cancel command to ESP32
    rtdb.ref('rfid_command').set({
        command: 'cancel',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log('Cancel command sent to ESP32');
    })
    .catch(error => {
        console.error('Error sending cancel command:', error);
    });
}

// Set up RFID tag detection listener
function setupRFIDListener() {
    const rfidRef = rtdb.ref('rfid_tags');
    
    // Listen for new RFID tags
    rfidRef.on('child_added', snapshot => {
        if (!isScanning) return; // Only process if we're actively scanning
        
        const rfidData = snapshot.val();
        console.log('New RFID tag detected:', rfidData);
        
        // Update UI with tag info
        currentTagId = rfidData.tag_id || snapshot.key;
        currentTagUid = rfidData.uid || '';
        
        document.getElementById('tag-id').textContent = currentTagId;
        document.getElementById('tag-uid').textContent = currentTagUid;
        document.getElementById('scanner-status').textContent = 'Tag detected';
        document.getElementById('modal-scan-status').textContent = 'Tag detected successfully!';
        
        // Enable submit button
        submitBtn.disabled = false;
        
        // Close scanning modal
        setTimeout(() => {
            scanningModal.style.display = 'none';
            isScanning = false;
            showNotification('RFID tag detected successfully!', 'success');
        }, 1500);
        
        // Remove the detected tag from RTDB to avoid duplicate processing
        snapshot.ref.remove();
    });
    
    // Listen for scan errors
    rtdb.ref('rfid_error').on('value', snapshot => {
        if (!isScanning) return;
        
        const errorData = snapshot.val();
        if (errorData) {
            console.error('RFID scan error:', errorData);
            document.getElementById('modal-scan-status').textContent = 'Error: ' + errorData.message;
            showNotification('Error scanning RFID tag: ' + errorData.message, 'error');
            
            // Clear the error
            snapshot.ref.remove();
        }
    });
}


// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!currentTagId) {
        showNotification('Please scan an RFID tag first', 'warning');
        return;
    }
    
    const itemName = document.getElementById('item-name').value;
    const ownerName = document.getElementById('owner-name').value;
    const ownerEmail = document.getElementById('owner-email').value;
    const ownerPhone = document.getElementById('owner-phone').value;
    const itemDescription = document.getElementById('item-description').value;
    const itemStatus = document.getElementById('item-status').value;
    
    // Create item data
    const itemData = {
        UID: currentTagUid,
        lostItem: itemName,
        ownerName: ownerName,
        ownerEmail: ownerEmail,
        ownerContact: ownerPhone,
        description: itemDescription,
        status: itemStatus,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    db.collection('RFID_Tags').doc(currentTagId).set(itemData)
        .then(() => {
            console.log('Tag registered successfully');
            
            // Update success modal
            document.getElementById('success-tag-id').textContent = currentTagId;
            document.getElementById('success-item-name').textContent = itemName;
            document.getElementById('success-owner-name').textContent = ownerName;
            
            // Show success modal
            successModal.style.display = 'block';
            
            // Reload recent registrations
            loadRecentRegistrations();
        })
        .catch(error => {
            console.error('Error registering tag:', error);
            showNotification('Error registering tag: ' + error.message, 'error');
        });
}

// Reset form
function resetForm() {
    registerForm.reset();
    currentTagId = null;
    currentTagUid = null;
    document.getElementById('tag-id').textContent = 'Not scanned yet';
    document.getElementById('tag-uid').textContent = 'Not available';
    document.getElementById('scanner-status').textContent = 'Ready to scan';
    submitBtn.disabled = true;
}

// Show notification
function showNotification(message, type = 'success') {
    // Check if notification element exists, create if not
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = 'notification ' + type;
    
    // Add show class to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove element after animation completes
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Simulate RFID scanning for development/testing
function simulateRFIDScan() {
    // Only use this function for development/testing
    const randomTagId = 'RFID_' + Math.floor(Math.random() * 1000000);
    const randomUid = 'UID_' + Math.floor(Math.random() * 1000000);
    
    // Update UI with simulated tag info
    currentTagId = randomTagId;
    currentTagUid = randomUid;
    
    document.getElementById('tag-id').textContent = currentTagId;
    document.getElementById('tag-uid').textContent = currentTagUid;
    document.getElementById('scanner-status').textContent = 'Tag detected (simulated)';
    
    // Enable submit button
    submitBtn.disabled = false;
    
    // Show notification
    showNotification('RFID tag detected (simulated)', 'success');
    
    return { tag_id: randomTagId, uid: randomUid };
}

// For development/testing: Add a hidden button to simulate RFID scanning
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    const devTools = document.createElement('div');
    devTools.className = 'dev-tools';
    devTools.innerHTML = `
        <button id="simulate-scan-btn" title="Simulate RFID Scan (Development Only)">
            <i class="fas fa-bug"></i> Simulate Scan
        </button>
    `;
    document.body.appendChild(devTools);
    
    document.getElementById('simulate-scan-btn').addEventListener('click', simulateRFIDScan);
    
    // Add styles for dev tools
    const style = document.createElement('style');
    style.textContent = `
        .dev-tools {
            position: fixed;
            bottom: 10px;
            left: 10px;
            z-index: 1000;
        }
        
        .dev-tools button {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .dev-tools button:hover {
            background-color: #f5c6cb;
        }
    `;
    document.head.appendChild(style);
}

// Connect to Flask backend for RFID scanning (if applicable)
function connectToFlaskBackend() {
    // This function would be used if you're using the Flask backend for RFID scanning
    // It would make fetch requests to your Flask API endpoints
    
    // Example:
    // fetch('/api/start-scan')
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Scan started:', data);
    //     })
    //     .catch(error => {
    //         console.error('Error starting scan:', error);
    //     });
}

// You can add this function to your scan button if using Flask
function startScanningWithFlask() {
    isScanning = true;
    scanningModal.style.display = 'block';
    document.getElementById('modal-scan-status').textContent = 'Waiting for tag...';
    
    // Make a request to your Flask backend to start scanning
    fetch('/api/start-scan', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Scan started successfully');
            
            // Poll for results
            pollForScanResults();
        } else {
            document.getElementById('modal-scan-status').textContent = 'Error: ' + data.message;
            showNotification('Error starting scan: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error starting scan:', error);
        document.getElementById('modal-scan-status').textContent = 'Error connecting to server';
        showNotification('Error connecting to server', 'error');
    });
}

// Poll for scan results from Flask backend
function pollForScanResults() {
    if (!isScanning) return;
    
    fetch('/api/scan-status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'complete') {
                // Tag detected
                currentTagId = data.tag_id;
                currentTagUid = data.uid || '';
                
                document.getElementById('tag-id').textContent = currentTagId;
                document.getElementById('tag-uid').textContent = currentTagUid;
                document.getElementById('scanner-status').textContent = 'Tag detected';
                document.getElementById('modal-scan-status').textContent = 'Tag detected successfully!';
                
                // Enable submit button
                submitBtn.disabled = false;
                
                // Close scanning modal
                setTimeout(() => {
                    scanningModal.style.display = 'none';
                    isScanning = false;
                    showNotification('RFID tag detected successfully!', 'success');
                }, 1500);
            } else if (data.status === 'error') {
                // Error occurred
                document.getElementById('modal-scan-status').textContent = 'Error: ' + data.message;
                showNotification('Error scanning RFID tag: ' + data.message, 'error');
                isScanning = false;
            } else {
                // Still scanning, poll again after a delay
                setTimeout(pollForScanResults, 1000);
            }
        })
        .catch(error => {
            console.error('Error checking scan status:', error);
            document.getElementById('modal-scan-status').textContent = 'Error connecting to server';
            showNotification('Error connecting to server', 'error');
            isScanning = false;
        });
}