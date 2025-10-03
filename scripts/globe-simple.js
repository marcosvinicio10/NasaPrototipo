// Script simplificado para o globo 3D com textura realista da Terra
class SimpleGlobeApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.controls = null;
        this.animationId = null;
        this.isMobile = false;
        
        this.init();
    }

    init() {
        console.log('Inicializando globo simplificado...');
        this.createScene();
        this.createGlobe();
        this.setupControls();
        this.animate();
    }

    createScene() {
        console.log('Criando cena...');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Adicionar iluminação
        this.setupLighting();
        
        // Detectar mobile
        this.isMobile = this.detectMobile();
        console.log('Mobile detectado:', this.isMobile);
        
        // Camera
        const fov = this.isMobile ? 60 : 75;
        const aspect = window.innerWidth / window.innerHeight;
        
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
        
        if (this.isMobile) {
            this.camera.position.z = 2.2;
            this.camera.position.y = 0.3;
        } else {
            this.camera.position.z = 1.8;
            this.camera.position.y = 0;
        }
        
        // Renderer
        const canvas = document.getElementById('globe-canvas');
        if (!canvas) {
            throw new Error('Canvas não encontrado!');
        }
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: !this.isMobile,
            alpha: true,
            powerPreference: this.isMobile ? "low-power" : "high-performance"
        });
        
        this.setupResponsiveRenderer();
        
        // Adicionar listeners de resize
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });
    }

    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return isMobile || (isSmallScreen && isTouchDevice);
    }

    setupResponsiveRenderer() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (this.isMobile) {
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = false;
        } else {
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    handleResize() {
        console.log('Redimensionando...');
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        if (this.controls) {
            const wasMobile = this.isMobile;
            this.isMobile = this.detectMobile();
            
            if (wasMobile !== this.isMobile) {
                this.setupControls();
            }
        }
    }

    createGlobe() {
        console.log('Criando globo com textura realista...');
        
        // Geometria
        const geometry = new THREE.SphereGeometry(1.0, 64, 64);
        
        // Timeout para fallback se textura não carregar
        const textureTimeout = setTimeout(() => {
            if (!this.globe) {
                console.log('Timeout: Criando globo de fallback...');
                this.createFallbackGlobe();
            }
        }, 5000); // 5 segundos
        
        // Carregar textura da Terra
        this.loadEarthTexture().then(() => {
            clearTimeout(textureTimeout);
            
            // Material
            const material = new THREE.MeshPhongMaterial({
                map: this.earthTexture,
                shininess: 100,
                specular: new THREE.Color(0x222222)
            });
            
            // Criar globo
            this.globe = new THREE.Mesh(geometry, material);
            this.scene.add(this.globe);
            
            console.log('Globo criado com sucesso');
        }).catch(error => {
            clearTimeout(textureTimeout);
            console.error('Erro ao carregar textura:', error);
            this.createFallbackGlobe();
        });
    }

    async loadEarthTexture() {
        console.log('Carregando textura da Terra...');
        
        const loader = new THREE.TextureLoader();
        
        // URLs alternativas da NASA
        const textureUrls = [
            'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg',
            'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg',
            'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg'
        ];
        
        for (let i = 0; i < textureUrls.length; i++) {
            try {
                console.log(`Tentando carregar textura ${i + 1}/${textureUrls.length}...`);
                const texture = await this.loadTexture(loader, textureUrls[i]);
                if (texture) {
                    this.earthTexture = texture;
                    console.log('✅ Textura da NASA carregada com sucesso!');
                    return texture;
                }
            } catch (error) {
                console.warn(`❌ Falha ao carregar textura ${i + 1}:`, error);
                if (i === textureUrls.length - 1) {
                    throw error;
                }
            }
        }
    }

    loadTexture(loader, url) {
        return new Promise((resolve, reject) => {
            console.log('🌍 Carregando textura da NASA:', url);
            
            // Timeout de 10 segundos por tentativa
            const timeout = setTimeout(() => {
                console.warn('⏰ Timeout ao carregar textura');
                reject(new Error('Timeout'));
            }, 10000);
            
            const texture = loader.load(
                url,
                (loadedTexture) => {
                    clearTimeout(timeout);
                    console.log('✅ Textura carregada com sucesso!');
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.RepeatWrapping;
                    loadedTexture.flipY = false;
                    loadedTexture.anisotropy = 16;
                    resolve(loadedTexture);
                },
                (progress) => {
                    if (progress.total > 0) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        console.log(`📥 Carregando textura: ${percent}%`);
                    }
                },
                (error) => {
                    clearTimeout(timeout);
                    console.error('❌ Erro ao carregar textura:', error);
                    reject(error);
                }
            );
        });
    }

    createFallbackGlobe() {
        console.log('🔄 Criando globo de fallback...');
        
        // Geometria
        const geometry = new THREE.SphereGeometry(1.0, 64, 64);
        
        // Textura procedural melhorada
        const canvas = document.createElement('canvas');
        canvas.width = 2048; // Maior resolução
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Gradiente de fundo para oceanos mais realista
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#0c4a6e'); // Azul escuro (pólos)
        oceanGradient.addColorStop(0.2, '#0284c7'); // Azul médio
        oceanGradient.addColorStop(0.5, '#0ea5e9'); // Azul claro (equador)
        oceanGradient.addColorStop(0.8, '#0284c7'); // Azul médio
        oceanGradient.addColorStop(1, '#0c4a6e'); // Azul escuro (pólos)
        
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Continentes com gradientes mais realistas
        const continentGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        continentGradient.addColorStop(0, '#16a34a'); // Verde escuro
        continentGradient.addColorStop(0.5, '#22c55e'); // Verde médio
        continentGradient.addColorStop(1, '#15803d'); // Verde escuro
        
        ctx.fillStyle = continentGradient;
        
        // América do Norte (mais detalhada)
        ctx.beginPath();
        ctx.ellipse(200, 150, 100, 80, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // América do Sul (mais detalhada)
        ctx.beginPath();
        ctx.ellipse(220, 300, 80, 120, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Europa
        ctx.beginPath();
        ctx.ellipse(450, 120, 50, 40, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // África (mais detalhada)
        ctx.beginPath();
        ctx.ellipse(480, 220, 60, 100, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ásia (mais detalhada)
        ctx.beginPath();
        ctx.ellipse(600, 140, 120, 80, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Austrália
        ctx.beginPath();
        ctx.ellipse(700, 320, 50, 40, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Adicionar nuvens mais realistas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 30 + 15;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Adicionar detalhes nos continentes
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 15 + 5;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Criar textura
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false;
        texture.anisotropy = 16;
        
        // Material com iluminação melhorada
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 100,
            specular: new THREE.Color(0x444444),
            bumpScale: 0.1
        });
        
        // Criar globo
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        console.log('✅ Globo de fallback criado com sucesso');
    }

    setupLighting() {
        console.log('Configurando iluminação...');
        
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direcional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 3, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Luz pontual para iluminação adicional
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(-5, -3, -5);
        this.scene.add(pointLight);
        
        console.log('Iluminação configurada');
    }

    setupControls() {
        console.log('Configurando controles...');
        
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = this.isMobile ? 0.1 : 0.05;
            
            if (this.isMobile) {
                this.controls.enableZoom = true;
                this.controls.enablePan = false;
                this.controls.minDistance = 1.8;
                this.controls.maxDistance = 3.5;
                this.controls.maxPolarAngle = Math.PI * 0.8;
                this.controls.minPolarAngle = Math.PI * 0.2;
                this.controls.rotateSpeed = 0.5;
                this.controls.zoomSpeed = 0.8;
                this.controls.panSpeed = 0.5;
            } else {
                this.controls.enableZoom = true;
                this.controls.enablePan = false;
                this.controls.minDistance = 1.2;
                this.controls.maxDistance = 3.0;
                this.controls.maxPolarAngle = Math.PI;
                this.controls.minPolarAngle = 0;
                this.controls.rotateSpeed = 1.0;
                this.controls.zoomSpeed = 1.0;
                this.controls.panSpeed = 1.0;
            }
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando globo simplificado...');
    window.globeApp = new SimpleGlobeApp();
});
