document.addEventListener('DOMContentLoaded', function() {
    // DOM 
    const examLinkEntry = document.getElementById('examLinkEntry');
    const geolocationSection = document.getElementById('geolocationSection');
    const examInterface = document.getElementById('examInterface');
    const resultsSection = document.getElementById('resultsSection');
    const startExamBtn = document.getElementById('startExamBtn');
    const enableGeoBtn = document.getElementById('enableGeoBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const finishExamBtn = document.getElementById('finishExamBtn');
    const questionTimer = document.getElementById('questionTimer');
    const currentQuestion = document.getElementById('currentQuestion');
    const questionOptions = document.getElementById('questionOptions');
    const scoreDisplay = document.getElementById('scoreDisplay');
    
    // Exam state
    let examData = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    let timeLeft = 0;
    let geolocation = null;
    
    // Start exam when link is entered
    startExamBtn.addEventListener('click', function() {
        const examLink = document.getElementById('examLink').value.trim();
        if (!examLink) {
            alert('Please enter a valid exam link');
            return;
        }
        
        fetchExamData(examLink);
    });
    
    // Enable geolocation
    enableGeoBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    geolocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    document.getElementById('geoStatus').textContent = 'Geolocation enabled!';
                    enableGeoBtn.disabled = true;
                    console.log('Geolocation captured:', geolocation);
                    setTimeout(startExam, 1500);
                },
                function(error) {
                    document.getElementById('geoStatus').textContent = 'Error getting location: ' + error.message;
                }
            );
        } else {
            document.getElementById('geoStatus').textContent = 'Geolocation is not supported by this browser.';
        }
    });
    
    // Next question button
    nextQuestionBtn.addEventListener('click', function() {
        saveAnswer();
        currentQuestionIndex++;
        if (currentQuestionIndex < examData.questions.length) {
            displayQuestion();
        } else {
            finishExam();
        }
    });
    
    // Finish exam button
    finishExamBtn.addEventListener('click', function() {
        alert('Exam completed! You can close this window.');
    });
    
    async function fetchExamData(link) {
        try {
          const accessCode = link.split('/').pop(); 
          const response = await fetch(`/api/exams/${accessCode}`);
          if (!response.ok) throw new Error("Exam not found");
          examData = await response.json();
          examLinkEntry.classList.add('hidden');
          geolocationSection.classList.remove('hidden');
        } catch (error) {
          alert(error.message);
          startExamBtn.disabled = false;
          startExamBtn.textContent = 'Start Exam';
        }
    }
    
    function startExam() {
        geolocationSection.classList.add('hidden');
        examInterface.classList.remove('hidden');
        document.getElementById('examTitle').textContent = examData.title;
        displayQuestion();
    }
    
    function displayQuestion() {
        const question = examData.questions[currentQuestionIndex];
        currentQuestion.innerHTML = '';
        questionOptions.innerHTML = '';
        
        const questionText = document.createElement('div');
        questionText.className = 'question';
        questionText.textContent = question.text;
        currentQuestion.appendChild(questionText);
        
        if (question.type === 'qcm') {
          question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
              <input type="radio" name="qcm-answer" id="option-${index}" value="${index}">
              <label for="option-${index}">${option.text}</label>
            `;
            questionOptions.appendChild(optionElement);
          });
        } else {
          const answerInput = document.createElement('input');
          answerInput.type = 'text';
          answerInput.id = 'direct-answer';
          answerInput.placeholder = 'Type your answer here...';
          questionOptions.appendChild(answerInput);
        }
        startTimer(question.duration || 60);
    }
     
    function startTimer(seconds) {
        timeLeft = seconds;
        updateTimerDisplay();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function() {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                saveAnswer();
                currentQuestionIndex++;
                if (currentQuestionIndex < examData.questions.length) {
                    displayQuestion();
                } else {
                    finishExam();
                }
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        questionTimer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function saveAnswer() {
        const question = examData.questions[currentQuestionIndex];
        let isCorrect = false;
        
        if (question.type === 'qcm') {
          const selectedOption = document.querySelector('input[name="qcm-answer"]:checked');
          if (selectedOption) {
            isCorrect = question.options[selectedOption.value].isCorrect;
          }
        } else {
          const studentAnswer = document.getElementById('direct-answer').value.toLowerCase();
          const correctAnswer = question.correctAnswer.toLowerCase();
          if (question.tolerance > 0) {
            isCorrect = studentAnswer.includes(correctAnswer) || 
                       correctAnswer.includes(studentAnswer);
          } else {
            isCorrect = studentAnswer === correctAnswer;
          }
        }
        if (isCorrect) {
          score += question.points || 1;
        }
    }
    
    async function finishExam() {
        clearInterval(timerInterval);
        examInterface.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        scoreDisplay.textContent = `Your score: ${score}/100`;
        const feedback = document.getElementById('examFeedback');
        if (score >= 80) {
            feedback.textContent = "Excellent work!";
        } else if (score >= 50) {
            feedback.textContent = "Good job, but there's room for improvement.";
        } else {
            feedback.textContent = "Keep practicing! Review the material and try again.";
        }
        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: examData._id,
                    studentId: "CURRENT_STUDENT_ID",
                    answers: getStudentAnswers(),
                    score: score,
                    geolocation: geolocation
                })
            });
            if (!response.ok) throw new Error("Failed to save results");
        } catch (error) {
            console.error("Result submission error:", error);
        }
    }

    function getStudentAnswers() {
        return examData.questions.map((q, index) => {
            let answer;
            let isCorrect = false;
            
            if (q.type === 'qcm') {
                const selected = document.querySelector('input[name="qcm-answer"]:checked');
                answer = selected?.value;
                isCorrect = selected ? q.options[selected.value]?.isCorrect : false;
            } else {
                answer = document.getElementById('direct-answer')?.value;
                const studentAnswer = answer?.toLowerCase();
                const correctAnswer = q.correctAnswer?.toLowerCase();
                if (q.tolerance > 0) {
                    isCorrect = studentAnswer?.includes(correctAnswer) || 
                               correctAnswer?.includes(studentAnswer);
                } else {
                    isCorrect = studentAnswer === correctAnswer;
                }
            }
            return {
                questionId: q._id,
                answer: answer,
                isCorrect: isCorrect
            };
        });
    }

    document.getElementById('examLink').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('startExamBtn').click();
    });
    document.getElementById('enableGeoBtn').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('enableGeoBtn').click();
    });
    document.getElementById('nextQuestionBtn').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('nextQuestionBtn').click();
    });
    document.getElementById('finishExamBtn').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('finishExamBtn').click();
    });
});