// Configurações globais
const EARTH_RADIUS = 1;
const ATMOSPHERE_RADIUS = 1.01;
const ROTATION_SPEED = 0.002;

// Variáveis globais
let scene, camera, renderer, controls;
let earthMesh, atmosphereMesh;
let earthMaterial, atmosphereMaterial;
let isOzoneMode = true;
let isLoading = true;
let currentDataType = 'all'; // 'all', 'monitoring', 'station', 'observatory', 'satellite'
let currentDisplayData = 'co2'; // 'co2', 'temperature', 'ozone', 'humidity', 'pressure'
let dataPoints = [];

// Configurações removidas - não utilizadas

// Texturas da NASA
const textures = {
    earth: {
        surface: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg',
        bump: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg',
        specular: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/water_4k.png'
    },
    atmosphere: {
        ozone: 'https://neo.gsfc.nasa.gov/archive/png/OZONE_M/OZONE_M_2024-09-01.png',
        co2: 'https://neo.gsfc.nasa.gov/archive/png/AIRS_CO2_M/AIRS_CO2_M_2024-09-01.png'
    }
};

// Inicialização
function init() {
    createScene();
    createCamera();
    createRenderer();
    createControls();
    createLights();
    createBasicEarth(); // Criar Terra básica primeiro
    loadTextures(); // Tentar carregar texturas da NASA
    setupEventListeners();
    animate();
}

// Criar cena
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
}

// Criar câmera
function createCamera() {
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 3);
}

// Criar renderer
function createRenderer() {
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
}

// Criar controles de órbita
function createControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controls.autoRotate = false;
}

// Criar iluminação
function createLights() {
    // Luz solar direcional (mais intensa para simular dia)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    scene.add(sunLight);

    // Luz ambiente mais intensa para iluminação uniforme
    const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
    scene.add(ambientLight);
    
    // Luz adicional para garantir iluminação uniforme
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-3, -2, -3);
    scene.add(fillLight);
}

