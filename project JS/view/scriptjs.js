document.getElementById('form-examen').addEventListener('submit', function(e) {
    e.preventDefault();
    const examen = {
        nom: document.getElementById('nom').value,
        duree: parseInt(document.getElementById('duree').value),
        description: document.getElementById('description').value,
        proprietaire: document.getElementById('proprietaire').value,
        questions: []
    };

    const examsKey = 'examens_' + examen.proprietaire;
    const exams = JSON.parse(localStorage.getItem(examsKey)) || [];
    exams.push(examen);
    localStorage.setItem(examsKey, JSON.stringify(exams));

    alert('Exam added successfully!');
    this.reset();
    
    // Redirect to exam creation page
    window.location.href = 'questions.html'; // Change this to your actual exam creation page URL
});