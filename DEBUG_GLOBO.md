# 🐛 Debug: Globo não está aparecendo

## 📋 Problema
O globo 3D não está aparecendo na tela, apenas fica tudo preto.

## 🔍 O que foi feito

### ✅ Simplificações realizadas:
1. **Desabilitado temporariamente**:
   - Sistema de mapa de calor (`initHeatmapSystem()`)
   - Atmosfera (`createAtmosphere()`)
   - Estrelas de fundo (`createStarField()`)
   - Controles de camadas (`setupGlobeControls()`)

2. **Simplificado**:
   - Geometria da esfera (de 128x128 para 32x32)
   - Material (de `MeshPhongMaterial` para `MeshBasicMaterial`)
   - Sistema de dados (apenas `this.dataPoints = []`)

3. **Adicionado logs de debug** em:
   - Construtor da classe
   - Função `init()`
   - Função `showScreen()`
   - Função `showGlobe()`
   - Função `initGlobe()`
   - Função `createGlobe()`
   - Função `animateGlobe()`
   - Criação da câmera
   - Criação do renderer
   - Criação dos controles
   - Criação das luzes

## 🎯 Próximos passos para debug

### 1. Abrir o navegador e verificar:
   - Abrir `http://localhost:8000/index.html`
   - Abrir o console do navegador (F12)
   - Clicar em "Ver o ar agora"
   - Verificar os logs no console

### 2. Logs esperados:
```
DOM carregado, inicializando AirQuest...
Construtor AirQuest chamado
Inicializando AirQuest...
Criando partículas...
Partículas criadas
Configurando event listeners...
Event listeners configurados
Carregando dados do quiz...
Dados do quiz carregados
Carregando dados de qualidade do ar...
Dados de qualidade do ar carregados
AirQuest inicializado
AirQuest carregado e funções globais definidas
--- Ao clicar em "Ver o ar agora" ---
Mostrando tela do globo...
Mostrando tela: globe-screen
Tela ativada: globe-screen
Inicializando globo...
Inicializando globo...
Canvas encontrado: [canvas element]
Container: [div element]
Câmera criada: [camera object]
Posição da câmera: Vector3 {x: 0, y: 0, z: 3}
Renderer criado: [renderer object]
Tamanho do renderer: Vector2 {x: width, y: height}
Controles criados: [controls object]
Luzes adicionadas à cena
Número de objetos na cena: 3
Criando globo...
Globo criado e adicionado à cena
Globo posição: Vector3 {x: 0, y: 0, z: 0}
Globo visível: true
Iniciando animação do globo...
Animação iniciada
Globo deve estar visível agora
Cena final: [scene object]
Globo final: [mesh object]
Verificando se tudo está funcionando...
--- Após 1 segundo ---
Teste após 1 segundo:
Globo ainda existe: true
Cena ainda existe: true
Câmera ainda existe: true
Renderer ainda existe: true
--- Após 2 segundos ---
Testando renderização manual...
Renderização manual executada
```

### 3. Possíveis problemas:
   - **Three.js não está carregando**: Verificar se o script do Three.js está carregando corretamente
   - **OrbitControls não está carregando**: Verificar se o script do OrbitControls está carregando corretamente
   - **Canvas não está sendo encontrado**: Verificar se o ID do canvas está correto
   - **Container não está com dimensões**: Verificar se o container tem width e height
   - **Câmera muito longe**: Posição z=3 pode ser muito longe (tentar z=2)
   - **Globo muito pequeno**: Raio de 1 pode ser muito pequeno (tentar raio de 2)

### 4. Testes adicionais:
   - Verificar se o canvas está visível no DOM
   - Verificar se o canvas tem width e height
   - Verificar se o renderer está criando o contexto WebGL
   - Verificar se há erros no console
   - Verificar se há erros de CORS (caso esteja usando texturas externas)

## 🔧 Código de teste simplificado

Se os logs estiverem todos OK mas o globo ainda não aparecer, testar este código ultra-simples no console:

```javascript
// Teste manual no console
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('globe-canvas') });
renderer.setSize(800, 600);

const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Vermelho para teste
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 3;

renderer.render(scene, camera);
```

Se este código funcionar, o problema é com a inicialização da aplicação.
Se não funcionar, o problema é com o Three.js ou com o canvas.

## 📞 Próximas ações

1. **Abrir o navegador** e verificar os logs
2. **Verificar se há erros** no console
3. **Testar o código simplificado** acima
4. **Reportar os resultados** para continuar o debug