// Criar textura procedural realista da Terra
function createRealisticEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Gradiente base (oceano)
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGradient.addColorStop(0, '#1e3a8a'); // Azul escuro (profundo)
    oceanGradient.addColorStop(0.5, '#3b82f6'); // Azul médio
    oceanGradient.addColorStop(1, '#60a5fa'); // Azul claro (raso)
    
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Adicionar continentes com cores realistas
    const continents = [
        // América do Norte
        { x: 150, y: 100, width: 200, height: 300, color: '#8b5a2b' },
        // América do Sul
        { x: 200, y: 250, width: 120, height: 200, color: '#a0522d' },
        // Europa/África
        { x: 450, y: 120, width: 80, height: 200, color: '#8b7355' },
        { x: 480, y: 200, width: 100, height: 250, color: '#8b7355' },
        // Ásia
        { x: 650, y: 80, width: 200, height: 180, color: '#8b5a2b' },
        // Austrália
        { x: 750, y: 350, width: 80, height: 60, color: '#a0522d' }
    ];
    
    continents.forEach(continent => {
        ctx.fillStyle = continent.color;
        ctx.beginPath();
        ctx.ellipse(continent.x, continent.y, continent.width/2, continent.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Adicionar variações de cor (florestas, desertos, etc.)
        const variation = Math.random() * 0.3;
        const r = parseInt(continent.color.slice(1, 3), 16);
        const g = parseInt(continent.color.slice(3, 5), 16);
        const b = parseInt(continent.color.slice(5, 7), 16);
        
        const newR = Math.min(255, Math.max(0, r + (Math.random() - 0.5) * 50));
        const newG = Math.min(255, Math.max(0, g + (Math.random() - 0.5) * 50));
        const newB = Math.min(255, Math.max(0, b + (Math.random() - 0.5) * 50));
        
        ctx.fillStyle = `rgb(${newR}, ${newG}, ${newB})`;
        ctx.beginPath();
        ctx.ellipse(continent.x + (Math.random() - 0.5) * 20, continent.y + (Math.random() - 0.5) * 20, 
                   continent.width/3, continent.height/3, 0, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Adicionar nuvens
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 30 + 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Criar pontos de dados informativos
function createDataPoints() {
    // Pontos de dados da NASA com coordenadas geograficamente corretas
    dataPoints = [
        {
            name: "Estação Espacial Internacional",
            lat: 51.6, // Londres, Reino Unido (órbita próxima)
            lon: -0.1,
            data: "Altitude: 408km | Velocidade: 27,600 km/h",
            color: 0xff6b6b,
            type: "station"
        },
        {
            name: "Observatório de Ozônio - Antártica",
            lat: -75.0, // Estação McMurdo, Antártica
            lon: 166.0,
            data: "Buraco na camada de ozônio monitorado",
            color: 0x4ecdc4,
            type: "observatory"
        },
        {
            name: "Estação de Monitoramento CO₂ - Mauna Loa",
            lat: 19.5, // Havaí, EUA
            lon: -155.6,
            data: "Concentração CO₂: 421 ppm (2024)",
            color: 0xffa726,
            type: "monitoring"
        },
        {
            name: "Satélite Aura (NASA)",
            lat: 0, // Equador (órbita)
            lon: 0,
            data: "Monitoramento atmosférico global",
            color: 0x9c27b0,
            type: "satellite"
        },
        {
            name: "Estação de Monitoramento - Ártico",
            lat: 78.2, // Svalbard, Noruega
            lon: 15.6,
            data: "Temperatura: -15°C | CO₂: 420 ppm",
            color: 0x2196f3,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Amazônia",
            lat: -3.1, // Manaus, Brasil
            lon: -60.0,
            data: "Floresta tropical | CO₂: 380 ppm",
            color: 0x4caf50,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Sibéria",
            lat: 64.0, // Yakutsk, Sibéria, Rússia
            lon: 129.7,
            data: "Permafrost | Temperatura: -25°C",
            color: 0x607d8b,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Austrália",
            lat: -25.3, // Alice Springs, Austrália
            lon: 133.3,
            data: "Deserto | CO₂: 410 ppm",
            color: 0xff9800,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - África",
            lat: -1.3, // Nairobi, Quênia
            lon: 36.8,
            data: "Savana | CO₂: 390 ppm",
            color: 0x8bc34a,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Europa",
            lat: 52.5, // Berlim, Alemanha
            lon: 13.4,
            data: "Temperado | CO₂: 420 ppm",
            color: 0x2196f3,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Ásia",
            lat: 35.7, // Tóquio, Japão
            lon: 139.7,
            data: "Industrial | CO₂: 450 ppm",
            color: 0xf44336,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - América do Norte",
            lat: 40.7, // Nova York, EUA
            lon: -74.0,
            data: "Continental | CO₂: 415 ppm",
            color: 0x9c27b0,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Oceano Pacífico",
            lat: 0.0, // Oceano Pacífico Central
            lon: -150.0,
            data: "Oceano | CO₂: 380 ppm",
            color: 0x00bcd4,
            type: "monitoring"
        },
        {
            name: "Estação de Monitoramento - Oceano Atlântico",
            lat: 0.0, // Oceano Atlântico Central
            lon: -30.0,
            data: "Oceano | CO₂: 385 ppm",
            color: 0x009688,
            type: "monitoring"
        }
    ];
    
    dataPoints.forEach(point => {
        // Converter coordenadas para posição 3D
        const phi = (90 - point.lat) * (Math.PI / 180);
        const theta = (point.lon + 180) * (Math.PI / 180);
        
        const x = EARTH_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = EARTH_RADIUS * Math.cos(phi);
        const z = EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);
        
        // Criar ponto visual (sólido e fixo)
        const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ 
            color: point.color,
            transparent: false,
            opacity: 1.0
        });
        const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
        
        pointMesh.position.set(x, y, z);
        pointMesh.userData = {
            name: point.name,
            data: point.data,
            lat: point.lat,
            lon: point.lon,
            type: point.type,
            originalPosition: new THREE.Vector3(x, y, z)
        };
        
        // Ponto fixo sem animação
        pointMesh.scale.set(1.0, 1.0, 1.0);
        
        // Adicionar ponto como filho do globo terrestre
        earthMesh.add(pointMesh);
        
        // Criar linha conectora para a superfície (mais visível)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x * 1.2, y * 1.2, z * 1.2)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: point.color,
            transparent: true,
            opacity: 0.8,
            linewidth: 3
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { parentPoint: pointMesh };
        earthMesh.add(line);
    });
    
    // Dados simulados para demonstração
    
    // Criar interfaces flutuantes
    createFloatingInterfaces();
    
    // Criar aura atmosférica
    createAtmosphereAura();
    
    // Criar estrelas no céu
    createStars();
}

// Filtrar pontos por tipo
function filterDataPointsByType(type) {
    if (earthMesh) {
        earthMesh.traverse((child) => {
            if (child.userData && child.userData.name) {
                const pointType = child.userData.type;
                const shouldShow = type === 'all' || pointType === type;
                child.visible = shouldShow;
                
                // Também esconder/mostrar linha conectora
                if (child.userData.parentPoint) {
                    child.visible = shouldShow;
                }
                
                // Esconder/mostrar interface flutuante
                if (child.userData.floatingInterface) {
                    child.userData.floatingInterface.visible = shouldShow;
                }
            }
        });
    }
}

// Alternar tipo de dados
function toggleDataType(type) {
    currentDataType = type;
    filterDataPointsByType(type);
    updateMenuButtons();
}

// Atualizar botões do menu
function updateMenuButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === currentDataType) {
            btn.classList.add('active');
        }
    });
    
    const displayButtons = document.querySelectorAll('.display-btn');
    displayButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.display === currentDisplayData) {
            btn.classList.add('active');
        }
    });
}

