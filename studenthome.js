// Logout functionality
document.querySelector('.logout-btn').addEventListener('click', function() {
    if(confirm('Are you sure you want to logout?')) {
        // Clear session data if needed
        localStorage.removeItem('studentToken');
        // Redirect to login page
        window.location.href = './student_login.html';
    }
});

// Active navigation highlighting
const navLinks = document.querySelectorAll('.sidebar nav ul li');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navLinks.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
    });
});

// Exam start confirmation
document.querySelector('.start-btn').addEventListener('click', function(e) {
    if(!confirm('Are you ready to start the exam? You cannot pause once started.')) {
        e.preventDefault(); // Prevent navigation if canceled
    }

});