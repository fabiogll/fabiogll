// Variabili globali
let quizDatabase = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timer;
let timeLeft = 60 * 60; // 60 minuti in secondi

// Elementi DOM
let loadingElement, examInfoElement, quizContainer, resultsContainer;
let questionText, optionsContainer, currentQuestionElement, totalQuestionsElement;
let timerElement, prevBtn, nextBtn, finishBtn, scoreText, resultsDetails, restartBtn;

// Inizializza gli elementi DOM
function initializeDOMElements() {
    loadingElement = document.getElementById('loading');
    examInfoElement = document.getElementById('exam-info');
    quizContainer = document.getElementById('quiz-container');
    resultsContainer = document.getElementById('results-container');
    questionText = document.getElementById('question-text');
    optionsContainer = document.getElementById('options-container');
    currentQuestionElement = document.getElementById('current-question');
    totalQuestionsElement = document.getElementById('total-questions');
    timerElement = document.getElementById('timer');
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    finishBtn = document.getElementById('finish-btn');
    scoreText = document.getElementById('score-text');
    resultsDetails = document.getElementById('results-details');
    restartBtn = document.getElementById('restart-btn');
}

// Carica il database delle domande
async function loadQuizDatabase() {
    try {
        console.log("Caricamento database quiz...");
        
        // Inizializza gli elementi DOM
        initializeDOMElements();
        
        // Carica il file JSON esterno
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        quizDatabase = await response.json();
        
        console.log(`Database caricato: ${quizDatabase.length} domande`);
        
        // Simula un caricamento più lungo per mostrare il loading
        setTimeout(() => {
            loadingElement.style.display = 'none';
            examInfoElement.style.display = 'flex';
            initQuiz();
        }, 1500);
        
    } catch (error) {
        console.error('Errore nel caricamento del database:', error);
        loadingElement.innerHTML = '<p style="color: red;">Errore nel caricamento delle domande. Ricarica la pagina.</p>';
    }
}

// Inizializza il quiz
function initQuiz() {
    if (quizDatabase.length === 0) {
        alert('Database non caricato correttamente');
        return;
    }

    // Seleziona casualmente 30 domande dal database
    currentQuiz = getRandomQuestions(30);
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuiz.length).fill(null);
    
    // Aggiorna il contatore delle domande
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    totalQuestionsElement.textContent = currentQuiz.length;
    
    // Avvia il timer
    startTimer();
    
    // Mostra la prima domanda
    showQuestion();
    
    // Nascondi i risultati e mostra il quiz
    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
}

// Seleziona casualmente n domande dal database
function getRandomQuestions(n) {
    const shuffled = [...quizDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Mostra la domanda corrente
function showQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    
    // Aggiorna il testo della domanda
    questionText.textContent = question.question;
    
    // Aggiorna il contatore
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    
    // Pulisci le opzioni precedenti
    optionsContainer.innerHTML = '';
    
    // Aggiungi le nuove opzioni
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', selectOption);
        optionsContainer.appendChild(optionElement);
    });
    
    // Aggiorna lo stato dei pulsanti di navigazione
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentQuiz.length - 1;
}

// Gestisce la selezione di un'opzione
function selectOption(e) {
    const selectedIndex = parseInt(e.target.dataset.index);
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    // Rimuovi la selezione precedente
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Aggiungi la selezione corrente
    e.target.classList.add('selected');
}

// Passa alla domanda successiva
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

// Torna alla domanda precedente
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Avvia il timer
function startTimer() {
    clearInterval(timer);
    timeLeft = 60 * 60; // 60 minuti
    
    timer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            finishQuiz();
        }
    }, 1000);
}

// Termina il quiz e mostra i risultati
function finishQuiz() {
    clearInterval(timer);
    
    // Calcola il punteggio
    let correctAnswers = 0;
    currentQuiz.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / currentQuiz.length) * 100;
    const passed = score >= 70; // Soglia di superamento del 70%
    
    // Mostra il punteggio
    scoreText.textContent = `Hai risposto correttamente a ${correctAnswers} su ${currentQuiz.length} domande (${score.toFixed(1)}%)`;
    scoreText.className = passed ? 'score passed' : 'score failed';
    
    // Mostra i dettagli delle risposte
    resultsDetails.innerHTML = '';
    currentQuiz.forEach((question, index) => {
        const resultItem = document.createElement('div');
        const isCorrect = userAnswers[index] === question.correctAnswer;
        
        resultItem.className = isCorrect ? 'result-item correct' : 'result-item incorrect';
        
        let userAnswerText = 'Nessuna risposta';
        if (userAnswers[index] !== null) {
            userAnswerText = question.options[userAnswers[index]];
        }
        
        const correctAnswerText = question.options[question.correctAnswer];
        
        resultItem.innerHTML = `
            <div class="question-number">Domanda ${index + 1}</div>
            <div class="question-text">${question.question}</div>
            <div class="user-answer">La tua risposta: ${userAnswerText}</div>
            ${!isCorrect ? `<div class="correct-answer">Risposta corretta: ${correctAnswerText}</div>` : ''}
            <div class="topic">Argomento: ${question.topic}</div>
        `;
        
        resultsDetails.appendChild(resultItem);
    });
    
    // Nascondi il quiz e mostra i risultati
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
}

// Setup degli event listeners
function setupEventListeners() {
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    finishBtn.addEventListener('click', finishQuiz);
    restartBtn.addEventListener('click', initQuiz);
}

// Inizializza l'applicazione quando la pagina è pronta
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadQuizDatabase();
});