// Alternar tipo de dado exibido
function toggleDisplayData(displayType) {
    currentDisplayData = displayType;
    updateMenuButtons();
    updateFloatingInterfaces();
}

// Funções de carregamento de dados reais removidas - não utilizadas

// Função updateDataPointsWithRealData removida - não utilizada

// Gerar dados específicos para cada estação
function generateStationData(point) {
    const baseData = getBaseDataForLocation(point.lat, point.lon);
    const timeStamp = new Date().toLocaleTimeString();
    
    switch (point.type) {
        case 'station':
            return generateStationDataValues(point, baseData, timeStamp);
        case 'monitoring':
            return generateMonitoringData(point, baseData, timeStamp);
        case 'observatory':
            return generateObservatoryData(point, baseData, timeStamp);
        case 'satellite':
            return generateSatelliteData(point, baseData, timeStamp);
        default:
            return point.data;
    }
}

// Gerar dados para estações espaciais
function generateStationDataValues(point, baseData, timeStamp) {
    const altitude = Math.floor(Math.random() * 50 + 400);
    const velocity = Math.floor(Math.random() * 1000 + 27000);
    const orbit = Math.floor(Math.random() * 10 + 90);
    
    return `Altitude: ${altitude}km | Velocidade: ${velocity} km/h | Órbita: ${orbit}° | Status: Ativo | ${timeStamp}`;
}

// Gerar dados para estações de monitoramento
function generateMonitoringData(point, baseData, timeStamp) {
    const co2 = Math.floor(Math.random() * 20 + baseData.co2Base);
    const temp = Math.floor(Math.random() * 20 + baseData.tempBase);
    const humidity = Math.floor(Math.random() * 30 + baseData.humidityBase);
    const pressure = Math.floor(Math.random() * 50 + baseData.pressureBase);
    const airQuality = getAirQualityIndex(co2);
    
    return `CO₂: ${co2} ppm | Temp: ${temp}°C | Umidade: ${humidity}% | Pressão: ${pressure} hPa | AQI: ${airQuality} | ${timeStamp}`;
}

