// Sostituisci questa parte:
quizDatabase = [ ... ];

// Con questa:
const response = await fetch('quiz-database.json');
quizDatabase = await response.json();