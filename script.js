// AirQuest - Sistema de Qualidade do Ar
class AirQuest {
    constructor() {
        console.log('Construtor AirQuest chamado');
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
        console.log('Inicializando AirQuest...');
        this.createParticles();
        this.setupEventListeners();
        this.loadQuizData();
        this.loadAirQualityData();
        console.log('AirQuest inicializado');
    }

    // Sistema de Partículas
    createParticles() {
        console.log('Criando partículas...');
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
        console.log('Partículas criadas');
    }

    // Navegação entre telas
    showScreen(screenId) {
        console.log('Mostrando tela:', screenId);
        
        // Esconder todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar tela selecionada
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        console.log('Tela ativada:', screenId);
        
        // Ações específicas por tela
        if (screenId === 'globe-screen') {
            console.log('Inicializando globo...');
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
        console.log('Mostrando tela do globo...');
        this.showScreen('globe-screen');
        console.log('Tela do globo ativada');
        
        // Verificar se o HTML está carregado
        setTimeout(() => {
            const container = document.querySelector('.globe-container');
            console.log('Container do globo:', container);
            if (container) {
                console.log('Container HTML:', container.outerHTML.substring(0, 300) + '...');
            }
        }, 100);
        
        this.initGlobe();
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
        console.log('Inicializando globo...');
        
        if (this.globe) {
            console.log('Globo já inicializado');
            return; // Já inicializado
        }

        const canvas = document.getElementById('globe-canvas');
        const container = canvas.parentElement;
        
        console.log('Canvas encontrado:', canvas);
        console.log('Container:', container);
        
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
        this.camera.position.z = 1.8; // Mais próximo do globo menor
        
        console.log('Câmera criada:', this.camera);
        console.log('Posição da câmera:', this.camera.position);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true 
        });
        // Ajustar tamanho do renderer (menor para dar espaço aos controles)
        const canvasWidth = Math.min(container.clientWidth * 0.6, 800);
        const canvasHeight = Math.min(container.clientHeight * 0.8, 600);
        this.renderer.setSize(canvasWidth, canvasHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        console.log('Renderer criado:', this.renderer);
        console.log('Tamanho do renderer:', this.renderer.getSize());
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 1.5;
        this.controls.maxDistance = 10;
        
        console.log('Controles criados:', this.controls);
        
        // Luzes
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Luz do sol
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(10, 10, 5);
        this.scene.add(sunLight);
        
        console.log('Luzes adicionadas à cena');
        console.log('Número de objetos na cena:', this.scene.children.length);
        
        // Criar globo
        this.createGlobe();
        
        // Animar
        this.animateGlobe();
        
        // Event listeners para camadas
        this.setupGlobeControls();
        
        // Inicializar sistema de heatmap
        this.initHeatmapSystem();
        
        // Adicionar estrelas de fundo (desabilitado temporariamente)
        // this.createStarField();
    }

    createGlobe() {
        console.log('Criando globo...');
        
        try {
            // Geometria da esfera com mais detalhes
            const geometry = new THREE.SphereGeometry(1.2, 64, 64);
            
            // Criar textura da Terra usando canvas
            const earthTexture = this.createEarthTexture();
            
            // Material da Terra com textura
            this.earthMaterial = new THREE.MeshPhongMaterial({
                map: earthTexture,
                transparent: false,
                opacity: 1.0
            });
            
            // Criar o globo
            this.globe = new THREE.Mesh(geometry, this.earthMaterial);
            this.globe.castShadow = true;
            this.globe.receiveShadow = true;
            
            // Adicionar à cena
            this.scene.add(this.globe);
            
            console.log('Globo com países criado e adicionado à cena');
            console.log('Globo posição:', this.globe.position);
            console.log('Globo visível:', this.globe.visible);
            
        } catch (error) {
            console.error('Erro ao criar globo:', error);
        }
        
        // Inicializar sistema de dados (simplificado)
        this.dataPoints = [];
    }

    createEarthTexture() {
        console.log('Criando textura da Terra...');
        
        // Criar canvas para a textura
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Fundo azul oceano
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar continentes simplificados
        this.drawContinents(ctx, canvas.width, canvas.height);
        
        // Criar textura Three.js
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        console.log('Textura da Terra criada');
        return texture;
    }

    drawContinents(ctx, width, height) {
        // Cores dos continentes
        const continentColor = '#22c55e';
        const borderColor = '#16a34a';
        
        ctx.fillStyle = continentColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        
        // América do Norte
        this.drawNorthAmerica(ctx, width, height);
        
        // América do Sul
        this.drawSouthAmerica(ctx, width, height);
        
        // Europa
        this.drawEurope(ctx, width, height);
        
        // África
        this.drawAfrica(ctx, width, height);
        
        // Ásia
        this.drawAsia(ctx, width, height);
        
        // Oceania
        this.drawOceania(ctx, width, height);
    }