// Gerar dados para observatórios
function generateObservatoryData(point, baseData, timeStamp) {
    const ozone = Math.floor(Math.random() * 50 + baseData.ozoneBase);
    const uvIndex = Math.floor(Math.random() * 10 + baseData.uvBase);
    const radiation = (Math.random() * 0.5 + baseData.radiationBase).toFixed(2);
    const atmosphericPressure = Math.floor(Math.random() * 20 + baseData.pressureBase);
    
    return `Ozônio: ${ozone} DU | UV: ${uvIndex} | Radiação: ${radiation} μW/cm² | Pressão: ${atmosphericPressure} hPa | ${timeStamp}`;
}

// Gerar dados para satélites
function generateSatelliteData(point, baseData, timeStamp) {
    const orbit = Math.floor(Math.random() * 100 + 700);
    const dataRate = Math.floor(Math.random() * 1000 + 500);
    const coverage = Math.floor(Math.random() * 20 + 80);
    const missionStatus = Math.random() > 0.1 ? 'Operacional' : 'Manutenção';
    
    return `Órbita: ${orbit}km | Taxa: ${dataRate} Mbps | Cobertura: ${coverage}% | Status: ${missionStatus} | ${timeStamp}`;
}

// Obter dados base para localização
function getBaseDataForLocation(lat, lon) {
    // Dados base por região
    if (lat > 60) { // Ártico
        return { co2Base: 400, tempBase: -20, humidityBase: 60, pressureBase: 1013, ozoneBase: 250, uvBase: 2, radiationBase: 0.1 };
    } else if (lat < -60) { // Antártica
        return { co2Base: 380, tempBase: -30, humidityBase: 40, pressureBase: 1000, ozoneBase: 200, uvBase: 1, radiationBase: 0.05 };
    } else if (lat > 0 && lat < 30) { // Norte temperado
        return { co2Base: 420, tempBase: 15, humidityBase: 70, pressureBase: 1013, ozoneBase: 300, uvBase: 5, radiationBase: 0.3 };
    } else if (lat < 0 && lat > -30) { // Sul temperado
        return { co2Base: 410, tempBase: 20, humidityBase: 75, pressureBase: 1015, ozoneBase: 320, uvBase: 6, radiationBase: 0.4 };
    } else if (Math.abs(lat) < 30) { // Tropical
        return { co2Base: 400, tempBase: 25, humidityBase: 80, pressureBase: 1010, ozoneBase: 280, uvBase: 8, radiationBase: 0.5 };
    } else { // Outros
        return { co2Base: 415, tempBase: 10, humidityBase: 65, pressureBase: 1012, ozoneBase: 290, uvBase: 4, radiationBase: 0.2 };
    }
}

// Obter índice de qualidade do ar
function getAirQualityIndex(co2) {
    if (co2 < 400) return 'Excelente';
    if (co2 < 420) return 'Bom';
    if (co2 < 450) return 'Moderado';
    if (co2 < 500) return 'Ruim';
    return 'Muito Ruim';
}

// Obter status da qualidade do ar com cores
function getAirQualityStatus(data) {
    const baseData = getBaseDataForLocation(data.lat, data.lon);
    const co2 = Math.floor(Math.random() * 20 + baseData.co2Base);
    
    if (co2 < 400) {
        return { status: '🟢 Excelente', color: '#4CAF50' };
    } else if (co2 < 420) {
        return { status: '🟡 Bom', color: '#8BC34A' };
    } else if (co2 < 450) {
        return { status: '🟠 Moderado', color: '#FF9800' };
    } else if (co2 < 500) {
        return { status: '🔴 Ruim', color: '#F44336' };
    } else {
        return { status: '💀 Muito Ruim', color: '#9C27B0' };
    }
}

// Criar interfaces flutuantes em cima dos pontos
function createFloatingInterfaces() {
    if (earthMesh) {
        earthMesh.traverse((child) => {
            if (child.userData && child.userData.name) {
                const point = child.userData;
                const interface = createFloatingInterface(point);
                child.userData.floatingInterface = interface;
            }
        });
    }
}

