// Script específico para a página do quiz
class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = null;
        this.selectedAnswer = null;
        this.quizCompleted = false;
        
        this.init();
    }

    init() {
        console.log('Inicializando aplicação do quiz...');
        this.loadQuestions();
        this.setupEventListeners();
        this.startQuiz();
    }

    loadQuestions() {
        this.questions = [
            {
                id: 1,
                question: "O que significa AQI?",
                category: "Conceitos Básicos",
                options: [
                    "Air Quality Index",
                    "Atmospheric Quality Indicator",
                    "Air Quantity Index",
                    "Atmospheric Quantity Indicator"
                ],
                correct: 0,
                explanation: "AQI significa Air Quality Index (Índice de Qualidade do Ar), uma medida padronizada da qualidade do ar."
            },
            {
                id: 2,
                question: "Qual é o principal poluente atmosférico responsável por problemas respiratórios?",
                category: "Poluentes",
                options: [
                    "Dióxido de Carbono (CO₂)",
                    "Material Particulado (PM2.5)",
                    "Oxigênio (O₂)",
                    "Nitrogênio (N₂)"
                ],
                correct: 1,
                explanation: "O Material Particulado (PM2.5) é o principal poluente responsável por problemas respiratórios, pois penetra profundamente nos pulmões."
            },
            {
                id: 3,
                question: "Qual valor de AQI é considerado 'Bom' para a saúde?",
                category: "Padrões de Qualidade",
                options: [
                    "0-50",
                    "51-100",
                    "101-150",
                    "151-200"
                ],
                correct: 0,
                explanation: "Valores de AQI entre 0-50 são considerados 'Bom' e representam risco mínimo para a saúde."
            },
            {
                id: 4,
                question: "Qual é a principal fonte de poluição do ar em áreas urbanas?",
                category: "Fontes de Poluição",
                options: [
                    "Indústrias",
                    "Veículos automotores",
                    "Queimadas",
                    "Aquecimento residencial"
                ],
                correct: 1,
                explanation: "Em áreas urbanas, os veículos automotores são a principal fonte de poluição do ar, especialmente para NOx e material particulado."
            },
            {
                id: 5,
                question: "Quantas pessoas morrem anualmente devido à poluição do ar?",
                category: "Impacto Global",
                options: [
                    "1 milhão",
                    "4 milhões",
                    "7 milhões",
                    "10 milhões"
                ],
                correct: 2,
                explanation: "Segundo a OMS, aproximadamente 7 milhões de pessoas morrem anualmente devido à poluição do ar, tanto exterior quanto interior."
            }
        ];
        
        console.log(`${this.questions.length} questões carregadas`);
    }

    setupEventListeners() {
        // Event listeners para botões de resposta
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-option')) {
                this.selectAnswer(parseInt(e.target.dataset.index));
            }
        });

        // Event listeners para botões de controle
        const nextBtn = document.getElementById('next-btn');
        const skipBtn = document.getElementById('skip-btn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipQuestion());
        }
    }

    startQuiz() {
        console.log('Iniciando quiz...');
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        this.quizCompleted = false;
        
        this.showQuestion();
        this.updateProgress();
    }

    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestion];
        console.log(`Mostrando questão ${this.currentQuestion + 1}: ${question.question}`);
        
        // Atualizar elementos da interface
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('question-category').textContent = question.category;
        
        // Criar opções de resposta
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-option';
            answerElement.dataset.index = index;
            answerElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            answersContainer.appendChild(answerElement);
        });
        
        // Resetar seleção
        this.selectedAnswer = null;
        this.updateNextButton();
    }

    selectAnswer(answerIndex) {
        console.log(`Resposta selecionada: ${answerIndex}`);
        
        // Remover seleção anterior
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Marcar nova seleção
        const selectedOption = document.querySelector(`[data-index="${answerIndex}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        this.selectedAnswer = answerIndex;
        this.updateNextButton();
    }

    updateNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.disabled = this.selectedAnswer === null;
        }
    }

    nextQuestion() {
        if (this.selectedAnswer === null) return;
        
        const question = this.questions[this.currentQuestion];
        const isCorrect = this.selectedAnswer === question.correct;
        
        console.log(`Resposta: ${isCorrect ? 'Correta' : 'Incorreta'}`);
        
        if (isCorrect) {
            this.correctAnswers++;
            this.score += 100;
        }
        
        // Mostrar feedback visual
        this.showAnswerFeedback(isCorrect);
        
        // Avançar para próxima questão após delay
        setTimeout(() => {
            this.currentQuestion++;
            this.updateProgress();
            this.showQuestion();
        }, 1500);
    }

    showAnswerFeedback(isCorrect) {
        const selectedOption = document.querySelector(`[data-index="${this.selectedAnswer}"]`);
        if (selectedOption) {
            selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        
        // Destacar resposta correta
        const correctOption = document.querySelector(`[data-index="${this.questions[this.currentQuestion].correct}"]`);
        if (correctOption && !isCorrect) {
            correctOption.classList.add('correct');
        }
    }

    skipQuestion() {
        console.log('Questão pulada');
        this.currentQuestion++;
        this.updateProgress();
        this.showQuestion();
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progress}%`;
        document.getElementById('question-counter').textContent = `${this.currentQuestion + 1} de ${this.questions.length}`;
    }

    showResults() {
        console.log('Mostrando resultados...');
        this.quizCompleted = true;
        
        const endTime = Date.now();
        const totalTime = Math.round((endTime - this.startTime) / 1000);
        const accuracy = Math.round((this.correctAnswers / this.questions.length) * 100);
        
        // Atualizar elementos de resultado
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('correct-answers').textContent = `${this.correctAnswers}/${this.questions.length}`;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('quiz-time').textContent = `${totalTime}s`;
        
        // Determinar medalha
        const medal = this.calculateMedal(accuracy);
        this.showMedal(medal);
        
        // Atualizar estatísticas
        this.updateStats();
        
        // Mostrar tela de resultados
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('results-screen').style.display = 'block';
    }

    calculateMedal(accuracy) {
        if (accuracy >= 90) {
            return { icon: '🥇', name: 'Ouro', description: 'Excelente! Você é um especialista em qualidade do ar!' };
        } else if (accuracy >= 70) {
            return { icon: '🥈', name: 'Prata', description: 'Muito bom! Continue aprendendo sobre qualidade do ar!' };
        } else if (accuracy >= 50) {
            return { icon: '🥉', name: 'Bronze', description: 'Bom começo! Continue estudando para melhorar!' };
        } else {
            return { icon: '📚', name: 'Estudante', description: 'Continue estudando! O conhecimento sobre qualidade do ar é importante!' };
        }
    }

    showMedal(medal) {
        document.querySelector('.medal-icon').textContent = medal.icon;
        document.querySelector('.medal-text').textContent = medal.name;
        document.getElementById('medal-description').textContent = medal.description;
    }

    updateStats() {
        // Atualizar estatísticas locais (implementação simplificada)
        const stats = this.getStats();
        document.getElementById('streak').textContent = stats.streak;
        document.getElementById('best-score').textContent = stats.bestScore;
        document.getElementById('total-quizzes').textContent = stats.totalQuizzes;
    }

    getStats() {
        // Recuperar estatísticas do localStorage
        const stats = JSON.parse(localStorage.getItem('quizStats') || '{"streak": 0, "bestScore": 0, "totalQuizzes": 0}');
        
        // Atualizar estatísticas
        stats.totalQuizzes++;
        if (this.score > stats.bestScore) {
            stats.bestScore = this.score;
        }
        if (this.correctAnswers === this.questions.length) {
            stats.streak++;
        } else {
            stats.streak = 0;
        }
        
        // Salvar estatísticas
        localStorage.setItem('quizStats', JSON.stringify(stats));
        
        return stats;
    }

    restartQuiz() {
        console.log('Reiniciando quiz...');
        document.getElementById('results-screen').style.display = 'none';
        document.getElementById('question-container').style.display = 'block';
        this.startQuiz();
    }
}

// Funções globais para os botões
function nextQuestion() {
    if (window.quizApp) {
        window.quizApp.nextQuestion();
    }
}

function skipQuestion() {
    if (window.quizApp) {
        window.quizApp.skipQuestion();
    }
}

function restartQuiz() {
    if (window.quizApp) {
        window.quizApp.restartQuiz();
    }
}

// Inicializar aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página do quiz carregada');
    window.quizApp = new QuizApp();
});
