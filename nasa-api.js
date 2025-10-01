// Integração com APIs da NASA para dados de qualidade do ar
class NASAAPI {
    constructor() {
        this.baseURL = 'https://api.nasa.gov';
        this.apiKey = 'DEMO_KEY'; // Em produção, usar chave real
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    // NASA POWER API - Dados climáticos e atmosféricos
    async getPOWERData(lat, lon) {
        const cacheKey = `power-${lat}-${lon}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const url = `${this.baseURL}/power/v1/point?lat=${lat}&lon=${lon}&parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,TOA_SW_DWN&start=20240101&end=20240131&api_key=${this.apiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados POWER:', error);
            return this.getFallbackData();
        }
    }

    // GIBS - Global Imagery Browse Services
    async getGIBSLayers() {
        const cacheKey = 'gibs-layers';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Simular dados do GIBS (em produção, usar API real)
            const layers = {
                'MODIS_Terra_Aerosol': {
                    title: 'Aerosol Optical Depth',
                    description: 'Profundidade óptica de aerossóis do MODIS Terra',
                    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_Aerosol/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg'
                },
                'MODIS_Aqua_Aerosol': {
                    title: 'Aerosol Optical Depth (Aqua)',
                    description: 'Profundidade óptica de aerossóis do MODIS Aqua',
                    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Aqua_Aerosol/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg'
                },
                'VIIRS_SNPP_Aerosol_Optical_Depth': {
                    title: 'VIIRS Aerosol Optical Depth',
                    description: 'Profundidade óptica de aerossóis do VIIRS',
                    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_Aerosol_Optical_Depth/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg'
                }
            };

            this.setCachedData(cacheKey, layers);
            return layers;
        } catch (error) {
            console.error('Erro ao buscar camadas GIBS:', error);
            return {};
        }
    }

