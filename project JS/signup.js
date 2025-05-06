document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const fnameInput = document.getElementById('fname');
    const lnameInput = document.getElementById('lname');
    const establishmentInput = document.getElementById('Establishment');
    const majorInput = document.getElementById('major');
    const birthdateInput = document.querySelector('.birthdate input[type="date"]');
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const submitBtn = document.querySelector('.Submit-btn');

    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            simulateSubmission();
        }
    });

    
    function validateForm() {
        let isValid = true;

        
        clearErrors();

        
        if (!emailInput.value) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        if (!fnameInput.value) {
            showError(fnameInput, 'First name is required');
            isValid = false;
        }

        if (!lnameInput.value) {
            showError(lnameInput, 'Last name is required');
            isValid = false;
        }

        
        if (!establishmentInput.value) {
            showError(establishmentInput, 'Establishment is required');
            isValid = false;
        }

        
        if (!majorInput.value) {
            showError(majorInput, 'Major is required');
            isValid = false;
        }

        
        if (!birthdateInput.value) {
            showError(birthdateInput.parentNode, 'Birthdate is required');
            isValid = false;
        }

        let genderSelected = false;
        genderInputs.forEach(input => {
            if (input.checked) genderSelected = true;
        });
        
        if (!genderSelected) {
            showError(document.querySelector('.gender'), 'Please select your gender');
            isValid = false;
        }

        return isValid;
    }

    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    
    function showError(input, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        errorElement.textContent = message;
        
        
        if (input.tagName === 'DIV' || input.tagName === 'P') {
            input.appendChild(errorElement);
        } else {
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        
        input.classList.add('error');
    }

    
    function clearErrors() {
        
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
    
    function simulateSubmission() {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        
        setTimeout(() => {
            
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.style.color = 'green';
            successMsg.style.marginTop = '20px';
            successMsg.style.textAlign = 'center';
            successMsg.style.fontWeight = 'bold';
            successMsg.textContent = 'Registration successful! Redirecting...';
            
            
            form.parentNode.insertBefore(successMsg, form.nextSibling);
            
            form.style.display = 'none';
            
            
            setTimeout(() => {
                window.location.href = 'dashboard.html'; 
            }, 2000);
            
        }, 1500);
    }

    emailInput.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            showError(this, 'Please enter a valid email address');
        }
    });
});