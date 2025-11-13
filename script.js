console.log("✅ script.js caricato correttamente!");

// Variabili globali
let quizDatabase = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timer;
let timeLeft = 60 * 60;

// Elementi DOM
let loadingElement, examInfoElement, quizContainer, resultsContainer;
let questionText, optionsContainer, currentQuestionElement, totalQuestionsElement;
let timerElement, prevBtn, nextBtn, finishBtn, scoreText, resultsDetails, restartBtn;

// Inizializza gli elementi DOM
function initializeDOMElements() {
    console.log("🔄 Inizializzazione elementi DOM...");
    
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
    
    console.log("✅ Elementi DOM inizializzati");
}

// Carica il database delle domande
async function loadQuizDatabase() {
    try {
        console.log("📦 Caricamento database quiz...");
        
        // Inizializza gli elementi DOM
        initializeDOMElements();
        
        console.log("🔗 Tentativo di caricare data.json...");
        
        // Carica il file JSON esterno
        const response = await fetch('data.json');
        console.log("📡 Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📊 Dati caricati, numero di domande:", data.length);
        quizDatabase = data;
        
        console.log(`✅ Database caricato: ${quizDatabase.length} domande`);
        
        // Nascondi loading e mostra il quiz
        setTimeout(() => {
            console.log("🎯 Inizializzazione quiz...");
            loadingElement.style.display = 'none';
            examInfoElement.style.display = 'flex';
            initQuiz();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Errore nel caricamento del database:', error);
        loadingElement.innerHTML = '<p style="color: red;">Errore: ' + error.message + '</p>';
    }
}

// Inizializza il quiz
function initQuiz() {
    console.log("🎮 Inizializzazione quiz...");
    
    if (quizDatabase.length === 0) {
        console.error("❌ Database vuoto!");
        return;
    }

    // Seleziona 2 domande per test (poi cambierai in 30)
    currentQuiz = getRandomQuestions(2);
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuiz.length).fill(null);
    
    console.log("📝 Quiz creato con", currentQuiz.length, "domande");
    
    // Aggiorna il contatore
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    totalQuestionsElement.textContent = currentQuiz.length;
    
    // Avvia il timer
    startTimer();
    
    // Mostra la prima domanda
    showQuestion();
    
    // Mostra il quiz
    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    
    console.log("✅ Quiz inizializzato con successo!");
}

// Seleziona casualmente n domande
function getRandomQuestions(n) {
    const shuffled = [...quizDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Mostra la domanda corrente
function showQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    questionText.textContent = question.question;
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    
    optionsContainer.innerHTML = '';
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
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentQuiz.length - 1;
}

// Gestisce la selezione di un'opzione
function selectOption(e) {
    const selectedIndex = parseInt(e.target.dataset.index);
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    e.target.classList.add('selected');
}

// Navigazione
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Timer
function startTimer() {
    clearInterval(timer);
    timeLeft = 60 * 60;
    
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

// Termina il quiz
function finishQuiz() {
    clearInterval(timer);
    
    let correctAnswers = 0;
    currentQuiz.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / currentQuiz.length) * 100;
    const passed = score >= 70;
    
    scoreText.textContent = `Hai risposto correttamente a ${correctAnswers} su ${currentQuiz.length} domande (${score.toFixed(1)}%)`;
    scoreText.className = passed ? 'score passed' : 'score failed';
    
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
    
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    console.log("🔗 Setup event listeners...");
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    finishBtn.addEventListener('click', finishQuiz);
    restartBtn.addEventListener('click', initQuiz);
    console.log("✅ Event listeners configurati");
}

// Inizializza quando la pagina è pronta
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 DOM caricato - inizializzazione app");
    setupEventListeners();
    loadQuizDatabase();
});

console.log("🧩 script.js completamente caricato");