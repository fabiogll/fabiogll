// Carica il database delle domande dal file JSON
async function loadQuizDatabase() {
    try {
        console.log("Caricamento database quiz...");
        
        // Carica il file JSON esterno
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        const quizDatabase = await response.json();
        
        console.log(`Database caricato: ${quizDatabase.length} domande`);
        
        // Nascondi il loading e inizializza il quiz
        document.getElementById('loading').style.display = 'none';
        document.getElementById('exam-info').style.display = 'flex';
        initQuiz(quizDatabase);
        
    } catch (error) {
        console.error('Errore nel caricamento del database:', error);
        document.getElementById('loading').innerHTML = 
            '<p style="color: red;">Errore nel caricamento delle domande. Ricarica la pagina.</p>';
    }
}

// Inizializza il quiz con il database caricato
function initQuiz(quizDatabase) {
    // ... il resto del codice di initQuiz dal tuo index.html ...
    
    // Seleziona casualmente 30 domande dal database
    const currentQuiz = getRandomQuestions(quizDatabase, 30);
    // ... continua con il resto della logica ...
}

// Seleziona casualmente n domande dal database
function getRandomQuestions(database, n) {
    const shuffled = [...database].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Avvia il caricamento quando la pagina è pronta
document.addEventListener('DOMContentLoaded', loadQuizDatabase);