    drawNorthAmerica(ctx, width, height) {
        ctx.beginPath();
        // Canadá
        ctx.ellipse(width * 0.15, height * 0.25, width * 0.08, height * 0.15, 0, 0, 2 * Math.PI);
        // EUA
        ctx.ellipse(width * 0.2, height * 0.4, width * 0.1, height * 0.12, 0, 0, 2 * Math.PI);
        // México
        ctx.ellipse(width * 0.18, height * 0.55, width * 0.06, height * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawSouthAmerica(ctx, width, height) {
        ctx.beginPath();
        // Brasil
        ctx.ellipse(width * 0.25, height * 0.7, width * 0.08, height * 0.2, 0, 0, 2 * Math.PI);
        // Argentina
        ctx.ellipse(width * 0.22, height * 0.85, width * 0.05, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawEurope(ctx, width, height) {
        ctx.beginPath();
        // Europa Ocidental
        ctx.ellipse(width * 0.48, height * 0.3, width * 0.06, height * 0.08, 0, 0, 2 * Math.PI);
        // Europa Oriental
        ctx.ellipse(width * 0.55, height * 0.25, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawAfrica(ctx, width, height) {
        ctx.beginPath();
        // África
        ctx.ellipse(width * 0.52, height * 0.6, width * 0.06, height * 0.25, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawAsia(ctx, width, height) {
        ctx.beginPath();
        // China
        ctx.ellipse(width * 0.65, height * 0.35, width * 0.12, height * 0.15, 0, 0, 2 * Math.PI);
        // Índia
        ctx.ellipse(width * 0.62, height * 0.5, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        // Rússia
        ctx.ellipse(width * 0.7, height * 0.2, width * 0.15, height * 0.12, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawOceania(ctx, width, height) {
        ctx.beginPath();
        // Austrália
        ctx.ellipse(width * 0.75, height * 0.75, width * 0.08, height * 0.06, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    createAtmosphere() {
        // Criar atmosfera ao redor da Terra
        const atmosphereGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }

    createStarField() {
        // Criar campo de estrelas de fundo
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 2000;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    // Sistema de mapa de calor
    initHeatmapSystem() {
        console.log('Inicializando sistema de heatmap...');
        
        this.heatmapOverlay = null;
        this.heatmapData = this.generateHeatmapData();
        this.currentHeatmapType = 'aqi';
        this.heatmapMaterial = null;
        
        // Aguardar um pouco antes de criar o overlay
        setTimeout(() => {
            this.createHeatmapOverlay();
        }, 100);
        
        console.log('Sistema de heatmap inicializado');
    }

    generateHeatmapData() {
        // Gerar dados de mapa de calor para diferentes regiões
        return {
            aqi: this.generateAQIHeatmapData(),
            pollutants: this.generatePollutantHeatmapData(),
            fires: this.generateFireHeatmapData(),
            temperature: this.generateTemperatureHeatmapData(),
            humidity: this.generateHumidityHeatmapData()
        };
    }

    generateAQIHeatmapData() {
        // Dados de AQI por região (lat, lng, intensity)
        return [
            // América do Sul - Alta poluição
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo' },
            { lat: -22.9068, lng: -43.1729, intensity: 0.6, region: 'Rio de Janeiro' },
            { lat: -34.6118, lng: -58.3960, intensity: 0.7, region: 'Buenos Aires' },
            
            // América do Norte - Moderada
            { lat: 40.7128, lng: -74.0060, intensity: 0.4, region: 'Nova York' },
            { lat: 34.0522, lng: -118.2437, intensity: 0.7, region: 'Los Angeles' },
            { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'México City' },
            
            // Europa - Boa qualidade
            { lat: 51.5074, lng: -0.1278, intensity: 0.5, region: 'Londres' },
            { lat: 48.8566, lng: 2.3522, intensity: 0.4, region: 'Paris' },
            { lat: 52.5200, lng: 13.4050, intensity: 0.3, region: 'Berlim' },
            
            // Ásia - Crítica
            { lat: 39.9042, lng: 116.4074, intensity: 1.0, region: 'Pequim' },
            { lat: 28.7041, lng: 77.1025, intensity: 1.0, region: 'Delhi' },
            { lat: 19.0760, lng: 72.8777, intensity: 0.9, region: 'Mumbai' },
            { lat: 35.6762, lng: 139.6503, intensity: 0.3, region: 'Tóquio' },
            
            // África - Alta poluição
            { lat: 30.0444, lng: 31.2357, intensity: 0.9, region: 'Cairo' },
            { lat: 6.5244, lng: 3.3792, intensity: 0.8, region: 'Lagos' },
            
            // Oceania - Boa qualidade
            { lat: -33.8688, lng: 151.2093, intensity: 0.2, region: 'Sydney' },
            { lat: -37.8136, lng: 144.9631, intensity: 0.3, region: 'Melbourne' }
        ];
    }

    generatePollutantHeatmapData() {
        // Dados de poluentes por região
        return [
            // Regiões com alta concentração de MP2.5
            { lat: 39.9042, lng: 116.4074, intensity: 1.0, region: 'Pequim - MP2.5' },
            { lat: 28.7041, lng: 77.1025, intensity: 1.0, region: 'Delhi - MP2.5' },
            { lat: 19.0760, lng: 72.8777, intensity: 0.8, region: 'Mumbai - MP2.5' },
            { lat: -23.5505, lng: -46.6333, intensity: 0.7, region: 'São Paulo - MP2.5' },
            { lat: 19.4326, lng: -99.1332, intensity: 0.8, region: 'México City - MP2.5' },
            
            // Regiões com alta concentração de NO2
            { lat: 40.7128, lng: -74.0060, intensity: 0.6, region: 'Nova York - NO2' },
            { lat: 34.0522, lng: -118.2437, intensity: 0.7, region: 'Los Angeles - NO2' },
            { lat: 51.5074, lng: -0.1278, intensity: 0.5, region: 'Londres - NO2' },
            
            // Regiões com alta concentração de O3
            { lat: 30.0444, lng: 31.2357, intensity: 0.8, region: 'Cairo - O3' },
            { lat: 6.5244, lng: 3.3792, intensity: 0.7, region: 'Lagos - O3' }
        ];
    }

    generateFireHeatmapData() {
        // Dados de queimadas por região
        return [
            // Amazônia - Crítica
            { lat: -3.4653, lng: -62.2159, intensity: 1.0, region: 'Amazônia' },
            { lat: -4.2634, lng: -63.2972, intensity: 0.9, region: 'Amazônia' },
            { lat: -2.1631, lng: -60.0219, intensity: 1.0, region: 'Amazônia' },
            
            // África Central - Alta
            { lat: -2.1631, lng: 15.8277, intensity: 0.8, region: 'África Central' },
            { lat: 0.7893, lng: 20.2197, intensity: 0.9, region: 'África Central' },
            
            // Austrália - Moderada
            { lat: -25.2744, lng: 133.7751, intensity: 0.6, region: 'Austrália' },
            { lat: -33.8688, lng: 151.2093, intensity: 0.5, region: 'Austrália' },
            
            // Sibéria - Crítica
            { lat: 61.5240, lng: 105.3188, intensity: 1.0, region: 'Sibéria' },
            { lat: 55.7558, lng: 37.6176, intensity: 0.7, region: 'Rússia' },
            
            // Califórnia - Moderada
            { lat: 34.0522, lng: -118.2437, intensity: 0.6, region: 'Califórnia' },
            { lat: 37.7749, lng: -122.4194, intensity: 0.5, region: 'Califórnia' }
        ];
    }

    generateTemperatureHeatmapData() {
        // Dados de temperatura por região
        return [
            // Regiões tropicais - Quentes
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo - 28°C' },
            { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'México City - 25°C' },
            { lat: 30.0444, lng: 31.2357, intensity: 1.0, region: 'Cairo - 32°C' },
            { lat: 6.5244, lng: 3.3792, intensity: 0.8, region: 'Lagos - 28°C' },
            
            // Regiões temperadas - Moderadas
            { lat: 40.7128, lng: -74.0060, intensity: 0.3, region: 'Nova York - 15°C' },
            { lat: 51.5074, lng: -0.1278, intensity: 0.2, region: 'Londres - 12°C' },
            { lat: 35.6762, lng: 139.6503, intensity: 0.4, region: 'Tóquio - 18°C' },
            
            // Regiões frias - Baixas
            { lat: 61.5240, lng: 105.3188, intensity: 0.1, region: 'Sibéria - 5°C' },
            { lat: 55.7558, lng: 37.6176, intensity: 0.2, region: 'Rússia - 8°C' },
            
            // Oceania - Moderadas
            { lat: -33.8688, lng: 151.2093, intensity: 0.6, region: 'Sydney - 22°C' },
            { lat: -37.8136, lng: 144.9631, intensity: 0.5, region: 'Melbourne - 20°C' }
        ];
    }

    generateHumidityHeatmapData() {
        // Dados de umidade por região
        return [
            // Regiões úmidas - Altas
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo - 75%' },
            { lat: 51.5074, lng: -0.1278, intensity: 1.0, region: 'Londres - 80%' },
            { lat: 35.6762, lng: 139.6503, intensity: 0.9, region: 'Tóquio - 70%' },
            { lat: -33.8688, lng: 151.2093, intensity: 0.7, region: 'Sydney - 65%' },
            
            // Regiões secas - Baixas
            { lat: 30.0444, lng: 31.2357, intensity: 0.2, region: 'Cairo - 40%' },
            { lat: 39.9042, lng: 116.4074, intensity: 0.3, region: 'Pequim - 45%' },
            { lat: 6.5244, lng: 3.3792, intensity: 0.6, region: 'Lagos - 55%' },
            
            // Regiões moderadas
            { lat: 40.7128, lng: -74.0060, intensity: 0.6, region: 'Nova York - 60%' },
            { lat: 19.4326, lng: -99.1332, intensity: 0.5, region: 'México City - 55%' },
            { lat: 28.7041, lng: 77.1025, intensity: 0.7, region: 'Delhi - 65%' }
        ];
    }

    generateGlobalData() {
        // Gerar dados fictícios para diferentes categorias
        this.globalData = {
            aqi: this.generateAQIData(),
            pollutants: this.generatePollutantData(),
            fires: this.generateFireData(),
            temperature: this.generateTemperatureData(),
            humidity: this.generateHumidityData()
        };
    }

    // Sistema de mapa de calor
    createHeatmapOverlay() {
        console.log('Criando overlay de heatmap...');
        
        // Criar sobreposição de mapa de calor
        const geometry = new THREE.SphereGeometry(1.21, 128, 128);
        
        // Material transparente para o mapa de calor
        this.heatmapMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        this.heatmapOverlay = new THREE.Mesh(geometry, this.heatmapMaterial);
        this.scene.add(this.heatmapOverlay);
        
        // Aplicar mapa de calor inicial
        this.applyHeatmap('aqi');
        
        console.log('Overlay de heatmap criado');
    }

    applyHeatmap(type) {
        console.log('Aplicando heatmap:', type);
        this.currentHeatmapType = type;
        const data = this.heatmapData[type];
        
        // Criar textura de mapa de calor
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Limpar canvas
        ctx.clearRect(0, 0, 1024, 512);
        
        // Aplicar dados de mapa de calor
        data.forEach(point => {
            this.drawHeatmapPoint(ctx, point, type);
        });
        
        // Criar textura a partir do canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        // Aplicar textura ao material
        this.heatmapMaterial.map = texture;
        this.heatmapMaterial.needsUpdate = true;
        
        // Atualizar interface
        this.updateHeatmapInfo(type);
        
        console.log('Heatmap aplicado:', type);
    }

    drawHeatmapPoint(ctx, point, type) {
        // Converter coordenadas para posição na textura
        const x = ((point.lng + 180) / 360) * 1024;
        const y = ((90 - point.lat) / 180) * 512;
        
        // Criar gradiente radial baseado na intensidade
        const radius = 40 + (point.intensity * 80); // Raio maior para melhor visibilidade
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Cores baseadas no tipo de dados
        const colors = this.getHeatmapColors(type, point.intensity);
        
        gradient.addColorStop(0, colors.center);
        gradient.addColorStop(0.3, colors.middle);
        gradient.addColorStop(0.7, colors.edge);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Adicionar efeito de brilho no centro
        const glowRadius = radius * 0.3;
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glowGradient.addColorStop(0, colors.center);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    getHeatmapColors(type, intensity) {
        switch (type) {
            case 'aqi':
                if (intensity <= 0.3) {
                    return { center: 'rgba(0, 255, 136, 0.8)', middle: 'rgba(0, 255, 136, 0.4)', edge: 'rgba(0, 255, 136, 0.1)' };
                } else if (intensity <= 0.6) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else if (intensity <= 0.8) {
                    return { center: 'rgba(255, 102, 0, 0.8)', middle: 'rgba(255, 102, 0, 0.4)', edge: 'rgba(255, 102, 0, 0.1)' };
                } else {
                    return { center: 'rgba(255, 68, 68, 0.8)', middle: 'rgba(255, 68, 68, 0.4)', edge: 'rgba(255, 68, 68, 0.1)' };
                }
                
            case 'pollutants':
                return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                
            case 'fires':
                if (intensity <= 0.5) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else if (intensity <= 0.8) {
                    return { center: 'rgba(255, 102, 0, 0.8)', middle: 'rgba(255, 102, 0, 0.4)', edge: 'rgba(255, 102, 0, 0.1)' };
                } else {
                    return { center: 'rgba(255, 68, 68, 0.8)', middle: 'rgba(255, 68, 68, 0.4)', edge: 'rgba(255, 68, 68, 0.1)' };
                }
                
            case 'temperature':
                if (intensity <= 0.3) {
                    return { center: 'rgba(0, 102, 255, 0.8)', middle: 'rgba(0, 102, 255, 0.4)', edge: 'rgba(0, 102, 255, 0.1)' };
                } else if (intensity <= 0.6) {
                    return { center: 'rgba(0, 255, 136, 0.8)', middle: 'rgba(0, 255, 136, 0.4)', edge: 'rgba(0, 255, 136, 0.1)' };
                } else if (intensity <= 0.8) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else {
                    return { center: 'rgba(255, 68, 68, 0.8)', middle: 'rgba(255, 68, 68, 0.4)', edge: 'rgba(255, 68, 68, 0.1)' };
                }
                
            case 'humidity':
                if (intensity <= 0.3) {
                    return { center: 'rgba(255, 102, 0, 0.8)', middle: 'rgba(255, 102, 0, 0.4)', edge: 'rgba(255, 102, 0, 0.1)' };
                } else if (intensity <= 0.6) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else {
                    return { center: 'rgba(0, 102, 255, 0.8)', middle: 'rgba(0, 102, 255, 0.4)', edge: 'rgba(0, 102, 255, 0.1)' };
                }
                
            default:
                return { center: 'rgba(255, 255, 255, 0.8)', middle: 'rgba(255, 255, 255, 0.4)', edge: 'rgba(255, 255, 255, 0.1)' };
        }
    }

    updateHeatmapInfo(type) {
        const info = {
            aqi: { name: 'AQI (Índice de Qualidade do Ar)', description: 'Verde = Bom, Amarelo = Moderado, Laranja = Insalubre, Vermelho = Perigoso' },
            pollutants: { name: 'Poluentes Atmosféricos', description: 'Concentração de MP2.5, NO₂, O₃, CO' },
            fires: { name: 'Focos de Queimadas', description: 'Amarelo = Baixo, Laranja = Moderado, Vermelho = Alto' },
            temperature: { name: 'Temperatura Global', description: 'Azul = Frio, Verde = Agradável, Amarelo = Quente, Vermelho = Muito Quente' },
            humidity: { name: 'Umidade Relativa', description: 'Laranja = Seco, Amarelo = Moderado, Azul = Úmido' }
        };
        
        const currentInfo = info[type];
        console.log(`Mapa de Calor: ${currentInfo.name}`);
        console.log(`Descrição: ${currentInfo.description}`);
    }

    generateAQIData() {
        // Dados de AQI (Air Quality Index) para cidades globais
        const cities = [
            // América do Sul
            { name: 'São Paulo', lat: -23.5505, lng: -46.6333, aqi: 85, status: 'moderate', country: 'Brasil' },
            { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, aqi: 65, status: 'good', country: 'Brasil' },
            { name: 'Buenos Aires', lat: -34.6118, lng: -58.3960, aqi: 70, status: 'good', country: 'Argentina' },
            { name: 'Lima', lat: -12.0464, lng: -77.0428, aqi: 90, status: 'moderate', country: 'Peru' },
            
            // América do Norte
            { name: 'Nova York', lat: 40.7128, lng: -74.0060, aqi: 45, status: 'good', country: 'EUA' },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, aqi: 75, status: 'moderate', country: 'EUA' },
            { name: 'México City', lat: 19.4326, lng: -99.1332, aqi: 110, status: 'unhealthy', country: 'México' },
            { name: 'Toronto', lat: 43.6532, lng: -79.3832, aqi: 55, status: 'good', country: 'Canadá' },
            
            // Europa
            { name: 'Londres', lat: 51.5074, lng: -0.1278, aqi: 55, status: 'good', country: 'Reino Unido' },
            { name: 'Paris', lat: 48.8566, lng: 2.3522, aqi: 60, status: 'good', country: 'França' },
            { name: 'Berlim', lat: 52.5200, lng: 13.4050, aqi: 50, status: 'good', country: 'Alemanha' },
            { name: 'Madrid', lat: 40.4168, lng: -3.7038, aqi: 65, status: 'good', country: 'Espanha' },
            
            // Ásia
            { name: 'Pequim', lat: 39.9042, lng: 116.4074, aqi: 120, status: 'unhealthy', country: 'China' },
            { name: 'Delhi', lat: 28.7041, lng: 77.1025, aqi: 150, status: 'hazardous', country: 'Índia' },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, aqi: 95, status: 'moderate', country: 'Índia' },
            { name: 'Tóquio', lat: 35.6762, lng: 139.6503, aqi: 40, status: 'good', country: 'Japão' },
            { name: 'Seul', lat: 37.5665, lng: 126.9780, aqi: 80, status: 'moderate', country: 'Coreia do Sul' },
            
            // África
            { name: 'Cairo', lat: 30.0444, lng: 31.2357, aqi: 100, status: 'unhealthy', country: 'Egito' },
            { name: 'Lagos', lat: 6.5244, lng: 3.3792, aqi: 85, status: 'moderate', country: 'Nigéria' },
            { name: 'Joanesburgo', lat: -26.2041, lng: 28.0473, aqi: 70, status: 'good', country: 'África do Sul' },
            
            // Oceania
            { name: 'Sydney', lat: -33.8688, lng: 151.2093, aqi: 35, status: 'good', country: 'Austrália' },
            { name: 'Melbourne', lat: -37.8136, lng: 144.9631, aqi: 45, status: 'good', country: 'Austrália' }
        ];

        return cities;
    }

    generatePollutantData() {
        // Dados de poluentes específicos
        const pollutants = [
            { name: 'São Paulo', lat: -23.5505, lng: -46.6333, pm25: 25, no2: 45, o3: 30, co: 2.5, country: 'Brasil' },
            { name: 'Pequim', lat: 39.9042, lng: 116.4074, pm25: 60, no2: 80, o3: 70, co: 5.2, country: 'China' },
            { name: 'Delhi', lat: 28.7041, lng: 77.1025, pm25: 75, no2: 90, o3: 85, co: 6.8, country: 'Índia' },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, pm25: 20, no2: 35, o3: 55, co: 1.8, country: 'EUA' },
            { name: 'Londres', lat: 51.5074, lng: -0.1278, pm25: 15, no2: 30, o3: 25, co: 1.2, country: 'Reino Unido' },
            { name: 'México City', lat: 19.4326, lng: -99.1332, pm25: 35, no2: 65, o3: 45, co: 3.5, country: 'México' },
            { name: 'Cairo', lat: 30.0444, lng: 31.2357, pm25: 40, no2: 70, o3: 50, co: 4.2, country: 'Egito' },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, pm25: 30, no2: 55, o3: 40, co: 2.8, country: 'Índia' }
        ];

        return pollutants;
    }

    generateFireData() {
        // Dados de focos de queimadas
        const fires = [
            // Amazônia
            { lat: -3.4653, lng: -62.2159, intensity: 85, confidence: 95, region: 'Amazônia' },
            { lat: -4.2634, lng: -63.2972, intensity: 75, confidence: 90, region: 'Amazônia' },
            { lat: -2.1631, lng: -60.0219, intensity: 90, confidence: 98, region: 'Amazônia' },
            
            // África Central
            { lat: -2.1631, lng: 15.8277, intensity: 70, confidence: 85, region: 'África Central' },
            { lat: 0.7893, lng: 20.2197, intensity: 80, confidence: 92, region: 'África Central' },
            
            // Austrália
            { lat: -25.2744, lng: 133.7751, intensity: 60, confidence: 88, region: 'Austrália' },
            { lat: -33.8688, lng: 151.2093, intensity: 45, confidence: 75, region: 'Austrália' },
            
            // Sibéria
            { lat: 61.5240, lng: 105.3188, intensity: 95, confidence: 96, region: 'Sibéria' },
            { lat: 55.7558, lng: 37.6176, intensity: 55, confidence: 80, region: 'Rússia' },
            
            // Califórnia
            { lat: 34.0522, lng: -118.2437, intensity: 65, confidence: 85, region: 'Califórnia' },
            { lat: 37.7749, lng: -122.4194, intensity: 40, confidence: 70, region: 'Califórnia' }
        ];

        return fires;
    }

    generateTemperatureData() {
        // Dados de temperatura global
        const temperatures = [
            { lat: -23.5505, lng: -46.6333, temp: 28, city: 'São Paulo', country: 'Brasil' },
            { lat: 40.7128, lng: -74.0060, temp: 15, city: 'Nova York', country: 'EUA' },
            { lat: 51.5074, lng: -0.1278, temp: 12, city: 'Londres', country: 'Reino Unido' },
            { lat: 39.9042, lng: 116.4074, temp: 8, city: 'Pequim', country: 'China' },
            { lat: -33.8688, lng: 151.2093, temp: 22, city: 'Sydney', country: 'Austrália' },
            { lat: 19.4326, lng: -99.1332, temp: 25, city: 'México City', country: 'México' },
            { lat: 30.0444, lng: 31.2357, temp: 32, city: 'Cairo', country: 'Egito' },
            { lat: 35.6762, lng: 139.6503, temp: 18, city: 'Tóquio', country: 'Japão' }
        ];

        return temperatures;
    }

    generateHumidityData() {
        // Dados de umidade relativa
        const humidity = [
            { lat: -23.5505, lng: -46.6333, humidity: 75, city: 'São Paulo', country: 'Brasil' },
            { lat: 40.7128, lng: -74.0060, humidity: 60, city: 'Nova York', country: 'EUA' },
            { lat: 51.5074, lng: -0.1278, humidity: 80, city: 'Londres', country: 'Reino Unido' },
            { lat: 39.9042, lng: 116.4074, humidity: 45, city: 'Pequim', country: 'China' },
            { lat: -33.8688, lng: 151.2093, humidity: 65, city: 'Sydney', country: 'Austrália' },
            { lat: 19.4326, lng: -99.1332, humidity: 55, city: 'México City', country: 'México' },
            { lat: 30.0444, lng: 31.2357, humidity: 40, city: 'Cairo', country: 'Egito' },
            { lat: 35.6762, lng: 139.6503, humidity: 70, city: 'Tóquio', country: 'Japão' }
        ];

        return humidity;
    }

    // Sistema de renderização de camadas de dados
    renderDataLayers() {
        // Limpar camadas existentes
        this.clearDataLayers();
        
        // Renderizar cada camada ativa
        if (this.dataLayers.aqi.visible) {
            this.renderAQILayer();
        }
        if (this.dataLayers.pollutants.visible) {
            this.renderPollutantsLayer();
        }
        if (this.dataLayers.fires.visible) {
            this.renderFiresLayer();
        }
        if (this.dataLayers.temperature.visible) {
            this.renderTemperatureLayer();
        }
        if (this.dataLayers.humidity.visible) {
            this.renderHumidityLayer();
        }
    }

    clearDataLayers() {
        // Remover todos os pontos de dados existentes
        this.dataLayers.aqi.points.forEach(point => this.scene.remove(point));
        this.dataLayers.pollutants.points.forEach(point => this.scene.remove(point));
        this.dataLayers.fires.points.forEach(point => this.scene.remove(point));
        this.dataLayers.temperature.points.forEach(point => this.scene.remove(point));
        this.dataLayers.humidity.points.forEach(point => this.scene.remove(point));
        
        // Limpar arrays
        this.dataLayers.aqi.points = [];
        this.dataLayers.pollutants.points = [];
        this.dataLayers.fires.points = [];
        this.dataLayers.temperature.points = [];
        this.dataLayers.humidity.points = [];
    }

    renderAQILayer() {
        this.globalData.aqi.forEach(city => {
            const point = this.createDataPoint(city, 'aqi');
            this.dataLayers.aqi.points.push(point);
            this.scene.add(point);
        });
    }

    renderPollutantsLayer() {
        this.globalData.pollutants.forEach(city => {
            const point = this.createDataPoint(city, 'pollutants');
            this.dataLayers.pollutants.points.push(point);
            this.scene.add(point);
        });
    }

    renderFiresLayer() {
        this.globalData.fires.forEach(fire => {
            const point = this.createDataPoint(fire, 'fires');
            this.dataLayers.fires.points.push(point);
            this.scene.add(point);
        });
    }

    renderTemperatureLayer() {
        this.globalData.temperature.forEach(city => {
            const point = this.createDataPoint(city, 'temperature');
            this.dataLayers.temperature.points.push(point);
            this.scene.add(point);
        });
    }

    renderHumidityLayer() {
        this.globalData.humidity.forEach(city => {
            const point = this.createDataPoint(city, 'humidity');
            this.dataLayers.humidity.points.push(point);
            this.scene.add(point);
        });
    }

    createDataPoint(data, type) {
        // Converter coordenadas para posição 3D
        const phi = (90 - data.lat) * (Math.PI / 180);
        const theta = (data.lng + 180) * (Math.PI / 180);
        
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        
        let point, color, size;
        
        switch (type) {
            case 'aqi':
                color = this.getAQIColor(data.aqi);
                size = 0.03 + (data.aqi / 200) * 0.02; // Tamanho baseado no AQI
                point = this.createSpherePoint(x, y, z, color, size, data);
                break;
                
            case 'pollutants':
                color = this.getPollutantColor(data.pm25);
                size = 0.025 + (data.pm25 / 100) * 0.03;
                point = this.createSpherePoint(x, y, z, color, size, data);
                break;
                
            case 'fires':
                color = this.getFireColor(data.intensity);
                size = 0.02 + (data.intensity / 100) * 0.04;
                point = this.createFirePoint(x, y, z, color, size, data);
                break;
                
            case 'temperature':
                color = this.getTemperatureColor(data.temp);
                size = 0.02 + Math.abs(data.temp - 20) / 50 * 0.03;
                point = this.createSpherePoint(x, y, z, color, size, data);
                break;
                
            case 'humidity':
                color = this.getHumidityColor(data.humidity);
                size = 0.02 + (data.humidity / 100) * 0.03;
                point = this.createSpherePoint(x, y, z, color, size, data);
                break;
        }
        
        return point;
    }

    createSpherePoint(x, y, z, color, size, data) {
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const point = new THREE.Mesh(geometry, material);
        
        point.position.set(x, y, z);
        point.userData = { ...data, type: 'data-point' };
        
        // Adicionar efeito de brilho
        const glowGeometry = new THREE.SphereGeometry(size * 1.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(x, y, z);
        
        const group = new THREE.Group();
        group.add(point);
        group.add(glow);
        group.userData = { ...data, type: 'data-point' };
        
        return group;
    }

    createFirePoint(x, y, z, color, size, data) {
        // Criar ponto de fogo com efeito especial
        const geometry = new THREE.SphereGeometry(size, 6, 6);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const point = new THREE.Mesh(geometry, material);
        
        point.position.set(x, y, z);
        point.userData = { ...data, type: 'fire-point' };
        
        // Adicionar efeito de chama
        const flameGeometry = new THREE.ConeGeometry(size * 0.5, size * 2, 6);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.6
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(x, y + size, z);
        flame.rotation.x = Math.PI;
        
        const group = new THREE.Group();
        group.add(point);
        group.add(flame);
        group.userData = { ...data, type: 'fire-point' };
        
        return group;
    }

    // Funções de cor baseadas nos dados
    getAQIColor(aqi) {
        if (aqi <= 50) return 0x00ff88; // Verde - bom
        if (aqi <= 100) return 0xffaa00; // Amarelo - moderado
        if (aqi <= 150) return 0xff6600; // Laranja - insalubre para grupos sensíveis
        if (aqi <= 200) return 0xff4444; // Vermelho - insalubre
        if (aqi <= 300) return 0x9900cc; // Roxo - muito insalubre
        return 0x660000; // Marrom - perigoso
    }

    getPollutantColor(pm25) {
        if (pm25 <= 15) return 0x00ff88; // Verde
        if (pm25 <= 35) return 0xffaa00; // Amarelo
        if (pm25 <= 55) return 0xff6600; // Laranja
        return 0xff4444; // Vermelho
    }

    getFireColor(intensity) {
        if (intensity <= 30) return 0xffaa00; // Amarelo
        if (intensity <= 60) return 0xff6600; // Laranja
        if (intensity <= 80) return 0xff4444; // Vermelho
        return 0x9900cc; // Roxo
    }

    getTemperatureColor(temp) {
        if (temp <= 0) return 0x0066ff; // Azul - muito frio
        if (temp <= 10) return 0x00aaff; // Azul claro - frio
        if (temp <= 20) return 0x00ff88; // Verde - agradável
        if (temp <= 30) return 0xffaa00; // Amarelo - quente
        if (temp <= 40) return 0xff6600; // Laranja - muito quente
        return 0xff4444; // Vermelho - extremamente quente
    }

    getHumidityColor(humidity) {
        if (humidity <= 30) return 0xff6600; // Laranja - seco
        if (humidity <= 50) return 0xffaa00; // Amarelo - moderado
        if (humidity <= 70) return 0x00ff88; // Verde - confortável
        return 0x0066ff; // Azul - úmido
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
        console.log('Iniciando animação do globo...');
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotação suave do globo
            if (this.globe) {
                this.globe.rotation.y += 0.001;
            }
            
            if (this.controls) {
                this.controls.update();
            }
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            } else {
                console.error('Erro na renderização:', {
                    renderer: !!this.renderer,
                    scene: !!this.scene,
                    camera: !!this.camera
                });
            }
        };
        
        animate();
        console.log('Animação iniciada');
        console.log('Globo deve estar visível agora');
        console.log('Cena final:', this.scene);
        console.log('Globo final:', this.globe);
        console.log('Verificando se tudo está funcionando...');
        
        // Teste adicional
        setTimeout(() => {
            console.log('Teste após 1 segundo:');
            console.log('Globo ainda existe:', !!this.globe);
            console.log('Cena ainda existe:', !!this.scene);
            console.log('Câmera ainda existe:', !!this.camera);
            console.log('Renderer ainda existe:', !!this.renderer);
        }, 1000);
        
        // Teste de renderização manual
        setTimeout(() => {
            console.log('Testando renderização manual...');
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
                console.log('Renderização manual executada');
            } else {
                console.error('Não foi possível executar renderização manual');
            }
        }, 2000);
        
        // Teste de cor do globo
        setTimeout(() => {
            console.log('Testando cor do globo...');
            if (this.globe && this.globe.material) {
                console.log('Material do globo:', this.globe.material);
                console.log('Cor do material:', this.globe.material.color);
                console.log('Tipo do material:', this.globe.material.type);
                
                // Teste de mudança de cor
                this.globe.material.color.setHex(0x00ff00); // Verde
                console.log('Mudou cor para verde');
            } else {
                console.error('Globo ou material não encontrado');
            }
        }, 3000);
    }

    setupGlobeControls() {
        console.log('Configurando controles do globo...');
        
        // Verificar se os elementos existem
        const aqiLayer = document.getElementById('aqi-layer');
        console.log('Elemento aqi-layer encontrado:', aqiLayer);
        
        // Event listeners para as camadas
        if (aqiLayer) {
            aqiLayer.addEventListener('change', (e) => {
                this.toggleLayer('aqi', e.target.checked);
            });
        }
        
        const pollutantsLayer = document.getElementById('pollutants-layer');
        if (pollutantsLayer) {
            pollutantsLayer.addEventListener('change', (e) => {
                this.toggleLayer('pollutants', e.target.checked);
            });
        }
        
        const firesLayer = document.getElementById('fires-layer');
        if (firesLayer) {
            firesLayer.addEventListener('change', (e) => {
                this.toggleLayer('fires', e.target.checked);
            });
        }
        
        const temperatureLayer = document.getElementById('temperature-layer');
        if (temperatureLayer) {
            temperatureLayer.addEventListener('change', (e) => {
                this.toggleLayer('temperature', e.target.checked);
            });
        }
        
        const humidityLayer = document.getElementById('humidity-layer');
        if (humidityLayer) {
            humidityLayer.addEventListener('change', (e) => {
                this.toggleLayer('humidity', e.target.checked);
            });
        }

        // Event listeners para mapa de calor
        const heatmapAqi = document.getElementById('heatmap-aqi');
        if (heatmapAqi) {
            heatmapAqi.addEventListener('click', () => {
                this.switchHeatmap('aqi');
            });
        }
        
        const heatmapPollutants = document.getElementById('heatmap-pollutants');
        if (heatmapPollutants) {
            heatmapPollutants.addEventListener('click', () => {
                this.switchHeatmap('pollutants');
            });
        }
        
        const heatmapFires = document.getElementById('heatmap-fires');
        if (heatmapFires) {
            heatmapFires.addEventListener('click', () => {
                this.switchHeatmap('fires');
            });
        }
        
        const heatmapTemperature = document.getElementById('heatmap-temperature');
        if (heatmapTemperature) {
            heatmapTemperature.addEventListener('click', () => {
                this.switchHeatmap('temperature');
            });
        }
        
        const heatmapHumidity = document.getElementById('heatmap-humidity');
        if (heatmapHumidity) {
            heatmapHumidity.addEventListener('click', () => {
                this.switchHeatmap('humidity');
            });
        }
        
        console.log('Controles do globo configurados');
        
        // Teste imediato para verificar se os elementos existem
        const controls = document.querySelector('.globe-controls');
        console.log('Controles imediatos:', controls);
        
        if (!controls) {
            console.error('ERRO: Controles não encontrados!');
            console.log('HTML disponível:', document.querySelector('.globe-container'));
        } else {
            console.log('Controles encontrados com sucesso!');
            console.log('Controles HTML:', controls.outerHTML.substring(0, 200) + '...');
        }
        
        // Teste para verificar se os elementos estão visíveis
        setTimeout(() => {
            const controls = document.querySelector('.globe-controls');
            console.log('Controles encontrados:', controls);
            if (controls) {
                console.log('Controles visíveis:', controls.offsetWidth, controls.offsetHeight);
                console.log('Controles display:', window.getComputedStyle(controls).display);
                console.log('Controles visibility:', window.getComputedStyle(controls).visibility);
                console.log('Controles opacity:', window.getComputedStyle(controls).opacity);
                console.log('Controles z-index:', window.getComputedStyle(controls).zIndex);
            }
            
            // Verificar botões específicos
            const heatmapButtons = document.querySelectorAll('.heatmap-btn');
            console.log('Botões de heatmap encontrados:', heatmapButtons.length);
            heatmapButtons.forEach((btn, index) => {
                console.log(`Botão ${index}:`, btn);
                console.log(`Botão ${index} visível:`, btn.offsetWidth, btn.offsetHeight);
                console.log(`Botão ${index} display:`, window.getComputedStyle(btn).display);
            });
        }, 1000);

        // Adicionar interação com clique nos pontos
        this.addClickInteraction();
    }

    switchHeatmap(type) {
        // Alternar para o mapa de calor selecionado
        this.applyHeatmap(type);
        
        // Atualizar interface
        this.updateHeatmapButtons(type);
        
        // Atualizar informações
        this.updateHeatmapInfo(type);
    }

    updateHeatmapButtons(activeType) {
        // Remover classe ativa de todos os botões
        document.querySelectorAll('.heatmap-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Adicionar classe ativa ao botão selecionado
        document.getElementById(`heatmap-${activeType}`).classList.add('active');
    }

    toggleLayer(layerType, visible) {
        this.dataLayers[layerType].visible = visible;
        this.renderDataLayers();
        this.updateLayerInfo(layerType, visible);
    }

    updateLayerInfo(layerType, visible) {
        const layerInfo = {
            aqi: { name: 'AQI (Índice de Qualidade do Ar)', count: this.globalData.aqi.length },
            pollutants: { name: 'Poluentes (MP2.5, NO₂, O₃)', count: this.globalData.pollutants.length },
            fires: { name: 'Queimadas (Focos Ativos)', count: this.globalData.fires.length },
            temperature: { name: 'Temperatura Global', count: this.globalData.temperature.length },
            humidity: { name: 'Umidade Relativa', count: this.globalData.humidity.length }
        };

        const info = layerInfo[layerType];
        console.log(`${info.name}: ${visible ? 'Ativado' : 'Desativado'} (${info.count} pontos)`);
    }

    addClickInteraction() {
        const canvas = document.getElementById('globe-canvas');
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            // Verificar intersecção com pontos de dados
            const intersects = raycaster.intersectObjects(this.scene.children, true);
            
            for (let intersect of intersects) {
                if (intersect.object.userData && intersect.object.userData.type) {
                    this.showDataPointInfo(intersect.object.userData);
                    break;
                }
            }
        });
    }

    showDataPointInfo(data) {
        const statusElement = document.getElementById('air-status');
        const locationElement = document.getElementById('location-text');
        
        let infoText = '';
        let statusClass = '';
        
        switch (data.type) {
            case 'data-point':
                if (data.aqi !== undefined) {
                    // AQI
                    infoText = `${data.name}, ${data.country}: AQI ${data.aqi} (${this.getStatusText(data.status)})`;
                    statusClass = `status-${data.status}`;
                } else if (data.pm25 !== undefined) {
                    // Poluentes
                    infoText = `${data.name}, ${data.country}: MP2.5: ${data.pm25}μg/m³, NO₂: ${data.no2}μg/m³, O₃: ${data.o3}μg/m³`;
                    statusClass = 'status-pollutants';
                } else if (data.temp !== undefined) {
                    // Temperatura
                    infoText = `${data.city}, ${data.country}: ${data.temp}°C`;
                    statusClass = 'status-temperature';
                } else if (data.humidity !== undefined) {
                    // Umidade
                    infoText = `${data.city}, ${data.country}: ${data.humidity}% umidade`;
                    statusClass = 'status-humidity';
                }
                break;
                
            case 'fire-point':
                infoText = `Foco de Queimada - ${data.region}: Intensidade ${data.intensity}%, Confiança ${data.confidence}%`;
                statusClass = 'status-fire';
                break;
        }
        
        statusElement.className = `status-indicator ${statusClass}`;
        locationElement.textContent = infoText;
        
        // Animação de zoom para o ponto
        this.zoomToDataPoint(data);
    }

    zoomToDataPoint(data) {
        const targetPosition = new THREE.Vector3();
        targetPosition.setFromSphericalCoords(1.8, data.lat * Math.PI / 180, data.lng * Math.PI / 180);
        
        const startPosition = this.camera.position.clone();
        const duration = 1000;
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

    // Sistema de Quiz
    loadQuizData() {
        console.log('Carregando dados do quiz...');
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
        console.log('Dados do quiz carregados');
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
        console.log('Carregando dados de qualidade do ar...');
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
        console.log('Dados de qualidade do ar carregados');
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
        console.log('Configurando event listeners...');
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
        console.log('Event listeners configurados');
    }

    toggleSources() {
        const content = document.getElementById('sources-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando AirQuest...');
    window.airQuest = new AirQuest();
    
    // Funções globais para navegação
    window.showHome = () => window.airQuest.showHome();
    window.showIntro = () => window.airQuest.showIntro();
    window.showGlobe = () => window.airQuest.showGlobe();
    window.showQuiz = () => window.airQuest.showQuiz();
    window.restartQuiz = () => window.airQuest.restartQuiz();
    window.toggleSources = () => window.airQuest.toggleSources();
    
    console.log('AirQuest carregado e funções globais definidas');
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