// Criar interface flutuante individual
function createFloatingInterface(point) {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    // Obter dados específicos
    const dataValue = getDisplayValue(point, currentDisplayData);
    const airQuality = getAirQualityStatus(point);
    
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 80);
    gradient.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
    gradient.addColorStop(1, 'rgba(20, 20, 20, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 80);
    
    // Borda
    ctx.strokeStyle = airQuality.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 198, 78);
    
    // Título (tipo de dado)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(getDataTypeLabel(currentDisplayData), 100, 18);
    
    // Valor do dado
    ctx.fillStyle = airQuality.color;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(dataValue, 100, 38);
    
    // Status da qualidade do ar
    ctx.fillStyle = '#d0d0d0';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(airQuality.status, 100, 55);
    
    // Nome da estação
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(point.name, 100, 70);
    
    // Criar textura
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.4, 0.16, 1);
    sprite.userData = { parentPoint: point };
    
    // Posicionar acima do ponto
    const pointPosition = new THREE.Vector3();
    if (earthMesh) {
        earthMesh.traverse((child) => {
            if (child.userData && child.userData.name === point.name) {
                pointPosition.copy(child.position);
            }
        });
    }
    
    sprite.position.copy(pointPosition);
    sprite.position.y += 0.3; // Acima do ponto
    
    earthMesh.add(sprite);
    return sprite;
}

// Obter label do tipo de dado
function getDataTypeLabel(dataType) {
    const labels = {
        'co2': '🌫️ CO₂',
        'temperature': '🌡️ Temperatura',
        'ozone': '🛡️ Ozônio',
        'humidity': '💧 Umidade',
        'pressure': '📈 Pressão'
    };
    return labels[dataType] || '📊 Dados';
}

// Atualizar interfaces flutuantes
function updateFloatingInterfaces() {
    if (earthMesh) {
        earthMesh.traverse((child) => {
            if (child.userData && child.userData.floatingInterface) {
                const interface = child.userData.floatingInterface;
                const point = child.userData;
                
                // Recriar interface com novos dados
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 80;
                const ctx = canvas.getContext('2d');
                
                // Obter dados específicos
                const dataValue = getDisplayValue(point, currentDisplayData);
                const airQuality = getAirQualityStatus(point);
                
                // Fundo com gradiente
                const gradient = ctx.createLinearGradient(0, 0, 0, 80);
                gradient.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
                gradient.addColorStop(1, 'rgba(20, 20, 20, 0.95)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 200, 80);
                
                // Borda
                ctx.strokeStyle = airQuality.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, 198, 78);
                
                // Título (tipo de dado)
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(getDataTypeLabel(currentDisplayData), 100, 18);
                
                // Valor do dado
                ctx.fillStyle = airQuality.color;
                ctx.font = 'bold 16px Inter, sans-serif';
                ctx.fillText(dataValue, 100, 38);
                
                // Status da qualidade do ar
                ctx.fillStyle = '#d0d0d0';
                ctx.font = '11px Inter, sans-serif';
                ctx.fillText(airQuality.status, 100, 55);
                
                // Nome da estação
                ctx.fillStyle = '#a0a0a0';
                ctx.font = '10px Inter, sans-serif';
                ctx.fillText(point.name, 100, 70);
                
                // Atualizar textura
                const texture = new THREE.CanvasTexture(canvas);
                interface.material.map = texture;
                interface.material.needsUpdate = true;
            }
        });
    }
}

// Criar aura atmosférica ao redor do planeta
function createAtmosphereAura() {
    // Geometria da esfera atmosférica (um pouco maior que a Terra)
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 32, 32);
    
    // Material da atmosfera com transparência
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB, // Azul céu
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide, // Renderizar apenas o lado interno
        shininess: 100,
        specular: new THREE.Color(0x444444)
    });
    
    // Criar mesh da atmosfera
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.name = 'atmosphere';
    scene.add(atmosphere);
    
    // Adicionar efeito de brilho
    const glowGeometry = new THREE.SphereGeometry(1.08, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.name = 'atmosphereGlow';
    scene.add(glow);
    
    console.log('✅ Aura atmosférica criada com sucesso');
}

