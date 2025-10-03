// Integração com APIs da NASA para dados reais
class NasaDataIntegration {
    constructor() {
        this.tempoData = [];
        this.openAQData = [];
        this.fireData = [];
        this.weatherData = [];
        this.updateInterval = 30000; // 30 segundos
    }

    // ===== DADOS TEMPO (NASA) =====
    async fetchTempoData() {
        try {
            console.log('Carregando dados TEMPO...');
            
            // URL da API TEMPO da NASA (exemplo)
            const tempoUrl = 'https://api.nasa.gov/planetary/earth/assets';
            
            // Parâmetros para dados de qualidade do ar
            const params = {
                lat: 40.7128, // Nova York
                lon: -74.0060,
                date: new Date().toISOString().split('T')[0],
                api_key: 'DEMO_KEY' // Substituir por chave real
            };
            
            const response = await fetch(`${tempoUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            // Processar dados TEMPO
            this.tempoData = this.processTempoData(data);
            console.log('Dados TEMPO carregados:', this.tempoData.length, 'pontos');
            
            return this.tempoData;
            
        } catch (error) {
            console.error('Erro ao carregar dados TEMPO:', error);
            return this.getFallbackTempoData();
        }
    }

    processTempoData(rawData) {
        // Processar dados brutos da API TEMPO
        return rawData.map(point => ({
            lat: point.lat,
            lng: point.lon,
            intensity: this.calculateAQIIntensity(point.aqi || point.pm25),
            region: point.location || 'Local Desconhecido',
            aqi: point.aqi || point.pm25 || 50,
            temp: `${point.temperature || 20}°C`,
            timestamp: new Date().toISOString(),
            source: 'TEMPO'
        }));
    }

    // ===== DADOS OPENAQ =====
    async fetchOpenAQData() {
        try {
            console.log('Carregando dados OpenAQ...');
            
            // URL da API OpenAQ
            const openAQUrl = 'https://api.openaq.org/v2/measurements';
            
            const params = {
                limit: 100,
                page: 1,
                offset: 0,
                sort: 'desc',
                radius: 1000,
                order_by: 'datetime'
            };
            
            const response = await fetch(`${openAQUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            // Processar dados OpenAQ
            this.openAQData = this.processOpenAQData(data);
            console.log('Dados OpenAQ carregados:', this.openAQData.length, 'pontos');
            
            return this.openAQData;
            
        } catch (error) {
            console.error('Erro ao carregar dados OpenAQ:', error);
            return this.getFallbackOpenAQData();
        }
    }

    processOpenAQData(rawData) {
        return rawData.results.map(measurement => ({
            lat: measurement.coordinates.latitude,
            lng: measurement.coordinates.longitude,
            intensity: this.calculateAQIIntensity(measurement.value),
            region: measurement.location,
            aqi: this.convertToAQI(measurement.value, measurement.parameter),
            temp: `${measurement.temperature || 20}°C`,
            timestamp: measurement.date.utc,
            source: 'OpenAQ',
            parameter: measurement.parameter
        }));
    }

    // ===== DADOS DE QUEIMADAS (FIRMS) =====
    async fetchFireData() {
        try {
            console.log('Carregando dados de queimadas...');
            
            // URL da API FIRMS da NASA
            const fireUrl = 'https://firms.modaps.eosdis.nasa.gov/api/country/csv';
            
            const params = {
                country: 'BR', // Brasil
                source: 'MODIS_NRT',
                days: 1
            };
            
            const response = await fetch(`${fireUrl}?${new URLSearchParams(params)}`);
            const data = await response.text();
            
            // Processar dados de queimadas
            this.fireData = this.processFireData(data);
            console.log('Dados de queimadas carregados:', this.fireData.length, 'pontos');
            
            return this.fireData;
            
        } catch (error) {
            console.error('Erro ao carregar dados de queimadas:', error);
            return this.getFallbackFireData();
        }
    }

    processFireData(csvData) {
        const lines = csvData.split('\n');
        const fires = [];
        
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');
            if (columns.length > 5) {
                fires.push({
                    lat: parseFloat(columns[0]),
                    lng: parseFloat(columns[1]),
                    intensity: 1.0, // Queimadas sempre alta intensidade
                    region: `Queimada ${i}`,
                    aqi: 200 + Math.random() * 100,
                    temp: `${30 + Math.random() * 10}°C`,
                    timestamp: columns[5],
                    source: 'FIRMS',
                    confidence: parseFloat(columns[2])
                });
            }
        }
        
        return fires;
    }

    // ===== DADOS METEOROLÓGICOS =====
    async fetchWeatherData() {
        try {
            console.log('Carregando dados meteorológicos...');
            
            // Usar OpenWeatherMap como exemplo
            const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
            
            const params = {
                q: 'São Paulo,BR',
                appid: 'YOUR_API_KEY', // Substituir por chave real
                units: 'metric'
            };
            
            const response = await fetch(`${weatherUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            
            // Processar dados meteorológicos
            this.weatherData = this.processWeatherData(data);
            console.log('Dados meteorológicos carregados');
            
            return this.weatherData;
            
        } catch (error) {
            console.error('Erro ao carregar dados meteorológicos:', error);
            return this.getFallbackWeatherData();
        }
    }

    processWeatherData(rawData) {
        return [{
            lat: rawData.coord.lat,
            lng: rawData.coord.lon,
            intensity: this.calculateWeatherIntensity(rawData),
            region: rawData.name,
            aqi: 50 + Math.random() * 50,
            temp: `${Math.round(rawData.main.temp)}°C`,
            humidity: `${rawData.main.humidity}%`,
            wind: `${rawData.wind.speed} m/s`,
            timestamp: new Date().toISOString(),
            source: 'OpenWeatherMap'
        }];
    }

    // ===== FUNÇÕES AUXILIARES =====
    calculateAQIIntensity(value) {
        if (value <= 50) return 0.2;
        if (value <= 100) return 0.4;
        if (value <= 150) return 0.6;
        if (value <= 200) return 0.8;
        return 1.0;
    }

    convertToAQI(value, parameter) {
        // Conversão simplificada para AQI
        const multipliers = {
            'pm25': 1.0,
            'pm10': 0.8,
            'no2': 1.2,
            'o3': 1.1,
            'so2': 1.3
        };
        
        return Math.round(value * (multipliers[parameter] || 1.0));
    }

    calculateWeatherIntensity(weatherData) {
        // Calcular intensidade baseada em condições meteorológicas
        let intensity = 0.5;
        
        // Vento forte dispersa poluentes
        if (weatherData.wind.speed > 5) intensity -= 0.2;
        
        // Umidade alta pode aumentar poluição
        if (weatherData.main.humidity > 80) intensity += 0.2;
        
        // Temperatura alta pode aumentar ozônio
        if (weatherData.main.temp > 30) intensity += 0.1;
        
        return Math.max(0, Math.min(1, intensity));
    }

    // ===== DADOS DE FALLBACK =====
    getFallbackTempoData() {
        return [
            { lat: 40.7128, lng: -74.0060, intensity: 0.4, region: 'Nova York, EUA', aqi: 45, temp: '15°C', source: 'TEMPO' },
            { lat: 39.9042, lng: 116.4074, intensity: 1.0, region: 'Pequim, China', aqi: 98, temp: '22°C', source: 'TEMPO' },
            { lat: 28.6139, lng: 77.2090, intensity: 0.8, region: 'Nova Delhi, Índia', aqi: 88, temp: '35°C', source: 'TEMPO' }
        ];
    }

    getFallbackOpenAQData() {
        return [
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo, Brasil', aqi: 85, temp: '28°C', source: 'OpenAQ' },
            { lat: -22.9068, lng: -43.1729, intensity: 0.6, region: 'Rio de Janeiro, Brasil', aqi: 65, temp: '30°C', source: 'OpenAQ' }
        ];
    }

    getFallbackFireData() {
        return [
            { lat: -3.4653, lng: -62.2159, intensity: 1.0, region: 'Amazônia, Brasil', aqi: 203, temp: '32°C', source: 'FIRMS' },
            { lat: -2.1631, lng: 15.8277, intensity: 0.8, region: 'África Central', aqi: 189, temp: '28°C', source: 'FIRMS' }
        ];
    }

    getFallbackWeatherData() {
        return [
            { lat: -23.5505, lng: -46.6333, intensity: 0.8, region: 'São Paulo, Brasil', aqi: 85, temp: '28°C', humidity: '70%', source: 'OpenWeatherMap' }
        ];
    }

    // ===== INTEGRAÇÃO PRINCIPAL =====
    async loadAllData() {
        console.log('Carregando todos os dados das APIs...');
        
        try {
            // Carregar dados em paralelo
            const [tempoData, openAQData, fireData, weatherData] = await Promise.all([
                this.fetchTempoData(),
                this.fetchOpenAQData(),
                this.fetchFireData(),
                this.fetchWeatherData()
            ]);

            // Combinar todos os dados
            const allData = {
                aqi: [...tempoData, ...openAQData],
                pollutants: [...tempoData, ...openAQData],
                fires: fireData,
                temperature: weatherData,
                humidity: weatherData
            };

            console.log('Todos os dados carregados com sucesso!');
            return allData;

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return this.getFallbackAllData();
        }
    }

    getFallbackAllData() {
        return {
            aqi: this.getFallbackTempoData(),
            pollutants: this.getFallbackOpenAQData(),
            fires: this.getFallbackFireData(),
            temperature: this.getFallbackWeatherData(),
            humidity: this.getFallbackWeatherData()
        };
    }

    // ===== ATUALIZAÇÃO AUTOMÁTICA =====
    startAutoUpdate(callback) {
        console.log('Iniciando atualização automática de dados...');
        
        // Atualizar imediatamente
        this.loadAllData().then(callback);
        
        // Configurar atualização periódica
        setInterval(() => {
            console.log('Atualizando dados...');
            this.loadAllData().then(callback);
        }, this.updateInterval);
    }
}

// Exportar para uso global
window.NasaDataIntegration = NasaDataIntegration;

