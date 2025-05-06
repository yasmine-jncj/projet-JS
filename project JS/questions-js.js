document.getElementById('add-proposition').addEventListener('click', () => {
    const container = document.createElement('div');
    const input = document.createElement('input');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    input.type = 'text';
    input.placeholder = 'Proposition';
    container.appendChild(checkbox);
    container.appendChild(input);
    document.getElementById('propositions').appendChild(container);
    });

    document.getElementById('form-question').addEventListener('submit',
        function(e) {
        e.preventDefault();
        const enonce = document.getElementById('enonce').value;
        const duree = parseInt(document.getElementById('duree').value);
        const points = parseInt(document.getElementById('points').value);
        const proprietaire = document.getElementById('proprietaire').value;
        const nomExamen = document.getElementById('nom-examen').value;

        const propositions = [];
        document.querySelectorAll('#propositions div').forEach(div => {
            const texte = div.querySelector('input[type="text"]').value;
            const correcte = div.querySelector('input[type="checkbox"]').checked;
            propositions.push({ texte, correcte });
        });

        const examsKey = 'examens_' + proprietaire;
        const exams = JSON.parse(localStorage.getItem(examsKey)) || [];
        const exam = exams.find(e => e.nom === nomExamen);
        if (!exam) {
            alert('Examen non trouvé !');
            return;
        }
        const question = { enonce, duree, points, propositions };
        exam.questions.push(question);
        localStorage.setItem(examsKey, JSON.stringify(exams));
        alert('Question ajoutée avec succès !');
        this.reset();
        document.getElementById('propositions').innerHTML = '';
        });