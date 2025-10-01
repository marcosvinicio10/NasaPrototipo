# 🌍 AirQuest

**Slogan:** "Veja, aprenda, jogue e transforme o ar que você respira."

## 📋 Sobre o Projeto

O AirQuest é um protótipo funcional de uma aplicação web interativa que combina dados reais da NASA com gamificação para conscientizar sobre a qualidade do ar. O projeto foi desenvolvido para o NASA Space Apps Challenge e utiliza tecnologias modernas para criar uma experiência imersiva e educativa.

## ✨ Funcionalidades

### 🏠 Tela Inicial
- **Animação de partículas** simulando poluição flutuando
- **Pergunta impactante**: "Você sabe o que está respirando agora?"
- **Dois CTAs principais**:
  - 🔵 "Ver o ar agora" → Acesso direto ao globo 3D
  - ⚪ "Por que isso importa?" → Storytelling educativo

### 📚 Seção de Introdução
- **Storytelling visual** com dados impactantes:
  - 👶 Crianças respiram 2x mais poluição que adultos
  - 🏙 7 milhões de mortes por ano (OMS)
  - 🚀 Satélites NASA monitoram qualidade do ar em tempo real
- **Animações sequenciais** para máximo impacto emocional

### 🌍 Globo 3D Interativo
- **Tecnologia**: Three.js para renderização 3D
- **Interações**: Rotação, zoom, clique em regiões
- **Camadas de dados** (liga/desliga):
  - AQI (Índice de Qualidade do Ar)
  - Poluentes (MP2.5, NO₂, O₃, CO₂)
  - Queimadas (focos ativos por satélite)
  - Densidade de transporte urbano
- **Visualização dramática**:
  - Verde → Bom | Amarelo → Moderado | Vermelho → Crítico
  - Animações de zoom para cidades específicas
  - Informações em tempo real sobre qualidade do ar

### 🎮 Sistema de Quiz - AirQuest Challenge
- **5 perguntas** baseadas em dados reais
- **Sistema de pontuação** com medalhas (Bronze, Prata, Ouro)
- **Ranking local e global**
- **Feedback imediato** com explicações científicas
- **Gamificação** para engajamento

### 🔬 Integração com APIs da NASA
- **NASA TEMPO**: Poluentes atmosféricos em tempo real
- **NASA GIBS**: Camadas globais de satélite
- **NASA POWER API**: Dados climáticos e atmosféricos
- **OpenAQ**: Monitoramento em tempo real por governos locais
- **FIRMS**: Dados de queimadas e focos de incêndio

## 🛠 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js
- **APIs**: NASA Earth Data APIs
- **Design**: Inspirado em painéis de controle da NASA
- **Responsividade**: Mobile-first design

## 🚀 Como Executar

### Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para APIs da NASA)

### Instalação
1. **Clone ou baixe** os arquivos do projeto
2. **Abra** o arquivo `index.html` em um navegador web
3. **Permita** o acesso à localização (opcional, para dados locais)

### Estrutura de Arquivos
```
AirQuest/
├── index.html          # Estrutura principal
├── styles.css          # Estilos e design NASA
├── script.js           # Lógica principal da aplicação
├── nasa-api.js         # Integração com APIs da NASA
└── README.md           # Este arquivo
```

## 🎯 Funcionalidades Implementadas

### ✅ Completas
- [x] Tela inicial com animações de partículas
- [x] Sistema de navegação entre telas
- [x] Storytelling visual com dados impactantes
- [x] Globo 3D interativo com Three.js
- [x] Sistema de quiz com gamificação
- [x] Integração com APIs da NASA
- [x] Sistema de ranking e medalhas
- [x] Design responsivo
- [x] Animações e efeitos visuais

### 🔄 Em Desenvolvimento
- [ ] Dados reais em tempo real das APIs
- [ ] Geolocalização automática
- [ ] Mais perguntas no quiz
- [ ] Sistema de conquistas
- [ ] Compartilhamento social

## 📊 Dados e Fontes

### APIs da NASA Utilizadas
- **NASA TEMPO**: Monitoramento de poluentes atmosféricos
- **NASA GIBS**: Imagens globais de satélite
- **NASA POWER**: Dados climáticos e atmosféricos
- **FIRMS**: Sistema de informações sobre incêndios

### Dados Simulados
- Qualidade do ar por região
- Estatísticas de poluentes
- Focos de queimadas
- Dados de transporte urbano

## 🎨 Design e UX

### Inspiração NASA
- **Cores**: Azul espacial (#0096ff), verde tecnológico (#00d4ff)
- **Tipografia**: Orbitron (futurista) + Roboto (legibilidade)
- **Layout**: Painéis de controle de missão espacial
- **Animações**: Suaves e profissionais

### Responsividade
- **Mobile-first**: Otimizado para dispositivos móveis
- **Tablet**: Layout adaptativo para tablets
- **Desktop**: Experiência completa em desktop

## 🔧 Personalização

### Modificar Dados
1. Edite `nasa-api.js` para alterar fontes de dados
2. Atualize `script.js` para modificar lógica do quiz
3. Ajuste `styles.css` para personalizar visual

### Adicionar Novas Perguntas
```javascript
// Em script.js, método loadQuizData()
{
    question: "Sua pergunta aqui?",
    answers: ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
    correct: 0, // Índice da resposta correta
    explanation: "Explicação científica da resposta."
}
```

## 🌟 Impacto e Objetivos

### Educação
- **Storytelling rápido**: Informações em 3 segundos
- **Dados científicos**: Baseado em pesquisas da NASA e OMS
- **Gamificação**: Aprender jogando

### Conscientização
- **Dados reais**: Qualidade do ar em tempo real
- **Impacto visual**: Globo 3D com visualizações dramáticas
- **Ações práticas**: Sugestões personalizadas

### Engajamento
- **Quiz interativo**: Sistema de pontos e medalhas
- **Ranking**: Competição saudável
- **Compartilhamento**: Viralização da conscientização

## 📱 Compatibilidade

### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dispositivos
- **Desktop**: Experiência completa
- **Tablet**: Interface adaptada
- **Mobile**: Versão otimizada

## 🚀 Próximos Passos

### Melhorias Planejadas
1. **Dados em tempo real**: Integração completa com APIs
2. **Geolocalização**: Dados específicos da localização do usuário
3. **Mais idiomas**: Suporte multilíngue
4. **PWA**: Aplicativo web progressivo
5. **Offline**: Funcionamento sem internet

### Expansão
- **Mais regiões**: Dados globais completos
- **Histórico**: Tendências temporais
- **Alertas**: Notificações de qualidade do ar
- **Comunidade**: Sistema de usuários

## 📞 Suporte

Para dúvidas ou sugestões sobre o projeto AirQuest, entre em contato através dos canais oficiais do NASA Space Apps Challenge.

---

**Desenvolvido com ❤️ para o NASA Space Apps Challenge**

*"Transformando dados espaciais em conscientização terrestre"*
