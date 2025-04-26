document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const db = firebase.firestore();
    
    // DOM Elements
    const topupForm = document.getElementById('topup-form');
    const topupAmount = document.getElementById('topup-amount');
    const serviceFee = document.getElementById('service-fee');
    const totalAmount = document.getElementById('total-amount');
    const currentBalance = document.getElementById('current-balance');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentDetails = document.querySelectorAll('.payment-details');
    const quickActionButtons = document.querySelectorAll('.action-btn');
    const transactionHistoryBtn = document.getElementById('transaction-history-btn');
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    
    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to clicked method
            this.classList.add('active');
            
            // Get selected payment method
            const paymentMethod = this.querySelector('input').value;
            
            // Hide all payment details
            paymentDetails.forEach(detail => detail.style.display = 'none');
            
            // Show selected payment details
            document.getElementById(`${paymentMethod}-details`).style.display = 'block';
        });
    });
    
    // Quick action buttons
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            topupAmount.value = amount;
            updateFeeAndTotal();
        });
    });
    
    // Update fee and total when amount changes
    topupAmount.addEventListener('input', updateFeeAndTotal);
    
    function updateFeeAndTotal() {
        const amount = parseFloat(topupAmount.value) || 0;
        const fee = amount * 0.02; // 2% service fee
        const total = amount + fee;
        
        serviceFee.textContent = `₹${fee.toFixed(2)}`;
        totalAmount.textContent = `₹${total.toFixed(2)}`;
    }
    
    // Form submission
    topupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const amount = parseFloat(topupAmount.value);
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        
        // Validate amount
        if (!amount || amount < 10) {
            showNotification('Please enter a valid amount (minimum ₹10)', 'error');
            return;
        }
        
        // Show loading state
        const proceedBtn = document.getElementById('proceed-btn');
        proceedBtn.disabled = true;
        proceedBtn.innerHTML = '<span>Processing...</span><i class="fas fa-spinner fa-spin"></i>';
        
        // Simulate payment processing
        setTimeout(() => {
            // Update balance
            const oldBalance = parseFloat(currentBalance.textContent);
            const newBalance = oldBalance + amount;
            
            // Create transaction record
            const transaction = {
                type: 'topup',
                amount: amount,
                fee: amount * 0.02,
                paymentMethod: paymentMethod,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'completed'
            };
            
            // Save to Firebase
            db.collection('transactions').add(transaction)
                .then(() => {
                    // Update displayed balance with animation
                    animateBalance(oldBalance, newBalance);
                    
                    // Show success message
                    showNotification(`Successfully added ₹${amount} to your wallet!`, 'success');
                    
                    // Reset form
                    topupForm.reset();
                    updateFeeAndTotal();
                    
                    // Reset button state
                    proceedBtn.disabled = false;
                    proceedBtn.innerHTML = '<span>Proceed to Pay</span><i class="fas fa-arrow-right"></i>';
                })
                .catch(error => {
                    console.error('Error saving transaction:', error);
                    showNotification('Error processing payment. Please try again.', 'error');
                    
                    // Reset button state
                    proceedBtn.disabled = false;
                    proceedBtn.innerHTML = '<span>Proceed to Pay</span><i class="fas fa-arrow-right"></i>';
                });
        }, 2000);
    });
    
    // Animate balance change
    function animateBalance(start, end) {
        const duration = 1000; // 1 second
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const currentValue = start + (end - start) * progress;
                currentBalance.textContent = Math.round(currentValue);
                requestAnimationFrame(updateNumber);
            } else {
                currentBalance.textContent = end;
            }
        }
        
        requestAnimationFrame(updateNumber);
    }
    
    // Transaction history button
    transactionHistoryBtn.addEventListener('click', function() {
        showTransactionHistory();
    });
    
    // Show transaction history
    function showTransactionHistory() {
        // Create modal for transaction history
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Transaction History</h3>
                    <span class="close-modal">&times;</span>
                                </div>
                <div class="modal-body">
                    <div class="transaction-list">
                        <div class="transaction-item">
                            <div class="transaction-icon deposit">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">Wallet TopUp</div>
                                <div class="transaction-date">Today, 2:30 PM</div>
                            </div>
                            <div class="transaction-amount deposit">+₹500.00</div>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-icon withdraw">
                                <i class="fas fa-arrow-up"></i>
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">Canteen Payment</div>
                                <div class="transaction-date">Today, 12:15 PM</div>
                            </div>
                            <div class="transaction-amount withdraw">-₹120.00</div>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-icon deposit">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">Wallet TopUp</div>
                                <div class="transaction-date">Yesterday, 10:45 AM</div>
                            </div>
                            <div class="transaction-amount deposit">+₹1000.00</div>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-icon withdraw">
                                <i class="fas fa-arrow-up"></i>
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">Print Service</div>
                                <div class="transaction-date">Yesterday, 3:20 PM</div>
                            </div>
                            <div class="transaction-amount withdraw">-₹45.00</div>
                        </div>
                        <div class="transaction-item">
                            <div class="transaction-icon withdraw">
                                <i class="fas fa-arrow-up"></i>
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-title">Stationery Purchase</div>
                                <div class="transaction-date">Mar 15, 2023</div>
                            </div>
                            <div class="transaction-amount withdraw">-₹85.00</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="download-btn"><i class="fas fa-download"></i> Download Statement</button>
                </div>
            </div>
        </div>`;
        
        document.body.appendChild(modal);
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Add event listener to download button
        const downloadBtn = modal.querySelector('.download-btn');
        downloadBtn.addEventListener('click', function() {
            showNotification('Statement downloaded successfully!', 'success');
        });
    }
    
    // Subscribe buttons
    subscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planName = this.parentElement.querySelector('h3').textContent;
            
            // Show confirmation modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Confirm Subscription</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <p>You are about to subscribe to the <strong>${planName}</strong>.</p>
                        <p>This subscription will be billed monthly and can be canceled anytime.</p>
                        <div class="payment-methods">
                            <div class="payment-method active">
                                <input type="radio" name="sub-payment-method" id="sub-upi" value="upi" checked>
                                <label for="sub-upi">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>UPI</span>
                                </label>
                            </div>
                            <div class="payment-method">
                                <input type="radio" name="sub-payment-method" id="sub-card" value="card">
                                <label for="sub-card">
                                    <i class="fas fa-credit-card"></i>
                                    <span>Card</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn">Confirm Subscription</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listener to close button
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Add event listener to cancel button
            const cancelBtn = modal.querySelector('.cancel-btn');
            cancelBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Add event listener to confirm button
            const confirmBtn = modal.querySelector('.confirm-btn');
            confirmBtn.addEventListener('click', function() {
                // Show loading state
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                // Simulate subscription processing
                setTimeout(() => {
                    document.body.removeChild(modal);
                    showNotification(`Successfully subscribed to ${planName}!`, 'success');
                }, 2000);
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
            
            // Payment method selection
            const subPaymentMethods = modal.querySelectorAll('.payment-method');
            subPaymentMethods.forEach(method => {
                method.addEventListener('click', function() {
                    // Remove active class from all methods
                    subPaymentMethods.forEach(m => m.classList.remove('active'));
                    
                    // Add active class to clicked method
                    this.classList.add('active');
                });
            });
        });
    });
    
    // Show notification function
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
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // Show notification
        notification.style.display = 'flex';
        
        // Add event listener to close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.style.display = 'none';
        });
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // Add these styles for modal and notification
    const style = document.createElement('style');
    style.textContent = `
        /* Modal Styles */
        .modal {
            display: flex;
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
            max-height: 400px;
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #e9ecef;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .cancel-btn, .download-btn {
            padding: 8px 15px;
            border: 1px solid #ddd;
            background-color: #f8f9fa;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .confirm-btn {
            padding: 8px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        /* Transaction List Styles */
        .transaction-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .transaction-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: 8px;
            background-color: #f8f9fa;
        }
        
        .transaction-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 15px;
        }
        
        .transaction-icon.deposit {
            background-color: #e9f7ef;
            color: #4CAF50;
        }
        
        .transaction-icon.withdraw {
            background-color: #fbe9e7;
            color: #e74c3c;
        }
        
        .transaction-details {
            flex: 1;
        }
        
        .transaction-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .transaction-date {
            font-size: 12px;
            color: #6c757d;
        }
        
        .transaction-amount {
            font-weight: bold;
        }
        
        .transaction-amount.deposit {
            color: #4CAF50;
        }
        
        .transaction-amount.withdraw {
            color: #e74c3c;
        }
        
        /* Notification Styles */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            display: none;
            animation: notificationFadeIn 0.3s;
            background-color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
        }
        
        @keyframes notificationFadeIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        .notification-success .notification-icon {
            color: #4CAF50;
        }
        
        .notification-error .notification-icon {
            color: #e74c3c;
        }
        
        .notification-info .notification-icon {
            color: #3498db;
        }
        
        .notification-message {
            flex: 1;
        }
        
        .notification-close {
            cursor: pointer;
            color: #6c757d;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize with sample data
    updateFeeAndTotal();
});