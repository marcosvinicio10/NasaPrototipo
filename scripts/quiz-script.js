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
                question: "Imagine que você está caminhando na rua e sente que o ar está 'pesado' e difícil de respirar. Qual é o poluente invisível que mais provavelmente está causando essa sensação?",
                category: "🌬️ Experiência Pessoal",
                options: [
                    "Dióxido de Carbono (CO₂) - o gás que expiramos",
                    "Material Particulado (PM2.5) - partículas microscópicas que entram nos pulmões",
                    "Oxigênio (O₂) - o gás que respiramos",
                    "Nitrogênio (N₂) - o gás mais abundante no ar"
                ],
                correct: 1,
                explanation: "O PM2.5 são partículas tão pequenas que penetram profundamente nos pulmões, causando aquela sensação de 'ar pesado' e dificuldade para respirar. É como respirar poeira invisível!"
            },
            {
                id: 2,
                question: "Você está planejando uma atividade ao ar livre para sua família. Qual valor de qualidade do ar você consideraria seguro para crianças brincarem no parque?",
                category: "👨‍👩‍👧‍👦 Proteção Familiar",
                options: [
                    "0-50 (Verde) - Ar limpo e seguro para todos",
                    "51-100 (Amarelo) - Aceitável, mas sensíveis devem ter cuidado",
                    "101-150 (Laranja) - Insalubre para grupos sensíveis",
                    "151-200 (Vermelho) - Insalubre para todos"
                ],
                correct: 0,
                explanation: "Valores 0-50 (Verde) são os únicos considerados seguros para atividades ao ar livre, especialmente para crianças, idosos e pessoas com problemas respiratórios. É quando você pode respirar fundo sem se preocupar!"
            },
            {
                id: 3,
                question: "Sua avó de 75 anos está preocupada com a qualidade do ar em sua cidade. Qual é o impacto mais comum da poluição do ar na saúde de idosos?",
                category: "👵 Impacto na Terceira Idade",
                options: [
                    "Melhora da capacidade pulmonar",
                    "Aumento do risco de infartos e derrames",
                    "Fortalecimento do sistema imunológico",
                    "Redução da pressão arterial"
                ],
                correct: 1,
                explanation: "A poluição do ar aumenta significativamente o risco de problemas cardiovasculares em idosos, incluindo infartos e derrames. É por isso que dias de ar poluído são especialmente perigosos para nossos avós."
            },
            {
                id: 4,
                question: "Você está dirigindo para o trabalho todos os dias e se preocupa com sua contribuição para a poluição. Qual ação diária teria o maior impacto positivo na qualidade do ar?",
                category: "🚗 Ação Pessoal",
                options: [
                    "Usar o ar-condicionado do carro menos",
                    "Optar por transporte público ou bicicleta 2-3 vezes por semana",
                    "Trocar o filtro de ar do carro mensalmente",
                    "Dirigir mais devagar para economizar combustível"
                ],
                correct: 1,
                explanation: "Reduzir o uso do carro individual é a ação mais impactante. Cada viagem que você faz de ônibus, metrô ou bicicleta significa menos poluentes no ar que todos respiramos!"
            },
            {
                id: 5,
                question: "Refletindo sobre o que você aprendeu no AirQuest, quantas pessoas no mundo respiram ar que não atende aos padrões seguros da OMS?",
                category: "🌍 Consciência Global",
                options: [
                    "1 em cada 10 pessoas (10%)",
                    "1 em cada 4 pessoas (25%)",
                    "9 em cada 10 pessoas (90%)",
                    "Todas as pessoas (100%)"
                ],
                correct: 2,
                explanation: "Incrivelmente, 9 em cada 10 pessoas no mundo respiram ar que não atende aos padrões seguros da OMS. Isso significa que quase todos nós, incluindo você e sua família, estamos expostos a níveis perigosos de poluição do ar."
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
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextQuestion();
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.skipQuestion();
            });
        }
    }

    startQuiz() {
        console.log('Iniciando quiz...');
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        this.quizCompleted = false;
        this.selectedAnswer = null;
        
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
        
        // Resetar seleção e estado
        this.selectedAnswer = null;
        this.quizCompleted = false;
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
            nextBtn.disabled = this.selectedAnswer === null || this.quizCompleted;
        }
    }

    nextQuestion() {
        if (this.selectedAnswer === null || this.quizCompleted) {
            console.log('Próxima pergunta bloqueada - sem resposta ou já processada');
            return;
        }
        
        // Prevenir múltiplas execuções
        this.quizCompleted = true;
        
        const question = this.questions[this.currentQuestion];
        const isCorrect = this.selectedAnswer === question.correct;
        
        console.log(`Pergunta ${this.currentQuestion + 1}: Resposta ${isCorrect ? 'Correta' : 'Incorreta'} (${this.correctAnswers} corretas até agora)`);
        
        if (isCorrect) {
            this.correctAnswers++;
            this.score += 100;
            console.log(`Acerto! Total: ${this.correctAnswers} corretas, ${this.score} pontos`);
        }
        
        // Mostrar feedback visual
        this.showAnswerFeedback(isCorrect);
        
        // Avançar para próxima questão após delay
        setTimeout(() => {
            this.currentQuestion++;
            this.quizCompleted = false; // Reativar para próxima pergunta
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
        
        // Garantir que os valores sejam válidos
        const validCorrectAnswers = Math.max(0, Math.min(this.correctAnswers, this.questions.length));
        const accuracy = this.questions.length > 0 ? Math.round((validCorrectAnswers / this.questions.length) * 100) : 0;
        const finalScore = validCorrectAnswers * 100;
        
        console.log(`Resultados: ${validCorrectAnswers}/${this.questions.length} corretas, ${accuracy}% de precisão, ${finalScore} pontos`);
        
        // Atualizar elementos de resultado
        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('correct-answers').textContent = `${validCorrectAnswers}/${this.questions.length}`;
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
        
        // Reset completo de todas as variáveis
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.startTime = Date.now();
        this.quizCompleted = false;
        this.selectedAnswer = null;
        
        this.showQuestion();
        this.updateProgress();
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
