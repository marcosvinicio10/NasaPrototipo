// scripts/data-visualization.js
class DataVisualization {
    constructor() {
        this.charts = {};
        this.dataCache = {};
        this.visualizationTypes = {
            'chart': 'Gráfico de Linha',
            'bar': 'Gráfico de Barras',
            'pie': 'Gráfico de Pizza',
            'heatmap': 'Mapa de Calor',
            'scatter': 'Gráfico de Dispersão',
            'timeline': 'Linha do Tempo'
        };
    }

    // ===== GRÁFICOS COM CHART.JS =====
    createLineChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                title: {
                    display: true,
                    text: options.title || 'Dados de Qualidade do Ar',
                    color: '#ffffff',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        };

        const config = {
            type: 'line',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }

    createBarChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0'
                    }
                },
                title: {
                    display: true,
                    text: options.title || 'Comparação de Dados',
                    color: '#ffffff'
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            }
        };

        const config = {
            type: 'bar',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }

    createPieChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e2e8f0',
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: options.title || 'Distribuição de Dados',
                    color: '#ffffff'
                }
            }
        };

        const config = {
            type: 'pie',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    }

    // ===== VISUALIZAÇÕES COM D3.JS =====
    createHeatmap(containerId, data, options = {}) {
        const container = d3.select(`#${containerId}`);
        if (container.empty()) return null;

        const width = options.width || 400;
        const height = options.height || 300;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'rgba(15, 23, 42, 0.8)')
            .style('border-radius', '8px');

        // Escalas
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.x))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.y))
            .range([margin.top, height - margin.bottom])
            .padding(0.1);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data, d => d.value));

        // Criar células do heatmap
        svg.selectAll('.cell')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.value))
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke', '#3b82f6')
                    .attr('stroke-width', 2);
                
                // Tooltip
                const tooltip = d3.select('body')
                    .append('div')
                    .attr('class', 'heatmap-tooltip')
                    .style('position', 'absolute')
                    .style('background', 'rgba(15, 23, 42, 0.95)')
                    .style('color', '#e2e8f0')
                    .style('padding', '8px 12px')
                    .style('border-radius', '6px')
                    .style('border', '1px solid rgba(59, 130, 246, 0.3)')
                    .style('pointer-events', 'none')
                    .style('z-index', '1000')
                    .style('opacity', 0);

                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);

                tooltip.html(`
                    <strong>${d.x} - ${d.y}</strong><br/>
                    Valor: ${d.value.toFixed(2)}
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke', 'rgba(255, 255, 255, 0.1)')
                    .attr('stroke-width', 1);
                
                d3.selectAll('.heatmap-tooltip').remove();
            });

        // Eixos
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .style('color', '#94a3b8');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .style('color', '#94a3b8');

        return svg;
    }

    createScatterPlot(containerId, data, options = {}) {
        const container = d3.select(`#${containerId}`);
        if (container.empty()) return null;

        const width = options.width || 400;
        const height = options.height || 300;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'rgba(15, 23, 42, 0.8)')
            .style('border-radius', '8px');

        // Escalas
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.y))
            .range([height - margin.bottom, margin.top]);

        const colorScale = d3.scaleOrdinal()
            .domain([...new Set(data.map(d => d.category))])
            .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']);

        // Criar pontos
        svg.selectAll('.point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', d => d.size || 4)
            .attr('fill', d => colorScale(d.category))
            .attr('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('r', (d.size || 4) * 1.5);
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('opacity', 0.7)
                    .attr('r', d.size || 4);
            });

        // Eixos
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .style('color', '#94a3b8');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .style('color', '#94a3b8');

        return svg;
    }

    // ===== VISUALIZAÇÕES COM PLOTLY.JS =====
    create3DScatter(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const plotData = [{
            x: data.map(d => d.x),
            y: data.map(d => d.y),
            z: data.map(d => d.z),
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: data.map(d => d.size || 5),
                color: data.map(d => d.value),
                colorscale: 'Viridis',
                opacity: 0.8,
                line: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    width: 1
                }
            },
            text: data.map(d => d.label || ''),
            hovertemplate: '<b>%{text}</b><br>' +
                          'X: %{x}<br>' +
                          'Y: %{y}<br>' +
                          'Z: %{z}<br>' +
                          'Valor: %{marker.color}<extra></extra>'
        }];

        const layout = {
            title: {
                text: options.title || 'Visualização 3D dos Dados',
                font: { color: '#ffffff', size: 16 }
            },
            scene: {
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                xaxis: { color: '#94a3b8' },
                yaxis: { color: '#94a3b8' },
                zaxis: { color: '#94a3b8' }
            },
            paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
            plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
            font: { color: '#e2e8f0' }
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        };

        return Plotly.newPlot(container, plotData, layout, config);
    }

    // ===== PROCESSAMENTO DE DADOS =====
    processAirQualityData(rawData) {
        const processedData = {
            timeline: [],
            cities: [],
            pollutants: {},
            statistics: {}
        };

        // Processar dados por cidade
        rawData.forEach(point => {
            const city = point.region.split(',')[0];
            if (!processedData.cities.includes(city)) {
                processedData.cities.push(city);
            }

            // Timeline
            processedData.timeline.push({
                timestamp: new Date(point.lastUpdated || Date.now()),
                city: city,
                aqi: point.aqi,
                pm25: point.pm25 || 0,
                no2: point.no2 || 0
            });

            // Poluentes por cidade
            if (!processedData.pollutants[city]) {
                processedData.pollutants[city] = [];
            }
            processedData.pollutants[city].push({
                aqi: point.aqi,
                pm25: point.pm25 || 0,
                no2: point.no2 || 0,
                timestamp: new Date(point.lastUpdated || Date.now())
            });
        });

        // Estatísticas
        processedData.statistics = {
            totalCities: processedData.cities.length,
            averageAQI: rawData.reduce((sum, point) => sum + point.aqi, 0) / rawData.length,
            maxAQI: Math.max(...rawData.map(point => point.aqi)),
            minAQI: Math.min(...rawData.map(point => point.aqi))
        };

        return processedData;
    }

    // ===== CRIAÇÃO DE DASHBOARD =====
    createDashboard(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const processedData = this.processAirQualityData(data);

        // Criar estrutura do dashboard
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Timeline de Qualidade do Ar</h3>
                    <canvas id="timeline-chart"></canvas>
                </div>
                <div class="dashboard-card">
                    <h3>Comparação por Cidade</h3>
                    <canvas id="cities-chart"></canvas>
                </div>
                <div class="dashboard-card">
                    <h3>Distribuição de AQI</h3>
                    <canvas id="aqi-distribution"></canvas>
                </div>
                <div class="dashboard-card">
                    <h3>Mapa de Calor de Poluentes</h3>
                    <div id="pollutants-heatmap"></div>
                </div>
                <div class="dashboard-card">
                    <h3>Estatísticas Gerais</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Cidades Monitoradas</span>
                            <span class="stat-value">${processedData.statistics.totalCities}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">AQI Médio</span>
                            <span class="stat-value">${processedData.statistics.averageAQI.toFixed(1)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">AQI Máximo</span>
                            <span class="stat-value">${processedData.statistics.maxAQI}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">AQI Mínimo</span>
                            <span class="stat-value">${processedData.statistics.minAQI}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Criar gráficos
        this.createTimelineChart(processedData);
        this.createCitiesChart(processedData);
        this.createAQIDistribution(processedData);
        this.createPollutantsHeatmap(processedData);

        return container;
    }

    createTimelineChart(data) {
        const timelineData = data.timeline.slice(-20); // Últimos 20 pontos
        
        const chartData = {
            labels: timelineData.map(d => d.timestamp.toLocaleTimeString()),
            datasets: [{
                label: 'AQI',
                data: timelineData.map(d => d.aqi),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        };

        this.createLineChart('timeline-chart', chartData, {
            title: 'Evolução do AQI ao Longo do Tempo'
        });
    }

    createCitiesChart(data) {
        const citiesData = data.cities.map(city => {
            const cityData = data.pollutants[city];
            const avgAQI = cityData.reduce((sum, d) => sum + d.aqi, 0) / cityData.length;
            return { city, aqi: avgAQI };
        });

        const chartData = {
            labels: citiesData.map(d => d.city),
            datasets: [{
                label: 'AQI Médio',
                data: citiesData.map(d => d.aqi),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 2
            }]
        };

        this.createBarChart('cities-chart', chartData, {
            title: 'AQI Médio por Cidade'
        });
    }

    createAQIDistribution(data) {
        const aqiRanges = {
            'Bom (0-50)': 0,
            'Moderado (51-100)': 0,
            'Insalubre (101-150)': 0,
            'Muito Insalubre (151-200)': 0,
            'Perigoso (201+)': 0
        };

        data.timeline.forEach(point => {
            if (point.aqi <= 50) aqiRanges['Bom (0-50)']++;
            else if (point.aqi <= 100) aqiRanges['Moderado (51-100)']++;
            else if (point.aqi <= 150) aqiRanges['Insalubre (101-150)']++;
            else if (point.aqi <= 200) aqiRanges['Muito Insalubre (151-200)']++;
            else aqiRanges['Perigoso (201+)']++;
        });

        const chartData = {
            labels: Object.keys(aqiRanges),
            datasets: [{
                data: Object.values(aqiRanges),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(127, 29, 29, 0.8)'
                ],
                borderColor: [
                    '#10b981',
                    '#f59e0b',
                    '#fb923c',
                    '#ef4444',
                    '#7f1d1d'
                ],
                borderWidth: 2
            }]
        };

        this.createPieChart('aqi-distribution', chartData, {
            title: 'Distribuição de Qualidade do Ar'
        });
    }

    createPollutantsHeatmap(data) {
        const heatmapData = [];
        
        data.cities.forEach(city => {
            const cityData = data.pollutants[city];
            const avgPM25 = cityData.reduce((sum, d) => sum + d.pm25, 0) / cityData.length;
            const avgNO2 = cityData.reduce((sum, d) => sum + d.no2, 0) / cityData.length;
            
            heatmapData.push(
                { x: city, y: 'PM2.5', value: avgPM25 },
                { x: city, y: 'NO2', value: avgNO2 }
            );
        });

        this.createHeatmap('pollutants-heatmap', heatmapData, {
            width: 300,
            height: 200
        });
    }

    // ===== MÉTODOS DE UTILIDADE =====
    updateChart(chartId, newData) {
        if (this.charts[chartId]) {
            this.charts[chartId].data = newData;
            this.charts[chartId].update();
        }
    }

    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    exportChart(chartId, format = 'png') {
        if (this.charts[chartId]) {
            return this.charts[chartId].toBase64Image(format);
        }
        return null;
    }
}

// Instância global
window.dataVisualization = new DataVisualization();

