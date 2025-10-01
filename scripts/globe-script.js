// Script específico para a página do globo 3D
class GlobeApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.rotation = 0;
        this.currentHeatmap = 'aqi';
        this.animationId = null;
        this.heatmapData = {};
        
        this.init();
    }

    init() {
        console.log('Inicializando aplicação do globo...');
        this.setupCanvas();
        this.createHeatmapData();
        this.setupControls();
        this.animate();
        this.updateInfoPanel();
    }

    setupCanvas() {
        console.log('Configurando canvas...');
        
        this.canvas = document.getElementById('globe-canvas');
        if (!this.canvas) {
            console.error('Canvas não encontrado!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas configurado');
        
        // Configurar tamanho do canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createHeatmapData() {
        console.log('Criando dados de heatmap...');
        
        this.heatmapData = {
            aqi: [
                { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo, Brasil', aqi: 85, temp: '28°C' },
                { lat: -22.9068, lng: -43.1729, intensity: 0.6, region: 'Rio de Janeiro, Brasil', aqi: 65, temp: '30°C' },
                { lat: 40.7128, lng: -74.0060, intensity: 0.4, region: 'Nova York, EUA', aqi: 45, temp: '15°C' },
                { lat: 39.9042, lng: 116.4074, intensity: 1.0, region: 'Pequim, China', aqi: 98, temp: '22°C' },
                { lat: 28.6139, lng: 77.2090, intensity: 0.8, region: 'Nova Delhi, Índia', aqi: 88, temp: '35°C' }
            ],
            pollutants: [
                { lat: -23.5505, lng: -46.6333, intensity: 0.7, region: 'São Paulo, Brasil', aqi: 156, temp: '28°C' },
                { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'Cidade do México, México', aqi: 178, temp: '25°C' },
                { lat: 39.9042, lng: 116.4074, intensity: 0.8, region: 'Pequim, China', aqi: 165, temp: '22°C' }
            ],
            fires: [
                { lat: -3.4653, lng: -62.2159, intensity: 1.0, region: 'Amazônia, Brasil', aqi: 203, temp: '32°C' },
                { lat: -2.1631, lng: 15.8277, intensity: 0.8, region: 'África Central', aqi: 189, temp: '28°C' },
                { lat: 61.5240, lng: 105.3188, intensity: 1.0, region: 'Sibéria, Rússia', aqi: 195, temp: '5°C' }
            ],
            temperature: [
                { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo, Brasil', aqi: 85, temp: '28°C' },
                { lat: 19.4326, lng: -99.1332, intensity: 0.9, region: 'Cidade do México, México', aqi: 78, temp: '25°C' },
                { lat: 40.7128, lng: -74.0060, intensity: 0.3, region: 'Nova York, EUA', aqi: 45, temp: '15°C' }
            ],
            humidity: [
                { lat: 6.5244, lng: 3.3792, intensity: 0.8, region: 'Lagos, Nigéria', aqi: 72, temp: '28°C' },
                { lat: -33.8688, lng: 151.2093, intensity: 0.6, region: 'Sydney, Austrália', aqi: 58, temp: '20°C' },
                { lat: 30.0444, lng: 31.2357, intensity: 0.4, region: 'Cairo, Egito', aqi: 89, temp: '32°C' }
            ]
        };
        
        console.log('Dados de heatmap criados');
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
        this.currentHeatmap = type;
        
        // Atualizar botões
        document.querySelectorAll('.heatmap-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`heatmap-${type}`).classList.add('active');
        
        // Atualizar painel de informações
        this.updateInfoPanel();
    }

    toggleDataLayer(layerId, isVisible) {
        console.log(`Toggle layer ${layerId}: ${isVisible}`);
        // Implementar lógica para mostrar/ocultar camadas
    }

    updateInfoPanel() {
        const data = this.heatmapData[this.currentHeatmap] || this.heatmapData.aqi;
        const firstPoint = data[0];
        
        if (firstPoint) {
            document.getElementById('current-region').textContent = firstPoint.region;
            document.getElementById('current-aqi').textContent = firstPoint.aqi;
            document.getElementById('current-temp').textContent = firstPoint.temp;
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.drawGlobe();
        this.rotation += 0.005;
    }

    drawGlobe() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.25;
        
        // Limpar canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar estrelas de fundo
        this.drawStars();
        
        // Desenhar globo
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);
        
        // Gradiente para o globo
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(0.6, '#16a34a');
        gradient.addColorStop(0.8, '#15803d');
        gradient.addColorStop(1, '#14532d');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Adicionar continentes
        this.drawContinents(radius);
        
        // Adicionar pontos de heatmap
        this.drawHeatmapPoints(centerX, centerY, radius);
        
        this.ctx.restore();
    }

    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(i * 0.1) * this.canvas.width * 0.4) + this.canvas.width * 0.5;
            const y = (Math.cos(i * 0.1) * this.canvas.height * 0.4) + this.canvas.height * 0.5;
            const size = Math.random() * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawContinents(radius) {
        // América do Norte
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // América do Sul
        this.ctx.fillStyle = '#16a34a';
        this.ctx.beginPath();
        this.ctx.arc(-radius * 0.2, radius * 0.3, radius * 0.12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Europa
        this.ctx.fillStyle = '#6366f1';
        this.ctx.beginPath();
        this.ctx.arc(radius * 0.1, -radius * 0.3, radius * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        
        // África
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(radius * 0.2, -radius * 0.1, radius * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ásia
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(radius * 0.4, -radius * 0.2, radius * 0.18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oceania
        this.ctx.fillStyle = '#8b5cf6';
        this.ctx.beginPath();
        this.ctx.arc(radius * 0.5, radius * 0.2, radius * 0.06, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHeatmapPoints(centerX, centerY, radius) {
        const data = this.heatmapData[this.currentHeatmap] || this.heatmapData.aqi;
        
        data.forEach(point => {
            // Converter coordenadas para posição na tela
            const x = centerX + (point.lng / 180) * radius * 0.8;
            const y = centerY - (point.lat / 90) * radius * 0.8;
            
            // Cores baseadas na intensidade
            let color;
            if (point.intensity <= 0.3) {
                color = '#00ff88';
            } else if (point.intensity <= 0.6) {
                color = '#ffaa00';
            } else if (point.intensity <= 0.8) {
                color = '#ff6600';
            } else {
                color = '#ff4444';
            }
            
            // Tamanho baseado na intensidade
            const size = 15 + (point.intensity * 25);
            
            // Gradiente radial para o ponto
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color + '80');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ponto central mais brilhante
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Inicializar aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página do globo carregada');
    
    try {
        new GlobeApp();
        console.log('Aplicação iniciada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar GlobeApp:', error);
        alert('Erro ao inicializar o globo: ' + error.message);
    }
});