// Criar estrelas no céu
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        // Posições aleatórias em uma esfera grande
        const radius = 50 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Cores aleatórias das estrelas
        const color = new THREE.Color();
        color.setHSL(0.1 + Math.random() * 0.1, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.name = 'stars';
    scene.add(stars);
    
    console.log('✅ Estrelas criadas com sucesso');
}

// Obter valor específico para exibição
function getDisplayValue(point, dataType) {
    const baseData = getBaseDataForLocation(point.lat, point.lon);
    
    switch (dataType) {
        case 'co2':
            const co2 = Math.floor(Math.random() * 20 + baseData.co2Base);
            return `${co2} ppm CO₂`;
        case 'temperature':
            const temp = Math.floor(Math.random() * 20 + baseData.tempBase);
            return `${temp}°C`;
        case 'ozone':
            const ozone = Math.floor(Math.random() * 50 + baseData.ozoneBase);
            return `${ozone} DU`;
        case 'humidity':
            const humidity = Math.floor(Math.random() * 30 + baseData.humidityBase);
            return `${humidity}%`;
        case 'pressure':
            const pressure = Math.floor(Math.random() * 50 + baseData.pressureBase);
            return `${pressure} hPa`;
        default:
            return 'N/A';
    }
}

// Função updateDataLabels removida - não utilizada

// Atualizar pontos com dados simulados
function updateDataPointsWithSimulatedData() {
    if (earthMesh) {
        earthMesh.traverse((child) => {
            if (child.userData && child.userData.name) {
                const point = child.userData;
                
                // Usar o mesmo sistema de geração de dados
                point.data = generateStationData(point);
            }
        });
    }
}

// Criar Terra básica (sem texturas externas)
function createBasicEarth() {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    
    // Criar textura procedural mais realista
    const earthTexture = createRealisticEarthTexture();
    
    earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        shininess: 100,
        specular: 0x111111
    });
    
    earthMesh = new THREE.Mesh(geometry, earthMaterial);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    scene.add(earthMesh);
    
    // Criar atmosfera básica
    const atmosphereGeometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
    atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Verde para ozônio
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    
    atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);
    
    // Adicionar pontos informativos
    createDataPoints();
    
    // Esconder loading imediatamente
    hideLoading();
}

// Carregar texturas
function loadTextures() {
    const loader = new THREE.TextureLoader();
    let loadedCount = 0;
    const totalTextures = 5;
    
    // Função para verificar se todas as texturas foram carregadas
    function checkAllLoaded() {
        loadedCount++;
        console.log(`Texturas carregadas: ${loadedCount}/${totalTextures}`);
        
        if (loadedCount >= totalTextures) {
            console.log('Todas as texturas carregadas!');
            updateEarthWithTextures();
            updateAtmosphereWithTextures();
        }
    }
    
    // Função para criar texturas de fallback
    function createFallbackTexture(color = 0x404040) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(canvas);
    }

    // Carregar texturas da Terra com fallback
    const earthSurfaceTexture = loader.load(
        textures.earth.surface,
        () => checkAllLoaded(),
        undefined,
        (error) => {
            console.warn('Erro ao carregar textura da superfície, usando fallback:', error);
            window.earthTextures.surface = createFallbackTexture(0x4a90e2);
            checkAllLoaded();
        }
    );
    
    const earthBumpTexture = loader.load(
        textures.earth.bump,
        () => checkAllLoaded(),
        undefined,
        (error) => {
            console.warn('Erro ao carregar textura de relevo, usando fallback:', error);
            window.earthTextures.bump = createFallbackTexture(0x808080);
            checkAllLoaded();
        }
    );
    
    const earthSpecularTexture = loader.load(
        textures.earth.specular,
        () => checkAllLoaded(),
        undefined,
        (error) => {
            console.warn('Erro ao carregar textura de reflexos, usando fallback:', error);
            window.earthTextures.specular = createFallbackTexture(0x0000ff);
            checkAllLoaded();
        }
    );

    // Carregar texturas atmosféricas com fallback
    const ozoneTexture = loader.load(
        textures.atmosphere.ozone,
        () => checkAllLoaded(),
        undefined,
        (error) => {
            console.warn('Erro ao carregar textura de ozônio, usando fallback:', error);
            window.atmosphereTextures.ozone = createFallbackTexture(0x00ff00);
            checkAllLoaded();
        }
    );
    
    const co2Texture = loader.load(
        textures.atmosphere.co2,
        () => checkAllLoaded(),
        undefined,
        (error) => {
            console.warn('Erro ao carregar textura de CO₂, usando fallback:', error);
            window.atmosphereTextures.co2 = createFallbackTexture(0xff6600);
            checkAllLoaded();
        }
    );

    // Armazenar texturas globalmente
    window.earthTextures = {
        surface: earthSurfaceTexture,
        bump: earthBumpTexture,
        specular: earthSpecularTexture
    };
    
    window.atmosphereTextures = {
        ozone: ozoneTexture,
        co2: co2Texture
    };
    
    // Timeout de segurança - se não carregar em 10 segundos, usar fallbacks
    setTimeout(() => {
        if (isLoading) {
            console.warn('Timeout no carregamento, usando texturas de fallback');
            hideLoading();
            createEarth();
            createAtmosphere();
        }
    }, 10000);
}

