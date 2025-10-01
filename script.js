// AirQuest - Sistema de Qualidade do Ar
class AirQuest {
    constructor() {
        this.currentScreen = 'home-screen';
        this.quizData = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.globe = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.airQualityData = {};
        this.nasaAPI = new NASAAPI();
        
        this.init();
    }

    init() {
        this.createParticles();
        this.setupEventListeners();
        this.loadQuizData();
        this.loadAirQualityData();
    }

    // Sistema de Partículas
    createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posição aleatória
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Tamanho aleatório
            const size = Math.random() * 4 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Delay de animação aleatório
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
            
            container.appendChild(particle);
        }
    }

    // Navegação entre telas
    showScreen(screenId) {
        // Esconder todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar tela selecionada
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        // Ações específicas por tela
        if (screenId === 'globe-screen') {
            this.initGlobe();
        } else if (screenId === 'intro-screen') {
            this.animateStoryCards();
        }
    }

    showHome() {
        this.showScreen('home-screen');
    }

    showIntro() {
        this.showScreen('intro-screen');
    }

    showGlobe() {
        this.showScreen('globe-screen');
    }

    showQuiz() {
        this.showScreen('quiz-screen');
        this.startQuiz();
    }

    // Animações dos cards de storytelling
    animateStoryCards() {
        const cards = document.querySelectorAll('.story-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 300);
        });
    }

    // Globo 3D com Three.js
    initGlobe() {
        if (this.globe) return; // Já inicializado

        const canvas = document.getElementById('globe-canvas');
        const container = canvas.parentElement;
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 3;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        
        // Luzes
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Criar globo
        this.createGlobe();
        
        // Animar
        this.animateGlobe();
        
        // Event listeners para camadas
        this.setupGlobeControls();
    }

    createGlobe() {
        // Geometria da esfera
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Material com textura da Terra
        const material = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.8
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        // Adicionar pontos de dados de qualidade do ar
        this.addAirQualityPoints();
    }

    addAirQualityPoints() {
        // Dados simulados de qualidade do ar para diferentes cidades
        const cities = [
            { name: 'São Paulo', lat: -23.5505, lng: -46.6333, aqi: 85, status: 'moderate' },
            { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, aqi: 65, status: 'good' },
            { name: 'Nova York', lat: 40.7128, lng: -74.0060, aqi: 45, status: 'good' },
            { name: 'Londres', lat: 51.5074, lng: -0.1278, aqi: 55, status: 'good' },
            { name: 'Pequim', lat: 39.9042, lng: 116.4074, aqi: 120, status: 'bad' },
            { name: 'Delhi', lat: 28.7041, lng: 77.1025, aqi: 150, status: 'bad' },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, aqi: 75, status: 'moderate' },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, aqi: 95, status: 'moderate' }
        ];

        cities.forEach(city => {
            const point = this.createCityPoint(city);
            this.scene.add(point);
        });
    }

    createCityPoint(city) {
        // Converter coordenadas para posição 3D
        const phi = (90 - city.lat) * (Math.PI / 180);
        const theta = (city.lng + 180) * (Math.PI / 180);
        
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        
        // Cor baseada na qualidade do ar
        let color = 0x00ff88; // Verde - bom
        if (city.aqi > 100) color = 0xff4444; // Vermelho - ruim
        else if (city.aqi > 50) color = 0xffaa00; // Amarelo - moderado
        
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const point = new THREE.Mesh(geometry, material);
        
        point.position.set(x, y, z);
        point.userData = city;
        
        // Adicionar hover effect
        point.onClick = () => this.showCityInfo(city);
        
        return point;
    }

    showCityInfo(city) {
        const statusElement = document.getElementById('air-status');
        const locationElement = document.getElementById('location-text');
        
        statusElement.className = `status-indicator status-${city.status}`;
        locationElement.textContent = `${city.name}: AQI ${city.aqi} (${this.getStatusText(city.status)})`;
        
        // Animação de zoom para a cidade
        this.zoomToCity(city);
    }

    getStatusText(status) {
        const statusTexts = {
            'good': 'Bom',
            'moderate': 'Moderado',
            'bad': 'Ruim'
        };
        return statusTexts[status] || 'Desconhecido';
    }

    zoomToCity(city) {
        // Animação suave para a cidade
        const targetPosition = new THREE.Vector3();
        targetPosition.setFromSphericalCoords(1.5, city.lat * Math.PI / 180, city.lng * Math.PI / 180);
        
        // Animação da câmera
        const startPosition = this.camera.position.clone();
        const duration = 1000; // 1 segundo
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, progress);
            this.controls.target.lerp(new THREE.Vector3(0, 0, 0), progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    animateGlobe() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotação suave do globo
            if (this.globe) {
                this.globe.rotation.y += 0.001;
            }
            
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    setupGlobeControls() {
        // Event listeners para as camadas
        document.getElementById('aqi-layer').addEventListener('change', (e) => {
            this.toggleLayer('aqi', e.target.checked);
        });
        
        document.getElementById('pollutants-layer').addEventListener('change', (e) => {
            this.toggleLayer('pollutants', e.target.checked);
        });
        
        document.getElementById('fires-layer').addEventListener('change', (e) => {
            this.toggleLayer('fires', e.target.checked);
        });
        
        document.getElementById('transport-layer').addEventListener('change', (e) => {
            this.toggleLayer('transport', e.target.checked);
        });
    }

    toggleLayer(layerType, visible) {
        // Implementar lógica para mostrar/ocultar camadas
        console.log(`Toggling ${layerType} layer:`, visible);
    }

    // Sistema de Quiz
    loadQuizData() {
        this.quizData = [
            {
                question: "Qual poluente é mais perigoso para crianças?",
                answers: [
                    "MP2.5 (Material Particulado fino)",
                    "Dióxido de Nitrogênio (NO₂)",
                    "Ozônio (O₃)",
                    "Monóxido de Carbono (CO)"
                ],
                correct: 0,
                explanation: "MP2.5 são partículas tão pequenas que penetram profundamente nos pulmões e podem causar problemas respiratórios graves em crianças."
            },
            {
                question: "Quantas pessoas morrem por ano devido à poluição do ar?",
                answers: [
                    "2 milhões",
                    "4 milhões", 
                    "7 milhões",
                    "10 milhões"
                ],
                correct: 2,
                explanation: "Segundo a OMS, cerca de 7 milhões de pessoas morrem anualmente por doenças relacionadas à poluição do ar."
            },
            {
                question: "Qual cidade tem o ar mais poluído hoje?",
                answers: [
                    "São Paulo",
                    "Pequim",
                    "Delhi",
                    "Los Angeles"
                ],
                correct: 2,
                explanation: "Delhi frequentemente apresenta os piores índices de qualidade do ar do mundo, com AQI acima de 150."
            },
            {
                question: "Se 100 pessoas trocassem carro por bicicleta 2x/semana, quantos kg de CO₂ seriam evitados por ano?",
                answers: [
                    "500 kg",
                    "1.200 kg",
                    "2.400 kg",
                    "4.800 kg"
                ],
                correct: 2,
                explanation: "Cada pessoa economiza cerca de 24kg de CO₂ por ano ao trocar carro por bicicleta 2x/semana, totalizando 2.400kg para 100 pessoas."
            },
            {
                question: "Qual satélite da NASA monitora poluentes atmosféricos?",
                answers: [
                    "Terra",
                    "TEMPO",
                    "Aura",
                    "Aqua"
                ],
                correct: 1,
                explanation: "O satélite TEMPO (Tropospheric Emissions: Monitoring of Pollution) da NASA monitora poluentes atmosféricos em tempo real."
            }
        ];
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.showQuestion();
    }

    showQuestion() {
        const question = this.quizData[this.currentQuestion];
        
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('question-counter').textContent = `${this.currentQuestion + 1} de ${this.quizData.length}`;
        
        // Atualizar barra de progresso
        const progress = ((this.currentQuestion + 1) / this.quizData.length) * 100;
        document.getElementById('quiz-progress').style.width = progress + '%';
        
        // Criar botões de resposta
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.onclick = () => this.selectAnswer(index);
            answersContainer.appendChild(button);
        });
        
        // Esconder feedback
        document.getElementById('quiz-feedback').classList.remove('show');
        document.getElementById('quiz-results').style.display = 'none';
    }

    selectAnswer(selectedIndex) {
        const question = this.quizData[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.score += 10;
        }
        
        // Mostrar feedback visual
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach((button, index) => {
            button.disabled = true;
            if (index === question.correct) {
                button.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                button.classList.add('incorrect');
            }
        });
        
        // Mostrar feedback textual
        const feedback = document.getElementById('quiz-feedback');
        feedback.textContent = isCorrect ? '✅ Correto!' : `❌ Incorreto! ${question.explanation}`;
        feedback.className = `quiz-feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Próxima pergunta após delay
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.quizData.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        document.getElementById('quiz-results').style.display = 'block';
        
        // Calcular medalha
        const percentage = (this.score / (this.quizData.length * 10)) * 100;
        let medal = '🥉';
        let medalText = 'Bronze';
        
        if (percentage >= 80) {
            medal = '🥇';
            medalText = 'Ouro';
        } else if (percentage >= 60) {
            medal = '🥈';
            medalText = 'Prata';
        }
        
        document.getElementById('medal-display').textContent = medal;
        document.getElementById('final-score').textContent = this.score;
        
        // Simular ranking
        const ranking = Math.floor(Math.random() * 100) + 1;
        document.getElementById('user-ranking').textContent = `#${ranking}`;
        
        // Salvar score localmente
        this.saveScore(this.score);
    }

    restartQuiz() {
        this.startQuiz();
    }

    saveScore(score) {
        const scores = JSON.parse(localStorage.getItem('airquest-scores') || '[]');
        scores.push({
            score: score,
            date: new Date().toISOString()
        });
        
        // Manter apenas os 10 melhores scores
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10);
        
        localStorage.setItem('airquest-scores', JSON.stringify(scores));
    }

    // Dados de qualidade do ar
    async loadAirQualityData() {
        try {
            // Carregar dados reais da NASA
            const nasaData = await this.nasaAPI.getAllData();
            this.airQualityData = nasaData;
            
            // Atualizar interface com dados reais
            this.updateAirQualityDisplay(nasaData);
        } catch (error) {
            console.error('Erro ao carregar dados da NASA:', error);
            // Usar dados simulados como fallback
            this.airQualityData = {
                'sao-paulo': { aqi: 85, status: 'moderate', pollutants: { pm25: 25, no2: 45, o3: 30 } },
                'rio-de-janeiro': { aqi: 65, status: 'good', pollutants: { pm25: 15, no2: 30, o3: 25 } },
                'nova-york': { aqi: 45, status: 'good', pollutants: { pm25: 12, no2: 25, o3: 20 } },
                'londres': { aqi: 55, status: 'good', pollutants: { pm25: 18, no2: 35, o3: 22 } },
                'pequim': { aqi: 120, status: 'bad', pollutants: { pm25: 45, no2: 80, o3: 60 } },
                'delhi': { aqi: 150, status: 'bad', pollutants: { pm25: 60, no2: 90, o3: 70 } }
            };
        }
    }

    updateAirQualityDisplay(data) {
        // Atualizar informações de qualidade do ar na interface
        if (data.tempo && data.tempo.regions) {
            console.log('Dados TEMPO carregados:', data.tempo.regions);
        }
        
        if (data.fires && data.fires.statistics) {
            console.log('Dados de queimadas:', data.fires.statistics);
        }
        
        if (data.openAQ && data.openAQ.measurements) {
            console.log('Dados OpenAQ:', data.openAQ.measurements);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Botão de fontes da NASA
        document.querySelector('.sources-btn').addEventListener('click', this.toggleSources);
        
        // Redimensionamento da janela
        window.addEventListener('resize', () => {
            if (this.renderer && this.camera) {
                const container = document.getElementById('globe-canvas').parentElement;
                this.camera.aspect = container.clientWidth / container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    }

    toggleSources() {
        const content = document.getElementById('sources-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    window.airQuest = new AirQuest();
    
    // Funções globais para navegação
    window.showHome = () => window.airQuest.showHome();
    window.showIntro = () => window.airQuest.showIntro();
    window.showGlobe = () => window.airQuest.showGlobe();
    window.showQuiz = () => window.airQuest.showQuiz();
    window.restartQuiz = () => window.airQuest.restartQuiz();
    window.toggleSources = () => window.airQuest.toggleSources();
});

// Adicionar efeitos visuais extras
document.addEventListener('DOMContentLoaded', () => {
    // Efeito de digitação na pergunta principal
    const mainQuestion = document.querySelector('.main-question h2');
    if (mainQuestion) {
        const text = mainQuestion.textContent;
        mainQuestion.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                mainQuestion.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // Efeito de hover nos botões CTA
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });
});
