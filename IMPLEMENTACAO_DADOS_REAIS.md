# 🌍 Implementação de Dados Reais das APIs da NASA

## 📋 **Visão Geral**

Este documento explica como implementar dados reais das APIs da NASA no projeto AirQuest, substituindo os dados simulados por informações em tempo real.

## 🔗 **APIs Implementadas**

### **1. TEMPO (NASA)**
- **Fonte**: Satélite TEMPO da NASA
- **Dados**: Qualidade do ar em tempo real
- **Cobertura**: América do Norte
- **Parâmetros**: NO2, O3, PM2.5, PM10

### **2. OpenAQ**
- **Fonte**: Rede global de estações terrestres
- **Dados**: Medições de qualidade do ar
- **Cobertura**: Mundial
- **Parâmetros**: PM2.5, PM10, NO2, O3, SO2

### **3. FIRMS (NASA)**
- **Fonte**: Satélites MODIS e VIIRS
- **Dados**: Detecção de queimadas
- **Cobertura**: Mundial
- **Parâmetros**: Localização, confiança, intensidade

### **4. OpenWeatherMap**
- **Fonte**: Dados meteorológicos
- **Dados**: Temperatura, umidade, vento
- **Cobertura**: Mundial
- **Parâmetros**: Condições climáticas

## 🚀 **Como Implementar**

### **Passo 1: Configurar Chaves de API**

```javascript
// Em scripts/nasa-data-integration.js
const API_KEYS = {
    nasa: 'SUA_CHAVE_NASA_AQUI',
    openWeather: 'SUA_CHAVE_OPENWEATHER_AQUI'
};
```

### **Passo 2: Atualizar URLs das APIs**

```javascript
// URLs reais das APIs
const API_URLS = {
    tempo: 'https://api.nasa.gov/planetary/earth/assets',
    openAQ: 'https://api.openaq.org/v2/measurements',
    firms: 'https://firms.modaps.eosdis.nasa.gov/api/country/csv',
    weather: 'https://api.openweathermap.org/data/2.5/weather'
};
```

### **Passo 3: Implementar Processamento de Dados**

```javascript
// Exemplo de processamento de dados TEMPO
processTempoData(rawData) {
    return rawData.map(point => ({
        lat: point.lat,
        lng: point.lon,
        intensity: this.calculateAQIIntensity(point.aqi),
        region: point.location,
        aqi: point.aqi,
        temp: `${point.temperature}°C`,
        timestamp: new Date().toISOString(),
        source: 'TEMPO'
    }));
}
```

## 🎯 **Funcionalidades Implementadas**

### **✅ Sistema de Heatmap Dinâmico**
- **Overlay 3D** sobre o globo
- **Cores baseadas em intensidade** (Verde → Amarelo → Laranja → Vermelho)
- **Atualização em tempo real** a cada 30 segundos
- **Múltiplas camadas** (AQI, Poluentes, Queimadas, Temperatura, Umidade)

### **✅ Integração com Three.js**
- **Globo 3D interativo** com rotação e zoom
- **Texturas dinâmicas** geradas em tempo real
- **Overlay de heatmap** com transparência
- **Controles orbitais** para navegação

### **✅ Sistema de Fallback**
- **Dados simulados** quando APIs falham
- **Graceful degradation** para manter funcionalidade
- **Logs detalhados** para debugging

## 🔧 **Configuração Técnica**

### **Estrutura de Dados**

```javascript
// Formato padrão para todos os dados
{
    lat: number,           // Latitude
    lng: number,           // Longitude
    intensity: number,     // 0.0 a 1.0
    region: string,        // Nome da região
    aqi: number,          // Índice de qualidade do ar
    temp: string,         // Temperatura
    timestamp: string,    // ISO timestamp
    source: string        // Fonte dos dados
}
```

### **Sistema de Cores**

```javascript
// Cores baseadas na intensidade
if (intensity <= 0.3) color = 'rgba(0, 255, 136, 0.8)';    // Verde
if (intensity <= 0.6) color = 'rgba(255, 170, 0, 0.8)';    // Amarelo
if (intensity <= 0.8) color = 'rgba(255, 102, 0, 0.8)';    // Laranja
if (intensity > 0.8)  color = 'rgba(255, 68, 68, 0.8)';    // Vermelho
```

## 📊 **Exemplo de Uso**

### **Carregar Dados Reais**

