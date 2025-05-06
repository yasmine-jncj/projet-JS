document.getElementById('login').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('pseudo').value;
    const errorElement = document.getElementById('passwordError');
    
    // Clear previous errors
    errorElement.textContent = '';
    
    // Emailvalidation
    if (!email.includes('@') || !email.includes('.')) {
        errorElement.textContent = 'Please enter a valid email';
        return;
    }
    
    if (password.length < 8) {
        errorElement.textContent = 'Password must be at least 8 characters';
        return;
    }
    
    // If validation passes, proceed with form submission
    window.location.href = './studenthome.html';
});