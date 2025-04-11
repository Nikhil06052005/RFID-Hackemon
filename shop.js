document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const db = firebase.firestore();
    
    // DOM Elements
    const cardItems = document.querySelectorAll('.card-item');
    const cardTypeSelect = document.getElementById('card-type');
    const summaryCardType = document.getElementById('summary-card-type');
    const summaryQuantity = document.getElementById('summary-quantity');
    const summaryPrice = document.getElementById('summary-price');
    const quantityInput = document.getElementById('quantity');
    const orderForm = document.getElementById('rfid-order-form');
    const buyButton = document.getElementById('buy-card-btn');
    
    // Card selection
    cardItems.forEach(card => {
        card.addEventListener('click', function() {
            cardItems.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const cardType = this.getAttribute('data-type');
            cardTypeSelect.value = cardType;
            
            updateOrderSummary();
        });
    });
    
    // Dropdown selection
    cardTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        
        cardItems.forEach(card => {
            card.classList.remove('selected');
            if (card.getAttribute('data-type') === selectedType) {
                card.classList.add('selected');
            }
        });
        
        updateOrderSummary();
    });
    
    // Update when quantity changes
    quantityInput.addEventListener('input', updateOrderSummary);
    
    // Update order summary
    function updateOrderSummary() {
        const selectedCard = document.querySelector('.card-item.selected');
        const quantity = parseInt(quantityInput.value) || 1;
        
        if (selectedCard) {
            const cardType = selectedCard.getAttribute('data-type');
            const price = parseInt(selectedCard.getAttribute('data-price'));
            
            summaryCardType.textContent = cardType + ' RFID Card';
            summaryQuantity.textContent = quantity;
            summaryPrice.textContent = '₹' + (price * quantity);
        } else if (cardTypeSelect.value) {
            const cardType = cardTypeSelect.value;
            let price = 0;
            
            cardItems.forEach(card => {
                if (card.getAttribute('data-type') === cardType) {
                    price = parseInt(card.getAttribute('data-price'));
                }
            });
            
            summaryCardType.textContent = cardType + ' RFID Card';
            summaryQuantity.textContent = quantity;
            summaryPrice.textContent = '₹' + (price * quantity);
        } else {
            summaryCardType.textContent = '-';
            summaryQuantity.textContent = quantity;
            summaryPrice.textContent = '₹0';
        }
    }
    
    // Form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;
        const cardType = cardTypeSelect.value;
        const quantity = parseInt(quantityInput.value) || 1;
        
        // Get price
        let price = 0;
        cardItems.forEach(card => {
            if (card.getAttribute('data-type') === cardType) {
                price = parseInt(card.getAttribute('data-price'));
            }
        });
        
        // Validate form
        if (!customerName || !customerEmail || !cardType) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Show loading state
        buyButton.disabled = true;
        buyButton.innerHTML = '<span>Processing...</span><i class="fas fa-spinner fa-spin"></i>';
        
        // Create order object
        const order = {
            customerName,
            customerEmail,
            cardType,
            quantity,
            price: price * quantity,
            status: 'Pending',
            orderDate: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firebase
        db.collection('RFID_Orders').add(order)
            .then(docRef => {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h3>Order Placed Successfully!</h3>
                    <p>Your order ID is: ${docRef.id}</p>
                `;
                
                orderForm.parentNode.insertBefore(successMessage, orderForm);
                
                // Reset form
                orderForm.reset();
                cardItems.forEach(card => card.classList.remove('selected'));
                updateOrderSummary();
                
                // Reset button
                buyButton.disabled = false;
                buyButton.innerHTML = '<span>Buy Now</span><i class="fas fa-shopping-cart"></i>';
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 5000);
            })
            .catch(error => {
                console.error('Error saving order:', error);
                alert('Error placing order. Please try again.');
                
                buyButton.disabled = false;
                buyButton.innerHTML = '<span>Buy Now</span><i class="fas fa-shopping-cart"></i>';
            });
    });
    
    // Initialize summary
    updateOrderSummary();
});