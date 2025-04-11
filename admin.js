document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Load items
    loadItems();
    
    // Initialize the admin dashboard
    init();
});

// Load items from Firestore
function loadItems() {
    const itemsList = document.getElementById('items-list');
    const statusFilter = document.getElementById('status-filter').value;
    
    itemsList.innerHTML = `
        <tr>
            <td colspan="8">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading items...</p>
                </div>
            </td>
        </tr>
    `;
    
    // Create a query based on the status filter
    let query = db.collection('RFID_Tags');
    
    if (statusFilter !== 'All') {
        query = query.where('status', '==', statusFilter);
    }
    
    // Get items from Firestore
    query.get()
        .then(snapshot => {
            itemsList.innerHTML = '';
            
            if (snapshot.empty) {
                itemsList.innerHTML = `
                    <tr>
                        <td colspan="8" class="no-items">No items found.</td>
                    </tr>
                `;
                return;
            }
            
            snapshot.forEach(doc => {
                const item = doc.data();
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${doc.id}</td>
                    <td>${item.UID || ''}</td>
                    <td>${item.lostItem || ''}</td>
                    <td>${item.ownerName || ''}</td>
                    <td>${item.ownerContact || ''}</td>
                    <td>${item.ownerEmail || ''}</td>
                    <td>
                        <span class="status-badge ${item.status?.toLowerCase() || ''}">${item.status || ''}</span>
                    </td>
                    <td>
                        <button class="action-btn view-btn" data-id="${doc.id}"><i class="fas fa-eye"></i> View</button>
                        <button class="action-btn edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn delete-btn" data-id="${doc.id}"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
                
                itemsList.appendChild(row);
                
                // Add event listeners to buttons
                const viewBtn = row.querySelector('.view-btn');
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                viewBtn.addEventListener('click', () => viewItem(doc.id));
                editBtn.addEventListener('click', () => editItem(doc.id));
                                deleteBtn.addEventListener('click', () => deleteItem(doc.id));
            });
        })
        .catch(error => {
            console.error('Error loading items:', error);
            itemsList.innerHTML = `
                <tr>
                    <td colspan="8" class="error-message">Error loading items. Please try again later.</td>
                </tr>
            `;
        });
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    statusFilter.addEventListener('change', loadItems);
    
    // Search functionality
    const searchInput = document.getElementById('admin-search');
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            loadItems(); // If search is cleared, reload all items
            return;
        }
        
        // Search in Firestore
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Searching items...</p>
                    </div>
                </td>
            </tr>
        `;
        
        // Get all items and filter client-side (for simplicity)
        db.collection('RFID_Tags').get()
            .then(snapshot => {
                itemsList.innerHTML = '';
                
                if (snapshot.empty) {
                    itemsList.innerHTML = `
                        <tr>
                            <td colspan="8" class="no-items">No items found.</td>
                        </tr>
                    `;
                    return;
                }
                
                let matchFound = false;
                
                snapshot.forEach(doc => {
                    const item = doc.data();
                    
                    // Check if item matches search term
                    const matchesSearch = 
                        (doc.id && doc.id.toLowerCase().includes(searchTerm)) ||
                        (item.UID && item.UID.toLowerCase().includes(searchTerm)) ||
                        (item.lostItem && item.lostItem.toLowerCase().includes(searchTerm)) ||
                        (item.ownerName && item.ownerName.toLowerCase().includes(searchTerm)) ||
                        (item.ownerContact && item.ownerContact.toLowerCase().includes(searchTerm)) ||
                        (item.ownerEmail && item.ownerEmail.toLowerCase().includes(searchTerm)) ||
                        (item.status && item.status.toLowerCase().includes(searchTerm));
                    
                    if (matchesSearch) {
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${doc.id}</td>
                            <td>${item.UID || ''}</td>
                            <td>${item.lostItem || ''}</td>
                            <td>${item.ownerName || ''}</td>
                            <td>${item.ownerContact || ''}</td>
                            <td>${item.ownerEmail || ''}</td>
                            <td>
                                <span class="status-badge ${item.status?.toLowerCase() || ''}">${item.status || ''}</span>
                            </td>
                            <td>
                                <button class="action-btn view-btn" data-id="${doc.id}"><i class="fas fa-eye"></i> View</button>
                                <button class="action-btn edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edit</button>
                                <button class="action-btn delete-btn" data-id="${doc.id}"><i class="fas fa-trash"></i> Delete</button>
                            </td>
                        `;
                        
                        itemsList.appendChild(row);
                        
                        // Add event listeners to buttons
                        const viewBtn = row.querySelector('.view-btn');
                        const editBtn = row.querySelector('.edit-btn');
                        const deleteBtn = row.querySelector('.delete-btn');
                        
                        viewBtn.addEventListener('click', () => viewItem(doc.id));
                        editBtn.addEventListener('click', () => editItem(doc.id));
                        deleteBtn.addEventListener('click', () => deleteItem(doc.id));
                        
                        matchFound = true;
                    }
                });
                
                if (!matchFound) {
                    itemsList.innerHTML = `
                        <tr>
                            <td colspan="8" class="no-items">No matching items found.</td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error('Error searching items:', error);
                itemsList.innerHTML = `
                    <tr>
                        <td colspan="8" class="error-message">Error searching items. Please try again later.</td>
                    </tr>
                `;
            });
    }, 300)); // Debounce to avoid too many searches while typing
    
    // Add item button
    const addItemBtn = document.getElementById('add-item-btn');
    addItemBtn.addEventListener('click', () => {
        const modal = document.getElementById('add-item-modal');
        modal.style.display = 'block';
    });
    
    // Close modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Add item form submission
    const addItemForm = document.getElementById('add-item-form');
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const rfidTag = document.getElementById('rfid-tag').value;
        const uid = document.getElementById('item-uid').value;
        const itemName = document.getElementById('item-name').value;
        const ownerName = document.getElementById('owner-name').value;
        const ownerContact = document.getElementById('owner-contact').value;
        const ownerEmail = document.getElementById('owner-email').value;
        const status = document.getElementById('item-status').value;
        
        // Add to Firestore
        db.collection('RFID_Tags').doc(rfidTag).set({
            UID: uid,
            lostItem: itemName,
            ownerName: ownerName,
            ownerContact: ownerContact,
            ownerEmail: ownerEmail,
            status: status,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // Close modal and reload items
            document.getElementById('add-item-modal').style.display = 'none';
            addItemForm.reset();
            loadItems();
            showNotification('Item added successfully');
        })
        .catch(error => {
            console.error('Error adding item:', error);
            alert('Error adding item. Please try again.');
        });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', loadItems);
    
    // Export data button
    const exportDataBtn = document.getElementById('export-data-btn');
    exportDataBtn.addEventListener('click', exportData);
}

// View item details
function viewItem(id) {
    db.collection('RFID_Tags').doc(id).get()
        .then(doc => {
            if (!doc.exists) {
                alert('Item not found');
                return;
            }
            
            const item = doc.data();
            
            // Populate modal with item data
            document.getElementById('view-rfid-tag').textContent = id;
            document.getElementById('view-uid').textContent = item.UID || '';
            document.getElementById('view-item-name').textContent = item.lostItem || '';
            document.getElementById('view-owner-name').textContent = item.ownerName || '';
            document.getElementById('view-owner-contact').textContent = item.ownerContact || '';
            document.getElementById('view-owner-email').textContent = item.ownerEmail || '';
            document.getElementById('view-status').textContent = item.status || '';
            
            // Show modal
            document.getElementById('view-item-modal').style.display = 'block';
            
            // Set up edit button
            document.getElementById('edit-item-btn').onclick = () => {
                document.getElementById('view-item-modal').style.display = 'none';
                editItem(id);
            };
            
            // Set up delete button
            document.getElementById('delete-item-btn').onclick = () => {
                document.getElementById('view-item-modal').style.display = 'none';
                deleteItem(id);
            };
        })
        .catch(error => {
            console.error('Error viewing item:', error);
            alert('Error viewing item details. Please try again.');
        });
}

// Edit item
function editItem(id) {
    // Implement edit functionality
    // This would typically involve showing a modal with form fields pre-populated with the item's data
    alert('Edit functionality would be implemented here for item: ' + id);
}

// Delete item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        db.collection('RFID_Tags').doc(id).delete()
            .then(() => {
                loadItems();
                showNotification('Item deleted successfully');
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                alert('Error deleting item. Please try again.');
            });
    }
}

// Export data to CSV
function exportData() {
    db.collection('RFID_Tags').get()
        .then(snapshot => {
            if (snapshot.empty) {
                alert('No items to export.');
                return;
            }
            
            const items = [];
            snapshot.forEach(doc => {
                const item = doc.data();
                items.push({
                    rfidTag: doc.id,
                    uid: item.UID || '',
                    lostItem: item.lostItem || '',
                    ownerName: item.ownerName || '',
                    ownerContact: item.ownerContact || '',
                    ownerEmail: item.ownerEmail || '',
                    status: item.status || '',
                    timestamp: item.timestamp ? formatDate(item.timestamp) : ''
                });
            });
            
            // Convert to CSV
            const headers = ['RFID Tag', 'UID', 'Lost Item', 'Owner Name', 'Owner Contact', 'Owner Email', 'Status', 'Timestamp'];
            let csv = headers.join(',') + '\n';
            
            items.forEach(item => {
                const values = [
                    item.rfidTag,
                    item.uid,
                    `"${(item.lostItem || '').replace(/"/g, '""')}"`,
                    `"${(item.ownerName || '').replace(/"/g, '""')}"`,
                    item.ownerContact,
                    item.ownerEmail,
                    item.status,
                    item.timestamp
                ];
                csv += values.join(',') + '\n';
            });
            
            // Create download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `rfid_items_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again later.');
        });
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button functionality
    notification.querySelector('.close-notification').addEventListener('click', () => {
        document.body.removeChild(notification);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Initialize the admin dashboard
function init() {
    // Check for RFID data from ESP32 (if applicable)
    const rtdb = firebase.database();
    const rfidRef = rtdb.ref('rfid_tags');
    
    // Listen for new RFID tags
    rfidRef.on('child_added', snapshot => {
        const rfidData = snapshot.val();
        console.log('New RFID tag detected:', rfidData);
        
        // Check if this RFID tag is already in the system
        db.collection('RFID_Tags').doc(rfidData.tag_id).get()
            .then(doc => {
                if (!doc.exists) {
                    // New tag, show notification
                    showNotification(`New RFID tag detected: ${rfidData.tag_id}`);
                    
                    // Optionally, you can automatically add it to the system
                    const newItem = {
                        UID: rfidData.uid || '',
                        lostItem: 'New Item',
                        status: 'Found',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    db.collection('RFID_Tags').doc(rfidData.tag_id).set(newItem)
                        .then(() => {
                            console.log('New item added from RFID detection');
                            loadItems(); // Reload items to update the UI
                        })
                        .catch(error => {
                            console.error('Error adding new item from RFID:', error);
                        });
                } else {
                    // Existing tag
                    const item = doc.data();
                    showNotification(`RFID tag detected: ${item.lostItem || 'Unnamed item'}`);
                    
                    // Update the item with new timestamp
                    db.collection('RFID_Tags').doc(rfidData.tag_id).update({
                        lastDetected: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'Found'
                    })
                    .then(() => {
                        console.log('Item updated from RFID detection');
                        loadItems(); // Reload items to update the UI
                    })
                    .catch(error => {
                        console.error('Error updating item from RFID:', error);
                    });
                }
            })
            .catch(error => {
                console.error('Error checking for existing RFID tag:', error);
            });
    });
    
    // Set up real-time updates for Firestore collection
    setupRealtimeUpdates();
}

// Set up real-time updates for Firestore collection
function setupRealtimeUpdates() {
    // Listen for changes in the RFID_Tags collection
    db.collection('RFID_Tags').onSnapshot(snapshot => {
        // Process the changes
        snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const item = doc.data();
            const id = doc.id;
            
            if (change.type === 'added') {
                console.log('New item added:', id);
                // If we're not already loading all items, update the UI for this specific item
                updateItemInUI(id, item, 'added');
            }
            else if (change.type === 'modified') {
                console.log('Item modified:', id);
                updateItemInUI(id, item, 'modified');
            }
            else if (change.type === 'removed') {
                console.log('Item removed:', id);
                removeItemFromUI(id);
            }
        });
    }, error => {
        console.error('Error setting up real-time updates:', error);
    });
}

// Update a specific item in the UI
function updateItemInUI(id, item, changeType) {
    const itemsList = document.getElementById('items-list');
    
    // Check if the item already exists in the UI
    const existingRow = document.querySelector(`tr[data-id="${id}"]`);
    
    if (existingRow) {
        // Update existing row
        existingRow.innerHTML = `
            <td>${id}</td>
            <td>${item.UID || ''}</td>
            <td>${item.lostItem || ''}</td>
            <td>${item.ownerName || ''}</td>
            <td>${item.ownerContact || ''}</td>
            <td>${item.ownerEmail || ''}</td>
            <td>
                <span class="status-badge ${item.status?.toLowerCase() || ''}">${item.status || ''}</span>
            </td>
            <td>
                <button class="action-btn view-btn" data-id="${id}"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn edit-btn" data-id="${id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete-btn" data-id="${id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        
        // Highlight the row to indicate it was updated
        existingRow.classList.add('updated-row');
        setTimeout(() => {
            existingRow.classList.remove('updated-row');
        }, 2000);
        
        // Re-add event listeners
        const viewBtn = existingRow.querySelector('.view-btn');
        const editBtn = existingRow.querySelector('.edit-btn');
        const deleteBtn = existingRow.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => viewItem(id));
        editBtn.addEventListener('click', () => editItem(id));
        deleteBtn.addEventListener('click', () => deleteItem(id));
    } else if (changeType === 'added') {
        // Only add new row if it's a new item and not already in the list
        const row = document.createElement('tr');
        row.setAttribute('data-id', id);
        
        row.innerHTML = `
            <td>${id}</td>
            <td>${item.UID || ''}</td>
            <td>${item.lostItem || ''}</td>
            <td>${item.ownerName || ''}</td>
            <td>${item.ownerContact || ''}</td>
            <td>${item.ownerEmail || ''}</td>
            <td>
                <span class="status-badge ${item.status?.toLowerCase() || ''}">${item.status || ''}</span>
            </td>
            <td>
                <button class="action-btn view-btn" data-id="${id}"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn edit-btn" data-id="${id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete-btn" data-id="${id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        
        // Add the new row to the list
        if (itemsList.querySelector('.no-items')) {
            // If there's a "no items" message, replace it
            itemsList.innerHTML = '';
        }
        
        itemsList.appendChild(row);
        
        // Highlight the row to indicate it was added
        row.classList.add('added-row');
        setTimeout(() => {
            row.classList.remove('added-row');
        }, 2000);
        
        // Add event listeners to buttons
        const viewBtn = row.querySelector('.view-btn');
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => viewItem(id));
        editBtn.addEventListener('click', () => editItem(id));
        deleteBtn.addEventListener('click', () => deleteItem(id));
    }
}

// Remove an item from the UI
function removeItemFromUI(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        // Add a fade-out effect
        row.classList.add('removed-row');
        
        // Remove the row after the animation completes
        setTimeout(() => {
            if (row.parentNode) {
                row.parentNode.removeChild(row);
                
                // Check if there are any items left
                const itemsList = document.getElementById('items-list');
                if (itemsList.children.length === 0) {
                    itemsList.innerHTML = `
                        <tr>
                            <td colspan="8" class="no-items">No items found.</td>
                        </tr>
                    `;
                }
            }
        }, 500);
    }
}