// Atualizar Terra com texturas da NASA
function updateEarthWithTextures() {
    if (!earthMaterial || !window.earthTextures) return;
    
    earthMaterial.map = window.earthTextures.surface;
    earthMaterial.bumpMap = window.earthTextures.bump;
    earthMaterial.specularMap = window.earthTextures.specular;
    earthMaterial.needsUpdate = true;
    
    console.log('Terra atualizada com texturas da NASA!');
}

// Atualizar atmosfera com texturas da NASA
function updateAtmosphereWithTextures() {
    if (!atmosphereMaterial || !window.atmosphereTextures) return;
    
    atmosphereMaterial.map = window.atmosphereTextures.ozone;
    atmosphereMaterial.needsUpdate = true;
    
    console.log('Atmosfera atualizada com texturas da NASA!');
}

// Criar globo terrestre
function createEarth() {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    
    earthMaterial = new THREE.MeshPhongMaterial({
        map: window.earthTextures.surface,
        bumpMap: window.earthTextures.bump,
        bumpScale: 0.02,
        specularMap: window.earthTextures.specular,
        shininess: 100
    });
    
    earthMesh = new THREE.Mesh(geometry, earthMaterial);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    scene.add(earthMesh);
}

// Criar overlay atmosférico
function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
    
    atmosphereMaterial = new THREE.MeshBasicMaterial({
        map: window.atmosphereTextures.ozone,
        transparent: true,
        opacity: 0.6,
        side: THREE.BackSide
    });
    
    atmosphereMesh = new THREE.Mesh(geometry, atmosphereMaterial);
    scene.add(atmosphereMesh);
}

// Função removida - não mais necessária

// Esconder tela de carregamento
function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    isLoading = false;
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de voltar para página inicial
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
    
    // Botão do quiz
    document.getElementById('quiz-btn').addEventListener('click', () => {
        window.location.href = '/pages/quiz.html';
    });
    
    // Botões de filtro de tipo
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            toggleDataType(type);
        });
    });
    
    // Botões de tipo de dado exibido
    document.querySelectorAll('.display-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const displayType = btn.dataset.display;
            toggleDisplayData(displayType);
        });
    });
    
    // Redimensionamento da janela
    window.addEventListener('resize', onWindowResize);
    
    // Prevenir contexto do menu no canvas
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Interatividade com pontos de dados
    setupDataPointInteraction();
}