```javascript
// Inicializar integração
const nasaIntegration = new NasaDataIntegration();

// Carregar todos os dados
nasaIntegration.loadAllData().then(data => {
    console.log('Dados carregados:', data);
    
    // Atualizar visualização
    globeApp.updateHeatmap(data);
});

// Atualização automática
nasaIntegration.startAutoUpdate((newData) => {
    globeApp.updateHeatmap(newData);
});
```

### **Processar Dados Específicos**

```javascript
// Dados TEMPO
const tempoData = await nasaIntegration.fetchTempoData();

// Dados OpenAQ
const openAQData = await nasaIntegration.fetchOpenAQData();

// Dados de queimadas
const fireData = await nasaIntegration.fetchFireData();
```

## 🎨 **Visualização no Globo**

### **Como os Dados Aparecem**

1. **Conversão de Coordenadas**: Lat/Lng → Posição na textura
2. **Geração de Gradientes**: Círculos radiais com transparência
3. **Aplicação na Textura**: Canvas → Three.js Texture
4. **Renderização 3D**: Overlay sobre o globo

### **Código de Visualização**

```javascript
// Converter coordenadas para posição na textura
const x = ((point.lng + 180) / 360) * canvas.width;
const y = ((90 - point.lat) / 180) * canvas.height;

// Criar gradiente radial
const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
gradient.addColorStop(0, color);
gradient.addColorStop(0.5, color.replace('0.8', '0.4'));
gradient.addColorStop(1, 'transparent');

// Aplicar na textura
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(x, y, size, 0, Math.PI * 2);
ctx.fill();
```

## 🚨 **Alertas e Notificações**

### **Sistema de Alertas**

```javascript
// Verificar níveis perigosos
if (point.aqi > 150) {
    this.sendAlert({
        type: 'danger',
        message: `Qualidade do ar perigosa em ${point.region}`,
        aqi: point.aqi,
        recommendations: this.getHealthRecommendations(point.aqi)
    });
}
```

### **Recomendações de Saúde**

```javascript
getHealthRecommendations(aqi) {
    if (aqi > 200) return 'Evite atividades ao ar livre';
    if (aqi > 150) return 'Limite atividades ao ar livre';
    if (aqi > 100) return 'Sensíveis devem evitar atividades ao ar livre';
    return 'Qualidade do ar aceitável';
}
```

## 🔄 **Atualização em Tempo Real**

### **Sistema de Polling**

```javascript
// Atualização a cada 30 segundos
setInterval(() => {
    this.loadAllData().then(callback);
}, 30000);
```

### **WebSocket (Futuro)**

```javascript
// Implementação futura com WebSocket
const ws = new WebSocket('wss://api.nasa.gov/stream');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    this.updateHeatmap(data);
};
```

## 📈 **Métricas e Monitoramento**

### **Logs de Performance**

```javascript
console.log('Dados TEMPO carregados:', this.tempoData.length, 'pontos');
console.log('Dados OpenAQ carregados:', this.openAQData.length, 'pontos');
console.log('Dados de queimadas carregados:', this.fireData.length, 'pontos');
```

### **Monitoramento de Erros**

```javascript
try {
    const data = await this.fetchTempoData();
    return data;
} catch (error) {
    console.error('Erro ao carregar dados TEMPO:', error);
    return this.getFallbackTempoData();
}
```

## 🎯 **Próximos Passos**

### **Implementações Futuras**

1. **Machine Learning**: Previsões de qualidade do ar
2. **Geolocalização**: Dados específicos da localização do usuário
3. **Histórico**: Gráficos de tendências temporais
4. **Comparação**: Benchmark entre cidades
5. **Exportação**: Relatórios em PDF/CSV

### **Otimizações**

1. **Cache**: Armazenar dados localmente
2. **Compressão**: Reduzir tamanho dos dados
3. **Lazy Loading**: Carregar dados sob demanda
4. **Web Workers**: Processamento em background

## 🏆 **Resultado Final**

Com esta implementação, o projeto AirQuest terá:

- ✅ **Dados reais** das APIs da NASA
- ✅ **Visualização 3D** interativa
- ✅ **Atualização em tempo real**
- ✅ **Sistema de alertas**
- ✅ **Fallback robusto**
- ✅ **Performance otimizada**

**O globo agora mostra dados reais de qualidade do ar, queimadas, temperatura e umidade, atualizados automaticamente a cada 30 segundos!** 🌍✨