    // Simulação de dados TEMPO (em produção, usar API real)
    async getTEMPOData() {
        const cacheKey = 'tempo-data';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Dados simulados baseados em padrões reais
            const tempoData = {
                timestamp: new Date().toISOString(),
                pollutants: {
                    'NO2': this.generatePollutantData('NO2'),
                    'O3': this.generatePollutantData('O3'),
                    'PM25': this.generatePollutantData('PM25'),
                    'CO': this.generatePollutantData('CO')
                },
                regions: [
                    {
                        name: 'América do Sul',
                        bounds: { north: 12, south: -56, east: -34, west: -82 },
                        aqi: this.calculateAQI(),
                        status: this.getAirQualityStatus()
                    },
                    {
                        name: 'América do Norte',
                        bounds: { north: 71, south: 7, east: -52, west: -172 },
                        aqi: this.calculateAQI(),
                        status: this.getAirQualityStatus()
                    },
                    {
                        name: 'Europa',
                        bounds: { north: 71, south: 35, east: 40, west: -25 },
                        aqi: this.calculateAQI(),
                        status: this.getAirQualityStatus()
                    },
                    {
                        name: 'Ásia',
                        bounds: { north: 81, south: -11, east: 180, west: 26 },
                        aqi: this.calculateAQI(),
                        status: this.getAirQualityStatus()
                    }
                ]
            };

            this.setCachedData(cacheKey, tempoData);
            return tempoData;
        } catch (error) {
            console.error('Erro ao buscar dados TEMPO:', error);
            return this.getFallbackTEMPOData();
        }
    }

    // Dados de queimadas (Fire Information for Resource Management System)
    async getFIRMSData() {
        const cacheKey = 'firms-data';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Simular dados de focos de queimadas
            const firmsData = {
                timestamp: new Date().toISOString(),
                fires: this.generateFireData(),
                statistics: {
                    totalFires: 0,
                    activeFires: 0,
                    highConfidence: 0
                }
            };

            // Calcular estatísticas
            firmsData.statistics.totalFires = firmsData.fires.length;
            firmsData.statistics.activeFires = firmsData.fires.filter(f => f.confidence > 80).length;
            firmsData.statistics.highConfidence = firmsData.fires.filter(f => f.confidence > 90).length;

            this.setCachedData(cacheKey, firmsData);
            return firmsData;
        } catch (error) {
            console.error('Erro ao buscar dados FIRMS:', error);
            return this.getFallbackFIRMSData();
        }
    }

    // OpenAQ - Dados de monitoramento em tempo real
    async getOpenAQData(country = 'BR') {
        const cacheKey = `openaq-${country}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Simular dados do OpenAQ
            const openAQData = {
                country: country,
                measurements: this.generateOpenAQMeasurements(),
                lastUpdated: new Date().toISOString(),
                sources: [
                    'CETESB - São Paulo',
                    'INEA - Rio de Janeiro',
                    'FEPAM - Rio Grande do Sul'
                ]
            };

            this.setCachedData(cacheKey, openAQData);
            return openAQData;
        } catch (error) {
            console.error('Erro ao buscar dados OpenAQ:', error);
            return this.getFallbackOpenAQData();
        }
    }

    // Métodos auxiliares
    generatePollutantData(pollutant) {
        const ranges = {
            'NO2': { min: 10, max: 120 },
            'O3': { min: 20, max: 180 },
            'PM25': { min: 5, max: 80 },
            'CO': { min: 0.5, max: 15 }
        };

        const range = ranges[pollutant] || { min: 0, max: 100 };
        return {
            value: Math.random() * (range.max - range.min) + range.min,
            unit: pollutant === 'PM25' ? 'μg/m³' : pollutant === 'CO' ? 'ppm' : 'ppb',
            status: this.getPollutantStatus(pollutant, Math.random() * (range.max - range.min) + range.min)
        };
    }

    getPollutantStatus(pollutant, value) {
        const thresholds = {
            'NO2': { good: 40, moderate: 80 },
            'O3': { good: 60, moderate: 120 },
            'PM25': { good: 15, moderate: 35 },
            'CO': { good: 2, moderate: 5 }
        };

        const threshold = thresholds[pollutant];
        if (value <= threshold.good) return 'good';
        if (value <= threshold.moderate) return 'moderate';
        return 'bad';
    }

    calculateAQI() {
        // Simulação simplificada do AQI
        return Math.floor(Math.random() * 200) + 20;
    }

    getAirQualityStatus() {
        const aqi = this.calculateAQI();
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'unhealthy';
        return 'hazardous';
    }

    generateFireData() {
        const fires = [];
        const fireCount = Math.floor(Math.random() * 50) + 10;

        for (let i = 0; i < fireCount; i++) {
            fires.push({
                id: `fire_${i}`,
                lat: (Math.random() - 0.5) * 180,
                lon: (Math.random() - 0.5) * 360,
                confidence: Math.floor(Math.random() * 100),
                brightness: Math.floor(Math.random() * 500) + 300,
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return fires;
    }

    generateOpenAQMeasurements() {
        const measurements = [];
        const cities = [
            { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
            { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
            { name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
            { name: 'Salvador', lat: -12.9714, lon: -38.5014 }
        ];

        cities.forEach(city => {
            measurements.push({
                city: city.name,
                coordinates: { lat: city.lat, lon: city.lon },
                pollutants: {
                    'PM2.5': {
                        value: Math.random() * 50 + 10,
                        unit: 'μg/m³',
                        lastUpdated: new Date().toISOString()
                    },
                    'PM10': {
                        value: Math.random() * 80 + 20,
                        unit: 'μg/m³',
                        lastUpdated: new Date().toISOString()
                    },
                    'NO2': {
                        value: Math.random() * 60 + 15,
                        unit: 'μg/m³',
                        lastUpdated: new Date().toISOString()
                    }
                }
            });
        });

        return measurements;
    }

    // Sistema de cache
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Dados de fallback
    getFallbackData() {
        return {
            error: 'Dados não disponíveis',
            message: 'Usando dados simulados para demonstração'
        };
    }

    getFallbackTEMPOData() {
        return {
            timestamp: new Date().toISOString(),
            pollutants: {
                'NO2': { value: 45, unit: 'ppb', status: 'moderate' },
                'O3': { value: 80, unit: 'ppb', status: 'moderate' },
                'PM25': { value: 25, unit: 'μg/m³', status: 'moderate' },
                'CO': { value: 2.5, unit: 'ppm', status: 'good' }
            },
            regions: [
                { name: 'Brasil', aqi: 75, status: 'moderate' },
                { name: 'América do Norte', aqi: 45, status: 'good' },
                { name: 'Europa', aqi: 55, status: 'good' },
                { name: 'Ásia', aqi: 120, status: 'unhealthy' }
            ]
        };
    }

    getFallbackFIRMSData() {
        return {
            timestamp: new Date().toISOString(),
            fires: [],
            statistics: {
                totalFires: 0,
                activeFires: 0,
                highConfidence: 0
            }
        };
    }

    getFallbackOpenAQData() {
        return {
            country: 'BR',
            measurements: [],
            lastUpdated: new Date().toISOString(),
            sources: ['Dados simulados para demonstração']
        };
    }

    // Método para obter todos os dados combinados
    async getAllData() {
        try {
            const [tempoData, firmsData, openAQData] = await Promise.all([
                this.getTEMPOData(),
                this.getFIRMSData(),
                this.getOpenAQData()
            ]);

            return {
                tempo: tempoData,
                fires: firmsData,
                openAQ: openAQData,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Erro ao buscar dados combinados:', error);
            return this.getFallbackData();
        }
    }
}

// Exportar para uso global
window.NASAAPI = NASAAPI;
