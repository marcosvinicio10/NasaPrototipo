// Script específico para a página do globo 3D com Three.js
class GlobeApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.controls = null;
        this.heatmapOverlay = null;
        this.heatmapData = {};
        this.currentHeatmapType = 'aqi';
        this.heatmapMaterial = null;
        this.dataPoints = [];
        this.airQualityData = [];
        this.fireData = [];
        this.temperatureData = [];
        this.animationId = null;
        
        this.init();
    }

    init() {
        console.log('Inicializando aplicação do globo com Three.js...');
        this.createScene();
        this.createGlobe();
        this.initHeatmapSystem();
        this.setupControls();
        this.animate();
        this.loadRealData();
    }

    createScene() {
        console.log('Criando cena Three.js...');
        
        try {
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000011);
            console.log('Cena criada');

            // Camera
            this.camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            this.camera.position.z = 1.8;
            console.log('Câmera criada, posição:', this.camera.position);

            // Renderer
            const canvas = document.getElementById('globe-canvas');
            if (!canvas) {
                throw new Error('Canvas não encontrado!');
            }
            
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            console.log('Renderer criado');

            // Controls
            if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = false;
                this.controls.minDistance = 1.5;
                this.controls.maxDistance = 3.0;
                console.log('Controles OrbitControls criados');
            } else {
                console.log('OrbitControls não disponível, usando controles básicos');
                this.setupBasicControls();
            }

            // Sistema de iluminação realista
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            this.scene.add(ambientLight);

            // Luz principal (Sol)
            const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
            sunLight.position.set(2, 1, 1);
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 2048;
            sunLight.shadow.mapSize.height = 2048;
            this.scene.add(sunLight);

            // Luz de preenchimento
            const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
            fillLight.position.set(-1, 0.5, -1);
            this.scene.add(fillLight);

            console.log('Luzes adicionadas à cena');
            console.log('Número de objetos na cena:', this.scene.children.length);
            
        } catch (error) {
            console.error('Erro ao criar cena:', error);
            throw error;
        }
    }

    createGlobe() {
        console.log('Criando globo com textura realista da Terra...');
        
        try {
            // Geometria do globo
            const geometry = new THREE.SphereGeometry(1.0, 64, 64);
            console.log('Geometria criada');

            // Carregar textura da Terra
            this.loadEarthTexture().then(() => {
                // Material da Terra
                const material = new THREE.MeshPhongMaterial({
                    map: this.earthTexture,
                    shininess: 100,
                    specular: new THREE.Color(0x222222)
                });
                console.log('Material criado');

                // Criar o globo
                this.globe = new THREE.Mesh(geometry, material);
                this.scene.add(this.globe);
                console.log('Globo criado e adicionado à cena');
            }).catch(error => {
                console.error('Erro ao carregar textura:', error);
                this.createFallbackGlobe();
            });
            
        } catch (error) {
            console.error('Erro ao criar globo:', error);
            this.createFallbackGlobe();
        }
    }

    async loadEarthTexture() {
        console.log('Carregando textura da Terra...');
        
        const loader = new THREE.TextureLoader();
        
        return new Promise((resolve, reject) => {
            // Textura realista da Terra
            this.earthTexture = loader.load(
                'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg',
                (texture) => {
                    console.log('Textura da Terra carregada com sucesso');
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.flipY = false;
                    resolve(texture);
                },
                (progress) => {
                    console.log('Carregando textura:', Math.round((progress.loaded / progress.total) * 100) + '%');
                },
                (error) => {
                    console.error('Erro ao carregar textura:', error);
                    reject(error);
                }
            );
        });
    }

    createFallbackGlobe() {
        console.log('Criando globo com textura de fallback...');
        
        // Geometria
        const geometry = new THREE.SphereGeometry(1.0, 64, 64);
        
        // Textura procedural
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Fundo azul (oceanos)
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Continentes verdes
        ctx.fillStyle = '#22c55e';
        
        // América do Norte
        ctx.beginPath();
        ctx.ellipse(200, 150, 80, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // América do Sul
        ctx.beginPath();
        ctx.ellipse(220, 280, 60, 100, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Europa
        ctx.beginPath();
        ctx.ellipse(450, 120, 40, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // África
        ctx.beginPath();
        ctx.ellipse(480, 200, 50, 80, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ásia
        ctx.beginPath();
        ctx.ellipse(600, 140, 100, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Austrália
        ctx.beginPath();
        ctx.ellipse(700, 300, 40, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Criar textura
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        // Material
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 100,
            specular: new THREE.Color(0x222222)
        });
        
        // Criar globo
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        console.log('Globo de fallback criado');
    }

    // Método removido - globo simplificado

    // Métodos antigos removidos - globo simplificado

    drawRealisticContinents(ctx, width, height) {
        // América do Norte
        ctx.fillStyle = '#22c55e';
            ctx.beginPath();
        ctx.ellipse(200, 200, 180, 120, 0, 0, 2 * Math.PI);
            ctx.fill();
        
        // América Central
        ctx.beginPath();
        ctx.ellipse(250, 320, 40, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // América do Sul
        ctx.beginPath();
        ctx.ellipse(220, 450, 120, 180, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Europa
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(900, 180, 80, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // África
        ctx.beginPath();
        ctx.ellipse(950, 350, 100, 200, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ásia
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(1200, 200, 300, 150, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Índia
        ctx.beginPath();
        ctx.ellipse(1300, 350, 60, 80, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Oceania
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(1600, 500, 100, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Antártica
        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.ellipse(width/2, height-50, width*0.4, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawRealisticClouds(ctx, width, height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        
        // Nuvens em diferentes regiões
        const cloudRegions = [
            { x: 300, y: 150, size: 40 },
            { x: 600, y: 200, size: 35 },
            { x: 1000, y: 250, size: 45 },
            { x: 1400, y: 300, size: 30 },
            { x: 400, y: 400, size: 50 },
            { x: 800, y: 450, size: 25 },
            { x: 1200, y: 500, size: 40 }
        ];
        
        cloudRegions.forEach(cloud => {
        ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, 2 * Math.PI);
        ctx.fill();
        
            // Adicionar variação
        ctx.beginPath();
            ctx.arc(cloud.x + 20, cloud.y - 10, cloud.size * 0.7, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
            ctx.arc(cloud.x - 15, cloud.y + 15, cloud.size * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        });
    }

    addLightingEffects(ctx, width, height) {
        // Gradiente de iluminação (lado iluminado vs lado escuro)
        const lightingGradient = ctx.createRadialGradient(width * 0.3, height * 0.5, 0, width * 0.3, height * 0.5, width * 0.8);
        lightingGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        lightingGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        lightingGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = lightingGradient;
        ctx.fillRect(0, 0, width, height);
    }

    createAtmosphere() {
        console.log('Criando atmosfera realista...');
        
        // Geometria da atmosfera (esfera ligeiramente maior)
        const atmosphereGeometry = new THREE.SphereGeometry(1.25, 64, 64);
        
        // Material da atmosfera com gradiente
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide,
            shininess: 100,
            specular: new THREE.Color(0x444444)
        });
        
        // Mesh da atmosfera
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
        
        // Adicionar efeito de brilho na borda
        this.createAtmosphereGlow();
        
        console.log('Atmosfera realista criada');
    }

    createAtmosphereGlow() {
        console.log('Criando brilho da atmosfera...');
        
        // Geometria para o brilho
        const glowGeometry = new THREE.SphereGeometry(1.26, 32, 32);
        
        // Material do brilho
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        // Mesh do brilho
        this.atmosphereGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(this.atmosphereGlow);
        
        console.log('Brilho da atmosfera criado');
    }

    initHeatmapSystem() {
        console.log('Inicializando sistema de heatmap...');
        
        // Criar material para overlay de heatmap
        this.heatmapMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Criar overlay de heatmap
        const heatmapGeometry = new THREE.SphereGeometry(1.21, 64, 64);
        this.heatmapOverlay = new THREE.Mesh(heatmapGeometry, this.heatmapMaterial);
        this.scene.add(this.heatmapOverlay);
        
        console.log('Sistema de heatmap inicializado');
    }

    setupControls() {
        console.log('Configurando controles...');
        
        // Event listeners para botões de heatmap
        const heatmapButtons = document.querySelectorAll('.heatmap-btn');
        heatmapButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.closest('.heatmap-btn').id.replace('heatmap-', '');
                this.switchHeatmap(type);
            });
        });

        // Event listeners para toggles de camadas
        const layerToggles = document.querySelectorAll('.layer-toggle input');
        layerToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const layerId = e.target.id;
                const isVisible = e.target.checked;
                this.toggleDataLayer(layerId, isVisible);
            });
        });
        
        console.log('Controles configurados');
    }

    switchHeatmap(type) {
        console.log('Mudando heatmap para:', type);
        this.currentHeatmapType = type;
        
        // Atualizar botões
        document.querySelectorAll('.heatmap-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`heatmap-${type}`).classList.add('active');
        
        // Atualizar overlay de heatmap
        this.updateHeatmapOverlay();
        
        // Recriar marcadores 3D para o novo tipo
        this.createDataMarkers();
        
        // Atualizar painel de informações
        this.updateInfoPanel();
    }

    updateHeatmapOverlay() {
        if (!this.heatmapOverlay) return;

        const data = this.heatmapData[this.currentHeatmapType] || this.heatmapData.aqi;
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configurações específicas por tipo de dados
        const heatmapConfig = this.getHeatmapConfig(this.currentHeatmapType);

        // Desenhar pontos de heatmap com configurações específicas
        data.forEach(point => {
            this.drawHeatmapPoint(ctx, point, heatmapConfig, canvas.width, canvas.height);
        });
        
        // Adicionar efeitos específicos por tipo
        this.addHeatmapEffects(ctx, heatmapConfig, canvas.width, canvas.height);

        // Atualizar textura do overlay
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.heatmapOverlay.material.map = texture;
        this.heatmapOverlay.material.needsUpdate = true;
    }

    getHeatmapConfig(type) {
        const configs = {
            aqi: {
                colors: {
                    good: 'rgba(0, 255, 136, 0.8)',
                    moderate: 'rgba(255, 170, 0, 0.8)',
                    unhealthy: 'rgba(255, 102, 0, 0.8)',
                    dangerous: 'rgba(255, 68, 68, 0.8)'
                },
                thresholds: [0.3, 0.6, 0.8],
                baseSize: 25,
                maxSize: 60,
                effect: 'glow'
            },
            pollutants: {
                colors: {
                    low: 'rgba(100, 200, 255, 0.7)',
                    medium: 'rgba(255, 150, 100, 0.8)',
                    high: 'rgba(255, 100, 100, 0.9)',
                    extreme: 'rgba(150, 50, 150, 1.0)'
                },
                thresholds: [0.25, 0.5, 0.75],
                baseSize: 20,
                maxSize: 50,
                effect: 'pulse'
            },
            fires: {
                colors: {
                    small: 'rgba(255, 200, 0, 0.8)',
                    medium: 'rgba(255, 150, 0, 0.9)',
                    large: 'rgba(255, 100, 0, 1.0)',
                    massive: 'rgba(255, 50, 0, 1.0)'
                },
                thresholds: [0.2, 0.5, 0.8],
                baseSize: 30,
                maxSize: 80,
                effect: 'flicker'
            },
            temperature: {
                colors: {
                    cold: 'rgba(100, 150, 255, 0.7)',
                    cool: 'rgba(150, 200, 255, 0.8)',
                    warm: 'rgba(255, 200, 100, 0.8)',
                    hot: 'rgba(255, 100, 50, 0.9)'
                },
                thresholds: [0.25, 0.5, 0.75],
                baseSize: 15,
                maxSize: 40,
                effect: 'gradient'
            },
            humidity: {
                colors: {
                    dry: 'rgba(255, 200, 100, 0.6)',
                    normal: 'rgba(150, 200, 255, 0.7)',
                    humid: 'rgba(100, 150, 255, 0.8)',
                    saturated: 'rgba(50, 100, 255, 0.9)'
                },
                thresholds: [0.3, 0.6, 0.8],
                baseSize: 18,
                maxSize: 45,
                effect: 'wave'
            }
        };

        return configs[type] || configs.aqi;
    }

    drawHeatmapPoint(ctx, point, config, canvasWidth, canvasHeight) {
        // Converter coordenadas para posição na textura
        const x = ((point.lng + 180) / 360) * canvasWidth;
        const y = ((90 - point.lat) / 180) * canvasHeight;

        // Determinar cor baseada na intensidade
        let color;
        if (point.intensity <= config.thresholds[0]) {
            color = config.colors.good || config.colors.low || config.colors.cold || config.colors.dry || config.colors.small;
        } else if (point.intensity <= config.thresholds[1]) {
            color = config.colors.moderate || config.colors.medium || config.colors.cool || config.colors.normal || config.colors.medium;
        } else if (point.intensity <= config.thresholds[2]) {
            color = config.colors.unhealthy || config.colors.high || config.colors.warm || config.colors.humid || config.colors.large;
        } else {
            color = config.colors.dangerous || config.colors.extreme || config.colors.hot || config.colors.saturated || config.colors.massive;
        }

        // Tamanho baseado na intensidade
        const size = config.baseSize + (point.intensity * (config.maxSize - config.baseSize));

        // Aplicar efeito específico
        this.applyHeatmapEffect(ctx, x, y, size, color, config.effect, point);
    }

    applyHeatmapEffect(ctx, x, y, size, color, effect, point) {
        switch (effect) {
            case 'glow':
                this.drawGlowEffect(ctx, x, y, size, color);
                break;
            case 'pulse':
                this.drawPulseEffect(ctx, x, y, size, color, point);
                break;
            case 'flicker':
                this.drawFlickerEffect(ctx, x, y, size, color, point);
                break;
            case 'gradient':
                this.drawGradientEffect(ctx, x, y, size, color);
                break;
            case 'wave':
                this.drawWaveEffect(ctx, x, y, size, color, point);
                break;
            default:
                this.drawGlowEffect(ctx, x, y, size, color);
        }
    }

    drawGlowEffect(ctx, x, y, size, color) {
        // Gradiente radial com brilho
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.3, color.replace('0.8', '0.6'));
        gradient.addColorStop(0.6, color.replace('0.8', '0.3'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Centro brilhante
        ctx.fillStyle = color.replace('0.8', '1.0');
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPulseEffect(ctx, x, y, size, color, point) {
        // Efeito pulsante baseado no tempo
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 2 + point.lat * 0.1) * 0.3 + 0.7;
        const pulseSize = size * pulse;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color.replace('0.8', '0.4'));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFlickerEffect(ctx, x, y, size, color, point) {
        // Efeito de chama/fogo
        const time = Date.now() * 0.005;
        const flicker = Math.random() * 0.5 + 0.5;
        
        // Múltiplas camadas para efeito de fogo
        for (let i = 0; i < 3; i++) {
            const layerSize = size * (0.8 - i * 0.2);
            const layerColor = color.replace('0.8', (0.6 - i * 0.1).toString());
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
            gradient.addColorStop(0, layerColor);
            gradient.addColorStop(0.7, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + Math.sin(time + i) * 5, y + Math.cos(time + i) * 3, layerSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawGradientEffect(ctx, x, y, size, color) {
        // Gradiente suave para temperatura
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color.replace('0.8', '0.5'));
        gradient.addColorStop(0.8, color.replace('0.8', '0.2'));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    drawWaveEffect(ctx, x, y, size, color, point) {
        // Efeito ondulante para umidade
        const time = Date.now() * 0.003;
        const wave = Math.sin(time + point.lng * 0.01) * 0.2 + 0.8;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * wave);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.6, color.replace('0.8', '0.3'));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * wave, 0, Math.PI * 2);
        ctx.fill();
    }

    addHeatmapEffects(ctx, config, canvasWidth, canvasHeight) {
        // Adicionar efeitos globais baseados no tipo de dados
        if (config.effect === 'flicker') {
            // Adicionar fumaça/partículas para queimadas
            ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvasWidth;
                const y = Math.random() * canvasHeight;
                const size = Math.random() * 10 + 5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    toggleDataLayer(layerId, isVisible) {
        console.log(`Toggle layer ${layerId}: ${isVisible}`);
        // Implementar lógica para mostrar/ocultar camadas
    }

    updateInfoPanel() {
        const data = this.heatmapData[this.currentHeatmapType] || this.heatmapData.aqi;
        const firstPoint = data[0];
        
        if (firstPoint) {
            document.getElementById('current-region').textContent = firstPoint.region;
            document.getElementById('current-aqi').textContent = firstPoint.aqi;
            document.getElementById('current-temp').textContent = firstPoint.temp;
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }
    }

    loadRealData() {
        console.log('Carregando dados reais das APIs...');
        
        // Carregar dados reais do OpenAQ
        this.loadOpenAQData().then(data => {
            this.heatmapData = data;
            console.log('Dados reais do OpenAQ carregados:', this.heatmapData);
            
            // Atualizar heatmap inicial
            this.updateHeatmapOverlay();
            
            // Criar marcadores 3D para os dados
            this.createDataMarkers();
            
            // Criar dashboard de visualização
            this.createDataDashboard();
            
            // Iniciar atualização automática
            this.startRealTimeUpdates();
        }).catch(error => {
            console.error('Erro ao carregar dados reais, usando fallback:', error);
            this.simulateRealData();
            this.updateHeatmapOverlay();
        });
    }

    createDataDashboard() {
        console.log('Criando dashboard de visualização...');
        
        // Criar container para o dashboard
        const dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'data-dashboard';
        dashboardContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80vw;
            height: 80vh;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 20px;
            z-index: 100;
            display: none;
            overflow-y: auto;
        `;
        
        // Adicionar botão de fechar
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.8);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            color: white;
            font-size: 18px;
            cursor: pointer;
            z-index: 101;
        `;
        closeBtn.onclick = () => {
            dashboardContainer.style.display = 'none';
        };
        
        dashboardContainer.appendChild(closeBtn);
        document.body.appendChild(dashboardContainer);
        
        // Criar dashboard com dados reais
        const allData = [];
        Object.values(this.heatmapData).forEach(category => {
            allData.push(...category);
        });
        
        if (window.dataVisualization) {
            window.dataVisualization.createDashboard('data-dashboard', allData);
        }
        
        // Adicionar botão para abrir dashboard
        this.addDashboardButton();
    }

    addDashboardButton() {
        const dashboardBtn = document.createElement('div');
        dashboardBtn.className = 'floating-dashboard-btn';
        dashboardBtn.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            pointer-events: auto;
            z-index: 20;
            animation: slideIn 1.4s ease-out 0.8s both;
        `;
        
        dashboardBtn.innerHTML = `
            <button class="dashboard-btn" onclick="document.getElementById('data-dashboard').style.display = 'block'">
                <span class="icon">📊</span>
                <span class="text">Dashboard</span>
            </button>
        `;
        
        // Adicionar CSS para o botão
        const style = document.createElement('style');
        style.textContent = `
            .floating-dashboard-btn .dashboard-btn {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
                backdrop-filter: blur(10px);
                border: 1px solid #8b5cf6;
                border-radius: 12px;
                padding: 12px 20px;
                color: #8b5cf6;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
            }
            
            .floating-dashboard-btn .dashboard-btn:hover {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2));
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            }
            
            .floating-dashboard-btn .dashboard-btn .icon {
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
        
        document.querySelector('.floating-panels').appendChild(dashboardBtn);
    }

    async loadOpenAQData() {
        console.log('Carregando dados do OpenAQ...');
        
        try {
            // Lista de cidades principais para monitorar
            const cities = [
                'São Paulo', 'Rio de Janeiro', 'Buenos Aires',
                'New York', 'Los Angeles', 'Toronto',
                'London', 'Paris', 'Berlin',
                'Beijing', 'Delhi', 'Tokyo',
                'Johannesburg', 'Lagos', 'Sydney'
            ];
            
            const allData = {
                aqi: [],
                pollutants: [],
                fires: [],
                temperature: [],
                humidity: []
            };
            
            // Carregar dados para cada cidade
            for (const city of cities) {
                try {
                    const cityData = await this.fetchCityData(city);
                    if (cityData) {
                        allData.aqi.push(cityData);
                        allData.pollutants.push(cityData);
                        allData.temperature.push(cityData);
                        allData.humidity.push(cityData);
                    }
                } catch (error) {
                    console.warn(`Erro ao carregar dados para ${city}:`, error);
                }
            }
            
            // Adicionar dados de queimadas (simulados por enquanto)
            allData.fires = this.getFireData();
            
            return allData;
            
        } catch (error) {
            console.error('Erro ao carregar dados do OpenAQ:', error);
            throw error;
        }
    }

    async fetchCityData(city) {
        try {
            // Usar API do OpenAQ para dados reais
            const response = await fetch(`https://api.openaq.org/v2/latest?city=${encodeURIComponent(city)}&limit=1`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const measurements = result.measurements || [];
                
                // Encontrar PM2.5 ou PM10
                const pm25 = measurements.find(m => m.parameter === 'pm25');
                const pm10 = measurements.find(m => m.parameter === 'pm10');
                const no2 = measurements.find(m => m.parameter === 'no2');
                
                const pmValue = pm25 ? pm25.value : (pm10 ? pm10.value : 50);
                const no2Value = no2 ? no2.value : 30;
                
                // Calcular AQI baseado no PM2.5
                const aqi = this.calculateAQI(pmValue);
                const intensity = this.calculateIntensity(aqi);
                
                return {
                    lat: result.coordinates.latitude,
                    lng: result.coordinates.longitude,
                    intensity: intensity,
                    region: `${city}, ${result.country}`,
                    aqi: aqi,
                    temp: `${Math.round(20 + Math.random() * 15)}°C`, // Simulado por enquanto
                    source: 'OpenAQ',
                    pm25: pmValue,
                    no2: no2Value,
                    lastUpdated: result.lastUpdated
                };
            }
            
            return null;
            
        } catch (error) {
            console.warn(`Erro ao buscar dados para ${city}:`, error);
            return null;
        }
    }

    calculateAQI(pm25) {
        // Conversão simplificada PM2.5 para AQI
        if (pm25 <= 12) return Math.round(pm25 * 4.17);
        if (pm25 <= 35.4) return Math.round(50 + (pm25 - 12) * 1.43);
        if (pm25 <= 55.4) return Math.round(100 + (pm25 - 35.4) * 2.5);
        if (pm25 <= 150.4) return Math.round(150 + (pm25 - 55.4) * 1.05);
        return Math.round(200 + (pm25 - 150.4) * 0.5);
    }

    calculateIntensity(aqi) {
        if (aqi <= 50) return 0.2;
        if (aqi <= 100) return 0.4;
        if (aqi <= 150) return 0.6;
        if (aqi <= 200) return 0.8;
        return 1.0;
    }

    getFireData() {
        // Dados simulados de queimadas (futuramente integrar com FIRMS)
        return [
            { lat: -3.4653, lng: -62.2159, intensity: 1.0, region: 'Amazônia, Brasil', aqi: 203, temp: '32°C', source: 'FIRMS' },
            { lat: -2.1631, lng: 15.8277, intensity: 0.8, region: 'África Central', aqi: 189, temp: '28°C', source: 'FIRMS' },
            { lat: 61.5240, lng: 105.3188, intensity: 1.0, region: 'Sibéria, Rússia', aqi: 195, temp: '5°C', source: 'FIRMS' }
        ];
    }

    simulateRealData() {
        // Dados simulados mais realistas e variados
        this.heatmapData = {
            aqi: [
                // América do Sul
                { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo, Brasil', aqi: 85, temp: '28°C', source: 'TEMPO' },
                { lat: -22.9068, lng: -43.1729, intensity: 0.6, region: 'Rio de Janeiro, Brasil', aqi: 65, temp: '30°C', source: 'OpenAQ' },
                { lat: -34.6037, lng: -58.3816, intensity: 0.5, region: 'Buenos Aires, Argentina', aqi: 55, temp: '22°C', source: 'OpenAQ' },
                
                // América do Norte
                { lat: 40.7128, lng: -74.0060, intensity: 0.4, region: 'Nova York, EUA', aqi: 45, temp: '15°C', source: 'TEMPO' },
                { lat: 34.0522, lng: -118.2437, intensity: 0.7, region: 'Los Angeles, EUA', aqi: 75, temp: '25°C', source: 'TEMPO' },
                { lat: 43.6532, lng: -79.3832, intensity: 0.3, region: 'Toronto, Canadá', aqi: 35, temp: '8°C', source: 'OpenAQ' },
                
                // Europa
                { lat: 51.5074, lng: -0.1278, intensity: 0.4, region: 'Londres, Reino Unido', aqi: 42, temp: '12°C', source: 'OpenAQ' },
                { lat: 48.8566, lng: 2.3522, intensity: 0.5, region: 'Paris, França', aqi: 48, temp: '14°C', source: 'OpenAQ' },
                { lat: 52.5200, lng: 13.4050, intensity: 0.6, region: 'Berlim, Alemanha', aqi: 58, temp: '10°C', source: 'OpenAQ' },
                
                // Ásia
                { lat: 39.9042, lng: 116.4074, intensity: 1.0, region: 'Pequim, China', aqi: 98, temp: '22°C', source: 'TEMPO' },
                { lat: 28.6139, lng: 77.2090, intensity: 0.8, region: 'Nova Delhi, Índia', aqi: 88, temp: '35°C', source: 'OpenAQ' },
                { lat: 35.6762, lng: 139.6503, intensity: 0.6, region: 'Tóquio, Japão', aqi: 62, temp: '18°C', source: 'OpenAQ' },
                
                // África
                { lat: -26.2041, lng: 28.0473, intensity: 0.7, region: 'Joanesburgo, África do Sul', aqi: 72, temp: '24°C', source: 'OpenAQ' },
                { lat: 6.5244, lng: 3.3792, intensity: 0.8, region: 'Lagos, Nigéria', aqi: 82, temp: '28°C', source: 'OpenAQ' }
            ],
            
            pollutants: [
                { lat: -23.5505, lng: -46.6333, intensity: 0.7, region: 'São Paulo, Brasil', aqi: 156, temp: '28°C', source: 'OpenAQ' },
                { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'Cidade do México, México', aqi: 178, temp: '25°C', source: 'OpenAQ' },
                { lat: 39.9042, lng: 116.4074, intensity: 0.8, region: 'Pequim, China', aqi: 165, temp: '22°C', source: 'TEMPO' },
                { lat: 28.6139, lng: 77.2090, intensity: 0.9, region: 'Nova Delhi, Índia', aqi: 185, temp: '35°C', source: 'OpenAQ' },
                { lat: 34.0522, lng: -118.2437, intensity: 0.6, region: 'Los Angeles, EUA', aqi: 125, temp: '25°C', source: 'TEMPO' }
            ],
            
            fires: [
                { lat: -3.4653, lng: -62.2159, intensity: 1.0, region: 'Amazônia, Brasil', aqi: 203, temp: '32°C', source: 'FIRMS' },
                { lat: -2.1631, lng: 15.8277, intensity: 0.8, region: 'África Central', aqi: 189, temp: '28°C', source: 'FIRMS' },
                { lat: 61.5240, lng: 105.3188, intensity: 1.0, region: 'Sibéria, Rússia', aqi: 195, temp: '5°C', source: 'FIRMS' },
                { lat: -25.2744, lng: 133.7751, intensity: 0.9, region: 'Austrália Central', aqi: 175, temp: '38°C', source: 'FIRMS' },
                { lat: 39.8283, lng: -98.5795, intensity: 0.7, region: 'Grandes Planícies, EUA', aqi: 145, temp: '22°C', source: 'FIRMS' }
            ],
            
            temperature: [
                { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo, Brasil', aqi: 85, temp: '28°C', source: 'OpenWeather' },
                { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'Cidade do México, México', aqi: 78, temp: '25°C', source: 'OpenWeather' },
                { lat: 40.7128, lng: -74.0060, intensity: 0.3, region: 'Nova York, EUA', aqi: 45, temp: '15°C', source: 'OpenWeather' },
                { lat: 61.5240, lng: 105.3188, intensity: 0.1, region: 'Sibéria, Rússia', aqi: 35, temp: '-15°C', source: 'OpenWeather' },
                { lat: -25.2744, lng: 133.7751, intensity: 1.0, region: 'Austrália Central', aqi: 65, temp: '42°C', source: 'OpenWeather' },
                { lat: 51.5074, lng: -0.1278, intensity: 0.2, region: 'Londres, Reino Unido', aqi: 42, temp: '8°C', source: 'OpenWeather' }
            ],
            
            humidity: [
                { lat: 6.5244, lng: 3.3792, intensity: 0.8, region: 'Lagos, Nigéria', aqi: 72, temp: '28°C', humidity: '85%', source: 'OpenWeather' },
                { lat: -33.8688, lng: 151.2093, intensity: 0.6, region: 'Sydney, Austrália', aqi: 58, temp: '20°C', humidity: '70%', source: 'OpenWeather' },
                { lat: 30.0444, lng: 31.2357, intensity: 0.4, region: 'Cairo, Egito', aqi: 89, temp: '32°C', humidity: '45%', source: 'OpenWeather' },
                { lat: 1.3521, lng: 103.8198, intensity: 0.9, region: 'Singapura', aqi: 55, temp: '30°C', humidity: '90%', source: 'OpenWeather' },
                { lat: 25.2048, lng: 55.2708, intensity: 0.3, region: 'Dubai, Emirados Árabes', aqi: 68, temp: '35°C', humidity: '30%', source: 'OpenWeather' }
            ]
        };
        
        console.log('Dados simulados realistas carregados');
    }

    createDataMarkers() {
        console.log('Criando marcadores 3D para dados reais...');
        
        // Limpar marcadores existentes
        if (this.dataMarkers) {
            this.dataMarkers.forEach(marker => {
                this.scene.remove(marker);
            });
        }
        
        this.dataMarkers = [];
        const data = this.heatmapData[this.currentHeatmapType] || this.heatmapData.aqi;
        
        data.forEach(point => {
            const marker = this.createDataMarker(point);
            if (marker) {
                this.scene.add(marker);
                this.dataMarkers.push(marker);
            }
        });
        
        console.log(`${this.dataMarkers.length} marcadores 3D criados`);
    }

    createDataMarker(point) {
        // Converter lat/lng para posição 3D no globo
        const position = this.latLongToVector3(point.lat, point.lng, 1.2, 0.02);
        
        // Criar geometria do marcador
        const geometry = new THREE.SphereGeometry(0.015, 8, 8);
        
        // Cor baseada na intensidade
        let color;
        if (point.intensity <= 0.3) {
            color = 0x00ff88; // Verde
        } else if (point.intensity <= 0.6) {
            color = 0xffaa00; // Amarelo
        } else if (point.intensity <= 0.8) {
            color = 0xff6600; // Laranja
        } else {
            color = 0xff4444; // Vermelho
        }
        
        // Material com brilho
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        // Criar mesh
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        
        // Adicionar dados do ponto
        marker.userData = point;
        
        // Adicionar efeito de brilho
        this.addMarkerGlow(marker, color);
        
        return marker;
    }

    addMarkerGlow(marker, color) {
        // Criar halo de brilho
        const glowGeometry = new THREE.SphereGeometry(0.025, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        marker.add(glow);
        
        // Animação de pulsação
        marker.userData.pulseSpeed = 0.02;
        marker.userData.baseScale = 1.0;
    }

    latLongToVector3(lat, lon, radius, height) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius + height) * Math.sin(phi) * Math.cos(theta);
        const z = (radius + height) * Math.sin(phi) * Math.sin(theta);
        const y = (radius + height) * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    startRealTimeUpdates() {
        console.log('Iniciando atualizações em tempo real...');
        
        // Atualizar dados a cada 5 minutos
        setInterval(() => {
            console.log('Atualizando dados em tempo real...');
            this.loadOpenAQData().then(data => {
                this.heatmapData = data;
                this.updateHeatmapOverlay();
                this.createDataMarkers();
                this.updateInfoPanel();
            }).catch(error => {
                console.error('Erro na atualização em tempo real:', error);
            });
        }, 300000); // 5 minutos
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // Animar marcadores
        this.animateMarkers();
        
        // Animar camada de nuvens
        this.animateClouds();
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    animateClouds() {
        if (this.cloudLayer && this.cloudLayer.userData) {
            // Rotação lenta das nuvens em direção diferente da Terra
            this.cloudLayer.userData.baseRotation += this.cloudLayer.userData.rotationSpeed;
            this.cloudLayer.rotation.y = this.cloudLayer.userData.baseRotation;
            
            // Rotação ligeiramente diferente no eixo X para movimento mais natural
            this.cloudLayer.rotation.x = Math.sin(this.cloudLayer.userData.baseRotation * 0.5) * 0.1;
        }
    }

    animateMarkers() {
        if (!this.dataMarkers) return;
        
        const time = Date.now() * 0.001;
        
        this.dataMarkers.forEach(marker => {
            if (marker.userData && marker.userData.pulseSpeed) {
                // Animação de pulsação
                const pulse = Math.sin(time * 2 + marker.position.x * 0.1) * 0.3 + 0.7;
                const scale = marker.userData.baseScale * pulse;
                marker.scale.setScalar(scale);
                
                // Rotação suave
                marker.rotation.y += 0.01;
            }
        });
    }

    setupBasicControls() {
        console.log('Configurando controles básicos...');
        
        let mouseX = 0, mouseY = 0;
        let isMouseDown = false;
        
        // Controles de mouse
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Rotacionar globo
            if (this.globe) {
                this.globe.rotation.y += deltaX * 0.01;
                this.globe.rotation.x += deltaY * 0.01;
            }
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        // Controles de zoom
        this.renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            const zoomSpeed = 0.1;
            const zoomDirection = event.deltaY > 0 ? 1 : -1;
            
            this.camera.position.z += zoomDirection * zoomSpeed;
            this.camera.position.z = Math.max(1.5, Math.min(3.0, this.camera.position.z));
        });
        
        console.log('Controles básicos configurados');
    }

    handleResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

// Inicializar aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página do globo carregada');
    
    // Verificar se Three.js está carregado
    if (typeof THREE === 'undefined') {
        console.error('Three.js não está carregado!');
        alert('Erro: Three.js não foi carregado. Verifique a conexão com a internet.');
        return;
    }
    
    if (typeof THREE.OrbitControls === 'undefined') {
        console.warn('OrbitControls não está carregado, usando controles básicos');
    }
    
    try {
        new GlobeApp();
        console.log('Aplicação iniciada com sucesso!');
        
        // Adicionar listener para redimensionamento
        window.addEventListener('resize', () => {
            if (window.globeApp) {
                window.globeApp.handleResize();
            }
        });
        
    } catch (error) {
        console.error('Erro ao inicializar GlobeApp:', error);
        alert('Erro ao inicializar o globo: ' + error.message);
    }
});