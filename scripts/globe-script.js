// Script específico para a página do globo 3D
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
        
        this.init();
    }

    init() {
        console.log('Inicializando aplicação do globo...');
        this.createScene();
        this.createGlobe();
        this.initHeatmapSystem();
        this.setupControls();
        this.animate();
        this.loadData();
    }

    createScene() {
        console.log('Criando cena...');
        
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
            console.log('Canvas encontrado:', canvas);
            
            if (!canvas) {
                throw new Error('Canvas não encontrado!');
            }
            
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                antialias: true 
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            console.log('Renderer criado, tamanho:', window.innerWidth, 'x', window.innerHeight);

            // Controls
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = false;
            console.log('Controles criados');

            // Lights
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 3, 5);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);
            console.log('Luzes adicionadas');

            // Resize handler
            window.addEventListener('resize', () => {
                this.handleResize();
            });
            
            console.log('Cena criada com sucesso!');
            
        } catch (error) {
            console.error('Erro ao criar cena:', error);
            throw error;
        }
    }

    createGlobe() {
        console.log('Criando globo com países...');
        
        try {
            // Geometria da esfera com mais detalhes
            const geometry = new THREE.SphereGeometry(1.2, 64, 64);
            console.log('Geometria da esfera criada');
            
            // Criar textura da Terra usando canvas
            const earthTexture = this.createEarthTexture();
            console.log('Textura da Terra criada');
            
            // Material da Terra com textura
            this.earthMaterial = new THREE.MeshPhongMaterial({
                map: earthTexture,
                transparent: false,
                opacity: 1.0
            });
            console.log('Material da Terra criado');
            
            // Criar o globo
            this.globe = new THREE.Mesh(geometry, this.earthMaterial);
            this.globe.castShadow = true;
            this.globe.receiveShadow = true;
            console.log('Globo criado');
            
            // Adicionar à cena
            this.scene.add(this.globe);
            console.log('Globo adicionado à cena');
            
            console.log('Globo com países criado e adicionado à cena com sucesso!');
            
        } catch (error) {
            console.error('Erro ao criar globo:', error);
            throw error;
        }
    }

    createEarthTexture() {
        console.log('Criando textura detalhada da Terra...');
        
        // Criar canvas para a textura
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Fundo azul oceano com gradiente
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#0f172a');
        oceanGradient.addColorStop(0.5, '#1e3a8a');
        oceanGradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar países detalhados
        this.drawDetailedCountries(ctx, canvas.width, canvas.height);
        
        // Adicionar efeitos de nuvens
        this.drawClouds(ctx, canvas.width, canvas.height);
        
        // Criar textura Three.js
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        console.log('Textura detalhada da Terra criada');
        return texture;
    }

    drawDetailedCountries(ctx, width, height) {
        console.log('Desenhando países detalhados...');
        
        // Cores dos países por região
        const colors = {
            northAmerica: '#22c55e',
            southAmerica: '#16a34a',
            europe: '#3b82f6',
            africa: '#f59e0b',
            asia: '#ef4444',
            oceania: '#8b5cf6'
        };
        
        // Desenhar países com mais detalhes
        this.drawNorthAmericanCountries(ctx, width, height, colors.northAmerica);
        this.drawSouthAmericanCountries(ctx, width, height, colors.southAmerica);
        this.drawEuropeanCountries(ctx, width, height, colors.europe);
        this.drawAfricanCountries(ctx, width, height, colors.africa);
        this.drawAsianCountries(ctx, width, height, colors.asia);
        this.drawOceanianCountries(ctx, width, height, colors.oceania);
        
        console.log('Países detalhados desenhados');
    }

    drawClouds(ctx, width, height) {
        // Adicionar nuvens para realismo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        // Nuvens em diferentes regiões
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 20 + Math.random() * 40;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Funções para desenhar países (implementação simplificada)
    drawNorthAmericanCountries(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        
        // Canadá
        ctx.beginPath();
        ctx.ellipse(width * 0.15, height * 0.25, width * 0.12, height * 0.18, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // EUA
        ctx.beginPath();
        ctx.ellipse(width * 0.22, height * 0.42, width * 0.12, height * 0.15, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // México
        ctx.beginPath();
        ctx.ellipse(width * 0.18, height * 0.58, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawSouthAmericanCountries(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        
        // Brasil
        ctx.beginPath();
        ctx.ellipse(width * 0.25, height * 0.7, width * 0.1, height * 0.22, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Argentina
        ctx.beginPath();
        ctx.ellipse(width * 0.22, height * 0.85, width * 0.06, height * 0.12, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawEuropeanCountries(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        
        // Reino Unido
        ctx.beginPath();
        ctx.ellipse(width * 0.48, height * 0.28, width * 0.03, height * 0.05, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // França
        ctx.beginPath();
        ctx.ellipse(width * 0.49, height * 0.32, width * 0.04, height * 0.06, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawAfricanCountries(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        
        // África do Sul
        ctx.beginPath();
        ctx.ellipse(width * 0.55, height * 0.8, width * 0.04, height * 0.06, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawAsianCountries(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        
        // China
        ctx.beginPath();
        ctx.ellipse(width * 0.65, height * 0.35, width * 0.14, height * 0.18, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Índia
        ctx.beginPath();
        ctx.ellipse(width * 0.62, height * 0.5, width * 0.08, height * 0.12, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    drawOceanianCountries(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        
        // Austrália
        ctx.beginPath();
        ctx.ellipse(width * 0.75, height * 0.75, width * 0.1, height * 0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

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
        
        // Iniciar atualização de dados em tempo real
        this.startRealTimeUpdates();
    }

    generateHeatmapData() {
        return {
            aqi: this.generateAQIHeatmapData(),
            pollutants: this.generatePollutantHeatmapData(),
            fires: this.generateFireHeatmapData(),
            temperature: this.generateTemperatureHeatmapData(),
            humidity: this.generateHumidityHeatmapData()
        };
    }

    generateAQIHeatmapData() {
        return [
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo', aqi: 85, pm25: 35 },
            { lat: -22.9068, lng: -43.1729, intensity: 0.6, region: 'Rio de Janeiro', aqi: 65, pm25: 25 },
            { lat: 40.7128, lng: -74.0060, intensity: 0.4, region: 'Nova York', aqi: 45, pm25: 18 },
            { lat: 39.9042, lng: 116.4074, intensity: 1.0, region: 'Pequim', aqi: 98, pm25: 45 },
            { lat: 28.6139, lng: 77.2090, intensity: 0.8, region: 'Nova Delhi', aqi: 88, pm25: 38 }
        ];
    }

    generatePollutantHeatmapData() {
        return [
            { lat: -23.5505, lng: -46.6333, intensity: 0.7, region: 'São Paulo' },
            { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'México City' },
            { lat: 39.9042, lng: 116.4074, intensity: 0.8, region: 'Pequim' }
        ];
    }

    generateFireHeatmapData() {
        return [
            { lat: -3.4653, lng: -62.2159, intensity: 1.0, region: 'Amazônia', confidence: 95, brightness: 330 },
            { lat: -2.1631, lng: 15.8277, intensity: 0.8, region: 'África Central', confidence: 80, brightness: 300 },
            { lat: 61.5240, lng: 105.3188, intensity: 1.0, region: 'Sibéria', confidence: 95, brightness: 340 }
        ];
    }

    generateTemperatureHeatmapData() {
        return [
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo', temperature: 28, humidity: 75 },
            { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'México City', temperature: 25, humidity: 65 },
            { lat: 40.7128, lng: -74.0060, intensity: 0.3, region: 'Nova York', temperature: 15, humidity: 60 }
        ];
    }

    generateHumidityHeatmapData() {
        return [
            { lat: 6.5244, lng: 3.3792, intensity: 0.8, region: 'Lagos', humidity: 80 },
            { lat: -33.8688, lng: 151.2093, intensity: 0.6, region: 'Sydney', humidity: 70 },
            { lat: 30.0444, lng: 31.2357, intensity: 0.4, region: 'Cairo', humidity: 45 }
        ];
    }

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
        
        console.log('Heatmap aplicado:', type);
    }

    drawHeatmapPoint(ctx, point, type) {
        // Converter coordenadas para posição na textura
        const x = ((point.lng + 180) / 360) * 1024;
        const y = ((90 - point.lat) / 180) * 512;
        
        // Criar gradiente radial baseado na intensidade
        const radius = 40 + (point.intensity * 80);
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
    }

    getHeatmapColors(type, intensity) {
        switch (type) {
            case 'aqi':
                if (intensity <= 0.3) {
                    return { center: 'rgba(0, 255, 136, 0.9)', middle: 'rgba(0, 255, 136, 0.6)', edge: 'rgba(0, 255, 136, 0.3)' };
                } else if (intensity <= 0.6) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else if (intensity <= 0.8) {
                    return { center: 'rgba(255, 102, 0, 0.9)', middle: 'rgba(255, 102, 0, 0.6)', edge: 'rgba(255, 102, 0, 0.3)' };
                } else {
                    return { center: 'rgba(255, 68, 68, 0.9)', middle: 'rgba(255, 68, 68, 0.6)', edge: 'rgba(255, 68, 68, 0.3)' };
                }
            case 'pollutants':
                return { center: 'rgba(255, 107, 53, 0.9)', middle: 'rgba(255, 107, 53, 0.6)', edge: 'rgba(255, 107, 53, 0.3)' };
            case 'fires':
                if (intensity <= 0.5) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else if (intensity <= 0.8) {
                    return { center: 'rgba(255, 102, 0, 0.9)', middle: 'rgba(255, 102, 0, 0.6)', edge: 'rgba(255, 102, 0, 0.3)' };
                } else {
                    return { center: 'rgba(255, 68, 68, 0.9)', middle: 'rgba(255, 68, 68, 0.6)', edge: 'rgba(255, 68, 68, 0.3)' };
                }
            case 'temperature':
                if (intensity <= 0.3) {
                    return { center: 'rgba(0, 102, 255, 0.9)', middle: 'rgba(0, 102, 255, 0.6)', edge: 'rgba(0, 102, 255, 0.3)' };
                } else if (intensity <= 0.6) {
                    return { center: 'rgba(0, 255, 136, 0.9)', middle: 'rgba(0, 255, 136, 0.6)', edge: 'rgba(0, 255, 136, 0.3)' };
                } else if (intensity <= 0.8) {
                    return { center: 'rgba(255, 170, 0, 0.9)', middle: 'rgba(255, 170, 0, 0.6)', edge: 'rgba(255, 170, 0, 0.3)' };
                } else {
                    return { center: 'rgba(255, 68, 68, 0.9)', middle: 'rgba(255, 68, 68, 0.6)', edge: 'rgba(255, 68, 68, 0.3)' };
                }
            case 'humidity':
                if (intensity <= 0.3) {
                    return { center: 'rgba(255, 102, 0, 0.9)', middle: 'rgba(255, 102, 0, 0.6)', edge: 'rgba(255, 102, 0, 0.3)' };
                } else if (intensity <= 0.6) {
                    return { center: 'rgba(0, 102, 255, 0.9)', middle: 'rgba(0, 102, 255, 0.6)', edge: 'rgba(0, 102, 255, 0.3)' };
                } else {
                    return { center: 'rgba(0, 170, 255, 0.9)', middle: 'rgba(0, 170, 255, 0.6)', edge: 'rgba(0, 170, 255, 0.3)' };
                }
            default:
                return { center: 'rgba(255, 255, 255, 0.9)', middle: 'rgba(255, 255, 255, 0.6)', edge: 'rgba(255, 255, 255, 0.3)' };
        }
    }

    setupControls() {
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
    }

    switchHeatmap(type) {
        this.applyHeatmap(type);
        this.updateHeatmapButtons(type);
    }

    updateHeatmapButtons(activeType) {
        const buttons = document.querySelectorAll('.heatmap-btn');
        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.id === `heatmap-${activeType}`) {
                button.classList.add('active');
            }
        });
    }

    toggleDataLayer(layerId, isVisible) {
        console.log(`Toggle layer ${layerId}: ${isVisible}`);
        // Implementar lógica para mostrar/ocultar camadas
    }

    startRealTimeUpdates() {
        console.log('Iniciando atualizações em tempo real...');
        
        // Atualizar dados a cada 30 segundos
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
        
        // Atualização inicial
        this.updateRealTimeData();
    }

    updateRealTimeData() {
        console.log('Atualizando dados em tempo real...');
        
        // Simular variação nos dados
        this.simulateDataVariation();
        
        // Reaplicar o heatmap atual
        if (this.currentHeatmapType) {
            this.applyHeatmap(this.currentHeatmapType);
        }
    }

    simulateDataVariation() {
        // Simular variação nos dados para demonstrar comportamento dinâmico
        if (this.heatmapData && this.heatmapData.aqi) {
            this.heatmapData.aqi.forEach(point => {
                const variation = (Math.random() - 0.5) * 0.2;
                point.intensity = Math.max(0.1, Math.min(1.0, point.intensity + variation));
            });
        }
    }

    loadData() {
        // Carregar dados das APIs (implementação simplificada)
        console.log('Carregando dados das APIs...');
        // Aqui você pode implementar chamadas reais para APIs da NASA
    }

    handleResize() {
        if (this.renderer && this.camera) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Inicializar aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página do globo carregada');
    
    // Verificar se Three.js está carregado
    if (typeof THREE === 'undefined') {
        console.error('Three.js não foi carregado!');
        alert('Erro: Three.js não foi carregado. Verifique sua conexão com a internet.');
        return;
    }
    
    console.log('Three.js carregado:', THREE.REVISION);
    
    // Verificar se OrbitControls está disponível
    if (typeof THREE.OrbitControls === 'undefined') {
        console.error('OrbitControls não foi carregado!');
        alert('Erro: OrbitControls não foi carregado. Verifique sua conexão com a internet.');
        return;
    }
    
    console.log('OrbitControls carregado');
    
    try {
        new GlobeApp();
    } catch (error) {
        console.error('Erro ao inicializar GlobeApp:', error);
        alert('Erro ao inicializar o globo: ' + error.message);
    }
});