// Configurar interatividade com pontos de dados
function setupDataPointInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Criar tooltip moderno
    const tooltip = document.createElement('div');
    tooltip.id = 'dataTooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(10, 10, 10, 0.95);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        font-size: 13px;
        pointer-events: none;
        z-index: 1000;
        display: none;
        max-width: 280px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        font-family: 'Inter', sans-serif;
        line-height: 1.5;
    `;
    document.body.appendChild(tooltip);
    
    // Mouse move para detectar hover
    renderer.domElement.addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([earthMesh], true);
        
        let found = false;
        intersects.forEach(intersect => {
            if (intersect.object.userData && intersect.object.userData.name) {
                const data = intersect.object.userData;
                const airQuality = getAirQualityStatus(data);
                
                tooltip.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${airQuality.color};"></div>
                        <strong style="color: #ffffff; font-size: 14px;">${data.name}</strong>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                        <div style="color: #4CAF50; font-weight: 600; font-size: 12px; margin-bottom: 4px;">${airQuality.status}</div>
                        <div style="color: #d0d0d0; font-size: 11px;">${data.data}</div>
                    </div>
                    <div style="color: #a0a0a0; font-size: 10px; text-align: center;">
                        📍 ${data.lat}°N, ${data.lon}°E
                    </div>
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX + 15) + 'px';
                tooltip.style.top = (event.clientY - 15) + 'px';
                found = true;
            }
        });
        
        if (!found) {
            tooltip.style.display = 'none';
        }
    });
    
    // Click para focar no ponto
    renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([earthMesh], true);
        
        intersects.forEach(intersect => {
            if (intersect.object.userData && intersect.object.userData.name) {
                // Focar no ponto clicado
                const targetPosition = intersect.object.getWorldPosition(new THREE.Vector3());
                targetPosition.multiplyScalar(2.5);
                
                // Animação suave para o ponto
                animateCameraToPosition(targetPosition);
            }
        });
    });
}

// Animar câmera para posição
function animateCameraToPosition(targetPosition) {
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = 1000; // 1 segundo
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controls.target.lerpVectors(controls.target, new THREE.Vector3(0, 0, 0), easeProgress * 0.1);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Redimensionar renderer
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    
    if (!isLoading) {
        // Animar pontos de dados
        animateDataPoints();
    }
    
    // Atualizar controles
    controls.update();
    
    // Renderizar cena
    renderer.render(scene, camera);
}

// Animar pontos de dados
function animateDataPoints() {
    if (earthMesh) {
        earthMesh.traverse((child) => {
            // Animar interfaces flutuantes
            if (child.userData && child.userData.floatingInterface) {
                const interface = child.userData.floatingInterface;
                const pointPosition = new THREE.Vector3();
                
                // Encontrar posição do ponto pai
                earthMesh.traverse((pointChild) => {
                    if (pointChild.userData && pointChild.userData.name === child.userData.name) {
                        pointPosition.copy(pointChild.position);
                    }
                });
                
                // Atualizar posição da interface
                interface.position.copy(pointPosition);
                interface.position.y += 0.3;
                
                // Fazer a interface sempre olhar para a câmera
                interface.lookAt(camera.position);
            }
        });
    }
    
    // Animar estrelas (piscar)
    const stars = scene.getObjectByName('stars');
    if (stars) {
        const time = Date.now() * 0.001;
        stars.rotation.y = time * 0.01;
        
        // Fazer algumas estrelas piscarem
        const positions = stars.geometry.attributes.position.array;
        const colors = stars.geometry.attributes.color.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const starIndex = i / 3;
            const twinkle = Math.sin(time * 2 + starIndex * 0.1) * 0.3 + 0.7;
            colors[i] *= twinkle;
            colors[i + 1] *= twinkle;
            colors[i + 2] *= twinkle;
        }
        
        stars.geometry.attributes.color.needsUpdate = true;
    }
    
    // Animar aura atmosférica
    const atmosphere = scene.getObjectByName('atmosphere');
    if (atmosphere) {
        atmosphere.rotation.y += 0.001;
    }
    
    const atmosphereGlow = scene.getObjectByName('atmosphereGlow');
    if (atmosphereGlow) {
        atmosphereGlow.rotation.y -= 0.0005;
    }
}


// Inicializar quando a página carregar
window.addEventListener('load', init);

// Tratamento de erros
window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.error);
    if (isLoading) {
        hideLoading();
        document.getElementById('container').innerHTML = 
            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #ff6b6b;">' +
            '<h3>Erro ao carregar texturas</h3>' +
            '<p>Verifique sua conexão com a internet</p>' +
            '</div>';
    }
});
